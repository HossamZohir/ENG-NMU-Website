"""
Gallery albums and media routes.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status

from core.dependencies import AdminUser
from database import get_supabase
from services.audit import log_action
from services.storage import upload_file

router = APIRouter(prefix="/gallery", tags=["Gallery"])


@router.get("/albums")
async def list_albums(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100)) -> dict:
    supabase = get_supabase()
    offset = (page - 1) * limit
    result = supabase.table("gallery_albums").select("*", count="exact").order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    total = result.count or 0
    return {"data": result.data, "total": total, "page": page, "per_page": limit, "total_pages": max(1, (total + limit - 1) // limit)}


@router.post("/albums", status_code=status.HTTP_201_CREATED)
async def create_album(name_en: str, name_ar: str, current_user: AdminUser) -> dict:
    supabase = get_supabase()
    data = {"name_en": name_en, "name_ar": name_ar, "created_at": datetime.now(timezone.utc).isoformat()}
    result = supabase.table("gallery_albums").insert(data).execute()
    created = result.data[0]
    await log_action(current_user.id, "create", "gallery_album", created["id"])
    return created


@router.delete("/albums/{album_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_album(album_id: str, current_user: AdminUser) -> None:
    supabase = get_supabase()
    existing = supabase.table("gallery_albums").select("id").eq("id", album_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found.")
    supabase.table("gallery_albums").delete().eq("id", album_id).execute()
    await log_action(current_user.id, "delete", "gallery_album", album_id)


@router.get("/albums/{album_id}/media")
async def list_album_media(album_id: str, page: int = Query(1, ge=1), limit: int = Query(30, ge=1, le=100)) -> dict:
    supabase = get_supabase()
    offset = (page - 1) * limit
    result = supabase.table("gallery_media").select("*", count="exact").eq("album_id", album_id).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    total = result.count or 0
    return {"data": result.data, "total": total, "page": page, "per_page": limit, "total_pages": max(1, (total + limit - 1) // limit)}


@router.post("/albums/{album_id}/media", status_code=status.HTTP_201_CREATED)
async def upload_media(album_id: str, current_user: AdminUser, file: UploadFile = File(...)) -> dict:
    supabase = get_supabase()
    existing = supabase.table("gallery_albums").select("id").eq("id", album_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found.")
    uploaded = await upload_file(file, "gallery")
    data = {"album_id": album_id, "url": uploaded["url"], "media_type": "image" if "image" in uploaded["content_type"] else "video", "created_at": datetime.now(timezone.utc).isoformat()}
    result = supabase.table("gallery_media").insert(data).execute()
    created = result.data[0]
    await log_action(current_user.id, "upload", "gallery_media", created["id"])
    return created


@router.delete("/media/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(media_id: str, current_user: AdminUser) -> None:
    supabase = get_supabase()
    existing = supabase.table("gallery_media").select("id").eq("id", media_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found.")
    supabase.table("gallery_media").delete().eq("id", media_id).execute()
    await log_action(current_user.id, "delete", "gallery_media", media_id)
