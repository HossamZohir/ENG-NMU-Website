import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { homepageApi } from '@/api'
import type { HomepageContent } from '@/types'

const navLinks = [
  { key: 'nav.home', to: '/' },
  { key: 'nav.about', to: '/about' },
  { key: 'nav.programs', to: '/programs' },
  { key: 'nav.faculty', to: '/faculty' },
  { key: 'nav.research', to: '/research' },
  { key: 'nav.news', to: '/news' },
  { key: 'nav.events', to: '/events' },
  // { key: 'nav.contact', to: '/contact' }, // Removed
]

const Navbar: React.FC = () => {
  const { t, lang, toggle } = useTranslation()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [homepage, setHomepage] = useState<HomepageContent | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
  homepageApi
    .get()
    .then((data) => setHomepage(data))
    .catch((err) => console.error('Failed to load homepage:', err))
}, [])

  useEffect(() => setMobileOpen(false), [location.pathname])

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  // Get the announcement message
  const getAnnouncementText = () => {
  if (!homepage) {
    return lang === 'ar'
      ? '📢 التسجيل للعام الدراسي 2025/2026 مفتوح الآن — '
      : '📢 Registration for Fall 2025/2026 is now open — '
  }

  return lang === 'ar'
    ? `📢 ${homepage.announcement_text_ar} — `
    : `📢 ${homepage.announcement_text_en} — `
}

  return (
    <>
      {/* Announcement bar - Moving Marquee */}
      <div className="bg-nmu-red text-white py-2 border-b border-white/10 overflow-hidden relative">
        {/* Gradient fades on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-nmu-red to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-nmu-red to-transparent z-10 pointer-events-none"></div>
        
        {/* Live indicator */}
        <div className="flex-1 overflow-hidden relative">
  <div className="animate-marquee whitespace-nowrap">
    {Array.from({ length: 4 }).map((_, i) => (
      <span key={i} className="mx-4 text-xs font-medium">
        {getAnnouncementText()}
        <a
          href={homepage?.announcement_link || "https://www.nmu.edu.eg/en"}
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-bold hover:opacity-80 transition-opacity ml-1"
        >
          {lang === 'ar' ? 'تقدم الآن' : 'Apply Now'}
        </a>
      </span>
    ))}
  </div>
</div>
      </div>

      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-white border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-3">
            {/* Logo - Smaller */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src="/logo.svg" alt="NMU Logo" className="w-10 h-10 flex-shrink-0" />
              <div className="leading-tight">
                <div className="text-xs font-bold text-nmu-red">
                  {lang === 'ar' ? 'جامعة المنصورة الجديدة' : 'New Mansoura University'}
                </div>
                <div className="text-[10px] text-gray-500 font-medium">
                  {lang === 'ar' ? 'كلية الهندسة' : 'Faculty of Engineering'}
                </div>
              </div>
            </Link>

            {/* Desktop nav - Smaller text */}
            <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive(l.to)
                      ? 'text-nmu-red bg-nmu-red3'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {t(l.key)}
                </Link>
              ))}
            </div>

            {/* Actions - Smaller buttons */}
            <div className="flex items-center gap-2 flex-shrink-0 ms-auto lg:ms-0">
              <button
                onClick={toggle}
                className="hidden sm:block px-3 py-1 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:border-nmu-red hover:text-nmu-red transition-colors"
              >
                {lang === 'ar' ? 'EN' : 'عربي'}
              </button>
              
              {/* Admin - Icon only smaller */}
              <Link
                to="/admin"
                className="hidden sm:flex items-center justify-center w-8 h-8 bg-nmu-red text-white rounded-lg text-sm font-bold hover:bg-nmu-red2 transition-colors"
                aria-label="Admin Panel"
              >
                ⚙
              </Link>
              
              {/* Mobile hamburger - Smaller */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                <div className="w-5 space-y-1.5">
                  <span
                    className={`block h-0.5 bg-gray-700 transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`}
                  />
                  <span
                    className={`block h-0.5 bg-gray-700 transition-all ${mobileOpen ? 'opacity-0' : ''}`}
                  />
                  <span
                    className={`block h-0.5 bg-gray-700 transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? 'max-h-[600px] border-t border-gray-100' : 'max-h-0'
          }`}
        >
          <div className="px-4 py-3 space-y-1 bg-white">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(l.to)
                    ? 'text-nmu-red bg-nmu-red3'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t(l.key)}
              </Link>
            ))}
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={toggle}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600"
              >
                {lang === 'ar' ? 'English' : 'عربي'}
              </button>
              <Link
                to="/admin"
                className="flex-1 py-2.5 bg-nmu-red text-white rounded-lg text-sm font-semibold text-center"
              >
                ⚙ Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar