"""
Event routes, including banner image upload.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status

from core.dependencies import AdminUser
from database import get_supabase
from schemas.content import EventCreate, EventOut, EventUpdate
from services.audit import log_action
from services.storage import upload_file

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("")
async def list_events(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    upcoming: bool | None = Query(None, description="Filter to upcoming (true) or past (false) events"),
    published: bool | None = Query(None),
) -> dict:
    """List events, optionally filtered to upcoming or past. Public endpoint."""
    supabase = get_supabase()

    offset = (page - 1) * limit
    query = supabase.table("events").select("*", count="exact")

    if published is None:
        query = query.eq("is_published", True)
    else:
        query = query.eq("is_published", published)

    now = datetime.now(timezone.utc).isoformat()
    if upcoming is True:
        query = query.gte("start_date", now)
    elif upcoming is False:
        query = query.lt("start_date", now)

    result = query.order("start_date").range(offset, offset + limit - 1).execute()

    total = result.count or 0
    return {
        "data": [EventOut(**e) for e in result.data],
        "total": total,
        "page": page,
        "per_page": limit,
        "total_pages": max(1, (total + limit - 1) // limit),
    }


@router.get("/{event_id}", response_model=EventOut)
async def get_event(event_id: str) -> EventOut:
    """Get a single event by id. Public endpoint."""
    supabase = get_supabase()
    result = supabase.table("events").select("*").eq("id", event_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")
    return EventOut(**result.data[0])


@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
async def create_event(payload: EventCreate, current_user: AdminUser) -> EventOut:
    """Create an event. **Admin only.**"""
    supabase = get_supabase()

    data = {
        **payload.model_dump(mode="json"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = supabase.table("events").insert(data).execute()
    created = result.data[0]

    await log_action(current_user.id, "create", "event", created["id"], {"title": payload.title_en})

    return EventOut(**created)


@router.put("/{event_id}", response_model=EventOut)
async def update_event(event_id: str, payload: EventUpdate, current_user: AdminUser) -> EventOut:
    """Update an event. **Admin only.**"""
    supabase = get_supabase()

    existing = supabase.table("events").select("id").eq("id", event_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True, mode="json").items()}

    result = supabase.table("events").update(update_data).eq("id", event_id).execute()

    await log_action(current_user.id, "update", "event", event_id, update_data)

    return EventOut(**result.data[0])


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: str, current_user: AdminUser) -> None:
    """Delete an event. **Admin only.**"""
    supabase = get_supabase()

    existing = supabase.table("events").select("id").eq("id", event_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    supabase.table("events").delete().eq("id", event_id).execute()

    await log_action(current_user.id, "delete", "event", event_id)


@router.post("/{event_id}/banner")
async def upload_event_banner(
    event_id: str,
    current_user: AdminUser,
    file: UploadFile = File(...),
) -> dict:
    """Upload (or replace) an event's banner image. **Admin only.**"""
    supabase = get_supabase()

    existing = supabase.table("events").select("id").eq("id", event_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    uploaded = await upload_file(file, "events")

    supabase.table("events").update({"banner_url": uploaded["url"]}).eq("id", event_id).execute()

    await log_action(current_user.id, "upload", "event", event_id, {"file": "banner"})

    return {"url": uploaded["url"]}
