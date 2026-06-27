# 🏛 NMU Faculty of Engineering — Full-Stack Website & CMS

> **New Mansoura University · Faculty of Engineering**
> Bilingual (Arabic/English) public website + secure admin CMS.

---

## 🗂 Project Structure

```
nmu-engineering/
├── frontend/          ← React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/         ← Public pages + Admin pages
│   │   ├── components/    ← UI atoms + layout wrappers
│   │   ├── store/         ← Zustand (auth, language)
│   │   ├── api/           ← Axios API modules
│   │   ├── i18n/          ← Custom EN/AR translation system
│   │   ├── hooks/         ← useTranslation, useAuth
│   │   └── types/         ← TypeScript type definitions
│   └── vercel.json        ← SPA rewrites for Vercel
│
└── backend/           ← FastAPI (Python) + Supabase PostgreSQL
    ├── main.py            ← App entrypoint, CORS, router registration
    ├── database.py        ← Fresh Supabase client factory
    ├── core/
    │   ├── config.py      ← Pydantic settings from .env
    │   ├── security.py    ← bcrypt + JWT (HS256, 8h expiry)
    │   └── dependencies.py← get_current_user, require_admin, require_super_admin
    ├── routers/           ← One router per resource
    │   ├── auth.py        ← POST /auth/login (email+password → JWT)
    │   ├── users.py       ← Super Admin user CRUD
    │   ├── programs.py    ← Academic programs + study plan upload
    │   ├── departments.py ← Departments CRUD
    │   ├── faculty.py     ← Faculty members + photo upload
    │   ├── news.py        ← News articles + image upload
    │   ├── events.py      ← Events + banner upload
    │   ├── research.py    ← Research projects + laboratories
    │   ├── downloads.py   ← Document management + PDF upload
    │   ├── gallery.py     ← Albums + media upload
    │   ├── homepage.py    ← Singleton homepage editor
    │   ├── contact.py     ← Singleton contact info + message inbox
    │   └── dashboard.py   ← Aggregate stats for admin dashboard
    ├── schemas/
    │   ├── auth.py        ← User, Token, role schemas
    │   └── content.py     ← All content entity schemas
    ├── services/
    │   ├── slug.py        ← URL slug generation (EN + AR)
    │   ├── storage.py     ← Supabase Storage file upload helper
    │   └── audit.py       ← Audit log writer
    ├── supabase_schema.sql← Full DB schema + seed data
    ├── render.yaml        ← Render deployment config
    └── requirements.txt
```

---

## 🚀 Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_KEY, JWT_SECRET_KEY

pip install -r requirements.txt

# Set up the database
# → Open Supabase SQL editor and run supabase_schema.sql

uvicorn main:app --reload --port 8000
```

**Default Super Admin credentials (from seed):**
- Email: `superadmin@nmu.edu.eg`
- Password: `NMU@2025!`
- ⚠️ Change this immediately after first login!

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:8000

npm install
npm run dev
```

Frontend: http://localhost:3000

Admin login: http://localhost:3000/admin/login

---

## 🔐 Authentication Flow

1. Admin navigates to `/admin` → redirected to `/admin/login`
2. Enters **email + password** → POST `/auth/login` (form-urlencoded)
3. Backend verifies bcrypt hash → issues **JWT** (HS256, 8-hour expiry)
4. Token stored in Zustand (persisted via `localStorage`)
5. All admin API calls include `Authorization: Bearer <token>`
6. Auto-logout fires after 8 hours; 401 responses redirect to login

---

## 🌐 Public Routes

| Path | Page |
|------|------|
| `/` | Home |
| `/about` | About the Faculty |
| `/programs` | All 7 Programs |
| `/programs/:slug` | Program Detail (tabs: overview, outcomes, curriculum, careers, labs) |
| `/faculty` | Faculty Members (searchable, filterable) |
| `/faculty/:id` | Faculty Profile |
| `/departments` | Departments |
| `/research` | Research Projects + Labs |
| `/news` | News (paginated, filterable by category) |
| `/news/:slug` | Article Detail |
| `/events` | Events (upcoming/past toggle) |
| `/gallery` | Photo & Video Albums |
| `/downloads` | Document Downloads |
| `/contact` | Contact Form + Info |

---

## ⚙️ Admin Routes (JWT protected)

| Path | Module |
|------|--------|
| `/admin/login` | Login page |
| `/admin` | Dashboard |
| `/admin/homepage` | Edit hero, dean message, stats |
| `/admin/programs` | Programs CRUD + study plan upload |
| `/admin/members` | Faculty members CRUD + photo upload |
| `/admin/news` | News CRUD + image upload |
| `/admin/events` | Events CRUD + banner upload |
| `/admin/research` | Research projects CRUD |
| `/admin/downloads` | Document upload / management |
| `/admin/gallery` | Albums + media upload |
| `/admin/contact` | Contact info editor |
| `/admin/users` | **Super Admin only** — manage admin accounts |
| `/admin/settings` | Change own password |

---

## 🌍 Bilingual System

- **No** `react-i18next` — custom `t(key)` function in `src/i18n/index.ts`
- Language stored in `localStorage` as `nmu_lang`
- RTL/LTR applied to `<html dir>` and `<body class="ar">`
- All content fields are bilingual: `title_en` / `title_ar`, etc.
- Toggle button in navbar switches between EN ↔ عربي

---

## 🚢 Deployment

**Frontend → Vercel**
```bash
cd frontend
vercel --prod
# Set VITE_API_URL in Vercel dashboard
```

**Backend → Render**
- Connect GitHub repo
- Root directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Set env vars: `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET_KEY`, `ALLOWED_ORIGINS`

**Supabase Storage**
- Create bucket `nmu-media` (public)
- Folders: `news/`, `events/`, `faculty/`, `programs/`, `gallery/`, `documents/`

---

## 📐 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18.2, TypeScript, Vite, Tailwind CSS |
| Routing | React Router v6 |
| State | Zustand (auth + language) |
| HTTP | Axios with JWT interceptors |
| Backend | FastAPI (Python 3.11+) |
| Database | Supabase PostgreSQL |
| Auth | JWT (HS256) + bcrypt password hashing |
| Storage | Supabase Storage |
| Deploy Frontend | Vercel |
| Deploy Backend | Render |
