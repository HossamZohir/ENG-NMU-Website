"""
Department routes.
"""
from fastapi import APIRouter, HTTPException, Query, status

from core.dependencies import AdminUser
from database import get_supabase
from schemas.content import DepartmentCreate, DepartmentOut, DepartmentUpdate
from services.audit import log_action
from services.slug import slugify, unique_slug

router = APIRouter(prefix="/departments", tags=["Departments"])


@router.get("")
async def list_departments(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
) -> dict:
    """List all departments. Public endpoint."""
    supabase = get_supabase()

    offset = (page - 1) * limit
    result = (
        supabase.table("departments")
        .select("*", count="exact")
        .order("name_en")
        .range(offset, offset + limit - 1)
        .execute()
    )

    total = result.count or 0
    return {
        "data": [DepartmentOut(**d) for d in result.data],
        "total": total,
        "page": page,
        "per_page": limit,
        "total_pages": max(1, (total + limit - 1) // limit),
    }


@router.get("/{department_id}", response_model=DepartmentOut)
async def get_department(department_id: str) -> DepartmentOut:
    """Get a single department by id. Public endpoint."""
    supabase = get_supabase()
    result = supabase.table("departments").select("*").eq("id", department_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found.")
    return DepartmentOut(**result.data[0])


@router.post("", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
async def create_department(payload: DepartmentCreate, current_user: AdminUser) -> DepartmentOut:
    """Create a department. **Admin only.**"""
    supabase = get_supabase()

    base_slug = slugify(payload.name_en)
    slug = await unique_slug(supabase, "departments", base_slug)

    data = {**payload.model_dump(), "slug": slug}
    result = supabase.table("departments").insert(data).execute()
    created = result.data[0]

    await log_action(current_user.id, "create", "department", created["id"])

    return DepartmentOut(**created)


@router.put("/{department_id}", response_model=DepartmentOut)
async def update_department(
    department_id: str, payload: DepartmentUpdate, current_user: AdminUser
) -> DepartmentOut:
    """Update a department. **Admin only.**"""
    supabase = get_supabase()

    existing = supabase.table("departments").select("*").eq("id", department_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found.")

    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}

    if "name_en" in update_data and update_data["name_en"] != existing.data[0]["name_en"]:
        base_slug = slugify(update_data["name_en"])
        update_data["slug"] = await unique_slug(
            supabase, "departments", base_slug, exclude_id=department_id
        )

    result = supabase.table("departments").update(update_data).eq("id", department_id).execute()

    await log_action(current_user.id, "update", "department", department_id, update_data)

    return DepartmentOut(**result.data[0])


@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department(department_id: str, current_user: AdminUser) -> None:
    """Delete a department. **Admin only.**"""
    supabase = get_supabase()

    existing = supabase.table("departments").select("id").eq("id", department_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found.")

    supabase.table("departments").delete().eq("id", department_id).execute()

    await log_action(current_user.id, "delete", "department", department_id)
