"""
Slug generation helpers for programs, news articles, departments, etc.
"""
import re
import unicodedata


def slugify(text: str) -> str:
    """
    Convert a string (English or Arabic) into a URL-friendly slug.

    English text is transliterated/normalized to ASCII lowercase with
    hyphens. Arabic text falls back to a simplified character-stripping
    approach, retaining Arabic characters but removing punctuation/spaces
    in favor of hyphens.
    """
    text = text.strip()

    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")

    if ascii_text.strip():
        slug = ascii_text.lower()
        slug = re.sub(r"[^a-z0-9]+", "-", slug)
        slug = re.sub(r"-{2,}", "-", slug).strip("-")
        return slug or "item"

    slug = re.sub(r"[\s/\\?#&%\.,;:!\"'()\[\]{}]+", "-", text)
    slug = re.sub(r"-{2,}", "-", slug).strip("-")
    return slug or "item"


async def unique_slug(supabase, table: str, base_slug: str, exclude_id: str | None = None) -> str:
    """
    Ensure a slug is unique within a table by appending -2, -3, etc.
    if necessary.
    """
    slug = base_slug
    counter = 2

    while True:
        query = supabase.table(table).select("id").eq("slug", slug)
        if exclude_id:
            query = query.neq("id", exclude_id)
        result = query.limit(1).execute()

        if not result.data:
            return slug

        slug = f"{base_slug}-{counter}"
        counter += 1
