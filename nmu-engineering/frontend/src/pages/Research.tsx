import React, { useEffect, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { CardSkeleton } from '@/components/ui'
import { researchApi, laboratoriesApi } from '@/api'
import type { ResearchProject, Laboratory } from '@/types'

const MOCK_PROJECTS: ResearchProject[] = [
  { id: '1', title_en: 'Solar Thermal Storage Systems', title_ar: 'أنظمة تخزين الطاقة الشمسية الحرارية', description_en: 'Developing novel phase-change materials to improve solar energy storage efficiency.', description_ar: 'تطوير مواد طور انتقالية جديدة لتحسين كفاءة تخزين الطاقة الشمسية.', pi_name: 'Dr. Khaled Ibrahim', status: 'active', start_date: '2024-01-01', is_published: true, created_at: '' },
  { id: '2', title_en: 'UAV Design Optimization', title_ar: 'تحسين تصميم الطائرات المسيرة', description_en: 'Using machine learning to optimize aerodynamic performance of unmanned aerial vehicles.', description_ar: 'استخدام التعلم الآلي لتحسين الأداء الديناميكي الهوائي للطائرات المسيرة.', pi_name: 'Prof. Ahmed Hassan', status: 'active', start_date: '2024-03-15', is_published: true, created_at: '' },
  { id: '3', title_en: 'Biomedical Sensor Array', title_ar: 'مصفوفة المستشعرات الطبية الحيوية', description_en: 'Wearable sensor network for continuous patient monitoring in remote areas.', description_ar: 'شبكة مستشعرات قابلة للارتداء لمراقبة المرضى المستمرة في المناطق النائية.', pi_name: 'Prof. Dr. Fatma Ali', status: 'completed', start_date: '2023-06-01', is_published: true, created_at: '' },
  { id: '4', title_en: 'Smart Grid Integration', title_ar: 'تكامل الشبكات الذكية', description_en: 'Researching grid-scale integration strategies for distributed renewable energy sources.', description_ar: 'بحث استراتيجيات التكامل على مستوى الشبكة لمصادر الطاقة المتجددة الموزعة.', pi_name: 'Dr. Yasser Nasser', status: 'pending', start_date: '2025-09-01', is_published: true, created_at: '' },
]

const MOCK_LABS: Laboratory[] = [
  { id: '1', name_en: 'Structures & Materials Lab', name_ar: 'مختبر الإنشاءات والمواد', description_en: 'Testing facility for structural integrity and material properties.', description_ar: 'منشأة لاختبار السلامة الإنشائية وخصائص المواد.', department_id: 'civil', program_ids: [], is_active: true },
  { id: '2', name_en: 'Fluid Dynamics Lab', name_ar: 'مختبر ديناميكا السوائل', description_en: 'Wind tunnel and CFD simulation facilities.', description_ar: 'نفق هوائي ومرافق محاكاة ديناميكا السوائل الحاسوبية.', department_id: 'aerospace', program_ids: [], is_active: true },
  { id: '3', name_en: 'Robotics & Automation Lab', name_ar: 'مختبر الروبوتات والأتمتة', description_en: '12 industrial robots for hands-on automation training.', description_ar: '12 روبوت صناعي للتدريب العملي على الأتمتة.', department_id: 'mechatronics', program_ids: [], is_active: true },
  { id: '4', name_en: 'Renewable Energy Lab', name_ar: 'مختبر الطاقة المتجددة', description_en: 'Solar panel testing and energy storage research.', description_ar: 'اختبار الألواح الشمسية وبحوث تخزين الطاقة.', department_id: 'energy', program_ids: [], is_active: true },
  { id: '5', name_en: 'Biomedical Devices Lab', name_ar: 'مختبر الأجهزة الطبية الحيوية', description_en: 'Prototyping facility for medical device development.', description_ar: 'منشأة نموذجية لتطوير الأجهزة الطبية.', department_id: 'biomedical', program_ids: [], is_active: true },
  { id: '6', name_en: 'Petroleum Processing Lab', name_ar: 'مختبر معالجة البترول', description_en: 'Equipment for petroleum exploration and processing studies.', description_ar: 'معدات لدراسات استكشاف ومعالجة البترول.', department_id: 'petroleum', program_ids: [], is_active: true },
]

const STATUS_LABEL: Record<string, { en: string; ar: string; variant: string }> = {
  active: { en: 'Active', ar: 'نشط', variant: 'green' },
  completed: { en: 'Completed', ar: 'مكتمل', variant: 'blue' },
  pending: { en: 'Pending', ar: 'قيد الانتظار', variant: 'amber' },
}

const Research: React.FC = () => {
  const { t, lang } = useTranslation()
  const [projects, setProjects] = useState<ResearchProject[]>([])
  const [labs, setLabs] = useState<Laboratory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = lang === 'ar' ? 'البحث العلمي | كلية الهندسة' : 'Research | NMU Engineering'
    Promise.allSettled([researchApi.list(), laboratoriesApi.list()]).then(([p, l]) => {
      setProjects(p.status === 'fulfilled' && p.value.data.length ? p.value.data : MOCK_PROJECTS)
      setLabs(l.status === 'fulfilled' && l.value.data.length ? l.value.data : MOCK_LABS)
      setLoading(false)
    })
  }, [lang])

  return (
    <div>
      <section className="bg-gradient-to-br from-nmu-dark to-[#2d0a10] text-white py-14 lg:py-16">
        <div className="section-container">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
            {t('nav.research')}
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-3">
            {lang === 'ar' ? 'البحث العلمي والابتكار' : 'Research & Innovation'}
          </h1>
          <p className="text-white/55 max-w-xl leading-relaxed">
            {lang === 'ar'
              ? 'مشاريع بحثية متطورة عبر سبعة تخصصات هندسية، تدعمها مختبرات وشراكات صناعية متطورة.'
              : 'Cutting-edge research projects across seven engineering disciplines, supported by advanced laboratories and industry partnerships.'}
          </p>
        </div>
      </section>

      {/* Projects */}
      <section className="section-container py-12">
        <h2 className="section-title mb-8">{lang === 'ar' ? 'مشاريع البحث' : 'Research Projects'}</h2>
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {projects.map((p) => (
              <div key={p.id} className="card p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-800 leading-snug pe-3">{lang === 'ar' ? p.title_ar : p.title_en}</h3>
                  <span className={`badge badge-${STATUS_LABEL[p.status]?.variant} flex-shrink-0 capitalize`}>
                    {STATUS_LABEL[p.status]?.[lang]}
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{lang === 'ar' ? p.description_ar : p.description_en}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                                  <span>{new Date(p.start_date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { year: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Labs */}
      <section className="bg-gray-50 py-12">
        <div className="section-container">
          <h2 className="section-title mb-8">{t('programs.labs')}</h2>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {labs.map((l) => (
                <div key={l.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                                    <h4 className="font-bold text-gray-800 text-sm mb-1">{lang === 'ar' ? l.name_ar : l.name_en}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{lang === 'ar' ? l.description_ar : l.description_en}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Research
