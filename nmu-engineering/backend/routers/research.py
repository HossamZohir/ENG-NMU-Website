"""
Research project and laboratory routes.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status

from core.dependencies import AdminUser
from database import get_supabase
from schemas.content import (
    LaboratoryCreate, LaboratoryOut, LaboratoryUpdate,
    ResearchProjectCreate, ResearchProjectOut, ResearchProjectUpdate,
)
from services.audit import log_action
from services.storage import upload_file

router = APIRouter(prefix="/research", tags=["Research"])
labs_router = APIRouter(prefix="/laboratories", tags=["Laboratories"])


@router.get("")
async def list_research_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
) -> dict:
    supabase = get_supabase()
    offset = (page - 1) * limit
    query = supabase.table("research_projects").select("*", count="exact").eq("is_published", True)
    if status_filter:
        query = query.eq("status", status_filter)
    result = query.order("start_date", desc=True).range(offset, offset + limit - 1).execute()
    total = result.count or 0
    return {"data": [ResearchProjectOut(**r) for r in result.data], "total": total, "page": page, "per_page": limit, "total_pages": max(1, (total + limit - 1) // limit)}


@router.get("/{project_id}", response_model=ResearchProjectOut)
async def get_research_project(project_id: str) -> ResearchProjectOut:
    supabase = get_supabase()
    result = supabase.table("research_projects").select("*").eq("id", project_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research project not found.")
    return ResearchProjectOut(**result.data[0])


@router.post("", response_model=ResearchProjectOut, status_code=status.HTTP_201_CREATED)
async def create_research_project(payload: ResearchProjectCreate, current_user: AdminUser) -> ResearchProjectOut:
    supabase = get_supabase()
    data = {**payload.model_dump(mode="json"), "created_at": datetime.now(timezone.utc).isoformat()}
    result = supabase.table("research_projects").insert(data).execute()
    created = result.data[0]
    await log_action(current_user.id, "create", "research_project", created["id"])
    return ResearchProjectOut(**created)


@router.put("/{project_id}", response_model=ResearchProjectOut)
async def update_research_project(project_id: str, payload: ResearchProjectUpdate, current_user: AdminUser) -> ResearchProjectOut:
    supabase = get_supabase()
    existing = supabase.table("research_projects").select("id").eq("id", project_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research project not found.")
    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True, mode="json").items()}
    result = supabase.table("research_projects").update(update_data).eq("id", project_id).execute()
    await log_action(current_user.id, "update", "research_project", project_id)
    return ResearchProjectOut(**result.data[0])


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_research_project(project_id: str, current_user: AdminUser) -> None:
    supabase = get_supabase()
    existing = supabase.table("research_projects").select("id").eq("id", project_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research project not found.")
    supabase.table("research_projects").delete().eq("id", project_id).execute()
    await log_action(current_user.id, "delete", "research_project", project_id)


@labs_router.get("")
async def list_laboratories(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    department_id: str | None = Query(None),
    program_id: str | None = Query(None, description="Filter labs linked to this program ID"),
) -> dict:
    supabase = get_supabase()
    offset = (page - 1) * limit
    query = supabase.table("laboratories").select("*", count="exact").eq("is_active", True)
    if department_id:
        query = query.eq("department_id", department_id)
    if program_id:
        query = query.contains("program_ids", [program_id])
    result = query.order("name_en").range(offset, offset + limit - 1).execute()
    total = result.count or 0
    return {"data": [LaboratoryOut(**l) for l in result.data], "total": total, "page": page, "per_page": limit, "total_pages": max(1, (total + limit - 1) // limit)}


@labs_router.get("/{lab_id}", response_model=LaboratoryOut)
async def get_laboratory(lab_id: str) -> LaboratoryOut:
    supabase = get_supabase()
    result = supabase.table("laboratories").select("*").eq("id", lab_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laboratory not found.")
    return LaboratoryOut(**result.data[0])


@labs_router.post("", response_model=LaboratoryOut, status_code=status.HTTP_201_CREATED)
async def create_laboratory(payload: LaboratoryCreate, current_user: AdminUser) -> LaboratoryOut:
    supabase = get_supabase()
    result = supabase.table("laboratories").insert(payload.model_dump()).execute()
    created = result.data[0]
    await log_action(current_user.id, "create", "laboratory", created["id"])
    return LaboratoryOut(**created)


@labs_router.put("/{lab_id}", response_model=LaboratoryOut)
async def update_laboratory(lab_id: str, payload: LaboratoryUpdate, current_user: AdminUser) -> LaboratoryOut:
    supabase = get_supabase()
    existing = supabase.table("laboratories").select("id").eq("id", lab_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laboratory not found.")
    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    result = supabase.table("laboratories").update(update_data).eq("id", lab_id).execute()
    await log_action(current_user.id, "update", "laboratory", lab_id)
    return LaboratoryOut(**result.data[0])


@labs_router.delete("/{lab_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_laboratory(lab_id: str, current_user: AdminUser) -> None:
    supabase = get_supabase()
    existing = supabase.table("laboratories").select("id").eq("id", lab_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laboratory not found.")
    supabase.table("laboratories").delete().eq("id", lab_id).execute()
    await log_action(current_user.id, "delete", "laboratory", lab_id)


@labs_router.post("/{lab_id}/image")
async def upload_laboratory_image(lab_id: str, current_user: AdminUser, file: UploadFile = File(...)) -> dict:
    supabase = get_supabase()
    existing = supabase.table("laboratories").select("id").eq("id", lab_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laboratory not found.")
    uploaded = await upload_file(file, "programs")
    supabase.table("laboratories").update({"image_url": uploaded["url"]}).eq("id", lab_id).execute()
    await log_action(current_user.id, "upload", "laboratory", lab_id)
    return {"url": uploaded["url"]}
