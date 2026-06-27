"""
NMU Faculty of Engineering — FastAPI Backend
============================================

Startup:
    uvicorn main:app --reload --port 8000

Deployment (Render):
    Start command: uvicorn main:app --host 0.0.0.0 --port $PORT
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import get_settings
from routers import (
    auth, contact, dashboard, departments, downloads,
    events, faculty, gallery, homepage, news, programs, research, users,
)

settings = get_settings()

app = FastAPI(
    title="NMU Faculty of Engineering API",
    description=(
        "Backend API for the New Mansoura University Faculty of Engineering "
        "website and Content Management System."
    ),
    version="1.0.0",
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url="/redoc" if settings.environment != "production" else None,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(programs.router)
app.include_router(departments.router)
app.include_router(faculty.router)
app.include_router(news.router)
app.include_router(events.router)
app.include_router(research.router)
app.include_router(research.labs_router)
app.include_router(downloads.router)
app.include_router(gallery.router)
app.include_router(homepage.router)
app.include_router(contact.router)
app.include_router(dashboard.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """Simple health check endpoint for Render / uptime monitoring."""
    return {"status": "ok", "service": "NMU Engineering API", "version": "1.0.0"}


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root() -> dict:
    return {"message": "NMU Faculty of Engineering API", "docs": "/docs"}
