"""
Dashboard statistics endpoint.
"""
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter

from core.dependencies import AdminUser
from database import get_supabase

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _format_time(iso_str: str) -> str:
    """Convert ISO timestamp to human-readable relative time."""
    if not iso_str:
        return "Unknown"
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        diff = now - dt
        if diff < timedelta(minutes=1):
            return "Just now"
        if diff < timedelta(hours=1):
            mins = int(diff.total_seconds() / 60)
            return f"{mins} min{'s' if mins != 1 else ''} ago"
        if diff < timedelta(days=1):
            hrs = int(diff.total_seconds() / 3600)
            return f"{hrs} hour{'s' if hrs != 1 else ''} ago"
        days = diff.days
        if days == 1:
            return "Yesterday"
        if days < 7:
            return f"{days} days ago"
        return dt.strftime("%b %d, %Y")
    except Exception:
        return iso_str[:10]


@router.get("/stats")
async def get_dashboard_stats(current_user: AdminUser) -> dict:
    """Return aggregate counts and recent audit log entries. **Admin only.**"""
    supabase = get_supabase()

    def count(table: str, filters: dict | None = None) -> int:
        q = supabase.table(table).select("id", count="exact")
        if filters:
            for k, v in filters.items():
                q = q.eq(k, v)
        try:
            res = q.execute()
            return res.count or 0
        except Exception:
            return 0

    programs  = count("programs",        {"is_active": True})
    faculty   = count("faculty_members", {"is_active": True})
    news      = count("news_articles",   {"is_published": True})
    events    = count("events",          {"is_published": True})
    downloads = count("downloads",       {"is_active": True})

    # Recent audit logs
    try:
        logs = (
            supabase.table("audit_logs")
            .select("action, resource_type, created_at, user_id")
            .order("created_at", desc=True)
            .limit(10)
            .execute()
        )
        log_data = logs.data or []
    except Exception:
        log_data = []

    recent = []
    for entry in log_data:
        action     = entry.get("action", "update")
        resource   = entry.get("resource_type", "item").replace("_", " ")
        created_at = entry.get("created_at", "")
        user_id    = entry.get("user_id", "")

        recent.append({
            "action":  f"{action.capitalize()} {resource}",
            "user":    user_id[:8] if user_id else "Admin",
            "time":    _format_time(created_at),
            "type":    action,
        })

    return {
        "programs":        programs,
        "faculty":         faculty,
        "news":            news,
        "events":          events,
        "downloads":       downloads,
        "recent_activity": recent,
    }
