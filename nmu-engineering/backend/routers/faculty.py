"""
Faculty member routes.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status

from core.dependencies import AdminUser
from database import get_supabase
from schemas.content import FacultyMemberCreate, FacultyMemberOut, FacultyMemberUpdate
from services.audit import log_action
from services.storage import upload_file

router = APIRouter(prefix="/faculty", tags=["Faculty Members"])


@router.get("")
async def list_faculty(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    department_id: str | None = Query(None),
    rank: str | None = Query(None),
    search: str | None = Query(None),
) -> dict:
    """
    List faculty members with optional filters.

    Public endpoint. Supports filtering by `department_id`, `rank`, and a
    free-text `search` across English/Arabic names.
    """
    supabase = get_supabase()

    offset = (page - 1) * limit
    query = supabase.table("faculty_members").select("*", count="exact").eq("is_active", True)

    if department_id:
        query = query.eq("department_id", department_id)
    if rank:
        query = query.eq("rank", rank)
    if search:
        query = query.or_(f"name_en.ilike.%{search}%,name_ar.ilike.%{search}%")

    result = query.order("name_en").range(offset, offset + limit - 1).execute()

    total = result.count or 0
    return {
        "data": [FacultyMemberOut(**f) for f in result.data],
        "total": total,
        "page": page,
        "per_page": limit,
        "total_pages": max(1, (total + limit - 1) // limit),
    }


@router.get("/{member_id}", response_model=FacultyMemberOut)
async def get_faculty_member(member_id: str) -> FacultyMemberOut:
    """Get a single faculty member by id, including publications. Public endpoint."""
    supabase = get_supabase()

    result = supabase.table("faculty_members").select("*").eq("id", member_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty member not found.")

    member = result.data[0]

    pubs = (
        supabase.table("publications")
        .select("*")
        .eq("faculty_id", member_id)
        .order("year", desc=True)
        .execute()
    )
    member["publications"] = pubs.data

    return FacultyMemberOut(**member)


@router.post("", response_model=FacultyMemberOut, status_code=status.HTTP_201_CREATED)
async def create_faculty_member(
    payload: FacultyMemberCreate, current_user: AdminUser
) -> FacultyMemberOut:
    """Create a new faculty member. **Admin only.**"""
    supabase = get_supabase()

    data = {**payload.model_dump(), "created_at": datetime.now(timezone.utc).isoformat()}
    result = supabase.table("faculty_members").insert(data).execute()
    created = result.data[0]

    await log_action(current_user.id, "create", "faculty_member", created["id"], {"name": payload.name_en})

    return FacultyMemberOut(**created)


@router.put("/{member_id}", response_model=FacultyMemberOut)
async def update_faculty_member(
    member_id: str, payload: FacultyMemberUpdate, current_user: AdminUser
) -> FacultyMemberOut:
    """Update a faculty member's profile. **Admin only.**"""
    supabase = get_supabase()

    existing = supabase.table("faculty_members").select("id").eq("id", member_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty member not found.")

    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}

    result = supabase.table("faculty_members").update(update_data).eq("id", member_id).execute()

    await log_action(current_user.id, "update", "faculty_member", member_id, update_data)

    return FacultyMemberOut(**result.data[0])


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_faculty_member(member_id: str, current_user: AdminUser) -> None:
    """Delete a faculty member. **Admin only.**"""
    supabase = get_supabase()

    existing = supabase.table("faculty_members").select("id").eq("id", member_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty member not found.")

    supabase.table("faculty_members").delete().eq("id", member_id).execute()

    await log_action(current_user.id, "delete", "faculty_member", member_id)


@router.post("/{member_id}/photo")
async def upload_faculty_photo(
    member_id: str,
    current_user: AdminUser,
    file: UploadFile = File(...),
) -> dict:
    """Upload (or replace) a faculty member's profile photo. **Admin only.**"""
    supabase = get_supabase()

    existing = supabase.table("faculty_members").select("id").eq("id", member_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty member not found.")

    uploaded = await upload_file(file, "faculty")

    supabase.table("faculty_members").update({"photo_url": uploaded["url"]}).eq("id", member_id).execute()

    await log_action(current_user.id, "upload", "faculty_member", member_id, {"file": "photo"})

    return {"url": uploaded["url"]}
