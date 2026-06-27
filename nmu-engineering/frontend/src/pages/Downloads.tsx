import React, { useEffect, useState, useMemo } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { EmptyState, CardSkeleton } from '@/components/ui'
import { downloadsApi } from '@/api'
import type { Download } from '@/types'

const MOCK_DOCS: Download[] = [
  { id: '1', title_en: 'Study Plan — Aerospace Engineering 2025/2026', title_ar: 'الخطة الدراسية — هندسة الطيران 2025/2026', category: 'study_plan', file_url: '#', file_size: 2400000, is_active: true, created_at: '2025-01-10' },
  { id: '2', title_en: 'Study Plan — Mechatronics Engineering 2025/2026', title_ar: 'الخطة الدراسية — هندسة الميكاترونيكس 2025/2026', category: 'study_plan', file_url: '#', file_size: 2100000, is_active: true, created_at: '2025-01-10' },
  { id: '3', title_en: 'Academic Regulations 2024/2025', title_ar: 'اللائحة الأكاديمية 2024/2025', category: 'regulation', file_url: '#', file_size: 1100000, is_active: true, created_at: '2024-09-01' },
  { id: '4', title_en: 'Research Ethics Guidelines', title_ar: 'دليل أخلاقيات البحث العلمي', category: 'guide', file_url: '#', file_size: 800000, is_active: true, created_at: '2025-03-20' },
  { id: '5', title_en: 'Student Enrollment Form', title_ar: 'استمارة تسجيل الطلاب', category: 'form', file_url: '#', file_size: 300000, is_active: true, created_at: '2025-01-05' },
  { id: '6', title_en: 'Graduation Project Guidelines', title_ar: 'دليل مشروع التخرج', category: 'guide', file_url: '#', file_size: 950000, is_active: true, created_at: '2025-02-15' },
]

const CATEGORIES = [
  { id: 'all', en: 'All', ar: 'الكل' },
  { id: 'study_plan', en: 'Study Plans', ar: 'الخطط الدراسية' },
  { id: 'regulation', en: 'Regulations', ar: 'اللوائح' },
  { id: 'guide', en: 'Academic Guides', ar: 'الأدلة الأكاديمية' },
  { id: 'form', en: 'Forms', ar: 'النماذج' },
]

const CAT_ICON: Record<string, string> = { study_plan: '📘', regulation: '📋', guide: '📖', form: '📝', other: '📄' }

const formatSize = (bytes?: number) => {
  if (!bytes) return ''
  const mb = bytes / 1_000_000
  return `${mb.toFixed(1)} MB`
}

const Downloads: React.FC = () => {
  const { t, lang } = useTranslation()
  const [docs, setDocs] = useState<Download[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')

  useEffect(() => {
    document.title = lang === 'ar' ? 'التنزيلات | كلية الهندسة' : 'Downloads | NMU Engineering'
    downloadsApi.list()
      .then((res) => setDocs(res.data.length ? res.data : MOCK_DOCS))
      .catch(() => setDocs(MOCK_DOCS))
      .finally(() => setLoading(false))
  }, [lang])

  const filtered = useMemo(
    () => docs.filter((d) => category === 'all' || d.category === category),
    [docs, category]
  )

  return (
    <div>
      <section className="bg-gradient-to-br from-nmu-dark to-[#2d0a10] text-white py-14 lg:py-16">
        <div className="section-container">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
            {t('nav.downloads')}
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold">
            {lang === 'ar' ? 'الوثائق والتنزيلات' : 'Documents & Downloads'}
          </h1>
        </div>
      </section>

      <section className="section-container py-12">
        <div className="flex gap-2 overflow-x-auto pb-1 mb-8">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap border transition-colors ${
                category === c.id
                  ? 'bg-nmu-red3 text-nmu-red border-nmu-red'
                  : 'border-gray-200 text-gray-500 hover:border-nmu-red hover:text-nmu-red'
              }`}
            >
              {lang === 'ar' ? c.ar : c.en}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📄" title={t('common.noResults')} />
        ) : (
          <div className="space-y-3">
            {filtered.map((d) => (
              <a
                key={d.id}
                href={d.file_url}
                download
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4 hover:border-nmu-red hover:shadow-sm transition-all duration-150"
              >
                <div className="w-12 h-12 bg-nmu-red3 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {CAT_ICON[d.category] || '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{lang === 'ar' ? d.title_ar : d.title_en}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatSize(d.file_size)} · {new Date(d.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}
                  </p>
                </div>
                <span className="flex-shrink-0 text-nmu-red font-semibold text-sm flex items-center gap-1.5">
                  {t('common.download')} ⬇
                </span>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Downloads
