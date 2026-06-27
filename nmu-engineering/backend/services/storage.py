"""
File upload helpers for Supabase Storage.

Storage bucket layout (per spec):
    /news
    /events
    /faculty
    /programs
    /gallery
    /documents
"""
import mimetypes
import uuid
from typing import Literal

from fastapi import HTTPException, UploadFile, status

from database import get_supabase

StorageFolder = Literal["news", "events", "faculty", "programs", "gallery", "documents"]

BUCKET_NAME = "nmu-media"

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_DOCUMENT_TYPES = {"application/pdf"}

MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_DOCUMENT_SIZE = 20 * 1024 * 1024  # 20 MB


async def upload_file(
    file: UploadFile,
    folder: StorageFolder,
    *,
    allow_documents: bool = False,
) -> dict:
    """
    Upload a file to Supabase Storage under the given folder.

    Validates content type and size, then uploads with a unique filename
    to avoid collisions. Returns a dict with `url`, `path`, and `size`.
    """
    content_type = file.content_type or mimetypes.guess_type(file.filename or "")[0] or ""

    allowed_types = ALLOWED_IMAGE_TYPES | (ALLOWED_DOCUMENT_TYPES if allow_documents else set())
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {content_type}. "
            f"Allowed: {', '.join(sorted(allowed_types))}",
        )

    contents = await file.read()
    max_size = MAX_DOCUMENT_SIZE if content_type in ALLOWED_DOCUMENT_TYPES else MAX_IMAGE_SIZE
    if len(contents) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {max_size // (1024 * 1024)} MB.",
        )

    original_name = file.filename or "upload"
    ext = original_name.rsplit(".", 1)[-1].lower() if "." in original_name else "bin"
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    storage_path = f"{folder}/{unique_name}"

    supabase = get_supabase()

    try:
        supabase.storage.from_(BUCKET_NAME).upload(
            storage_path,
            contents,
            file_options={"content-type": content_type},
        )
    except Exception as exc:  # pragma: no cover - network/storage errors
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to upload file to storage: {exc}",
        ) from exc

    public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(storage_path)

    return {
        "url": public_url,
        "path": storage_path,
        "size": len(contents),
        "content_type": content_type,
    }


async def delete_file(storage_path: str) -> None:
    """Delete a file from Supabase Storage by its path within the bucket."""
    supabase = get_supabase()
    try:
        supabase.storage.from_(BUCKET_NAME).remove([storage_path])
    except Exception:  # pragma: no cover
        pass
