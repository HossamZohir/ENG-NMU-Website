import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { initLang } from '@/i18n'

// Layouts
import PublicLayout from '@/components/layout/PublicLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import ProtectedRoute from '@/components/layout/ProtectedRoute'

// Public pages
import Home from '@/pages/Home'
import About from '@/pages/About'
import Programs from '@/pages/Programs'
import ProgramDetails from '@/pages/ProgramDetails'
import Faculty from '@/pages/Faculty'
import FacultyProfile from '@/pages/FacultyProfile'
import Departments from '@/pages/Departments'
import Research from '@/pages/Research'
import News from '@/pages/News'
import NewsDetails from '@/pages/NewsDetails'
import Events from '@/pages/Events'
import Gallery from '@/pages/Gallery'
import Downloads from '@/pages/Downloads'
import Contact from '@/pages/Contact'

// Admin pages
import AdminLogin from '@/pages/admin/Login'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminHomepage from '@/pages/admin/Homepage'
import AdminPrograms from '@/pages/admin/Programs'
import AdminNews from '@/pages/admin/News'
import AdminUsers from '@/pages/admin/Users'
import {
  AdminMembers,
  AdminEvents,
  AdminResearch,
  AdminDownloads,
  AdminContact,
  AdminGallery,
  AdminSettings,
} from '@/pages/admin/AdminPages'

const NotFound: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <div className="text-6xl mb-4">🧭</div>
    <h1 className="text-2xl font-extrabold text-gray-800 mb-2">404 — Page Not Found</h1>
    <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
    <a href="/" className="btn-primary">Go Home</a>
  </div>
)

const App: React.FC = () => {
  useEffect(() => {
    initLang()
  }, [])

  return (
    <Routes>
      {/* ── Public Site ───────────────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/programs/:slug" element={<ProgramDetails />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/faculty/:id" element={<FacultyProfile />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/research" element={<Research />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsDetails />} />
        <Route path="/events" element={<Events />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* ── Admin Login (public) ───────────────────────────────────── */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ── Admin CMS (JWT protected) ─────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/homepage" element={<AdminHomepage />} />
          <Route path="/admin/programs" element={<AdminPrograms />} />
          <Route path="/admin/members" element={<AdminMembers />} />
          <Route path="/admin/news" element={<AdminNews />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/research" element={<AdminResearch />} />
          <Route path="/admin/downloads" element={<AdminDownloads />} />
          <Route path="/admin/gallery" element={<AdminGallery />} />
          <Route path="/admin/contact" element={<AdminContact />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* ── Super Admin only ──────────────────────────────────────── */}
      <Route element={<ProtectedRoute requireSuperAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Route>

      {/* ── 404 ──────────────────────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
