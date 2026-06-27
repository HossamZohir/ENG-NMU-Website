"""
Downloads (documents) routes.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status

from core.dependencies import AdminUser
from database import get_supabase
from schemas.content import DownloadCreate, DownloadOut, DownloadUpdate
from services.audit import log_action
from services.storage import upload_file

router = APIRouter(prefix="/downloads", tags=["Downloads"])


@router.get("")
async def list_downloads(
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=100),
    category: str | None = Query(None),
    program_id: str | None = Query(None),
) -> dict:
    supabase = get_supabase()
    offset = (page - 1) * limit
    query = supabase.table("downloads").select("*", count="exact").eq("is_active", True)
    if category:
        query = query.eq("category", category)
    if program_id:
        query = query.eq("program_id", program_id)
    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    total = result.count or 0
    return {"data": [DownloadOut(**d) for d in result.data], "total": total, "page": page, "per_page": limit, "total_pages": max(1, (total + limit - 1) // limit)}


@router.get("/{download_id}", response_model=DownloadOut)
async def get_download(download_id: str) -> DownloadOut:
    supabase = get_supabase()
    result = supabase.table("downloads").select("*").eq("id", download_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Download not found.")
    return DownloadOut(**result.data[0])


@router.post("/upload", response_model=DownloadOut, status_code=status.HTTP_201_CREATED)
async def upload_download(
    current_user: AdminUser,
    title_en: str = "",
    title_ar: str = "",
    category: str = "other",
    program_id: str | None = None,
    file: UploadFile = File(...),
) -> DownloadOut:
    """Upload a document/PDF and create a download record. **Admin only.**"""
    supabase = get_supabase()

    uploaded = await upload_file(file, "documents", allow_documents=True)

    now = datetime.now(timezone.utc).isoformat()
    data = {
        "title_en": title_en or (file.filename or "Document"),
        "title_ar": title_ar or (file.filename or "وثيقة"),
        "category": category,
        "program_id": program_id,
        "file_url": uploaded["url"],
        "file_size": uploaded["size"],
        "is_active": True,
        "created_at": now,
    }

    result = supabase.table("downloads").insert(data).execute()
    created = result.data[0]

    await log_action(current_user.id, "upload", "download", created["id"], {"file": file.filename})

    return DownloadOut(**created)


@router.put("/{download_id}", response_model=DownloadOut)
async def update_download(download_id: str, payload: DownloadUpdate, current_user: AdminUser) -> DownloadOut:
    supabase = get_supabase()
    existing = supabase.table("downloads").select("id").eq("id", download_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Download not found.")
    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    result = supabase.table("downloads").update(update_data).eq("id", download_id).execute()
    await log_action(current_user.id, "update", "download", download_id)
    return DownloadOut(**result.data[0])


@router.delete("/{download_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_download(download_id: str, current_user: AdminUser) -> None:
    supabase = get_supabase()
    existing = supabase.table("downloads").select("id").eq("id", download_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Download not found.")
    supabase.table("downloads").delete().eq("id", download_id).execute()
    await log_action(current_user.id, "delete", "download", download_id)
