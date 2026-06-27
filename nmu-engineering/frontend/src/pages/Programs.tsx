import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { CardSkeleton } from '@/components/ui'
import { programsApi } from '@/api'
import type { Program } from '@/types'

const MOCK_PROGRAMS: Program[] = [
  { id: '1', slug: 'civil', name_en: 'Civil Construction Engineering Technology', name_ar: 'هندسة وتكنولوجيا تنفيذ الأعمال المدنية', description_en: 'Advanced training in structural engineering, construction management, and sustainable building technologies.', description_ar: 'تدريب متقدم في الهندسة الإنشائية وإدارة المشاريع وتكنولوجيا البناء المستدام.', icon: '🏗', duration_years: 4, credit_hours: 160, language: 'English', vision_en: '', vision_ar: '', mission_en: '', mission_ar: '', is_active: true, created_at: '', updated_at: '' },
  { id: '2', slug: 'aerospace', name_en: 'Aerospace Engineering', name_ar: 'هندسة الطيران والفضاء', description_en: 'Aviation, space systems, aerodynamics and propulsion engineering for the modern aerospace industry.', description_ar: 'الطيران وأنظمة الفضاء والديناميكا الهوائية والدفع لصناعة الطيران الحديثة.', icon: '✈️', duration_years: 4, credit_hours: 160, language: 'English', vision_en: '', vision_ar: '', mission_en: '', mission_ar: '', is_active: true, created_at: '', updated_at: '' },
  { id: '3', slug: 'petroleum', name_en: 'Petroleum and Gas Engineering', name_ar: 'هندسة البترول والغاز', description_en: 'Exploration, drilling, production, and processing of petroleum and natural gas resources.', description_ar: 'استكشاف وحفر وإنتاج ومعالجة موارد البترول والغاز الطبيعي.', icon: '⛽', duration_years: 4, credit_hours: 160, language: 'English', vision_en: '', vision_ar: '', mission_en: '', mission_ar: '', is_active: true, created_at: '', updated_at: '' },
  { id: '4', slug: 'architecture', name_en: 'Environmental Architecture & Building Technology', name_ar: 'العمارة البيئية وتكنولوجيا البناء', description_en: 'Sustainable design principles, building technology, and environmental systems integration.', description_ar: 'مبادئ التصميم المستدام وتكنولوجيا البناء وتكامل الأنظمة البيئية.', icon: '🏛', duration_years: 4, credit_hours: 160, language: 'English', vision_en: '', vision_ar: '', mission_en: '', mission_ar: '', is_active: true, created_at: '', updated_at: '' },
  { id: '5', slug: 'mechatronics', name_en: 'Mechatronics Engineering', name_ar: 'هندسة الميكاترونيكس', description_en: 'Integration of mechanical, electrical, computer and control engineering for intelligent systems.', description_ar: 'تكامل الهندسة الميكانيكية والكهربائية والحاسوبية للأنظمة الذكية.', icon: '🤖', duration_years: 4, credit_hours: 160, language: 'English', vision_en: '', vision_ar: '', mission_en: '', mission_ar: '', is_active: true, created_at: '', updated_at: '' },
  { id: '6', slug: 'energy', name_en: 'Energy Engineering', name_ar: 'هندسة الطاقة', description_en: 'Renewable energy systems, power engineering, and sustainable energy solutions for the future.', description_ar: 'أنظمة الطاقة المتجددة وهندسة القدرة وحلول الطاقة المستدامة للمستقبل.', icon: '⚡', duration_years: 4, credit_hours: 160, language: 'English', vision_en: '', vision_ar: '', mission_en: '', mission_ar: '', is_active: true, created_at: '', updated_at: '' },
  { id: '7', slug: 'biomedical', name_en: 'Biomedical Engineering', name_ar: 'الهندسة الطبية الحيوية', description_en: 'Medical device development, healthcare technology, and biological systems engineering.', description_ar: 'تطوير الأجهزة الطبية وتكنولوجيا الرعاية الصحية وهندسة الأنظمة الحيوية.', icon: '🏥', duration_years: 4, credit_hours: 160, language: 'English', vision_en: '', vision_ar: '', mission_en: '', mission_ar: '', is_active: true, created_at: '', updated_at: '' },
]

const Programs: React.FC = () => {
  const { t, lang } = useTranslation()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = lang === 'ar'
      ? 'البرامج الأكاديمية | كلية الهندسة'
      : 'Academic Programs | Faculty of Engineering'

    programsApi.list()
      .then((res) => setPrograms(res.data.length ? res.data : MOCK_PROGRAMS))
      .catch(() => setPrograms(MOCK_PROGRAMS))
      .finally(() => setLoading(false))
  }, [lang])

  const display = programs.length ? programs : MOCK_PROGRAMS

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-nmu-dark to-[#2d0a10] text-white py-16 lg:py-20">
        <div className="section-container">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
            {t('programs.eyebrow')}
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-3">{t('programs.title')}</h1>
          <p className="text-white/55 max-w-xl leading-relaxed">{t('programs.subtitle')}</p>
        </div>
      </section>

      {/* Grid */}
      <section className="section-container py-16 lg:py-20">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {display.map((p) => (
              <Link key={p.id} to={`/programs/${p.slug}`} className="card card-hover overflow-hidden group">
                <div className="h-2 bg-gradient-to-r from-nmu-red to-nmu-red2" />
                <div className="p-6">
                  <div className="w-12 h-12 bg-nmu-red3 rounded-xl flex items-center justify-center text-2xl mb-4">
                    {p.icon}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1 leading-snug">
                    {lang === 'ar' ? p.name_ar : p.name_en}
                  </h3>
                  <div className="text-sm text-nmu-red font-cairo mb-3" dir="rtl">
                    {lang === 'ar' ? p.name_en : p.name_ar}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    {lang === 'ar' ? p.description_ar : p.description_en}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4 pt-3 border-t border-gray-100">
                    <span>{p.duration_years} {lang === 'ar' ? 'سنوات' : 'Years'}</span>
                    <span>{p.credit_hours} {lang === 'ar' ? 'ساعة' : 'Credits'}</span>
                    <span>{p.language}</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-nmu-red text-sm font-semibold">
                    {t('common.learnMore')}
                    <span className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                      {lang === 'ar' ? '←' : '→'}
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Programs
