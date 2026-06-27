"""
Authentication routes: login (email + password), current user, admin
account management, password changes.
"""
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from core.dependencies import CurrentUser, SuperAdminUser
from core.security import create_access_token, hash_password, verify_password
from database import get_supabase
from schemas.auth import (
    PasswordChangeRequest,
    Token,
    UserCreate,
    UserOut,
)
from services.audit import log_action

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
    """
    Authenticate an admin using **email + password** (OAuth2 password flow).

    The frontend sends `username` (the user's email) and `password` as
    `application/x-www-form-urlencoded` data, per the OAuth2 spec used by
    FastAPI's `OAuth2PasswordRequestForm`.

    Returns a JWT access token (valid for `JWT_EXPIRATION_HOURS`, default 8h)
    along with the authenticated user's profile.
    """
    supabase = get_supabase()

    result = (
        supabase.table("users")
        .select("*")
        .eq("email", form_data.username.lower().strip())
        .limit(1)
        .execute()
    )

    invalid_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not result.data:
        raise invalid_credentials

    user = result.data[0]

    if not verify_password(form_data.password, user["password_hash"]):
        raise invalid_credentials

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Contact a Super Admin.",
        )

    now = datetime.now(timezone.utc).isoformat()
    supabase.table("users").update({"last_login": now}).eq("id", user["id"]).execute()
    user["last_login"] = now

    access_token = create_access_token(
        data={"sub": user["id"], "email": user["email"], "role": user["role"]}
    )

    await log_action(user["id"], "login", "auth", user["id"])

    return Token(access_token=access_token, user=UserOut(**user))


@router.get("/me", response_model=UserOut)
async def get_me(current_user: CurrentUser) -> UserOut:
    """Return the profile of the currently authenticated admin."""
    return current_user


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_admin(
    payload: UserCreate,
    current_user: SuperAdminUser,
) -> UserOut:
    """
    Create a new administrator account.

    **Super Admin only.** The password is hashed with bcrypt before storage.
    """
    supabase = get_supabase()

    email = payload.email.lower().strip()

    existing = supabase.table("users").select("id").eq("email", email).limit(1).execute()
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    new_user = {
        "email": email,
        "password_hash": hash_password(payload.password),
        "full_name": payload.full_name,
        "full_name_ar": payload.full_name_ar,
        "role": payload.role,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    result = supabase.table("users").insert(new_user).execute()
    created = result.data[0]

    await log_action(current_user.id, "create", "user", created["id"], {"email": email, "role": payload.role})

    return UserOut(**created)


@router.put("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    payload: PasswordChangeRequest,
    current_user: CurrentUser,
) -> None:
    """Allow the currently authenticated admin to change their own password."""
    supabase = get_supabase()

    result = (
        supabase.table("users").select("password_hash").eq("id", current_user.id).limit(1).execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if not verify_password(payload.current_password, result.data[0]["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    supabase.table("users").update(
        {"password_hash": hash_password(payload.new_password)}
    ).eq("id", current_user.id).execute()

    await log_action(current_user.id, "update", "user", current_user.id, {"action": "change_password"})
