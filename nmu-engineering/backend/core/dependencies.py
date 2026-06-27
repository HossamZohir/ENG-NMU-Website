"""
FastAPI dependencies: database client, current user resolution, role-based guards.
"""
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from core.security import decode_access_token
from database import get_supabase
from schemas.auth import TokenPayload, UserOut

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
) -> UserOut:
    """
    Decode the JWT bearer token, validate it, and load the corresponding
    user record from Supabase. Raises 401 if the token is invalid/expired
    or the user no longer exists / is inactive.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    token_data = TokenPayload(**payload)

    supabase = get_supabase()
    result = (
        supabase.table("users")
        .select("*")
        .eq("id", token_data.sub)
        .eq("is_active", True)
        .limit(1)
        .execute()
    )

    if not result.data:
        raise credentials_exception

    user = result.data[0]
    return UserOut(**user)


async def require_admin(
    current_user: Annotated[UserOut, Depends(get_current_user)],
) -> UserOut:
    """Require the current user to have at least 'admin' role."""
    if current_user.role not in ("admin", "super_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


async def require_super_admin(
    current_user: Annotated[UserOut, Depends(get_current_user)],
) -> UserOut:
    """Require the current user to have 'super_admin' role."""
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin privileges required",
        )
    return current_user


CurrentUser = Annotated[UserOut, Depends(get_current_user)]
AdminUser = Annotated[UserOut, Depends(require_admin)]
SuperAdminUser = Annotated[UserOut, Depends(require_super_admin)]
