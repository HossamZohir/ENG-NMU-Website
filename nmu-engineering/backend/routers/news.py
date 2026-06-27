"""
News article routes, including category management and image uploads.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status

from core.dependencies import AdminUser
from database import get_supabase
from schemas.content import NewsArticleCreate, NewsArticleOut, NewsArticleUpdate
from services.audit import log_action
from services.slug import slugify, unique_slug
from services.storage import upload_file

router = APIRouter(prefix="/news", tags=["News"])


@router.get("")
async def list_news(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category_id: str | None = Query(None),
    featured: bool | None = Query(None),
    published: bool | None = Query(None),
    slug: str | None = Query(None),
    search: str | None = Query(None),
) -> dict:
    """
    List news articles with optional filters.

    Public endpoint. By default returns only published articles unless
    `published=false` is explicitly requested (admin use).
    """
    supabase = get_supabase()

    offset = (page - 1) * limit
    query = supabase.table("news_articles").select("*", count="exact")

    if published is None:
        query = query.eq("is_published", True)
    else:
        query = query.eq("is_published", published)

    if category_id:
        query = query.eq("category_id", category_id)
    if featured is not None:
        query = query.eq("is_featured", featured)
    if slug:
        query = query.eq("slug", slug)
    if search:
        query = query.or_(f"title_en.ilike.%{search}%,title_ar.ilike.%{search}%")

    result = query.order("published_at", desc=True).range(offset, offset + limit - 1).execute()

    total = result.count or 0
    return {
        "data": [NewsArticleOut(**n) for n in result.data],
        "total": total,
        "page": page,
        "per_page": limit,
        "total_pages": max(1, (total + limit - 1) // limit),
    }


@router.get("/{article_id}", response_model=NewsArticleOut)
async def get_news_article(article_id: str) -> NewsArticleOut:
    """Get a single news article by id. Public endpoint."""
    supabase = get_supabase()
    result = supabase.table("news_articles").select("*").eq("id", article_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")
    return NewsArticleOut(**result.data[0])


@router.post("", response_model=NewsArticleOut, status_code=status.HTTP_201_CREATED)
async def create_news_article(payload: NewsArticleCreate, current_user: AdminUser) -> NewsArticleOut:
    """Create a news article (rich text content). **Admin only.**"""
    supabase = get_supabase()

    base_slug = slugify(payload.title_en)
    slug = await unique_slug(supabase, "news_articles", base_slug)

    now = datetime.now(timezone.utc).isoformat()
    data = {
        **payload.model_dump(),
        "slug": slug,
        "published_at": now if payload.is_published else None,
        "created_at": now,
        "updated_at": now,
    }

    result = supabase.table("news_articles").insert(data).execute()
    created = result.data[0]

    await log_action(current_user.id, "create", "news_article", created["id"], {"title": payload.title_en})

    return NewsArticleOut(**created)


@router.put("/{article_id}", response_model=NewsArticleOut)
async def update_news_article(
    article_id: str, payload: NewsArticleUpdate, current_user: AdminUser
) -> NewsArticleOut:
    """Update a news article. **Admin only.**

    If `is_published` transitions from False to True and `published_at`
    has not yet been set, it will be set to the current time.
    """
    supabase = get_supabase()

    existing = supabase.table("news_articles").select("*").eq("id", article_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")

    current = existing.data[0]
    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}

    if "title_en" in update_data and update_data["title_en"] != current["title_en"]:
        base_slug = slugify(update_data["title_en"])
        update_data["slug"] = await unique_slug(
            supabase, "news_articles", base_slug, exclude_id=article_id
        )

    if update_data.get("is_published") and not current.get("published_at"):
        update_data["published_at"] = datetime.now(timezone.utc).isoformat()

    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = supabase.table("news_articles").update(update_data).eq("id", article_id).execute()

    await log_action(current_user.id, "update", "news_article", article_id, update_data)

    return NewsArticleOut(**result.data[0])


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_news_article(article_id: str, current_user: AdminUser) -> None:
    """Delete a news article. **Admin only.**"""
    supabase = get_supabase()

    existing = supabase.table("news_articles").select("id").eq("id", article_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")

    supabase.table("news_articles").delete().eq("id", article_id).execute()

    await log_action(current_user.id, "delete", "news_article", article_id)


@router.post("/{article_id}/image")
async def upload_news_image(
    article_id: str,
    current_user: AdminUser,
    file: UploadFile = File(...),
) -> dict:
    """Upload (or replace) a news article's cover image. **Admin only.**"""
    supabase = get_supabase()

    existing = supabase.table("news_articles").select("id").eq("id", article_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")

    uploaded = await upload_file(file, "news")

    supabase.table("news_articles").update(
        {"image_url": uploaded["url"], "updated_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", article_id).execute()

    await log_action(current_user.id, "upload", "news_article", article_id, {"file": "image"})

    return {"url": uploaded["url"]}


# ── Categories ────────────────────────────────────────────────────────────────
@router.get("/categories/all")
async def list_news_categories() -> dict:
    """List all news categories. Public endpoint."""
    supabase = get_supabase()
    result = supabase.table("news_categories").select("*").order("name_en").execute()
    return {"data": result.data}


@router.post("/categories", status_code=status.HTTP_201_CREATED)
async def create_news_category(
    name_en: str, name_ar: str, current_user: AdminUser
) -> dict:
    """Create a news category. **Admin only.**"""
    supabase = get_supabase()

    base_slug = slugify(name_en)
    slug = await unique_slug(supabase, "news_categories", base_slug)

    result = (
        supabase.table("news_categories")
        .insert({"name_en": name_en, "name_ar": name_ar, "slug": slug})
        .execute()
    )

    await log_action(current_user.id, "create", "news_category", result.data[0]["id"])

    return result.data[0]
