import React, { useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

const About: React.FC = () => {
  const { t, lang } = useTranslation()

  useEffect(() => {
    document.title = lang === 'ar'
      ? 'عن الكلية | كلية الهندسة - جامعة المنصورة الجديدة'
      : 'About the Faculty | NMU Faculty of Engineering'
  }, [lang])

  const timeline = [
    { year: '2020', titleEn: 'Faculty Established', titleAr: 'تأسيس الكلية', descEn: 'New Mansoura University founded; Faculty of Engineering launches its first intake of students across 4 programs.', descAr: 'تأسست جامعة المنصورة الجديدة؛ بدأت كلية الهندسة في استقبال أول دفعة من الطلاب في 4 برامج.' },
    { year: '2020', titleEn: 'Research Centers Launched', titleAr: 'إطلاق مراكز البحث', descEn: 'Three specialized research centers established in collaboration with international universities and industry partners.', descAr: 'تأسيس ثلاثة مراكز بحثية متخصصة بالتعاون مع جامعات دولية وشركاء صناعيين.' },
    { year: '2021', titleEn: 'Program Expansion', titleAr: 'توسيع البرامج', descEn: 'Three additional engineering programs added, bringing the total to 7 specialized programs covering the most in-demand fields.', descAr: 'إضافة ثلاثة برامج هندسية جديدة لتصل إلى 7 برامج متخصصة تغطي أكثر المجالات المطلوبة.' },
    { year: '2023', titleEn: 'First Graduating Class', titleAr: 'أول دفعة متخرجين', descEn: 'The first cohort of NMU engineering graduates — a milestone celebrated with an employment rate exceeding 85% within six months.', descAr: 'تخرجت أول دفعة من مهندسي الجامعة، وحققت نسبة توظيف تجاوزت 85% خلال ستة أشهر.' },
    { year: '2025', titleEn: 'Accreditation Achieved', titleAr: 'الحصول على الاعتماد', descEn: "Programs receive national and international accreditation, cementing NMU's reputation for engineering quality.", descAr: 'حصلت البرامج على الاعتماد المحلي والدولي، مما يعزز سمعة الجامعة في جودة التعليم الهندسي.' },
  ]

  const goals = [
    { titleEn: 'Academic Excellence', titleAr: 'التميز الأكاديمي', descEn: 'Continuously update curricula to align with global engineering standards and industry needs.', descAr: 'تحديث المناهج باستمرار لتتوافق مع المعايير الهندسية العالمية واحتياجات الصناعة.' },
    { titleEn: 'Research Leadership', titleAr: 'الريادة البحثية', descEn: 'Establish NMU as a recognized center for applied engineering research and innovation in the region.', descAr: 'ترسيخ مكانة الجامعة كمركز رائد للبحث الهندسي التطبيقي والابتكار في المنطقة.' },
    { titleEn: 'Industry Partnership', titleAr: 'الشراكة الصناعية', descEn: 'Build strategic alliances with 100+ industry partners to provide real-world learning opportunities.', descAr: 'بناء تحالفات استراتيجية مع أكثر من 100 شريك صناعي لتوفير فرص تعلم عملية.' },
    { titleEn: 'Global Reach', titleAr: 'الانتشار العالمي', descEn: 'Forge international university partnerships to enable student and faculty exchange programs.', descAr: 'إقامة شراكات جامعية دولية لتفعيل برامج تبادل الطلاب وأعضاء هيئة التدريس.' },
  ]

  // Leadership team with both English and Arabic names and roles
  const leadershipTeam = [
    { 
      id: 'dean',
      role_en: 'Dean',
      role_ar: 'العميد',
      name_en: 'Prof. Dr. Wael Seddik',
      name_ar: 'أ.د. وائل صديق'
    },
    { 
      id: 'programs-director',
      role_en: 'Programs Director',
      role_ar: 'مدير البرامج',
      name_en: 'Assoc. Prof. Sara El-bahloul',
      name_ar: 'أ.د. سارة البهلول'
    },
    { 
      id: 'Quality Assurance Unit Manager',
      role_en: 'Quality Assurance Unit Manager',
      role_ar: 'مدير وحدة ضمان الجودة',
      name_en: 'Assoc. Prof. Ahmed Gomaa',
      name_ar: 'أ.م. أحمد جمعة'
    },
   
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-nmu-dark to-[#2d1215] text-white py-16 lg:py-20">
        <div className="section-container text-center">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
            {t('about.eyebrow')}
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-4">{t('about.title')}</h1>
          <p className="text-white/55 max-w-2xl mx-auto leading-relaxed">{t('about.subtitle')}</p>

          <div className="grid sm:grid-cols-3 gap-5 mt-12">
            {[
              { icon: '🎯', title: t('about.vision'), bodyEn: 'To be a leading engineering faculty in Egypt and the Arab world, recognized for academic excellence, innovative research, and outstanding graduates.', bodyAr: 'أن نكون كلية هندسة رائدة في مصر والعالم العربي، معروفة بالتميز الأكاديمي والبحث المبتكر والخريجين المتميزين.' },
              { icon: '📋', title: t('about.mission'), bodyEn: 'To provide high-quality engineering education, advance knowledge through research, and contribute to the sustainable development of society.', bodyAr: 'تقديم تعليم هندسي عالي الجودة، وتطوير المعرفة من خلال البحث العلمي، والمساهمة في التنمية المستدامة للمجتمع.' },
              { icon: '⭐', title: t('about.values'), bodyEn: 'Excellence, integrity, innovation, diversity, and a commitment to societal responsibility guide everything we do.', bodyAr: 'التميز والنزاهة والابتكار والتنوع والالتزام بالمسؤولية المجتمعية توجه كل ما نقوم به.' },
            ].map((c, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-start">
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="text-white font-bold mb-2">{c.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{lang === 'ar' ? c.bodyAr : c.bodyEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline + Goals */}
      <section className="section-container py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* History timeline */}
          <div>
            <div className="mb-8">
              <span className="eyebrow">{t('about.history')}</span>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-800">
                {lang === 'ar' ? 'مسيرتنا' : 'Our Journey'}
              </h2>
            </div>
            <div className="relative ps-8 border-s-2 border-gray-200 space-y-8">
              {timeline.map((item, i) => (
                <div key={i} className="relative">
                  <span className="absolute -start-[2.05rem] top-0.5 w-3 h-3 rounded-full bg-nmu-red ring-4 ring-white shadow-[0_0_0_2px_#8B141E]" />
                  <div className="text-xs font-bold text-nmu-red mb-1">{item.year}</div>
                  <h4 className="font-bold text-gray-800 mb-1">{lang === 'ar' ? item.titleAr : item.titleEn}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{lang === 'ar' ? item.descAr : item.descEn}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic goals */}
          <div>
            <div className="mb-8">
              <span className="eyebrow">{t('about.goals')}</span>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-800">
                {lang === 'ar' ? 'إلى أين نتجه' : "Where We're Heading"}
              </h2>
            </div>
            <div className="space-y-3">
              {goals.map((g, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-5 border-s-4 border-nmu-red">
                  <h4 className="font-bold text-gray-800 mb-1.5 text-sm">{lang === 'ar' ? g.titleAr : g.titleEn}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{lang === 'ar' ? g.descAr : g.descEn}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Org structure */}
      <section className="bg-gray-50 py-16 lg:py-20">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="eyebrow">{lang === 'ar' ? 'الهيكل التنظيمي' : 'Organizational Structure'}</span>
            <h2 className="section-title">{lang === 'ar' ? 'القيادة الأكاديمية' : 'Academic Leadership'}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {leadershipTeam.map((member) => (
              <div key={member.id} className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-nmu-red to-nmu-red2 text-white flex items-center justify-center text-xl font-bold mb-4">
                  {/* Get first letter of the name in the current language */}
                  {lang === 'ar' 
                    ? member.name_ar.split(' ').slice(-1)[0]?.charAt(0) || 'أ'
                    : member.name_en.split(' ').slice(-1)[0]?.charAt(0) || 'P'
                  }
                </div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">
                  {lang === 'ar' ? member.name_ar : member.name_en}
                </h4>
                <p className="text-xs text-nmu-red font-semibold">
                  {lang === 'ar' ? member.role_ar : member.role_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default About