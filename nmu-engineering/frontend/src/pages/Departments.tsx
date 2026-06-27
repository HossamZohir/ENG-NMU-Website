import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'

const DEPARTMENTS = [
  { id: 'aerospace', icon: '✈️', en: 'Aerospace Engineering', ar: 'هندسة الطيران والفضاء', descEn: 'Aviation, space systems and propulsion engineering.', descAr: 'هندسة الطيران وأنظمة الفضاء والدفع.', faculty: 18, labs: 3 },
  { id: 'civil', icon: '🏗', en: 'Civil Construction Engineering Technology', ar: 'هندسة وتكنولوجيا تنفيذ الأعمال المدنية', descEn: 'Structural engineering and construction management.', descAr: 'الهندسة الإنشائية وإدارة المشاريع.', faculty: 22, labs: 4 },
  { id: 'mechatronics', icon: '🤖', en: 'Mechatronics Engineering', ar: 'هندسة الميكاترونيكس', descEn: 'Robotics, automation and intelligent control systems.', descAr: 'الروبوتات والأتمتة وأنظمة التحكم الذكية.', faculty: 16, labs: 3 },
  { id: 'energy', icon: '⚡', en: 'Energy Engineering', ar: 'هندسة الطاقة', descEn: 'Renewable energy and sustainable power systems.', descAr: 'الطاقة المتجددة وأنظمة القدرة المستدامة.', faculty: 14, labs: 2 },
  { id: 'biomedical', icon: '🏥', en: 'Biomedical Engineering', ar: 'الهندسة الطبية الحيوية', descEn: 'Medical devices and healthcare technology.', descAr: 'الأجهزة الطبية وتكنولوجيا الرعاية الصحية.', faculty: 12, labs: 2 },
  { id: 'petroleum', icon: '⛽', en: 'Petroleum and Gas Engineering', ar: 'هندسة البترول والغاز', descEn: 'Exploration, drilling and production engineering.', descAr: 'هندسة الاستكشاف والحفر والإنتاج.', faculty: 15, labs: 1 },
  { id: 'architecture', icon: '🏛', en: 'Environmental Architecture & Building Technology', ar: 'العمارة البيئية وتكنولوجيا البناء', descEn: 'Sustainable design and building systems.', descAr: 'التصميم المستدام وأنظمة البناء.', faculty: 13, labs: 0 },
]

const Departments: React.FC = () => {
  const { t, lang } = useTranslation()

  useEffect(() => {
    document.title = lang === 'ar' ? 'الأقسام | كلية الهندسة' : 'Departments | NMU Engineering'
  }, [lang])

  return (
    <div>
      <section className="bg-gradient-to-br from-nmu-dark to-[#2d0a10] text-white py-14 lg:py-16">
        <div className="section-container">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
            {t('nav.departments')}
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-3">
            {lang === 'ar' ? 'أقسام الكلية' : 'Faculty Departments'}
          </h1>
          <p className="text-white/55 max-w-xl leading-relaxed">
            {lang === 'ar'
              ? 'سبعة أقسام متخصصة، كل منها يضم أعضاء هيئة تدريس متميزين ومرافق بحثية متقدمة.'
              : 'Seven specialized departments, each with distinguished faculty and advanced research facilities.'}
          </p>
        </div>
      </section>

      <section className="section-container py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEPARTMENTS.map((d) => (
            <Link key={d.id} to={`/programs/${d.id}`} className="card card-hover p-6">
              <div className="w-12 h-12 bg-nmu-red3 rounded-xl flex items-center justify-center text-2xl mb-4">{d.icon}</div>
              <h3 className="font-bold text-gray-800 mb-1 leading-snug">{lang === 'ar' ? d.ar : d.en}</h3>
              <div className="text-sm text-nmu-red font-cairo mb-3" dir="rtl">{lang === 'ar' ? d.en : d.ar}</div>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{lang === 'ar' ? d.descAr : d.descEn}</p>
              <div className="flex gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
                <span>👥 {d.faculty} {lang === 'ar' ? 'عضو هيئة تدريس' : 'Faculty'}</span>
                <span>🔬 {d.labs} {lang === 'ar' ? 'معمل' : 'Labs'}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Departments
