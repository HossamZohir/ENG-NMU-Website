"""
Audit logging service.

Every meaningful admin action (create/update/delete/upload) is recorded to
the `audit_logs` table for accountability.
"""
from datetime import datetime, timezone
from typing import Any, Literal

from database import get_supabase

AuditAction = Literal["create", "update", "delete", "upload", "login", "logout"]


async def log_action(
    user_id: str,
    action: AuditAction,
    resource_type: str,
    resource_id: str | None = None,
    details: dict[str, Any] | None = None,
) -> None:
    """
    Insert a row into `audit_logs`.

    Failures to write the audit log are swallowed (logged in production)
    so they never block the primary operation.
    """
    supabase = get_supabase()
    try:
        supabase.table("audit_logs").insert(
            {
                "user_id": user_id,
                "action": action,
                "resource_type": resource_type,
                "resource_id": resource_id,
                "details": details or {},
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        ).execute()
    except Exception:  # pragma: no cover
        pass
