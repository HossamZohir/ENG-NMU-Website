"""
Pydantic schemas for authentication: login, tokens, user representations.
"""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

Role = Literal["admin", "super_admin"]


class TokenPayload(BaseModel):
    """Decoded JWT payload."""
    sub: str  # user id
    email: EmailStr
    role: Role
    exp: int | None = None
    iat: int | None = None


class Token(BaseModel):
    """Response returned by /auth/login."""
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    """Public user representation (never includes password hash)."""
    id: str
    email: EmailStr
    full_name: str
    full_name_ar: str = ""
    role: Role
    is_active: bool = True
    created_at: datetime | None = None
    last_login: datetime | None = None

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    """Payload for creating a new admin account (Super Admin only)."""
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2)
    full_name_ar: str = ""
    role: Role = "admin"


class UserUpdate(BaseModel):
    """Payload for updating an existing admin account."""
    full_name: str | None = None
    full_name_ar: str | None = None
    role: Role | None = None
    is_active: bool | None = None


class PasswordResetRequest(BaseModel):
    """Super Admin resets another user's password."""
    new_password: str = Field(min_length=8)


class PasswordChangeRequest(BaseModel):
    """Current user changes their own password."""
    current_password: str
    new_password: str = Field(min_length=8)


Token.model_rebuild()
