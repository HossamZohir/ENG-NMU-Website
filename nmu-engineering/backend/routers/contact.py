"""
Contact information and message routes.
"""
from datetime import datetime, timezone

from fastapi import APIRouter

from core.dependencies import AdminUser
from database import get_supabase
from schemas.content import ContactInfoOut, ContactInfoUpdate, ContactMessageCreate
from services.audit import log_action

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.get("", response_model=ContactInfoOut)
async def get_contact_info() -> ContactInfoOut:
    """Get contact information. Public endpoint."""
    supabase = get_supabase()
    result = supabase.table("contact_information").select("*").limit(1).execute()
    if not result.data:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact information not found.")
    return ContactInfoOut(**result.data[0])


@router.put("", response_model=ContactInfoOut)
async def update_contact_info(payload: ContactInfoUpdate, current_user: AdminUser) -> ContactInfoOut:
    """Update contact information (singleton upsert). **Admin only.**"""
    supabase = get_supabase()

    existing = supabase.table("contact_information").select("id").limit(1).execute()
    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}

    if existing.data:
        record_id = existing.data[0]["id"]
        result = supabase.table("contact_information").update(update_data).eq("id", record_id).execute()
    else:
        result = supabase.table("contact_information").insert(update_data).execute()

    await log_action(current_user.id, "update", "contact_information", result.data[0]["id"])

    return ContactInfoOut(**result.data[0])


@router.post("/message", status_code=204)
async def send_contact_message(payload: ContactMessageCreate) -> None:
    """
    Store an incoming public contact message.

    In production, this would also trigger an email notification.
    """
    supabase = get_supabase()
    supabase.table("contact_messages").insert({
        "name": payload.name,
        "email": payload.email,
        "subject": payload.subject,
        "message": payload.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_read": False,
    }).execute()
