"""
Pydantic schemas for content entities: programs, faculty, news, events,
research, downloads, homepage, contact info.
"""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

# ── Programs ──────────────────────────────────────────────────────────────────
class ProgramBase(BaseModel):
    name_en: str
    name_ar: str
    description_en: str = ""
    description_ar: str = ""
    icon: str = "🎓"
    duration_years: int = 4
    credit_hours: int = 160
    language: str = "English"
    vision_en: str = ""
    vision_ar: str = ""
    mission_en: str = ""
    mission_ar: str = ""
    coordinator_id: str | None = None
    coordinator_name_en: str = ""
    coordinator_name_ar: str = ""
    coordinator_email: str = ""
    is_active: bool = True


class ProgramCreate(ProgramBase):
    pass


class ProgramUpdate(BaseModel):
    name_en: str | None = None
    name_ar: str | None = None
    description_en: str | None = None
    description_ar: str | None = None
    icon: str | None = None
    duration_years: int | None = None
    credit_hours: int | None = None
    language: str | None = None
    vision_en: str | None = None
    vision_ar: str | None = None
    mission_en: str | None = None
    mission_ar: str | None = None
    coordinator_id: str | None = None
    coordinator_name_en: str | None = None
    coordinator_name_ar: str | None = None
    coordinator_email: str | None = None
    study_plan_url: str | None = None
    is_active: bool | None = None


class ProgramOut(ProgramBase):
    id: str
    slug: str
    study_plan_url: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Departments ───────────────────────────────────────────────────────────────
class DepartmentBase(BaseModel):
    name_en: str
    name_ar: str
    description_en: str = ""
    description_ar: str = ""
    head_id: str | None = None
    email: EmailStr | None = None
    is_active: bool = True


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name_en: str | None = None
    name_ar: str | None = None
    description_en: str | None = None
    description_ar: str | None = None
    head_id: str | None = None
    email: EmailStr | None = None
    is_active: bool | None = None


class DepartmentOut(DepartmentBase):
    id: str
    slug: str

    class Config:
        from_attributes = True


# ── Faculty Members ───────────────────────────────────────────────────────────
AcademicRank = Literal[
    "professor", "associate_professor", "assistant_professor", "lecturer", "teaching_assistant"
]


class FacultyMemberBase(BaseModel):
    name_en: str
    name_ar: str
    title_en: str = ""
    title_ar: str = ""
    rank: AcademicRank = "lecturer"
    department_id: str
    email: EmailStr
    phone: str | None = None
    office: str | None = None
    office_hours: str | None = None
    bio_en: str = ""
    bio_ar: str = ""
    research_interests_en: list[str] = Field(default_factory=list)
    research_interests_ar: list[str] = Field(default_factory=list)
    is_active: bool = True


class FacultyMemberCreate(FacultyMemberBase):
    pass


class FacultyMemberUpdate(BaseModel):
    name_en: str | None = None
    name_ar: str | None = None
    title_en: str | None = None
    title_ar: str | None = None
    rank: AcademicRank | None = None
    department_id: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    office: str | None = None
    office_hours: str | None = None
    bio_en: str | None = None
    bio_ar: str | None = None
    research_interests_en: list[str] | None = None
    research_interests_ar: list[str] | None = None
    photo_url: str | None = None
    is_active: bool | None = None


class FacultyMemberOut(FacultyMemberBase):
    id: str
    photo_url: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── News ─────────────────────────────────────────────────────────────────────
class NewsArticleBase(BaseModel):
    title_en: str
    title_ar: str
    excerpt_en: str = ""
    excerpt_ar: str = ""
    content_en: str = ""
    content_ar: str = ""
    category_id: str
    is_featured: bool = False
    is_published: bool = False


class NewsArticleCreate(NewsArticleBase):
    pass


class NewsArticleUpdate(BaseModel):
    title_en: str | None = None
    title_ar: str | None = None
    excerpt_en: str | None = None
    excerpt_ar: str | None = None
    content_en: str | None = None
    content_ar: str | None = None
    category_id: str | None = None
    image_url: str | None = None
    is_featured: bool | None = None
    is_published: bool | None = None


class NewsArticleOut(NewsArticleBase):
    id: str
    slug: str
    image_url: str | None = None
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Events ────────────────────────────────────────────────────────────────────
class EventBase(BaseModel):
    title_en: str
    title_ar: str
    description_en: str = ""
    description_ar: str = ""
    location_en: str = ""
    location_ar: str = ""
    start_date: datetime
    end_date: datetime | None = None
    registration_url: str | None = None
    is_published: bool = False


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title_en: str | None = None
    title_ar: str | None = None
    description_en: str | None = None
    description_ar: str | None = None
    location_en: str | None = None
    location_ar: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    banner_url: str | None = None
    registration_url: str | None = None
    is_published: bool | None = None


class EventOut(EventBase):
    id: str
    banner_url: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Research ──────────────────────────────────────────────────────────────────
ResearchStatus = Literal["active", "completed", "pending"]


class ResearchProjectBase(BaseModel):
    title_en: str
    title_ar: str
    description_en: str = ""
    description_ar: str = ""
    principal_investigator_id: str | None = None
    status: ResearchStatus = "active"
    start_date: datetime
    end_date: datetime | None = None
    funding_source: str | None = None
    is_published: bool = True


class ResearchProjectCreate(ResearchProjectBase):
    pass


class ResearchProjectUpdate(BaseModel):
    title_en: str | None = None
    title_ar: str | None = None
    description_en: str | None = None
    description_ar: str | None = None
    principal_investigator_id: str | None = None
    status: ResearchStatus | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    funding_source: str | None = None
    is_published: bool | None = None


class ResearchProjectOut(ResearchProjectBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class LaboratoryBase(BaseModel):
    name_en: str
    name_ar: str
    description_en: str = ""
    description_ar: str = ""
    department_id: str
    program_ids: list[str] = Field(default_factory=list)
    is_active: bool = True


class LaboratoryCreate(LaboratoryBase):
    pass


class LaboratoryUpdate(BaseModel):
    name_en: str | None = None
    name_ar: str | None = None
    description_en: str | None = None
    description_ar: str | None = None
    department_id: str | None = None
    program_ids: list[str] | None = None
    image_url: str | None = None
    is_active: bool | None = None


class LaboratoryOut(LaboratoryBase):
    id: str
    image_url: str | None = None

    class Config:
        from_attributes = True


# ── Downloads ─────────────────────────────────────────────────────────────────
DownloadCategory = Literal["study_plan", "regulation", "guide", "form", "other"]


class DownloadBase(BaseModel):
    title_en: str
    title_ar: str
    category: DownloadCategory = "other"
    program_id: str | None = None
    is_active: bool = True


class DownloadCreate(DownloadBase):
    pass


class DownloadUpdate(BaseModel):
    title_en: str | None = None
    title_ar: str | None = None
    category: DownloadCategory | None = None
    program_id: str | None = None
    is_active: bool | None = None


class DownloadOut(DownloadBase):
    id: str
    file_url: str
    file_size: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Homepage ──────────────────────────────────────────────────────────────────
class HomepageContentUpdate(BaseModel):
    hero_headline_en: str | None = None
    hero_headline_ar: str | None = None
    hero_subtitle_en: str | None = None
    hero_subtitle_ar: str | None = None
    announcement_text_en: str | None = None
    announcement_text_ar: str | None = None
    announcement_link: str | None = None
    dean_name: str | None = None
    dean_name_ar: str | None = None
    dean_title_en: str | None = None
    dean_title_ar: str | None = None
    dean_message_en: str | None = None
    dean_message_ar: str | None = None
    dean_email: EmailStr | None = None
    stat_programs: int | None = None
    stat_faculty: int | None = None
    stat_students: int | None = None
    stat_labs: int | None = None
    stat_partners: int | None = None
    stat_publications: int | None = None


class HomepageContentOut(BaseModel):
    id: str
    hero_headline_en: str
    hero_headline_ar: str
    hero_subtitle_en: str
    hero_subtitle_ar: str
    announcement_text_en: str
    announcement_text_ar: str
    announcement_link: str | None = None
    dean_name: str
    dean_name_ar: str 
    dean_title_en: str
    dean_title_ar: str
    dean_message_en: str
    dean_message_ar: str
    dean_email: EmailStr
    dean_photo_url: str | None = None
    stat_programs: int
    stat_faculty: int
    stat_students: int
    stat_labs: int
    stat_partners: int
    stat_publications: int
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Contact ───────────────────────────────────────────────────────────────────
class ContactInfoUpdate(BaseModel):
    address_en: str | None = None
    address_ar: str | None = None
    phone_primary: str | None = None
    phone_secondary: str | None = None
    email_general: EmailStr | None = None
    email_admissions: EmailStr | None = None
    working_hours_en: str | None = None
    working_hours_ar: str | None = None
    google_maps_url: str | None = None
    facebook_url: str | None = None
    twitter_url: str | None = None
    linkedin_url: str | None = None
    youtube_url: str | None = None


class ContactInfoOut(BaseModel):
    id: str
    address_en: str
    address_ar: str
    phone_primary: str
    phone_secondary: str | None = None
    email_general: EmailStr
    email_admissions: EmailStr
    working_hours_en: str
    working_hours_ar: str
    google_maps_url: str | None = None
    facebook_url: str | None = None
    twitter_url: str | None = None
    linkedin_url: str | None = None
    youtube_url: str | None = None

    class Config:
        from_attributes = True


class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str = ""
    message: str


# ── Pagination ────────────────────────────────────────────────────────────────
class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
