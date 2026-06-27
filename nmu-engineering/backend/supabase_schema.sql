-- =============================================================================
-- NMU Faculty of Engineering — Supabase PostgreSQL Schema
-- v2: Fixed table creation order (no forward references)
-- =============================================================================
-- Run this entire script in the Supabase SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS + ON CONFLICT DO NOTHING.
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. USERS (Admin accounts) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name     TEXT NOT NULL,
    full_name_ar  TEXT NOT NULL DEFAULT '',
    role          TEXT NOT NULL DEFAULT 'admin'
                      CHECK (role IN ('admin', 'super_admin')),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    last_login    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);


-- ── 2. FACULTY MEMBERS (must exist before departments references it) ────────
CREATE TABLE IF NOT EXISTS faculty_members (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en               TEXT NOT NULL,
    name_ar               TEXT NOT NULL,
    title_en              TEXT NOT NULL DEFAULT '',
    title_ar              TEXT NOT NULL DEFAULT '',
    rank                  TEXT NOT NULL DEFAULT 'lecturer'
                              CHECK (rank IN (
                                  'professor',
                                  'associate_professor',
                                  'assistant_professor',
                                  'lecturer',
                                  'teaching_assistant'
                              )),
    department_id         TEXT NOT NULL DEFAULT '',
    email                 TEXT NOT NULL,
    phone                 TEXT,
    office                TEXT,
    office_hours          TEXT,
    bio_en                TEXT NOT NULL DEFAULT '',
    bio_ar                TEXT NOT NULL DEFAULT '',
    research_interests_en JSONB NOT NULL DEFAULT '[]',
    research_interests_ar JSONB NOT NULL DEFAULT '[]',
    photo_url             TEXT,
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty_members(department_id);
CREATE INDEX IF NOT EXISTS idx_faculty_rank        ON faculty_members(rank);
CREATE INDEX IF NOT EXISTS idx_faculty_is_active   ON faculty_members(is_active);


-- ── 3. PROGRAMS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS programs (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug           TEXT UNIQUE NOT NULL,
    name_en        TEXT NOT NULL,
    name_ar        TEXT NOT NULL,
    description_en TEXT NOT NULL DEFAULT '',
    description_ar TEXT NOT NULL DEFAULT '',
    icon           TEXT NOT NULL DEFAULT '🎓',
    duration_years INTEGER NOT NULL DEFAULT 4,
    credit_hours   INTEGER NOT NULL DEFAULT 160,
    language       TEXT NOT NULL DEFAULT 'English',
    vision_en      TEXT NOT NULL DEFAULT '',
    vision_ar      TEXT NOT NULL DEFAULT '',
    mission_en     TEXT NOT NULL DEFAULT '',
    mission_ar     TEXT NOT NULL DEFAULT '',
    coordinator_id UUID REFERENCES faculty_members(id) ON DELETE SET NULL,
    study_plan_url TEXT,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_programs_slug      ON programs(slug);
CREATE INDEX IF NOT EXISTS idx_programs_is_active ON programs(is_active);


-- ── 4. DEPARTMENTS ─────────────────────────────────────────────────────────
-- head_id references faculty_members, which now exists.
CREATE TABLE IF NOT EXISTS departments (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug           TEXT UNIQUE NOT NULL,
    name_en        TEXT NOT NULL,
    name_ar        TEXT NOT NULL,
    description_en TEXT NOT NULL DEFAULT '',
    description_ar TEXT NOT NULL DEFAULT '',
    head_id        UUID REFERENCES faculty_members(id) ON DELETE SET NULL,
    email          TEXT,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_departments_slug ON departments(slug);


-- ── 5. PUBLICATIONS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS publications (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID NOT NULL REFERENCES faculty_members(id) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    journal    TEXT NOT NULL DEFAULT '',
    year       INTEGER NOT NULL,
    url        TEXT,
    doi        TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publications_faculty ON publications(faculty_id);


-- ── 6. NEWS CATEGORIES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS news_categories (
    id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug    TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL
);

INSERT INTO news_categories (id, slug, name_en, name_ar)
VALUES
    (uuid_generate_v4(), 'research',     'Research',     'بحث'),
    (uuid_generate_v4(), 'events',       'Events',       'فعاليات'),
    (uuid_generate_v4(), 'achievement',  'Achievement',  'إنجاز'),
    (uuid_generate_v4(), 'partnership',  'Partnership',  'شراكة'),
    (uuid_generate_v4(), 'academic',     'Academic',     'أكاديمي'),
    (uuid_generate_v4(), 'announcement', 'Announcement', 'إعلان')
ON CONFLICT (slug) DO NOTHING;


-- ── 7. NEWS ARTICLES ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS news_articles (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug         TEXT UNIQUE NOT NULL,
    title_en     TEXT NOT NULL,
    title_ar     TEXT NOT NULL,
    excerpt_en   TEXT NOT NULL DEFAULT '',
    excerpt_ar   TEXT NOT NULL DEFAULT '',
    content_en   TEXT NOT NULL DEFAULT '',
    content_ar   TEXT NOT NULL DEFAULT '',
    category_id  TEXT NOT NULL,
    image_url    TEXT,
    is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_slug      ON news_articles(slug);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_featured  ON news_articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_news_category  ON news_articles(category_id);


-- ── 8. EVENTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en         TEXT NOT NULL,
    title_ar         TEXT NOT NULL,
    description_en   TEXT NOT NULL DEFAULT '',
    description_ar   TEXT NOT NULL DEFAULT '',
    location_en      TEXT NOT NULL DEFAULT '',
    location_ar      TEXT NOT NULL DEFAULT '',
    start_date       TIMESTAMPTZ NOT NULL,
    end_date         TIMESTAMPTZ,
    banner_url       TEXT,
    registration_url TEXT,
    is_published     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_start_date   ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON events(is_published);


-- ── 9. RESEARCH PROJECTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS research_projects (
    id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en                  TEXT NOT NULL,
    title_ar                  TEXT NOT NULL,
    description_en            TEXT NOT NULL DEFAULT '',
    description_ar            TEXT NOT NULL DEFAULT '',
    principal_investigator_id UUID REFERENCES faculty_members(id) ON DELETE SET NULL,
    status                    TEXT NOT NULL DEFAULT 'active'
                                  CHECK (status IN ('active', 'completed', 'pending')),
    start_date                TIMESTAMPTZ NOT NULL,
    end_date                  TIMESTAMPTZ,
    funding_source            TEXT,
    is_published              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_status ON research_projects(status);


-- ── 10. LABORATORIES ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS laboratories (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en        TEXT NOT NULL,
    name_ar        TEXT NOT NULL,
    description_en TEXT NOT NULL DEFAULT '',
    description_ar TEXT NOT NULL DEFAULT '',
    department_id  TEXT NOT NULL DEFAULT '',
    program_ids    JSONB NOT NULL DEFAULT '[]',
    image_url      TEXT,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_labs_department ON laboratories(department_id);


-- ── 11. DOWNLOADS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS downloads (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en   TEXT NOT NULL,
    title_ar   TEXT NOT NULL,
    category   TEXT NOT NULL DEFAULT 'other'
                   CHECK (category IN (
                       'study_plan', 'regulation', 'guide', 'form', 'other'
                   )),
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    file_url   TEXT NOT NULL,
    file_size  BIGINT,
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_downloads_category  ON downloads(category);
CREATE INDEX IF NOT EXISTS idx_downloads_program   ON downloads(program_id);
CREATE INDEX IF NOT EXISTS idx_downloads_is_active ON downloads(is_active);


-- ── 12. GALLERY ALBUMS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery_albums (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en    TEXT NOT NULL,
    name_ar    TEXT NOT NULL,
    cover_url  TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 13. GALLERY MEDIA ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery_media (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id   UUID NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
    url        TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'image'
                   CHECK (media_type IN ('image', 'video')),
    caption_en TEXT,
    caption_ar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_media_album ON gallery_media(album_id);


-- ── 14. HOMEPAGE CONTENT (singleton) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS homepage_content (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hero_headline_en     TEXT NOT NULL DEFAULT 'Shaping Tomorrow''s Engineers Today',
    hero_headline_ar     TEXT NOT NULL DEFAULT 'نُشكِّل مهندسي الغد اليوم',
    hero_subtitle_en     TEXT NOT NULL DEFAULT 'Join Egypt''s most innovative engineering faculty.',
    hero_subtitle_ar     TEXT NOT NULL DEFAULT 'انضم إلى كلية الهندسة الأكثر ابتكاراً في مصر.',
    announcement_text_en TEXT NOT NULL DEFAULT 'Registration for Fall 2025/2026 is now open',
    announcement_text_ar TEXT NOT NULL DEFAULT 'التسجيل للعام الدراسي 2025/2026 مفتوح الآن',
    announcement_link    TEXT DEFAULT '/contact',
    dean_name            TEXT NOT NULL DEFAULT 'Prof. Dr. Ahmed Hassan Ibrahim',
    dean_name_ar         TEXT NOT NULL DEFAULT 'أ.د. وائل صديق',
    dean_title_en        TEXT NOT NULL DEFAULT 'Dean, Faculty of Engineering',
    dean_title_ar        TEXT NOT NULL DEFAULT 'عميد كلية الهندسة',
    dean_message_en      TEXT NOT NULL DEFAULT 'At New Mansoura University''s Faculty of Engineering, we are committed to providing a world-class education that bridges theory with practice.',
    dean_message_ar      TEXT NOT NULL DEFAULT 'في كلية الهندسة بجامعة المنصورة الجديدة، نلتزم بتقديم تعليم عالمي المستوى يجمع بين النظرية والتطبيق.',
    dean_email           TEXT NOT NULL DEFAULT 'dean.eng@nmu.edu.eg',
    dean_photo_url       TEXT,
    stat_programs        INTEGER NOT NULL DEFAULT 7,
    stat_faculty         INTEGER NOT NULL DEFAULT 124,
    stat_students        INTEGER NOT NULL DEFAULT 3500,
    stat_labs            INTEGER NOT NULL DEFAULT 15,
    stat_partners        INTEGER NOT NULL DEFAULT 50,
    stat_publications    INTEGER NOT NULL DEFAULT 300,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the singleton row
INSERT INTO homepage_content DEFAULT VALUES
ON CONFLICT DO NOTHING;


-- ── 15. CONTACT INFORMATION (singleton) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_information (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address_en       TEXT NOT NULL DEFAULT 'New Mansoura City, Dakahlia Governorate, Egypt',
    address_ar       TEXT NOT NULL DEFAULT 'مدينة المنصورة الجديدة، محافظة الدقهلية، مصر',
    phone_primary    TEXT NOT NULL DEFAULT '+20 50 123 4567',
    phone_secondary  TEXT,
    email_general    TEXT NOT NULL DEFAULT 'engineering@nmu.edu.eg',
    email_admissions TEXT NOT NULL DEFAULT 'admissions.eng@nmu.edu.eg',
    working_hours_en TEXT NOT NULL DEFAULT 'Sunday – Thursday, 9:00 AM – 3:00 PM',
    working_hours_ar TEXT NOT NULL DEFAULT 'الأحد – الخميس، ٩:٠٠ ص – ٣:٠٠ م',
    google_maps_url  TEXT,
    facebook_url     TEXT,
    twitter_url      TEXT,
    linkedin_url     TEXT,
    youtube_url      TEXT
);

-- Seed the singleton row
INSERT INTO contact_information DEFAULT VALUES
ON CONFLICT DO NOTHING;


-- ── 16. CONTACT MESSAGES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    subject    TEXT NOT NULL DEFAULT '',
    message    TEXT NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON contact_messages(is_read);


-- ── 17. ANNOUNCEMENTS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text_en    TEXT NOT NULL,
    text_ar    TEXT NOT NULL,
    link_url   TEXT,
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);


-- ── 18. AUDIT LOGS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    action        TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id   TEXT,
    details       JSONB NOT NULL DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user     ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created  ON audit_logs(created_at DESC);


-- ── 19. SETTINGS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
    key        TEXT PRIMARY KEY,
    value      JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- SEED: Default programs
-- =============================================================================
INSERT INTO programs (id, slug, name_en, name_ar, description_en, description_ar,
                      icon, duration_years, credit_hours, language,
                      vision_en, vision_ar, mission_en, mission_ar)
VALUES
    (uuid_generate_v4(), 'civil',
     'Civil Construction Engineering Technology',
     'هندسة وتكنولوجيا تنفيذ الأعمال المدنية',
     'Advanced training in structural engineering, construction management, and sustainable building technologies.',
     'تدريب متقدم في الهندسة الإنشائية وإدارة المشاريع وتكنولوجيا البناء المستدام.',
     '🏗', 4, 160, 'English',
     'To lead in civil construction education and innovation across the region.',
     'الريادة في تعليم وابتكار هندسة الإنشاءات المدنية في المنطقة.',
     'Equip students with technical and managerial skills for the construction industry.',
     'تزويد الطلاب بالمهارات التقنية والإدارية لصناعة الإنشاءات.'),

    (uuid_generate_v4(), 'aerospace',
     'Aerospace Engineering',
     'هندسة الطيران والفضاء',
     'Aviation, space systems, aerodynamics and propulsion engineering for the modern aerospace industry.',
     'الطيران وأنظمة الفضاء والديناميكا الهوائية والدفع لصناعة الطيران الحديثة.',
     '✈️', 4, 160, 'English',
     'To be a regional leader in aerospace engineering education and research.',
     'أن نكون رائدين إقليمياً في تعليم وبحث هندسة الطيران والفضاء.',
     'Train engineers capable of designing and maintaining aerospace systems.',
     'تدريب مهندسين قادرين على تصميم وصيانة أنظمة الطيران والفضاء.'),

    (uuid_generate_v4(), 'petroleum',
     'Petroleum and Gas Engineering',
     'هندسة البترول والغاز',
     'Exploration, drilling, production, and processing of petroleum and natural gas resources.',
     'استكشاف وحفر وإنتاج ومعالجة موارد البترول والغاز الطبيعي.',
     '⛽', 4, 160, 'English',
     'To advance sustainable petroleum engineering practices nationally.',
     'تطوير ممارسات هندسة البترول المستدامة على المستوى الوطني.',
     'Prepare graduates for careers across the energy value chain.',
     'تأهيل الخريجين لمسارات مهنية عبر سلسلة قيمة الطاقة.'),

    (uuid_generate_v4(), 'architecture',
     'Environmental Architecture & Building Technology',
     'العمارة البيئية وتكنولوجيا البناء',
     'Sustainable design principles, building technology, and environmental systems integration.',
     'مبادئ التصميم المستدام وتكنولوجيا البناء وتكامل الأنظمة البيئية.',
     '🏛', 4, 160, 'English',
     'To pioneer environmentally responsive architecture in Egypt.',
     'الريادة في العمارة المستجيبة بيئياً في مصر.',
     'Educate architects who integrate sustainability into every design.',
     'تعليم مهندسين معماريين يدمجون الاستدامة في كل تصميم.'),

    (uuid_generate_v4(), 'mechatronics',
     'Mechatronics Engineering',
     'هندسة الميكاترونيكس',
     'Integration of mechanical, electrical, computer and control engineering for intelligent systems.',
     'تكامل الهندسة الميكانيكية والكهربائية والحاسوبية للأنظمة الذكية.',
     '🤖', 4, 160, 'English',
     'To lead innovation in robotics and intelligent automation systems.',
     'قيادة الابتكار في الروبوتات وأنظمة الأتمتة الذكية.',
     'Develop multidisciplinary engineers fluent in mechanical, electronic, and software systems.',
     'تطوير مهندسين متعددي التخصصات في الأنظمة الميكانيكية والإلكترونية والبرمجية.'),

    (uuid_generate_v4(), 'energy',
     'Energy Engineering',
     'هندسة الطاقة',
     'Renewable energy systems, power engineering, and sustainable energy solutions for the future.',
     'أنظمة الطاقة المتجددة وهندسة القدرة وحلول الطاقة المستدامة للمستقبل.',
     '⚡', 4, 160, 'English',
     'To accelerate Egypt''s transition to sustainable energy systems.',
     'تسريع انتقال مصر إلى أنظمة الطاقة المستدامة.',
     'Train energy engineers in renewable technologies and grid systems.',
     'تدريب مهندسي طاقة في تقنيات الطاقة المتجددة وأنظمة الشبكات.'),

    (uuid_generate_v4(), 'biomedical',
     'Biomedical Engineering',
     'الهندسة الطبية الحيوية',
     'Medical device development, healthcare technology, and biological systems engineering.',
     'تطوير الأجهزة الطبية وتكنولوجيا الرعاية الصحية وهندسة الأنظمة الحيوية.',
     '🏥', 4, 160, 'English',
     'To bridge engineering and medicine for better healthcare outcomes.',
     'الجمع بين الهندسة والطب لتحسين نتائج الرعاية الصحية.',
     'Develop engineers who design life-improving medical technologies.',
     'تطوير مهندسين يصممون تقنيات طبية تحسن الحياة.')
ON CONFLICT (slug) DO NOTHING;


-- =============================================================================
-- SEED: Default Super Admin
-- Password: NMU@2025!
-- bcrypt hash (cost=12): regenerate with Python before going live:
--   python3 -c "import bcrypt; print(bcrypt.hashpw(b'NMU@2025!', bcrypt.gensalt(12)).decode())"
-- =============================================================================
INSERT INTO users (id, email, password_hash, full_name, full_name_ar, role, is_active)
VALUES (
    uuid_generate_v4(),
    'superadmin@nmu.edu.eg',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4v/pCmkBZ6',
    'Super Administrator',
    'المشرف العام',
    'super_admin',
    TRUE
)
ON CONFLICT (email) DO NOTHING;


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
-- Enable RLS on sensitive tables. The backend uses the service-role key
-- which bypasses RLS. The anon key is used only for public reads and
-- is intentionally NOT granted access to these tables.
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Public tables (no RLS needed — service-role key controls writes):
-- programs, departments, faculty_members, publications, news_categories,
-- news_articles, events, research_projects, laboratories, downloads,
-- gallery_albums, gallery_media, homepage_content, contact_information,
-- announcements, settings


-- =============================================================================
-- STORAGE BUCKET SETUP INSTRUCTIONS
-- =============================================================================
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create a new bucket named:  nmu-media
-- 3. Set it to PUBLIC (for image/file serving)
-- 4. Add a storage policy:
--    • SELECT (read): allow for all (public)  → "true"
--    • INSERT/UPDATE/DELETE (write): service role only (backend handles this)
-- 5. The following folders will be created automatically on first upload:
--    news/, events/, faculty/, programs/, gallery/, documents/


-- =============================================================================
-- VERIFICATION QUERY — run after applying schema to confirm all tables exist
-- =============================================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
      'users', 'faculty_members', 'programs', 'departments', 'publications',
      'news_categories', 'news_articles', 'events', 'research_projects',
      'laboratories', 'downloads', 'gallery_albums', 'gallery_media',
      'homepage_content', 'contact_information', 'contact_messages',
      'announcements', 'audit_logs', 'settings'
  )
ORDER BY table_name;
-- Expected: 19 rows
