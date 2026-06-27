import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'

const Footer: React.FC = () => {
  const { t, lang } = useTranslation()

  const programs = [
    { to: '/programs/aerospace', label: lang === 'ar' ? 'هندسة الطيران والفضاء' : 'Aerospace Engineering' },
    { to: '/programs/mechatronics', label: lang === 'ar' ? 'هندسة الميكاترونيكس' : 'Mechatronics Engineering' },
    { to: '/programs/energy', label: lang === 'ar' ? 'هندسة الطاقة' : 'Energy Engineering' },
    { to: '/programs/biomedical', label: lang === 'ar' ? 'الهندسة الطبية الحيوية' : 'Biomedical Engineering' },
    { to: '/programs/civil', label: lang === 'ar' ? 'هندسة الأعمال المدنية' : 'Civil Engineering Tech.' },
    { to: '/programs/petroleum', label: lang === 'ar' ? 'هندسة البترول والغاز' : 'Petroleum Engineering' },
  ]

  const quickLinks = [
    { to: '/about', key: 'nav.about' },
    { to: '/faculty', key: 'nav.faculty' },
    { to: '/research', key: 'nav.research' },
    { to: '/news', key: 'nav.news' },
    { to: '/events', key: 'nav.events' },
    { to: '/downloads', key: 'nav.downloads' },
  ]

  return (
    <footer className="bg-nmu-dark text-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.svg" alt="NMU Logo" className="w-10 h-10 flex-shrink-0" />
              <div>
                <div className="text-white font-bold text-sm leading-tight">
                  {lang === 'ar' ? 'كلية الهندسة' : 'Faculty of Engineering'}
                </div>
                <div className="text-white/50 text-xs">
                  {lang === 'ar' ? 'جامعة المنصورة الجديدة' : 'New Mansoura University'}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5">
              {lang === 'ar'
                ? 'نُشكِّل مستقبل الهندسة في مصر من خلال التميز والابتكار والبحث العلمي.'
                : "Shaping Egypt's engineering future through excellence, innovation, and research."}
            </p>
            <div className="flex gap-3">
              {/* Facebook */}
              <a
                href="https://web.facebook.com/EngineeringNMU"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#1877F2] flex items-center justify-center text-xs transition-colors hover:text-white"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/nmueg/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#0A66C2] flex items-center justify-center text-xs transition-colors hover:text-white"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Programs */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">{t('footer.programs')}</h4>
            <ul className="space-y-2">
              {programs.map((p) => (
                <li key={p.to}>
                  <Link to={p.to} className="text-sm hover:text-white transition-colors">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">{t('footer.links')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm hover:text-white transition-colors">
                    {t(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📍</span>
                <span>
                  {lang === 'ar'
                    ? 'مدينة المنصورة الجديدة، محافظة الدقهلية، مصر'
                    : 'New Mansoura City, Dakahlia Governorate, Egypt'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:01070004148 - 01070004149" className="hover:text-white transition-colors" dir="ltr">
                  01070004148 - 01070004149
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <a href="mailto:info@nmu.edu.eg" className="hover:text-white transition-colors">
                  info@nmu.edu.eg
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>⏰</span>
                <span>
                  {lang === 'ar' ? 'السبت – الخميس، ٩ ص – ٤ م' : 'Sat – Thu, 9:00 AM – 4:00 PM'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span>{t('footer.rights')}</span>
          <div className="flex gap-4">
            <a
              href="https://www.nmu.edu.eg/en/contact-us"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer