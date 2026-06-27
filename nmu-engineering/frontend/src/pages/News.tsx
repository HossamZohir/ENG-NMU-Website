import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { CardSkeleton, EmptyState } from '@/components/ui'
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

const MOCK_NEWS: NewsArticle[] = [
  { id: '1', title_en: 'NMU researchers develop breakthrough solar energy storage system', title_ar: 'باحثو الجامعة يطورون نظام تخزين طاقة شمسية مبتكر', slug: 'solar-energy', excerpt_en: 'A team from the Energy Engineering department has developed a novel phase-change material for thermal energy storage, promising to improve solar grid efficiency by up to 30%.', excerpt_ar: 'طور فريق من قسم هندسة الطاقة مادة طور انتقالية جديدة لتخزين الطاقة الحرارية، مما يعد بتحسين كفاءة الشبكة الشمسية بنسبة تصل إلى 30%.', content_en: '', content_ar: '', category_id: '1', is_featured: true, is_published: true, published_at: '2025-06-05', created_at: '', updated_at: '' },
  { id: '2', title_en: 'Annual Engineering Forum 2025 — Call for Papers', title_ar: 'ملتقى الهندسة السنوي 2025 — دعوة لتقديم الأبحاث', slug: 'forum-2025', excerpt_en: 'The Faculty invites researchers and students to submit papers for the 5th Annual Engineering Forum, focused on sustainable innovation.', excerpt_ar: 'تدعو الكلية الباحثين والطلاب لتقديم أبحاثهم للملتقى السنوي الخامس الذي يركز على الابتكار المستدام.', content_en: '', content_ar: '', category_id: '2', is_featured: false, is_published: true, published_at: '2025-05-28', created_at: '', updated_at: '' },
  { id: '3', title_en: 'Aerospace team wins national drone competition', title_ar: 'فريق الطيران يفوز بالبطولة الوطنية للطائرات المسيّرة', slug: 'drone-win', excerpt_en: 'NMU aerospace students took first place at the national UAV design championship held in Cairo, beating 24 competing universities.', excerpt_ar: 'حصل طلاب هندسة الطيران على المركز الأول في بطولة تصميم الطائرات المسيّرة بالقاهرة، متغلبين على 24 جامعة منافسة.', content_en: '', content_ar: '', category_id: '3', is_featured: true, is_published: true, published_at: '2025-05-15', created_at: '', updated_at: '' },
  { id: '4', title_en: 'New MoU signed with Siemens Egypt for internship programs', title_ar: 'توقيع بروتوكول تعاون مع سيمنس مصر لبرامج التدريب', slug: 'siemens-mou', excerpt_en: 'The Faculty has signed a memorandum of understanding with Siemens Egypt providing 50 internship slots annually for engineering students.', excerpt_ar: 'وقعت الكلية بروتوكول تعاون مع سيمنس مصر يوفر 50 فرصة تدريب سنوياً لطلاب الهندسة.', content_en: '', content_ar: '', category_id: '4', is_featured: false, is_published: true, published_at: '2025-04-22', created_at: '', updated_at: '' },
  { id: '5', title_en: 'New Mechatronics lab inaugurated with state-of-the-art robots', title_ar: 'افتتاح معمل الميكاترونيكس الجديد بروبوتات متطورة', slug: 'mechatronics-lab', excerpt_en: 'The new robotics laboratory features 12 industrial robots and collaborative research workstations for student projects.', excerpt_ar: 'يحتوي معمل الروبوتات الجديد على 12 روبوت صناعي ومحطات بحث تعاونية لمشاريع الطلاب.', content_en: '', content_ar: '', category_id: '5', is_featured: false, is_published: true, published_at: '2025-04-10', created_at: '', updated_at: '' },
  { id: '6', title_en: 'Petroleum engineering team completes Red Sea survey project', title_ar: 'فريق هندسة البترول ينهي مشروع مسح البحر الأحمر', slug: 'red-sea-survey', excerpt_en: 'Research results have been published in leading journals and received significant industry attention from regional energy companies.', excerpt_ar: 'تم نشر نتائج البحث في مجلات علمية رائدة وحظيت باهتمام كبير من شركات الطاقة الإقليمية.', content_en: '', content_ar: '', category_id: '1', is_featured: false, is_published: true, published_at: '2025-03-30', created_at: '', updated_at: '' },
]

const CATEGORY_FILTERS = ['all', '1', '2', '3', '4', '5', '6']

const News: React.FC = () => {
  const { t, lang } = useTranslation()
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 6

  useEffect(() => {
    document.title = lang === 'ar' ? 'الأخبار | كلية الهندسة' : 'News | NMU Engineering'
    newsApi.list()
      .then((res) => setArticles(res.data.length ? res.data : MOCK_NEWS))
      .catch(() => setArticles(MOCK_NEWS))
      .finally(() => setLoading(false))
  }, [lang])

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchCat = category === 'all' || a.category_id === category
      const q = search.toLowerCase()
      const matchSearch =
        !q || a.title_en.toLowerCase().includes(q) || a.title_ar.includes(search) || a.excerpt_en.toLowerCase().includes(q)
      return matchCat && matchSearch && a.is_published
    })
  }, [articles, search, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div>
      <section className="bg-gradient-to-br from-nmu-dark to-[#2d0a10] text-white py-14 lg:py-16">
        <div className="section-container">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
            {t('news.eyebrow')}
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold">{t('news.title')}</h1>
        </div>
      </section>

      <section className="section-container py-12">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder={t('news.search')}
            className="form-input sm:flex-1"
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORY_FILTERS.map((c) => (
              <button
                key={c}
                onClick={() => { setCategory(c); setPage(1) }}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap border transition-colors ${
                  category === c
                    ? 'bg-nmu-red3 text-nmu-red border-nmu-red'
                    : 'border-gray-200 text-gray-500 hover:border-nmu-red hover:text-nmu-red'
                }`}
              >
                {c === 'all' ? t('common.all') : (lang === 'ar' ? NEWS_CATS[c]?.ar : NEWS_CATS[c]?.en)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : paginated.length === 0 ? (
          <EmptyState icon="📰" title={t('common.noResults')} />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((n) => (
                <Link key={n.id} to={`/news/${n.slug}`} className="card card-hover overflow-hidden">
                  <div className="h-44 bg-gradient-to-br from-nmu-red to-nmu-red2 relative flex items-center justify-center text-5xl text-white/30 overflow-hidden">
                    {n.image_url
                      ? <img src={n.image_url} alt="" className="w-full h-full object-cover absolute inset-0" />
                      : NEWS_ICONS[n.category_id] || '📰'}
                    <span className="absolute top-3 start-3 bg-white text-nmu-red text-xs font-bold px-2.5 py-1 rounded-md z-10">
                      {lang === 'ar' ? NEWS_CATS[n.category_id]?.ar : NEWS_CATS[n.category_id]?.en}
                    </span>
                    {n.is_featured && (
                      <span className="absolute top-3 end-3 bg-amber-400 text-white text-xs font-bold px-2.5 py-1 rounded-md z-10">
                        ⭐ {lang === 'ar' ? 'مميز' : 'Featured'}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-gray-400 mb-2">
                      {n.published_at && new Date(n.published_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h3 className="font-bold text-gray-800 leading-snug mb-2">{lang === 'ar' ? n.title_ar : n.title_en}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{lang === 'ar' ? n.excerpt_ar : n.excerpt_en}</p>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:border-nmu-red hover:text-nmu-red transition-colors"
                >
                  {lang === 'ar' ? '→' : '←'} {t('common.prev')}
                </button>
                <span className="text-sm text-gray-500">{page} / {totalPages}</span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:border-nmu-red hover:text-nmu-red transition-colors"
                >
                  {t('common.next')} {lang === 'ar' ? '←' : '→'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default News
