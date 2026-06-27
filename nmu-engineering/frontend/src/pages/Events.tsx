import React, { useEffect, useState, useMemo } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { EmptyState, CardSkeleton } from '@/components/ui'
import { eventsApi } from '@/api'
import type { Event } from '@/types'

const MOCK_EVENTS: Event[] = [
  { id: '1', title_en: 'Annual Engineering Forum 2025', title_ar: 'ملتقى الهندسة السنوي 2025', description_en: 'A two-day forum bringing together researchers, students, and industry leaders to discuss the future of sustainable engineering.', description_ar: 'ملتقى لمدة يومين يجمع الباحثين والطلاب وقادة الصناعة لمناقشة مستقبل الهندسة المستدامة.', location_en: 'NMU Main Auditorium', location_ar: 'القاعة الرئيسية بالجامعة', start_date: '2025-07-15', end_date: '2025-07-16', registration_url: '#', is_published: true, created_at: '' },
  { id: '2', title_en: 'Industry Partnership Day', title_ar: 'يوم الشراكة الصناعية', description_en: 'Connect with representatives from over 30 industry partners offering internships and graduate positions.', description_ar: 'تواصل مع ممثلي أكثر من 30 شريك صناعي يقدمون فرص تدريب ووظائف للخريجين.', location_en: 'Engineering Building, Ground Floor', location_ar: 'مبنى الهندسة، الطابق الأرضي', start_date: '2025-08-05', registration_url: '#', is_published: true, created_at: '' },
  { id: '3', title_en: 'Research Symposium', title_ar: 'ندوة البحث العلمي', description_en: 'Graduate students present their latest research findings across all seven engineering programs.', description_ar: 'يقدم طلاب الدراسات العليا أحدث نتائج أبحاثهم في جميع البرامج الهندسية السبعة.', location_en: 'Conference Hall B', location_ar: 'قاعة المؤتمرات ب', start_date: '2025-09-20', is_published: true, created_at: '' },
  { id: '4', title_en: 'Graduation Ceremony 2024', title_ar: 'حفل تخرج 2024', description_en: 'Celebrating the achievements of our graduating engineers.', description_ar: 'الاحتفال بإنجازات مهندسينا المتخرجين.', location_en: 'NMU Stadium', location_ar: 'استاد الجامعة', start_date: '2024-12-20', is_published: true, created_at: '' },
]

const Events: React.FC = () => {
  const { t, lang } = useTranslation()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    document.title = lang === 'ar' ? 'الفعاليات | كلية الهندسة' : 'Events | NMU Engineering'
    eventsApi.list()
      .then((res) => setEvents(res.data.length ? res.data : MOCK_EVENTS))
      .catch(() => setEvents(MOCK_EVENTS))
      .finally(() => setLoading(false))
  }, [lang])

  const now = new Date()
  const { upcoming, past } = useMemo(() => {
    const up: Event[] = []
    const pa: Event[] = []
    events.forEach((e) => {
      if (new Date(e.start_date) >= now) up.push(e)
      else pa.push(e)
    })
    up.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    pa.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    return { upcoming: up, past: pa }
  }, [events]) // eslint-disable-line react-hooks/exhaustive-deps

  const display = tab === 'upcoming' ? upcoming : past

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div>
      <section className="bg-gradient-to-br from-nmu-dark to-[#2d0a10] text-white py-14 lg:py-16">
        <div className="section-container">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
            {t('events.eyebrow')}
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold">{t('events.title')}</h1>
        </div>
      </section>

      <section className="section-container py-12">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
          {(['upcoming', 'past'] as const).map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === tb ? 'bg-white text-nmu-red shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tb === 'upcoming'
                ? (lang === 'ar' ? 'القادمة' : 'Upcoming')
                : (lang === 'ar' ? 'السابقة' : 'Past')}
              <span className="ms-2 text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">
                {tb === 'upcoming' ? upcoming.length : past.length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : display.length === 0 ? (
          <EmptyState icon="📅" title={t('common.noResults')} />
        ) : (
          <div className="space-y-4">
            {display.map((e) => (
              <div key={e.id} className="card p-6 flex flex-col sm:flex-row gap-5">
                {/* Date block */}
                <div className="flex-shrink-0 w-full sm:w-24 text-center bg-nmu-red3 rounded-xl p-3">
                  <div className="text-2xl font-extrabold text-nmu-red">
                    {new Date(e.start_date).getDate()}
                  </div>
                  <div className="text-xs font-bold text-nmu-red uppercase">
                    {new Date(e.start_date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { month: 'short' })}
                  </div>
                  <div className="text-xs text-nmu-red/60">{new Date(e.start_date).getFullYear()}</div>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg mb-1.5">{lang === 'ar' ? e.title_ar : e.title_en}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">{lang === 'ar' ? e.description_ar : e.description_en}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">📅 {formatDate(e.start_date)}{e.end_date && ` – ${formatDate(e.end_date)}`}</span>
                    <span className="flex items-center gap-1.5">📍 {lang === 'ar' ? e.location_ar : e.location_en}</span>
                  </div>
                </div>

                {e.registration_url && tab === 'upcoming' && (
                  <div className="flex-shrink-0 flex items-center">
                    <a href={e.registration_url} className="btn-outline text-sm whitespace-nowrap">
                      {t('events.register')}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Events
