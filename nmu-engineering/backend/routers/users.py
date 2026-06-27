"""
User management routes (Super Admin only): list, update, delete admins,
and reset passwords.
"""
from fastapi import APIRouter, HTTPException, Query, status

from core.dependencies import SuperAdminUser
from core.security import hash_password
from database import get_supabase
from schemas.auth import PasswordResetRequest, UserOut, UserUpdate
from services.audit import log_action

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("")
async def list_users(
    current_user: SuperAdminUser,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
) -> dict:
    """List all administrator accounts. **Super Admin only.**"""
    supabase = get_supabase()

    offset = (page - 1) * limit
    result = (
        supabase.table("users")
        .select("*", count="exact")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    total = result.count or 0
    return {
        "data": [UserOut(**u) for u in result.data],
        "total": total,
        "page": page,
        "per_page": limit,
        "total_pages": max(1, (total + limit - 1) // limit),
    }


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str, current_user: SuperAdminUser) -> UserOut:
    """Get a single administrator account by id. **Super Admin only.**"""
    supabase = get_supabase()
    result = supabase.table("users").select("*").eq("id", user_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return UserOut(**result.data[0])


@router.put("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: str,
    payload: UserUpdate,
    current_user: SuperAdminUser,
) -> UserOut:
    """Update an administrator's profile, role, or active status. **Super Admin only.**"""
    supabase = get_supabase()

    existing = supabase.table("users").select("id").eq("id", user_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}

    if not update_data:
        result = supabase.table("users").select("*").eq("id", user_id).limit(1).execute()
        return UserOut(**result.data[0])

    if user_id == current_user.id and (
        update_data.get("role") == "admin" or update_data.get("is_active") is False
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot demote or deactivate your own account.",
        )

    result = supabase.table("users").update(update_data).eq("id", user_id).execute()

    await log_action(current_user.id, "update", "user", user_id, update_data)

    return UserOut(**result.data[0])


@router.put("/{user_id}/reset-password", status_code=status.HTTP_204_NO_CONTENT)
async def reset_password(
    user_id: str,
    payload: PasswordResetRequest,
    current_user: SuperAdminUser,
) -> None:
    """Reset another administrator's password. **Super Admin only.**"""
    supabase = get_supabase()

    existing = supabase.table("users").select("id").eq("id", user_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    supabase.table("users").update(
        {"password_hash": hash_password(payload.new_password)}
    ).eq("id", user_id).execute()

    await log_action(current_user.id, "update", "user", user_id, {"action": "reset_password"})


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, current_user: SuperAdminUser) -> None:
    """Delete an administrator account. **Super Admin only.**"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account.",
        )

    supabase = get_supabase()
    existing = supabase.table("users").select("id").eq("id", user_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    supabase.table("users").delete().eq("id", user_id).execute()

    await log_action(current_user.id, "delete", "user", user_id)
