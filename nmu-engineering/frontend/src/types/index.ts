// ── Auth ──────────────────────────────────────────────────────────────────────
export type Role = 'admin' | 'super_admin'

export interface User {
  id: string
  email: string
  full_name: string
  full_name_ar: string
  role: Role
  is_active: boolean
  created_at: string
  last_login?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

// ── Programs ──────────────────────────────────────────────────────────────────
export interface Program {
  id: string
  slug: string
  name_en: string
  name_ar: string
  description_en: string
  description_ar: string
  icon: string
  duration_years: number
  credit_hours: number
  language: string
  vision_en: string
  vision_ar: string
  mission_en: string
  mission_ar: string
  coordinator_id?: string
  coordinator_name_en?: string
  coordinator_name_ar?: string
  coordinator_email?: string
  study_plan_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CourseItem {
  id: string
  program_id: string
  name_en: string
  name_ar: string
  code: string
  credit_hours: number
  semester: number
  year: number
  is_required: boolean
}

export interface LearningOutcome {
  id: string
  program_id: string
  outcome_en: string
  outcome_ar: string
  order_index: number
}

// ── Faculty Members ───────────────────────────────────────────────────────────
export type AcademicRank =
  | 'professor'
  | 'associate_professor'
  | 'assistant_professor'
  | 'lecturer'
  | 'teaching_assistant'

export interface FacultyMember {
  id: string
  name_en: string
  name_ar: string
  title_en: string
  title_ar: string
  rank: AcademicRank
  department_id: string
  department_name?: string
  email: string
  phone?: string
  office?: string
  office_hours?: string
  bio_en: string
  bio_ar: string
  photo_url?: string
  research_interests_en: string[]
  research_interests_ar: string[]
  publications?: Publication[]
  is_active: boolean
  created_at: string
}

export interface Publication {
  id: string
  faculty_id: string
  title: string
  journal: string
  year: number
  url?: string
  doi?: string
}

// ── Department ────────────────────────────────────────────────────────────────
export interface Department {
  id: string
  name_en: string
  name_ar: string
  slug: string
  description_en: string
  description_ar: string
  head_id?: string
  email?: string
  is_active: boolean
}

// ── News ─────────────────────────────────────────────────────────────────────
export interface NewsCategory {
  id: string
  name_en: string
  name_ar: string
  slug: string
}

export interface NewsArticle {
  id: string
  title_en: string
  title_ar: string
  slug: string
  excerpt_en: string
  excerpt_ar: string
  content_en: string
  content_ar: string
  category_id: string
  category?: NewsCategory
  image_url?: string
  is_featured: boolean
  is_published: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

// ── Events ────────────────────────────────────────────────────────────────────
export interface Event {
  id: string
  title_en: string
  title_ar: string
  description_en: string
  description_ar: string
  location_en: string
  location_ar: string
  start_date: string
  end_date?: string
  banner_url?: string
  registration_url?: string
  is_published: boolean
  created_at: string
}

// ── Research ──────────────────────────────────────────────────────────────────
export interface ResearchProject {
  id: string
  title_en: string
  title_ar: string
  description_en: string
  description_ar: string
  principal_investigator_id?: string
  pi_name?: string
  status: 'active' | 'completed' | 'pending'
  start_date: string
  end_date?: string
  funding_source?: string
  is_published: boolean
  created_at: string
}

export interface Laboratory {
  id: string
  name_en: string
  name_ar: string
  description_en: string
  description_ar: string
  department_id: string
  program_ids: string[]
  image_url?: string
  is_active: boolean
}

// ── Downloads ─────────────────────────────────────────────────────────────────
export interface Download {
  id: string
  title_en: string
  title_ar: string
  category: 'study_plan' | 'regulation' | 'guide' | 'form' | 'other'
  file_url: string
  file_size?: number
  program_id?: string
  is_active: boolean
  created_at: string
}

// ── Homepage ──────────────────────────────────────────────────────────────────
export interface HomepageContent {
  id: string
  hero_headline_en: string
  hero_headline_ar: string
  hero_subtitle_en: string
  hero_subtitle_ar: string
  announcement_text_en: string
  announcement_text_ar: string
  announcement_link?: string
  dean_name: string
  dean_name_ar: string
  dean_title_en: string
  dean_title_ar: string
  dean_message_en: string
  dean_message_ar: string
  dean_email: string
  dean_photo_url?: string
  stat_programs: number
  stat_faculty: number
  stat_students: number
  stat_labs: number
  stat_partners: number
  stat_publications: number
  updated_at: string
}

// ── Contact ───────────────────────────────────────────────────────────────────
export interface ContactInfo {
  id: string
  address_en: string
  address_ar: string
  phone_primary: string
  phone_secondary?: string
  email_general: string
  email_admissions: string
  working_hours_en: string
  working_hours_ar: string
  google_maps_url?: string
  facebook_url?: string
  twitter_url?: string
  linkedin_url?: string
  youtube_url?: string
}

// ── API Response wrappers ─────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiError {
  detail: string
  status?: number
}

// ── i18n ──────────────────────────────────────────────────────────────────────
export type Lang = 'en' | 'ar'
