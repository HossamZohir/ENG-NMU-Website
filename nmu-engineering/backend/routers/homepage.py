"""
Homepage content routes (singleton record).
"""
from datetime import datetime, timezone

from fastapi import APIRouter, File, UploadFile

from core.dependencies import AdminUser
from database import get_supabase
from schemas.content import HomepageContentOut, HomepageContentUpdate
from services.audit import log_action
from services.storage import upload_file

router = APIRouter(prefix="/homepage", tags=["Homepage"])


@router.get("", response_model=HomepageContentOut)
async def get_homepage() -> HomepageContentOut:
    """Get homepage content. Public endpoint."""
    supabase = get_supabase()
    result = supabase.table("homepage_content").select("*").limit(1).execute()
    if not result.data:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Homepage content not found.")
    return HomepageContentOut(**result.data[0])


@router.put("", response_model=HomepageContentOut)
async def update_homepage(payload: HomepageContentUpdate, current_user: AdminUser) -> HomepageContentOut:
    """Update homepage content (singleton upsert). **Admin only.**"""
    supabase = get_supabase()

    existing = supabase.table("homepage_content").select("id").limit(1).execute()
    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    if existing.data:
        record_id = existing.data[0]["id"]
        result = supabase.table("homepage_content").update(update_data).eq("id", record_id).execute()
    else:
        result = supabase.table("homepage_content").insert(update_data).execute()

    await log_action(current_user.id, "update", "homepage_content", result.data[0]["id"])

    return HomepageContentOut(**result.data[0])


@router.post("/dean-photo")
async def upload_dean_photo(current_user: AdminUser, file: UploadFile = File(...)) -> dict:
    """Upload the dean's photo. **Admin only.**"""
    supabase = get_supabase()

    uploaded = await upload_file(file, "faculty")

    existing = supabase.table("homepage_content").select("id").limit(1).execute()
    if existing.data:
        supabase.table("homepage_content").update({"dean_photo_url": uploaded["url"], "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", existing.data[0]["id"]).execute()

    await log_action(current_user.id, "upload", "homepage_content", None, {"file": "dean_photo"})

    return {"url": uploaded["url"]}
