import React, { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { facultyApi } from '@/api'
import type { FacultyMember } from '@/types'

const RANK_LABEL: Record<string, { en: string; ar: string }> = {
  professor: { en: 'Professor', ar: 'أستاذ' },
  associate_professor: { en: 'Associate Professor', ar: 'أستاذ مشارك' },
  assistant_professor: { en: 'Assistant Professor', ar: 'أستاذ مساعد' },
  lecturer: { en: 'Lecturer', ar: 'مدرس' },
  teaching_assistant: { en: 'Teaching Assistant', ar: 'معيد' },
}

const MOCK_MEMBER: FacultyMember = {
  id: '1',
  name_en: 'Prof. Dr. Ahmed Hassan Ibrahim',
  name_ar: 'أ.د. أحمد حسن إبراهيم',
  title_en: 'Professor of Aerospace Engineering',
  title_ar: 'أستاذ هندسة الطيران والفضاء',
  rank: 'professor',
  department_id: 'aerospace',
  department_name: 'Aerospace Engineering',
  email: 'ahmed.hassan@nmu.edu.eg',
  phone: '+20 50 123 4567 (ext. 301)',
  office: 'Room 305, Engineering Building A',
  office_hours: 'Sunday & Tuesday, 10:00 AM – 12:00 PM',
  bio_en: 'Prof. Dr. Ahmed Hassan Ibrahim is a Professor of Aerospace Engineering with over 18 years of experience in aerodynamics and propulsion systems research. He earned his Ph.D. from Cairo University and completed postdoctoral research at the German Aerospace Center (DLR). His work focuses on computational fluid dynamics, UAV design, and sustainable aviation technologies.',
  bio_ar: 'أ.د. أحمد حسن إبراهيم أستاذ في هندسة الطيران والفضاء بخبرة تزيد عن 18 عاماً في أبحاث الديناميكا الهوائية وأنظمة الدفع. حصل على الدكتوراه من جامعة القاهرة وأكمل أبحاث ما بعد الدكتوراه في المركز الألماني للفضاء الجوي. يركز عمله على ديناميكا السوائل الحاسوبية وتصميم الطائرات المسيرة وتقنيات الطيران المستدام.',
  photo_url: '',
  research_interests_en: ['Computational Fluid Dynamics', 'UAV Design & Control', 'Sustainable Aviation', 'Propulsion Systems'],
  research_interests_ar: ['ديناميكا السوائل الحاسوبية', 'تصميم وتحكم الطائرات المسيرة', 'الطيران المستدام', 'أنظمة الدفع'],
  publications: [
    { id: '1', faculty_id: '1', title: 'Optimization of UAV Wing Design Using Machine Learning', journal: 'Journal of Aerospace Engineering', year: 2024 },
    { id: '2', faculty_id: '1', title: 'CFD Analysis of Hybrid Propulsion Systems for Regional Aircraft', journal: 'Aerospace Science and Technology', year: 2023 },
    { id: '3', faculty_id: '1', title: 'Sustainable Aviation Fuels: A Review of Recent Developments', journal: 'Energy Reports', year: 2022 },
  ],
  is_active: true,
  created_at: '',
}

const FacultyProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { t, lang } = useTranslation()
  const [member, setMember] = useState<FacultyMember | null | undefined>(undefined)

  useEffect(() => {
    facultyApi.get(id!)
      .then(setMember)
      .catch(() => setMember(id === '1' ? MOCK_MEMBER : { ...MOCK_MEMBER, id: id! }))
  }, [id])

  useEffect(() => {
    if (member) document.title = `${lang === 'ar' ? member.name_ar : member.name_en} | NMU Engineering`
  }, [member, lang])

  if (member === undefined) return <div className="py-32 text-center text-gray-400">{t('common.loading')}</div>
  if (member === null) return <Navigate to="/faculty" replace />

  return (
    <div>
      <section className="bg-gradient-to-br from-nmu-dark to-[#2d0a10] text-white py-12 lg:py-16">
        <div className="section-container">
          <Link to="/faculty" className="text-white/50 hover:text-white text-sm transition-colors">
            {lang === 'ar' ? '→' : '←'} {t('common.back')}
          </Link>
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mt-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-nmu-red to-nmu-red2 flex items-center justify-center text-3xl font-extrabold flex-shrink-0 overflow-hidden">
              {member.photo_url
                ? <img src={member.photo_url} alt={member.name_en} className="w-full h-full object-cover" />
                : (lang === 'ar' ? member.name_ar : member.name_en).split(' ').slice(-1)[0].charAt(0)}
            </div>
            <div className="text-center sm:text-start">
              <h1 className="text-2xl lg:text-3xl font-extrabold">{lang === 'ar' ? member.name_ar : member.name_en}</h1>
              <p className="text-white/55 mt-1">{lang === 'ar' ? member.title_ar : member.title_en}</p>
              <span className="inline-block mt-2 bg-white/10 text-xs font-bold px-3 py-1 rounded-full">
                {RANK_LABEL[member.rank]?.[lang] || member.rank}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-container py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-3">{t('faculty.profile.bio')}</h3>
              <p className="text-gray-500 leading-relaxed">{lang === 'ar' ? member.bio_ar : member.bio_en}</p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-3">{t('faculty.profile.research')}</h3>
              <div className="flex flex-wrap gap-2">
                {(lang === 'ar' ? member.research_interests_ar : member.research_interests_en).map((r, i) => (
                  <span key={i} className="badge badge-blue px-3 py-1.5">{r}</span>
                ))}
              </div>
            </div>

            {member.publications && member.publications.length > 0 && (
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-3">{t('faculty.profile.publications')}</h3>
                <div className="space-y-3">
                  {member.publications.map((p) => (
                    <div key={p.id} className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 text-sm leading-snug">{p.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{p.journal} · {p.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-24 space-y-4">
              <h4 className="font-bold text-gray-800">{t('faculty.profile.contact')}</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</div>
                  <a href={`mailto:${member.email}`} className="font-semibold text-nmu-red break-all" dir="ltr">{member.email}</a>
                </div>
                {member.phone && (
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">{lang === 'ar' ? 'الهاتف' : 'Phone'}</div>
                    <div className="font-semibold text-gray-800" dir="ltr">{member.phone}</div>
                  </div>
                )}
                {member.office && (
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">{t('faculty.profile.office')}</div>
                    <div className="font-semibold text-gray-800">{member.office}</div>
                  </div>
                )}
                {member.office_hours && (
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">{t('faculty.profile.hours')}</div>
                    <div className="font-semibold text-gray-800">{member.office_hours}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default FacultyProfile
