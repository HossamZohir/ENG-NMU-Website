import React, { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { Button, Input, Textarea, CardSkeleton } from '@/components/ui'
import { homepageApi } from '@/api'
import type { HomepageContent } from '@/types'
import toast from 'react-hot-toast'

const AdminHomepage: React.FC = () => {
  const { lang } = useTranslation()
  const [data, setData] = useState<HomepageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'hero' | 'dean' | 'stats'>('hero')
  const [deanPhotoFile, setDeanPhotoFile] = useState<File | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const content = await homepageApi.get()
      setData(content)
    } catch (error) {
      console.error('Failed to load homepage content:', error)
      toast.error(lang === 'ar' ? 'فشل في تحميل محتوى الصفحة الرئيسية' : 'Failed to load homepage content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const upd = (key: keyof HomepageContent, val: unknown) =>
    setData(p => p ? { ...p, [key]: val } : p)

  const handleSave = async () => {
    if (!data) return
    setSaving(true)
    try {
      // Upload dean photo first if selected
      if (deanPhotoFile) {
        const uploaded = await homepageApi.uploadDeanPhoto(deanPhotoFile)
        upd('dean_photo_url', uploaded.url)
        setDeanPhotoFile(null)
      }
      
      // Update the homepage content
      const updated = await homepageApi.update(data)
      setData(updated)
      
      toast.success(lang === 'ar' ? 'تم حفظ التغييرات!' : 'Homepage updated successfully!')
      
      // Reload to ensure we have the latest data
      await loadData()
    } catch (e: any) {
      console.error('Save error:', e)
      toast.error(e?.response?.data?.detail || (lang === 'ar' ? 'خطأ في حفظ الصفحة الرئيسية' : 'Error saving homepage'))
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'hero' as const,  label: lang === 'ar' ? 'البانر الرئيسي' : 'Hero Banner' },
    { id: 'dean' as const,  label: lang === 'ar' ? 'رسالة العميد'   : "Dean's Message" },
    { id: 'stats' as const, label: lang === 'ar' ? 'الإحصاءات'      : 'Statistics' },
  ]

  if (loading) return (
    <div className="space-y-4">
      {[0,1,2,3,4].map(i => <CardSkeleton key={i} />)}
    </div>
  )

  if (!data) return (
    <div className="text-center py-20 text-gray-400">
      <div className="text-4xl mb-3">⚠️</div>
      <p>{lang === 'ar' ? 'لا يمكن تحميل محتوى الصفحة الرئيسية' : 'Could not load homepage content'}</p>
      <Button onClick={loadData} className="mt-4">
        {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
      </Button>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">
            {lang === 'ar' ? 'إدارة الصفحة الرئيسية' : 'Homepage Management'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {lang === 'ar' ? 'آخر تحديث: ' : 'Last updated: '}
            {data.updated_at ? new Date(data.updated_at).toLocaleString() : 'Never'}
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          loading={saving}
          className="bg-nmu-red hover:bg-nmu-red/90 text-white"
        >
          {saving ? (
            lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'
          ) : (
            <>
              💾 {lang === 'ar' ? 'حفظ جميع التغييرات' : 'Save All Changes'}
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab.id ? 'bg-white text-nmu-red shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">

        {/* ── Hero Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'hero' && <>
          <h2 className="font-bold text-gray-700 text-xs uppercase tracking-widest">
            {lang === 'ar' ? 'القسم الرئيسي' : 'Hero Section'}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Headline (English)"
              value={data.hero_headline_en}
              onChange={e => upd('hero_headline_en', e.target.value)}
            />
            <Input
              label="العنوان الرئيسي (عربي)"
              value={data.hero_headline_ar}
              onChange={e => upd('hero_headline_ar', e.target.value)}
              dir="rtl"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Textarea
              label="Subtitle (English)"
              value={data.hero_subtitle_en}
              onChange={e => upd('hero_subtitle_en', e.target.value)}
              rows={3}
            />
            <Textarea
              label="العنوان الفرعي (عربي)"
              value={data.hero_subtitle_ar}
              onChange={e => upd('hero_subtitle_ar', e.target.value)}
              dir="rtl"
              rows={3}
            />
          </div>

          <hr className="border-gray-100" />
          <h2 className="font-bold text-gray-700 text-xs uppercase tracking-widest">
            {lang === 'ar' ? 'شريط الإعلانات' : 'Announcement Bar'}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Announcement Text (English)"
              value={data.announcement_text_en}
              onChange={e => upd('announcement_text_en', e.target.value)}
            />
            <Input
              label="نص الإعلان (عربي)"
              value={data.announcement_text_ar}
              onChange={e => upd('announcement_text_ar', e.target.value)}
              dir="rtl"
            />
          </div>
          <Input
            label="Announcement Link (URL)"
            value={data.announcement_link || ''}
            onChange={e => upd('announcement_link', e.target.value)}
            placeholder="/contact"
          />
        </>}

        {/* ── Dean Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'dean' && <>
          <h2 className="font-bold text-gray-700 text-xs uppercase tracking-widest">
            {lang === 'ar' ? 'رسالة العميد' : "Dean's Message"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Dean Full Name (English)"
              value={data.dean_name}
              onChange={e => upd('dean_name', e.target.value)}
            />
            <Input
              label="اسم العميد (عربي)"
              value={data.dean_name_ar}
              onChange={e => upd('dean_name_ar', e.target.value)}
              dir="rtl"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Title (English)"
              value={data.dean_title_en}
              onChange={e => upd('dean_title_en', e.target.value)}
            />
            <Input
              label="اللقب (عربي)"
              value={data.dean_title_ar}
              onChange={e => upd('dean_title_ar', e.target.value)}
              dir="rtl"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Textarea
              label="Message (English)"
              value={data.dean_message_en}
              onChange={e => upd('dean_message_en', e.target.value)}
              className="min-h-[140px]"
            />
            <Textarea
              label="الرسالة (عربي)"
              value={data.dean_message_ar}
              onChange={e => upd('dean_message_ar', e.target.value)}
              className="min-h-[140px]"
              dir="rtl"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Dean Email"
              type="email"
              value={data.dean_email}
              onChange={e => upd('dean_email', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lang === 'ar' ? 'صورة العميد' : 'Dean Photo'}
            </label>
            {data.dean_photo_url && (
              <div className="mb-3">
                <img
                  src={data.dean_photo_url}
                  alt="Dean"
                  className="w-24 h-24 rounded-xl object-cover border border-gray-200"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {lang === 'ar' ? 'الصورة الحالية — قم بتحميل صورة جديدة لاستبدالها' : 'Current photo — upload a new one to replace'}
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-nmu-red/10 file:text-nmu-red hover:file:bg-nmu-red/20"
              onChange={e => setDeanPhotoFile(e.target.files?.[0] || null)}
            />
            {deanPhotoFile && (
              <p className="text-xs text-emerald-600 mt-2">✅ {deanPhotoFile.name} {lang === 'ar' ? 'جاهز للرفع' : 'ready to upload'}</p>
            )}
          </div>
        </>}

        {/* ── Stats Tab ────────────────────────────────────────────────── */}
        {activeTab === 'stats' && <>
          <h2 className="font-bold text-gray-700 text-xs uppercase tracking-widest">
            {lang === 'ar' ? 'الإحصاءات (تظهر في البانر وشريط الإحصائيات)' : 'Statistics (shown in hero and stats bar)'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              label={lang === 'ar' ? 'البرامج' : 'Programs'}
              type="number"
              value={data.stat_programs}
              onChange={e => upd('stat_programs', Number(e.target.value))}
            />
            <Input
              label={lang === 'ar' ? 'أعضاء هيئة التدريس' : 'Faculty Members'}
              type="number"
              value={data.stat_faculty}
              onChange={e => upd('stat_faculty', Number(e.target.value))}
            />
            <Input
              label={lang === 'ar' ? 'الطلاب' : 'Students'}
              type="number"
              value={data.stat_students}
              onChange={e => upd('stat_students', Number(e.target.value))}
            />
            <Input
              label={lang === 'ar' ? 'المختبرات البحثية' : 'Research Labs'}
              type="number"
              value={data.stat_labs}
              onChange={e => upd('stat_labs', Number(e.target.value))}
            />
            <Input
              label={lang === 'ar' ? 'شركاء الصناعة' : 'Industry Partners'}
              type="number"
              value={data.stat_partners}
              onChange={e => upd('stat_partners', Number(e.target.value))}
            />
            <Input
              label={lang === 'ar' ? 'المنشورات' : 'Publications'}
              type="number"
              value={data.stat_publications}
              onChange={e => upd('stat_publications', Number(e.target.value))}
            />
          </div>
        </>}

      </div>

      {/* Preview note */}
      <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
        <span>💡</span>
        <span>
          {lang === 'ar'
            ? 'التغييرات ستظهر فوراً على الموقع بعد الحفظ. اضغط حفظ ثم انتقل للصفحة الرئيسية لترى النتيجة.'
            : 'Changes appear immediately on the site after saving. Click Save then visit the homepage to see the result.'}
        </span>
      </div>
    </div>
  )
}

export default AdminHomepage