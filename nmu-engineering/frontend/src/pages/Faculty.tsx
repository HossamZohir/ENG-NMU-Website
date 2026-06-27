import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { CardSkeleton, EmptyState } from '@/components/ui'
import { facultyApi } from '@/api'
import type { FacultyMember } from '@/types'

const DEPTS = [
  { id: 'all', en: 'All Departments', ar: 'جميع الأقسام' },
  { id: 'aerospace', en: 'Aerospace', ar: 'الطيران' },
  { id: 'civil', en: 'Civil', ar: 'المدنية' },
  { id: 'mechatronics', en: 'Mechatronics', ar: 'الميكاترونيكس' },
  { id: 'energy', en: 'Energy', ar: 'الطاقة' },
  { id: 'biomedical', en: 'Biomedical', ar: 'الطبية الحيوية' },
  { id: 'petroleum', en: 'Petroleum', ar: 'البترول' },
  { id: 'architecture', en: 'Architecture', ar: 'العمارة' },
]

const RANK_LABEL: Record<string, { en: string; ar: string }> = {
  professor: { en: 'Professor', ar: 'أستاذ' },
  associate_professor: { en: 'Associate Professor', ar: 'أستاذ مشارك' },
  assistant_professor: { en: 'Assistant Professor', ar: 'أستاذ مساعد' },
  lecturer: { en: 'Lecturer', ar: 'مدرس' },
  teaching_assistant: { en: 'Teaching Assistant', ar: 'معيد' },
}

const MOCK_MEMBERS: FacultyMember[] = [
  { id: '1', name_en: 'Prof. Dr. Ahmed Hassan Ibrahim', name_ar: 'أ.د. أحمد حسن إبراهيم', title_en: 'Professor of Aerospace Engineering', title_ar: 'أستاذ هندسة الطيران', rank: 'professor', department_id: 'aerospace', email: 'ahmed.hassan@nmu.edu.eg', bio_en: '', bio_ar: '', research_interests_en: [], research_interests_ar: [], is_active: true, created_at: '' },
  { id: '2', name_en: 'Dr. Sara Mohammed Al-Rashid', name_ar: 'د. سارة محمد الرشيد', title_en: 'Associate Professor of Civil Engineering', title_ar: 'أستاذ مشارك في الهندسة المدنية', rank: 'associate_professor', department_id: 'civil', email: 'sara.rashid@nmu.edu.eg', bio_en: '', bio_ar: '', research_interests_en: [], research_interests_ar: [], is_active: true, created_at: '' },
  { id: '3', name_en: 'Dr. Khaled Ibrahim Mostafa', name_ar: 'د. خالد إبراهيم مصطفى', title_en: 'Assistant Professor of Energy Engineering', title_ar: 'أستاذ مساعد في هندسة الطاقة', rank: 'assistant_professor', department_id: 'energy', email: 'khaled.ibrahim@nmu.edu.eg', bio_en: '', bio_ar: '', research_interests_en: [], research_interests_ar: [], is_active: true, created_at: '' },
  { id: '4', name_en: 'Prof. Dr. Fatma Ali Hassan', name_ar: 'أ.د. فاطمة علي حسن', title_en: 'Professor of Biomedical Engineering', title_ar: 'أستاذ الهندسة الطبية الحيوية', rank: 'professor', department_id: 'biomedical', email: 'fatma.ali@nmu.edu.eg', bio_en: '', bio_ar: '', research_interests_en: [], research_interests_ar: [], is_active: true, created_at: '' },
  { id: '5', name_en: 'Dr. Omar Mostafa Khalil', name_ar: 'د. عمر مصطفى خليل', title_en: 'Lecturer of Mechatronics Engineering', title_ar: 'مدرس هندسة الميكاترونيكس', rank: 'lecturer', department_id: 'mechatronics', email: 'omar.mostafa@nmu.edu.eg', bio_en: '', bio_ar: '', research_interests_en: [], research_interests_ar: [], is_active: true, created_at: '' },
  { id: '6', name_en: 'Dr. Nadia Youssef Kamal', name_ar: 'د. نادية يوسف كمال', title_en: 'Associate Professor of Petroleum Engineering', title_ar: 'أستاذ مشارك في هندسة البترول', rank: 'associate_professor', department_id: 'petroleum', email: 'nadia.youssef@nmu.edu.eg', bio_en: '', bio_ar: '', research_interests_en: [], research_interests_ar: [], is_active: true, created_at: '' },
  { id: '7', name_en: 'Dr. Mahmoud Salah El-Din', name_ar: 'د. محمود صلاح الدين', title_en: 'Assistant Professor of Aerospace Engineering', title_ar: 'أستاذ مساعد في هندسة الطيران', rank: 'assistant_professor', department_id: 'aerospace', email: 'mahmoud.salah@nmu.edu.eg', bio_en: '', bio_ar: '', research_interests_en: [], research_interests_ar: [], is_active: true, created_at: '' },
  { id: '8', name_en: 'Dr. Rania Fawzy Adel', name_ar: 'د. رانيا فوزي عادل', title_en: 'Lecturer of Environmental Architecture', title_ar: 'مدرس العمارة البيئية', rank: 'lecturer', department_id: 'architecture', email: 'rania.fawzy@nmu.edu.eg', bio_en: '', bio_ar: '', research_interests_en: [], research_interests_ar: [], is_active: true, created_at: '' },
  { id: '9', name_en: 'Prof. Dr. Tarek Abdel-Rahman', name_ar: 'أ.د. طارق عبد الرحمن', title_en: 'Professor of Civil Engineering', title_ar: 'أستاذ الهندسة المدنية', rank: 'professor', department_id: 'civil', email: 'tarek.abdelrahman@nmu.edu.eg', bio_en: '', bio_ar: '', research_interests_en: [], research_interests_ar: [], is_active: true, created_at: '' },
  { id: '10', name_en: 'Dr. Hala Gaber Mansour', name_ar: 'د. هالة جابر منصور', title_en: 'Associate Professor of Mechatronics', title_ar: 'أستاذ مشارك في الميكاترونيكس', rank: 'associate_professor', department_id: 'mechatronics', email: 'hala.gaber@nmu.edu.eg', bio_en: '', bio_ar: '', research_interests_en: [], research_interests_ar: [], is_active: true, created_at: '' },
  { id: '11', name_en: 'Dr. Yasser Nasser Fouad', name_ar: 'د. ياسر ناصر فؤاد', title_en: 'Assistant Professor of Energy Engineering', title_ar: 'أستاذ مساعد في هندسة الطاقة', rank: 'assistant_professor', department_id: 'energy', email: 'yasser.nasser@nmu.edu.eg', bio_en: '', bio_ar: '', research_interests_en: [], research_interests_ar: [], is_active: true, created_at: '' },
  { id: '12', name_en: 'Dr. Mona Samir Aziz', name_ar: 'د. منى سمير عزيز', title_en: 'Lecturer of Biomedical Engineering', title_ar: 'مدرس الهندسة الطبية الحيوية', rank: 'lecturer', department_id: 'biomedical', email: 'mona.samir@nmu.edu.eg', bio_en: '', bio_ar: '', research_interests_en: [], research_interests_ar: [], is_active: true, created_at: '' },
]

const Faculty: React.FC = () => {
  const { t, lang } = useTranslation()
  const [members, setMembers] = useState<FacultyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('all')

  useEffect(() => {
    document.title = lang === 'ar' ? 'أعضاء هيئة التدريس | كلية الهندسة' : 'Faculty Members | NMU Engineering'
    facultyApi.list()
      .then((res) => setMembers(res.data.length ? res.data : MOCK_MEMBERS))
      .catch(() => setMembers(MOCK_MEMBERS))
      .finally(() => setLoading(false))
  }, [lang])

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchDept = dept === 'all' || m.department_id === dept
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        m.name_en.toLowerCase().includes(q) ||
        m.name_ar.includes(search) ||
        m.title_en.toLowerCase().includes(q)
      return matchDept && matchSearch
    })
  }, [members, search, dept])

  return (
    <div>
      <section className="bg-gradient-to-br from-nmu-dark to-[#2d0a10] text-white py-14 lg:py-16">
        <div className="section-container">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
            {t('faculty.eyebrow')}
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-3">{t('faculty.title')}</h1>
          <p className="text-white/55 max-w-xl leading-relaxed">{t('faculty.subtitle')}</p>
        </div>
      </section>

      <section className="section-container py-12">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('faculty.search')}
            className="form-input sm:flex-1"
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DEPTS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDept(d.id)}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap border transition-colors ${
                  dept === d.id
                    ? 'bg-nmu-red3 text-nmu-red border-nmu-red'
                    : 'border-gray-200 text-gray-500 hover:border-nmu-red hover:text-nmu-red'
                }`}
              >
                {lang === 'ar' ? d.ar : d.en}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="🔍" title={t('common.noResults')} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((m) => (
              <Link
                key={m.id}
                to={`/faculty/${m.id}`}
                className="card card-hover p-5 text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-nmu-red to-nmu-red2 text-white flex items-center justify-center text-lg font-extrabold mb-3 overflow-hidden">
                  {m.photo_url
                    ? <img src={m.photo_url} alt={m.name_en} className="w-full h-full object-cover" />
                    : (lang === 'ar' ? m.name_ar : m.name_en).split(' ').slice(-1)[0].charAt(0)}
                </div>
                <h3 className="font-bold text-gray-800 text-sm leading-snug">{lang === 'ar' ? m.name_ar : m.name_en}</h3>
                <div className="text-xs text-nmu-red font-semibold mt-1">{RANK_LABEL[m.rank]?.[lang] || m.rank}</div>
                <div className="text-xs text-gray-400 mt-0.5 capitalize">{m.department_id}</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Faculty
