import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { CardSkeleton } from '@/components/ui'
import { homepageApi, programsApi, newsApi } from '@/api'
import type { HomepageContent, Program, NewsArticle } from '@/types'

const MOCK_HOMEPAGE: HomepageContent = {
  id: '1',
  hero_headline_en: "Shaping Tomorrow's Engineers Today",
  hero_headline_ar: 'نُشكِّل مهندسي الغد اليوم',
  hero_subtitle_en: "Join Egypt's most innovative engineering faculty. World-class programs, cutting-edge research, and industry partnerships that prepare you for a global career.",
  hero_subtitle_ar: 'انضم إلى كلية الهندسة الأكثر ابتكاراً في مصر. برامج عالمية المستوى، أبحاث متطورة، وشراكات صناعية تُهيئك لمسيرة مهنية دولية.',
  announcement_text_en: 'Registration for Fall 2025/2026 is now open',
  announcement_text_ar: 'التسجيل للعام الدراسي 2025/2026 مفتوح الآن',
  dean_name: 'Prof. Wael Seddik',
  dean_name_ar: 'أ.د. وائل صديق',
  dean_title_en: 'Dean, Faculty of Engineering',
  dean_title_ar: 'عميد كلية الهندسة',
  dean_message_en: "At New Mansoura University's Faculty of Engineering, we are committed to providing a world-class education that bridges theory with practice. Our programs are designed to cultivate critical thinkers, innovators, and leaders who will shape the future of engineering in Egypt and beyond. With state-of-the-art laboratories, distinguished faculty, and strong industry connections, we offer an unparalleled educational experience.",
  dean_message_ar: 'في كلية الهندسة بجامعة المنصورة الجديدة، نلتزم بتقديم تعليم عالمي المستوى يجمع بين النظرية والتطبيق. تم تصميم برامجنا لتنمية المفكرين المبدعين والمبتكرين والقادة الذين سيشكلون مستقبل الهندسة في مصر وخارجها.',
  dean_email: 'dean.eng@nmu.edu.eg',
  stat_programs: 7,
  stat_faculty: 30,
  stat_students: 3500,
  stat_labs: 15,
  stat_partners: 50,
  stat_publications: 5,
  updated_at: '',
}

const MOCK_PROGRAMS: Program[] = [
  { id: '1', slug: 'civil', name_en: 'Civil Construction Engineering Technology', name_ar: 'هندسة وتكنولوجيا تنفيذ الأعمال المدنية', description_en: 'Advanced training in structural engineering, construction management, and sustainable building technologies.', description_ar: 'تدريب متقدم في الهندسة الإنشائية وإدارة المشاريع وتكنولوجيا البناء المستدام.', icon: '🏗', duration_years: 4, credit_hours: 160, language: 'English', vision_en: '', vision_ar: '', mission_en: '', mission_ar: '', is_active: true, created_at: '', updated_at: '' },
  { id: '2', slug: 'aerospace', name_en: 'Aerospace Engineering', name_ar: 'هندسة الطيران والفضاء', description_en: 'Aviation, space systems, aerodynamics and propulsion engineering for the modern aerospace industry.', description_ar: 'الطيران وأنظمة الفضاء والديناميكا الهوائية والدفع لصناعة الطيران الحديثة.', icon: '✈️', duration_years: 4, credit_hours: 160, language: 'English', vision_en: '', vision_ar: '', mission_en: '', mission_ar: '', is_active: true, created_at: '', updated_at: '' },
  { id: '3', slug: 'mechatronics', name_en: 'Mechatronics Engineering', name_ar: 'هندسة الميكاترونيكس', description_en: 'Integration of mechanical, electrical, computer and control engineering for intelligent systems.', description_ar: 'تكامل الهندسة الميكانيكية والكهربائية والحاسوبية للأنظمة الذكية.', icon: '🤖', duration_years: 4, credit_hours: 160, language: 'English', vision_en: '', vision_ar: '', mission_en: '', mission_ar: '', is_active: true, created_at: '', updated_at: '' },
]

const MOCK_NEWS: NewsArticle[] = [
  { id: '1', title_en: 'NMU researchers develop breakthrough solar energy storage system', title_ar: 'باحثو الجامعة يطورون نظام تخزين طاقة شمسية مبتكر', slug: 'solar-energy', excerpt_en: 'A team from the Energy Engineering department has developed a novel phase-change material for thermal energy storage.', excerpt_ar: 'طور فريق من قسم هندسة الطاقة مادة طور انتقالية جديدة لتخزين الطاقة الحرارية.', content_en: '', content_ar: '', category_id: '1', is_featured: true, is_published: true, published_at: '2025-06-05', created_at: '', updated_at: '' },
  { id: '2', title_en: 'Annual Engineering Forum 2025 — Call for Papers', title_ar: 'ملتقى الهندسة السنوي 2025 — دعوة لتقديم الأبحاث', slug: 'forum-2025', excerpt_en: 'The Faculty invites researchers and students to submit papers for the 5th Annual Engineering Forum.', excerpt_ar: 'تدعو الكلية الباحثين والطلاب لتقديم أبحاثهم للملتقى السنوي الخامس.', content_en: '', content_ar: '', category_id: '2', is_featured: false, is_published: true, published_at: '2025-05-28', created_at: '', updated_at: '' },
  { id: '3', title_en: 'Aerospace team wins national drone competition', title_ar: 'فريق الطيران يفوز بالبطولة الوطنية للطائرات المسيّرة', slug: 'drone-win', excerpt_en: 'NMU aerospace students took first place at the national UAV design championship held in Cairo.', excerpt_ar: 'حصل طلاب هندسة الطيران على المركز الأول في بطولة تصميم الطائرات المسيّرة بالقاهرة.', content_en: '', content_ar: '', category_id: '3', is_featured: true, is_published: true, published_at: '2025-05-15', created_at: '', updated_at: '' },
]

const NEWS_ICONS: Record<string, string> = { '1': '🔬', '2': '🎓', '3': '🏆', '4': '🤝', '5': '📚', '6': '📢' }
const NEWS_CATS: Record<string, { en: string; ar: string }> = {
  '1': { en: 'Research', ar: 'بحث' },
  '2': { en: 'Events', ar: 'فعاليات' },
  '3': { en: 'Achievement', ar: 'إنجاز' },
}

// Custom hook for incrementing stats
const useIncrementingStat = (target: number, duration: number = 1500) => {
  const [value, setValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.3 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number | null = null
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.round(eased * target)
      setValue(currentValue)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setValue(target)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [target, duration, isVisible])

  return { value, elementRef }
}

// Animated Stat Component
const AnimatedStat: React.FC<{
  target: number
  label: string
  suffix?: string
  delay?: number
}> = ({ target, label, suffix = '', delay = 0 }) => {
  const { value, elementRef } = useIncrementingStat(target)

  // Apply delay to the animation start
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  // Only render the animated value when shouldAnimate is true
  const displayValue = shouldAnimate ? value : 0

  return (
    <div ref={elementRef} className="text-center">
      <div className="text-2xl lg:text-3xl font-extrabold text-white transition-all duration-300">
        {displayValue.toLocaleString()}{suffix}
      </div>
      <div className="text-xs text-white/70 mt-1">{label}</div>
    </div>
  )
}

const Home: React.FC = () => {
  const { t, lang } = useTranslation()
  const [home, setHome] = useState<HomepageContent | null>(null)
  const [programs, setPrograms] = useState<Program[]>([])
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = lang === 'ar'
      ? 'كلية الهندسة | جامعة المنصورة الجديدة'
      : 'Faculty of Engineering | New Mansoura University'

    Promise.allSettled([
      homepageApi.get(),
      programsApi.list({ limit: 3 }),
      newsApi.list({ limit: 3, featured: true }),
    ]).then(([h, p, n]) => {
      setHome(h.status === 'fulfilled' ? h.value : MOCK_HOMEPAGE)
      setPrograms(p.status === 'fulfilled' ? p.value.data : MOCK_PROGRAMS)
      setNews(n.status === 'fulfilled' ? n.value.data : MOCK_NEWS)
      setLoading(false)
    })
  }, [lang])

  const h = home || MOCK_HOMEPAGE
  const displayPrograms = programs.length ? programs.slice(0, 3) : MOCK_PROGRAMS
  const displayNews = news.length ? news.slice(0, 3) : MOCK_NEWS

  return (
    <div>
      {/* ── HERO (light) ─────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-white via-gray-50 to-nmu-red3/40 overflow-hidden">
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,20,30,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,20,30,.06) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-nmu-red2/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-12 w-96 h-96 rounded-full bg-nmu-red/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-800 leading-tight mb-5">
              {lang === 'ar' ? (
                h.hero_headline_ar
              ) : (
                <>
                  Shaping <span className="text-nmu-red">Tomorrow's</span>
                  <br />Engineers Today
                </>
              )}
            </h1>
            <p className="text-gray-500 text-base lg:text-lg leading-relaxed max-w-lg mb-8">
              {lang === 'ar' ? h.hero_subtitle_ar : h.hero_subtitle_en}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/programs" className="btn-primary">
                 {t('home.hero.cta')}
              </Link>
              <Link to="/about" className="btn-outline">
                {t('home.hero.cta2')}
              </Link>
            </div>
          </div>

          {/* Right cards */}
          <div className="hidden lg:flex flex-col gap-3">
            {[
              { icon: '✈️', titleEn: 'Aerospace Engineering', titleAr: 'هندسة الطيران والفضاء', subEn: 'Advanced aviation & space systems', subAr: 'أنظمة طيران وفضاء متقدمة', to: '/programs/aerospace' },
              { icon: '⚡', titleEn: 'Energy Engineering', titleAr: 'هندسة الطاقة', subEn: 'Renewable & sustainable energy', subAr: 'طاقة متجددة ومستدامة', to: '/programs/energy' },
              { icon: '🤖', titleEn: 'Mechatronics Engineering', titleAr: 'هندسة الميكاترونيكس', subEn: 'Robotics, automation & control', subAr: 'روبوتات وأتمتة وتحكم', to: '/programs/mechatronics' },
              { icon: '🏥', titleEn: 'Biomedical Engineering', titleAr: 'الهندسة الطبية الحيوية', subEn: 'Healthcare technology innovation', subAr: 'ابتكار تقنيات الرعاية الصحية', to: '/programs/biomedical' },
            
                    ].map((c, i) => (
              <Link
                key={i}
                to={c.to}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4 hover:border-nmu-red/30 hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-11 h-11 bg-nmu-red rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {c.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-gray-800 font-semibold text-sm">{lang === 'ar' ? c.titleAr : c.titleEn}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{lang === 'ar' ? c.subAr : c.subEn}</div>
                </div>
                <span className="ms-auto text-gray-300 group-hover:text-nmu-red group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all">
                  {lang === 'ar' ? '←' : '→'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR - Smaller with Incrementing Animation ────────────── */}
      <section className="bg-nmu-red py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <AnimatedStat 
            target={h.stat_programs} 
            label={t('home.stats.programs')} 
            delay={0}
          />
          <AnimatedStat 
            target={h.stat_labs} 
            label={t('home.stats.labs')} 
            suffix="+" 
            delay={300}
          />
          <AnimatedStat 
            target={h.stat_partners} 
            label={t('home.stats.partners')} 
            suffix="+" 
            delay={600}
          />
          <AnimatedStat 
            target={h.stat_publications} 
            label={t('home.stats.publications')} 
            suffix="+" 
            delay={900}
          />
        </div>
      </section>

       {/* ── DEAN MESSAGE ──────────────────────────────────────────────── */}
      <section className="section-container py-16 lg:py-20">
        <div className="grid lg:grid-cols-3 gap-12 items-center">
          <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl border border-gray-200 flex items-center justify-center text-7xl text-gray-300 overflow-hidden">
            {h.dean_photo_url ? (
              <img 
                src={h.dean_photo_url} 
                alt={lang === 'ar' ? h.dean_name_ar : h.dean_name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              '👨‍🏫'
            )}
          </div>
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 text-nmu-red font-bold mb-3">
              <span>✦</span> {t('home.dean.badge')}
            </div>
            <h2 className="section-title mb-5">{t('home.dean.title')}</h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              {lang === 'ar' ? h.dean_message_ar : h.dean_message_en}
            </p>
            
            {/* Signature - Segoe Script */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div 
                className="text-2xl font-bold italic text-nmu-red" 
                style={{ fontFamily: "'Segoe Script', 'Segoe Script Regular', cursive" }}
              >
                {lang === 'ar' ? (h.dean_name_ar || h.dean_name) : h.dean_name}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {lang === 'ar' ? (h.dean_title_ar || 'عميد كلية الهندسة') : (h.dean_title_en || 'Dean, Faculty of Engineering')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROGRAMS PREVIEW (light gray) ───────────────────────────────── */}
      <section className="bg-gray-50 py-16 lg:py-20">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="eyebrow">{t('home.programs.eyebrow')}</span>
            <h2 className="section-title">{t('home.programs.title')}</h2>
            <p className="section-subtitle">{t('home.programs.subtitle')}</p>
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayPrograms.map((p) => (
                <Link
                  key={p.id}
                  to={`/programs/${p.slug}`}
                  className="card card-hover overflow-hidden group"
                >
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
          <div className="text-center mt-12">
            <Link to="/programs" className="btn-primary">
              {t('home.programs.viewAll')} {lang === 'ar' ? '←' : '→'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── NEWS (white) ─────────────────────────────────────────────────── */}
      <section className="section-container py-16 lg:py-20">
        <div className="text-center mb-12">
          <span className="eyebrow">{t('home.news.eyebrow')}</span>
          <h2 className="section-title">{t('home.news.title')}</h2>
          <p className="section-subtitle">{t('home.news.subtitle')}</p>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayNews.map((n) => (
              <Link key={n.id} to={`/news/${n.slug}`} className="card card-hover overflow-hidden">
                <div className="h-44 bg-gradient-to-br from-nmu-red to-nmu-red2 relative flex items-center justify-center text-5xl text-white/30">
                  {n.image_url
                    ? <img src={n.image_url} alt="" className="w-full h-full object-cover absolute inset-0" />
                    : NEWS_ICONS[n.category_id] || '📰'}
                  <span className="absolute top-3 start-3 bg-white text-nmu-red text-xs font-bold px-2.5 py-1 rounded-md z-10">
                    {lang === 'ar' ? NEWS_CATS[n.category_id]?.ar || 'أخبار' : NEWS_CATS[n.category_id]?.en || 'News'}
                  </span>
                </div>
                <div className="p-5">
                  <div className="text-xs text-gray-400 mb-2">
                    {n.published_at && new Date(n.published_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h3 className="font-bold text-gray-800 leading-snug mb-2">
                    {lang === 'ar' ? n.title_ar : n.title_en}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                    {lang === 'ar' ? n.excerpt_ar : n.excerpt_en}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <Link to="/news" className="btn-outline">
            {t('common.viewAll')} {lang === 'ar' ? '←' : '→'}
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home