import React, { useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

const ALBUMS = [
  { id: '1', en: 'Graduation Ceremony 2024', ar: 'حفل تخرج 2024', count: 48, icon: '🎓' },
  { id: '2', en: 'Lab Inauguration', ar: 'افتتاح المعمل', count: 24, icon: '🔬' },
  { id: '3', en: 'Engineering Forum 2025', ar: 'ملتقى الهندسة 2025', count: 36, icon: '🎤' },
  { id: '4', en: 'Campus Life', ar: 'الحياة الجامعية', count: 60, icon: '🏫' },
  { id: '5', en: 'Industry Visits', ar: 'الزيارات الصناعية', count: 18, icon: '🏭' },
  { id: '6', en: 'Sports Day', ar: 'يوم رياضي', count: 32, icon: '⚽' },
]

const Gallery: React.FC = () => {
  const { t, lang } = useTranslation()

  useEffect(() => {
    document.title = lang === 'ar' ? 'معرض الصور | كلية الهندسة' : 'Gallery | NMU Engineering'
  }, [lang])

  return (
    <div>
      <section className="bg-gradient-to-br from-nmu-dark to-[#2d0a10] text-white py-14 lg:py-16">
        <div className="section-container">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
            {t('nav.gallery')}
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold">
            {lang === 'ar' ? 'معرض الصور والفيديو' : 'Photo & Video Gallery'}
          </h1>
        </div>
      </section>

      <section className="section-container py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALBUMS.map((a) => (
            <div key={a.id} className="card card-hover overflow-hidden">
              <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-5xl text-gray-300">
                {a.icon}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-800 mb-1">{lang === 'ar' ? a.ar : a.en}</h3>
                <p className="text-sm text-gray-400">{a.count} {lang === 'ar' ? 'عنصر' : 'items'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Gallery
