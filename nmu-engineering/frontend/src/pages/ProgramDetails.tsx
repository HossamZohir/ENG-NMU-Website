import React, { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { programsApi } from '@/api'
import type { Program } from '@/types'

const ALL_PROGRAMS: Program[] = [
  { id: '1', slug: 'civil', name_en: 'Civil Construction Engineering Technology', name_ar: 'هندسة وتكنولوجيا تنفيذ الأعمال المدنية', description_en: 'Advanced training in structural engineering, construction management, and sustainable building technologies.', description_ar: 'تدريب متقدم في الهندسة الإنشائية وإدارة المشاريع وتكنولوجيا البناء المستدام.', icon: '🏗', duration_years: 4, credit_hours: 160, language: 'English', vision_en: 'To lead in civil construction education and innovation across the region.', vision_ar: 'الريادة في تعليم وابتكار هندسة الإنشاءات المدنية في المنطقة.', mission_en: 'Equip students with technical and managerial skills for the construction industry.', mission_ar: 'تزويد الطلاب بالمهارات التقنية والإدارية لصناعة الإنشاءات.', is_active: true, created_at: '', updated_at: '' },
  { id: '2', slug: 'aerospace', name_en: 'Aerospace Engineering', name_ar: 'هندسة الطيران والفضاء', description_en: 'Aviation, space systems, aerodynamics and propulsion engineering for the modern aerospace industry.', description_ar: 'الطيران وأنظمة الفضاء والديناميكا الهوائية والدفع لصناعة الطيران الحديثة.', icon: '✈️', duration_years: 4, credit_hours: 160, language: 'English', vision_en: 'To be a regional leader in aerospace engineering education and research.', vision_ar: 'أن نكون رائدين إقليمياً في تعليم وبحث هندسة الطيران والفضاء.', mission_en: 'Train engineers capable of designing and maintaining aerospace systems.', mission_ar: 'تدريب مهندسين قادرين على تصميم وصيانة أنظمة الطيران والفضاء.', is_active: true, created_at: '', updated_at: '' },
  { id: '3', slug: 'petroleum', name_en: 'Petroleum and Gas Engineering', name_ar: 'هندسة البترول والغاز', description_en: 'Exploration, drilling, production, and processing of petroleum and natural gas resources.', description_ar: 'استكشاف وحفر وإنتاج ومعالجة موارد البترول والغاز الطبيعي.', icon: '⛽', duration_years: 4, credit_hours: 160, language: 'English', vision_en: 'To advance sustainable petroleum engineering practices nationally.', vision_ar: 'تطوير ممارسات هندسة البترول المستدامة على المستوى الوطني.', mission_en: 'Prepare graduates for careers across the energy value chain.', mission_ar: 'تأهيل الخريجين لمسارات مهنية عبر سلسلة قيمة الطاقة.', is_active: true, created_at: '', updated_at: '' },
  { id: '4', slug: 'architecture', name_en: 'Environmental Architecture & Building Technology', name_ar: 'العمارة البيئية وتكنولوجيا البناء', description_en: 'Sustainable design principles, building technology, and environmental systems integration.', description_ar: 'مبادئ التصميم المستدام وتكنولوجيا البناء وتكامل الأنظمة البيئية.', icon: '🏛', duration_years: 4, credit_hours: 160, language: 'English', vision_en: 'To pioneer environmentally responsive architecture in Egypt.', vision_ar: 'الريادة في العمارة المستجيبة بيئياً في مصر.', mission_en: 'Educate architects who integrate sustainability into every design.', mission_ar: 'تعليم مهندسين معماريين يدمجون الاستدامة في كل تصميم.', is_active: true, created_at: '', updated_at: '' },
  { id: '5', slug: 'mechatronics', name_en: 'Mechatronics Engineering', name_ar: 'هندسة الميكاترونيكس', description_en: 'Integration of mechanical, electrical, computer and control engineering for intelligent systems.', description_ar: 'تكامل الهندسة الميكانيكية والكهربائية والحاسوبية للأنظمة الذكية.', icon: '🤖', duration_years: 4, credit_hours: 160, language: 'English', vision_en: 'To lead innovation in robotics and intelligent automation systems.', vision_ar: 'قيادة الابتكار في الروبوتات وأنظمة الأتمتة الذكية.', mission_en: 'Develop multidisciplinary engineers fluent in mechanical, electronic, and software systems.', mission_ar: 'تطوير مهندسين متعددي التخصصات في الأنظمة الميكانيكية والإلكترونية والبرمجية.', is_active: true, created_at: '', updated_at: '' },
  { id: '6', slug: 'energy', name_en: 'Energy Engineering', name_ar: 'هندسة الطاقة', description_en: 'Renewable energy systems, power engineering, and sustainable energy solutions for the future.', description_ar: 'أنظمة الطاقة المتجددة وهندسة القدرة وحلول الطاقة المستدامة للمستقبل.', icon: '⚡', duration_years: 4, credit_hours: 160, language: 'English', vision_en: 'To accelerate Egypt\'s transition to sustainable energy systems.', vision_ar: 'تسريع انتقال مصر إلى أنظمة الطاقة المستدامة.', mission_en: 'Train energy engineers in renewable technologies and grid systems.', mission_ar: 'تدريب مهندسي طاقة في تقنيات الطاقة المتجددة وأنظمة الشبكات.', is_active: true, created_at: '', updated_at: '' },
  { id: '7', slug: 'biomedical', name_en: 'Biomedical Engineering', name_ar: 'الهندسة الطبية الحيوية', description_en: 'Medical device development, healthcare technology, and biological systems engineering.', description_ar: 'تطوير الأجهزة الطبية وتكنولوجيا الرعاية الصحية وهندسة الأنظمة الحيوية.', icon: '🏥', duration_years: 4, credit_hours: 160, language: 'English', vision_en: 'To bridge engineering and medicine for better healthcare outcomes.', vision_ar: 'الجمع بين الهندسة والطب لتحسين نتائج الرعاية الصحية.', mission_en: 'Develop engineers who design life-improving medical technologies.', mission_ar: 'تطوير مهندسين يصممون تقنيات طبية تحسن الحياة.', is_active: true, created_at: '', updated_at: '' },
]

// Remove the OUTCOMES_EN, OUTCOMES_AR, CAREERS_EN, CAREERS_AR arrays
// Remove the TABS array

const ProgramDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { t, lang } = useTranslation()
  const [program, setProgram] = useState<Program | null | undefined>(undefined)

  useEffect(() => {
    programsApi.getBySlug(slug!)
      .then(setProgram)
      .catch(() => {
        const found = ALL_PROGRAMS.find((p) => p.slug === slug)
        setProgram(found || null)
      })
  }, [slug])

  useEffect(() => {
    if (program) {
      document.title = `${lang === 'ar' ? program.name_ar : program.name_en} | NMU Engineering`
    }
  }, [program, lang])

  if (program === undefined) {
    return <div className="py-32 text-center text-gray-400">{t('common.loading')}</div>
  }
  if (program === null) {
    return <Navigate to="/programs" replace />
  }


  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-nmu-dark to-nmu-red text-white py-14 lg:py-16">
        <div className="section-container">
          <Link to="/programs" className="text-white/50 hover:text-white text-sm transition-colors">
            {lang === 'ar' ? '→' : '←'} {t('common.back')} {lang === 'ar' ? '' : 'to Programs'}
          </Link>
          <div className="flex items-center gap-4 mt-3 mb-3">
            <div className="text-4xl">{program.icon}</div>
            <h1 className="text-2xl lg:text-3xl font-extrabold">{lang === 'ar' ? program.name_ar : program.name_en}</h1>
          </div>
          <p className="text-white/55 max-w-2xl leading-relaxed">{lang === 'ar' ? program.description_ar : program.description_en}</p>
        </div>
      </section>

      {/* Content - No tabs, just full page content */}
      <section className="section-container py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-3">{t('programs.overview')}</h3>
              <p className="text-gray-500 leading-relaxed mb-3">{lang === 'ar' ? program.description_ar : program.description_en}</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-3">{lang === 'ar' ? 'الرؤية' : 'Vision'}</h3>
              <p className="text-gray-500 leading-relaxed">{lang === 'ar' ? program.vision_ar : program.vision_en}</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-3">{lang === 'ar' ? 'الرسالة' : 'Mission'}</h3>
              <p className="text-gray-500 leading-relaxed">{lang === 'ar' ? program.mission_ar : program.mission_en}</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-3">{t('programs.coordinator')}</h3>
              {program.coordinator_name_en ? (
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                  <div className="w-12 h-12 rounded-full bg-nmu-red text-white flex items-center justify-center font-bold flex-shrink-0">
                    {(lang === 'ar' ? program.coordinator_name_ar : program.coordinator_name_en)?.split(' ').slice(-1)[0]?.charAt(0) || 'PC'}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">
                      {lang === 'ar' ? program.coordinator_name_ar : program.coordinator_name_en}
                    </div>
                    {program.coordinator_email && (
                      <a href={`mailto:${program.coordinator_email}`} className="text-xs text-nmu-red hover:underline" dir="ltr">
                        {program.coordinator_email}
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  {lang === 'ar' ? 'لم يتم تعيين منسق بعد' : 'Coordinator not yet assigned'}
                </p>
              )}
            </div>
          </div>
          {/* Sidebar info */}
          <div>
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
              <h4 className="font-bold text-gray-800 mb-4">{lang === 'ar' ? 'معلومات البرنامج' : 'Program Info'}</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('programs.duration')}</span>
                  <span className="font-bold text-gray-800">{program.duration_years} {lang === 'ar' ? 'سنوات' : 'Years'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('programs.degree')}</span>
                  <span className="font-bold text-gray-800">B.Sc. Engineering</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('programs.credits')}</span>
                  <span className="font-bold text-gray-800">{program.credit_hours} {lang === 'ar' ? 'ساعة' : 'Hours'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('programs.language')}</span>
                  <span className="font-bold text-gray-800">{program.language}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                              </div>
                <button className="btn-primary w-full justify-center mt-3">
                  📄 {t('programs.downloadPlan')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProgramDetail