"""
Supabase client factory.

A fresh client is created per request (per the constraint of "fresh Supabase
client per request") to avoid sharing connection state across requests in an
async context. The Supabase Python client is lightweight to instantiate.
"""
from supabase import Client, create_client

from core.config import get_settings

settings = get_settings()


def get_supabase() -> Client:
    """
    Return a new Supabase client configured with the service-role key.

    Used by FastAPI dependencies / route handlers via `Depends(get_supabase)`
    or direct call. Each call creates a new client instance.
    """
    return create_client(settings.supabase_url, settings.supabase_key)


def get_supabase_anon() -> Client:
    """
    Return a new Supabase client configured with the anon/public key.

    Useful for operations that should respect Row Level Security as an
    anonymous/public user (e.g. public read-only endpoints).
    """
    key = settings.supabase_anon_key or settings.supabase_key
    return create_client(settings.supabase_url, key)
