import React, { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { newsApi } from '@/api'
import type { NewsArticle } from '@/types'

const NEWS_ICONS: Record<string, string> = { '1': '🔬', '2': '🎓', '3': '🏆', '4': '🤝', '5': '📚', '6': '📢' }
const NEWS_CATS: Record<string, { en: string; ar: string }> = {
  '1': { en: 'Research', ar: 'بحث' },
  '2': { en: 'Events', ar: 'فعاليات' },
  '3': { en: 'Achievement', ar: 'إنجاز' },
  '4': { en: 'Partnership', ar: 'شراكة' },
  '5': { en: 'Academic', ar: 'أكاديمي' },
  '6': { en: 'Announcement', ar: 'إعلان' },
}

const MOCK_ARTICLES: Record<string, NewsArticle> = {
  'solar-energy': {
    id: '1', title_en: 'NMU researchers develop breakthrough solar energy storage system', title_ar: 'باحثو الجامعة يطورون نظام تخزين طاقة شمسية مبتكر',
    slug: 'solar-energy',
    excerpt_en: 'A team from the Energy Engineering department has developed a novel phase-change material for thermal energy storage.',
    excerpt_ar: 'طور فريق من قسم هندسة الطاقة مادة طور انتقالية جديدة لتخزين الطاقة الحرارية.',
    content_en: 'A research team led by Dr. Khaled Ibrahim from the Energy Engineering department has developed a novel phase-change material capable of storing thermal energy with significantly higher efficiency than conventional materials.\n\nThe breakthrough addresses one of the biggest challenges facing solar energy adoption: storing power generated during daylight hours for use after sunset. Early testing shows the new material can retain up to 30% more thermal energy than current industry-standard materials, while also being more cost-effective to produce.\n\nThe research has been submitted for peer review and is expected to be published in a leading energy journal later this year. The team is now working with industry partners to explore pilot deployment opportunities across the growing solar infrastructure in Egypt.',
    content_ar: 'طور فريق بحثي بقيادة الدكتور خالد إبراهيم من قسم هندسة الطاقة مادة طور انتقالية جديدة قادرة على تخزين الطاقة الحرارية بكفاءة أعلى بكثير من المواد التقليدية.\n\nيعالج هذا الإنجاز أحد أكبر التحديات التي تواجه تبني الطاقة الشمسية: تخزين الطاقة المولدة خلال ساعات النهار لاستخدامها بعد غروب الشمس. تظهر الاختبارات الأولية أن المادة الجديدة يمكنها الاحتفاظ بطاقة حرارية أكثر بنسبة تصل إلى 30% مقارنة بالمواد المعيارية الحالية في الصناعة.\n\nتم تقديم البحث للمراجعة من قبل النظراء ومن المتوقع نشره في مجلة طاقة رائدة لاحقاً هذا العام.',
    category_id: '1', is_featured: true, is_published: true, published_at: '2025-06-05', created_at: '2025-06-05', updated_at: '2025-06-05',
  },
}

const NewsDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { t, lang } = useTranslation()
  const [article, setArticle] = useState<NewsArticle | null | undefined>(undefined)

  useEffect(() => {
    newsApi.list({ slug })
      .then((res) => {
        const found = res.data.find((a) => a.slug === slug)
        setArticle(found || MOCK_ARTICLES[slug!] || null)
      })
      .catch(() => setArticle(MOCK_ARTICLES[slug!] || null))
  }, [slug])

  useEffect(() => {
    if (article) document.title = `${lang === 'ar' ? article.title_ar : article.title_en} | NMU Engineering`
  }, [article, lang])

  if (article === undefined) return <div className="py-32 text-center text-gray-400">{t('common.loading')}</div>
  if (article === null) return <Navigate to="/news" replace />

  const paragraphs = (lang === 'ar' ? article.content_ar : article.content_en).split('\n\n').filter(Boolean)

  return (
    <div>
      <div className="h-72 bg-gradient-to-br from-nmu-red to-nmu-red2 flex items-center justify-center text-7xl text-white/30 relative overflow-hidden">
        {article.image_url
          ? <img src={article.image_url} alt="" className="w-full h-full object-cover absolute inset-0" />
          : NEWS_ICONS[article.category_id] || '📰'}
        <span className="absolute top-4 start-4 bg-white text-nmu-red text-xs font-bold px-3 py-1.5 rounded-md z-10">
          {lang === 'ar' ? NEWS_CATS[article.category_id]?.ar : NEWS_CATS[article.category_id]?.en}
        </span>
      </div>

      <section className="section-container py-12 max-w-3xl">
        <Link to="/news" className="text-nmu-red text-sm font-semibold hover:underline">
          {lang === 'ar' ? '→' : '←'} {t('common.back')}
        </Link>
        <div className="text-sm text-gray-400 mt-4 mb-2">
          {article.published_at && new Date(article.published_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-800 mb-6 leading-tight">
          {lang === 'ar' ? article.title_ar : article.title_en}
        </h1>

        {paragraphs.length > 0 ? (
          <div className="space-y-4">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-gray-600 leading-relaxed">{p}</p>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 leading-relaxed">{lang === 'ar' ? article.excerpt_ar : article.excerpt_en}</p>
        )}
      </section>
    </div>
  )
}

export default NewsDetails
