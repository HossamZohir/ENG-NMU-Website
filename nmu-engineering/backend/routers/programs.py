"""
Academic programs routes.

Public:
  - GET /programs            list all active programs
  - GET /programs/{id}       get a program by id
  - GET /programs/slug/{slug} get a program by slug

Admin:
  - POST   /programs              create
  - PUT    /programs/{id}         update
  - DELETE /programs/{id}         delete
  - POST   /programs/{id}/study-plan  upload study plan PDF
"""
from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status

from core.dependencies import AdminUser
from database import get_supabase
from schemas.content import ProgramCreate, ProgramOut, ProgramUpdate
from services.audit import log_action
from services.slug import slugify, unique_slug
from services.storage import upload_file

router = APIRouter(prefix="/programs", tags=["Programs"])


@router.get("")
async def list_programs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    is_active: bool | None = Query(None),
) -> dict:
    """List academic programs. Public endpoint."""
    supabase = get_supabase()

    offset = (page - 1) * limit
    query = supabase.table("programs").select("*", count="exact")

    if is_active is not None:
        query = query.eq("is_active", is_active)

    result = query.order("created_at").range(offset, offset + limit - 1).execute()

    total = result.count or 0
    return {
        "data": [ProgramOut(**p) for p in result.data],
        "total": total,
        "page": page,
        "per_page": limit,
        "total_pages": max(1, (total + limit - 1) // limit),
    }


@router.get("/slug/{slug}", response_model=ProgramOut)
async def get_program_by_slug(slug: str) -> ProgramOut:
    """Get a single program by its slug. Public endpoint."""
    supabase = get_supabase()
    result = supabase.table("programs").select("*").eq("slug", slug).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found.")
    return ProgramOut(**result.data[0])


@router.get("/{program_id}", response_model=ProgramOut)
async def get_program(program_id: str) -> ProgramOut:
    """Get a single program by id. Public endpoint."""
    supabase = get_supabase()
    result = supabase.table("programs").select("*").eq("id", program_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found.")
    return ProgramOut(**result.data[0])


@router.post("", response_model=ProgramOut, status_code=status.HTTP_201_CREATED)
async def create_program(payload: ProgramCreate, current_user: AdminUser) -> ProgramOut:
    """Create a new academic program. **Admin only.**"""
    supabase = get_supabase()

    base_slug = slugify(payload.name_en)
    slug = await unique_slug(supabase, "programs", base_slug)

    now = datetime.now(timezone.utc).isoformat()
    data = {
        **payload.model_dump(),
        "slug": slug,
        "created_at": now,
        "updated_at": now,
    }

    result = supabase.table("programs").insert(data).execute()
    created = result.data[0]

    await log_action(current_user.id, "create", "program", created["id"], {"name": payload.name_en})

    return ProgramOut(**created)


@router.put("/{program_id}", response_model=ProgramOut)
async def update_program(
    program_id: str,
    payload: ProgramUpdate,
    current_user: AdminUser,
) -> ProgramOut:
    """Update an existing academic program. **Admin only.**"""
    supabase = get_supabase()

    existing = supabase.table("programs").select("*").eq("id", program_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found.")

    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}

    if "name_en" in update_data and update_data["name_en"] != existing.data[0]["name_en"]:
        base_slug = slugify(update_data["name_en"])
        update_data["slug"] = await unique_slug(supabase, "programs", base_slug, exclude_id=program_id)

    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = supabase.table("programs").update(update_data).eq("id", program_id).execute()

    await log_action(current_user.id, "update", "program", program_id, update_data)

    return ProgramOut(**result.data[0])


@router.delete("/{program_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_program(program_id: str, current_user: AdminUser) -> None:
    """Delete an academic program. **Admin only.**"""
    supabase = get_supabase()

    existing = supabase.table("programs").select("id").eq("id", program_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found.")

    supabase.table("programs").delete().eq("id", program_id).execute()

    await log_action(current_user.id, "delete", "program", program_id)


@router.post("/{program_id}/study-plan")
async def upload_study_plan(
    program_id: str,
    current_user: AdminUser,
    file: UploadFile = File(...),
) -> dict:
    """Upload (or replace) a program's study plan PDF. **Admin only.**"""
    supabase = get_supabase()

    existing = supabase.table("programs").select("id").eq("id", program_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found.")

    uploaded = await upload_file(file, "programs", allow_documents=True)

    supabase.table("programs").update(
        {"study_plan_url": uploaded["url"], "updated_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", program_id).execute()

    await log_action(current_user.id, "upload", "program", program_id, {"file": "study_plan"})

    return {"url": uploaded["url"]}
