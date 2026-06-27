import React, { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { Button, Badge, Modal, Input, Textarea, Toggle, EmptyState, CardSkeleton } from '@/components/ui'
import { programsApi } from '@/api'
import type { Program } from '@/types'
import toast from 'react-hot-toast'

const emptyProgram: Partial<Program> = {
  name_en: '', name_ar: '', description_en: '', description_ar: '',
  icon: '🎓', duration_years: 4, credit_hours: 160, language: 'English',
  vision_en: '', vision_ar: '', mission_en: '', mission_ar: '',
  coordinator_name_en: '', coordinator_name_ar: '', coordinator_email: '',
  is_active: true,
}

const AdminPrograms: React.FC = () => {
  const { lang } = useTranslation()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Program>>(emptyProgram)
  const [saving, setSaving] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [studyPlanFile, setStudyPlanFile] = useState<File | null>(null)

  useEffect(() => {
    programsApi.list({ limit: 20, is_active: undefined } as any)
      .then(res => setPrograms(res.data))
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false))
  }, [])

  const openEdit = (p: Program) => {
    setEditing({ ...p })
    setIsNew(false)
    setModalOpen(true)
    setStudyPlanFile(null)
  }

  const openNew = () => {
    setEditing({ ...emptyProgram })
    setIsNew(true)
    setModalOpen(true)
    setStudyPlanFile(null)
  }

  const handleSave = async () => {
    if (!editing.name_en || !editing.name_ar) {
      toast.error('Program name in both languages is required.')
      return
    }
    setSaving(true)
    try {
      if (isNew) {
        let created = await programsApi.create(editing)
        if (studyPlanFile) {
          const { url } = await programsApi.uploadStudyPlan(created.id, studyPlanFile)
          created = { ...created, study_plan_url: url }
        }
        setPrograms(prev => [...prev, created])
        toast.success(lang === 'ar' ? 'تم إضافة البرنامج!' : 'Program created!')
      } else {
        let updated = await programsApi.update(editing.id!, editing)
        if (studyPlanFile) {
          const { url } = await programsApi.uploadStudyPlan(editing.id!, studyPlanFile)
          updated = { ...updated, study_plan_url: url }
        }
        setPrograms(prev => prev.map(p => p.id === updated.id ? updated : p))
        toast.success(lang === 'ar' ? 'تم حفظ التغييرات!' : 'Program saved!')
      }
      setModalOpen(false)
      setStudyPlanFile(null)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Error saving program')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (p: Program) => {
    try {
      const updated = await programsApi.update(p.id, { is_active: !p.is_active })
      setPrograms(prev => prev.map(x => x.id === p.id ? updated : x))
      toast.success(lang === 'ar' ? 'تم التحديث' : 'Status updated')
    } catch {
      toast.error('Error updating status')
    }
  }

  const upd = (key: keyof Program, val: unknown) =>
    setEditing(prev => ({ ...prev, [key]: val }))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">
            {lang === 'ar' ? 'إدارة البرامج' : 'Programs Management'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {programs.length} {lang === 'ar' ? 'برنامج' : 'programs'}
          </p>
        </div>
        <Button onClick={openNew} icon={<span>+</span>}>
          {lang === 'ar' ? 'إضافة برنامج' : 'Add Program'}
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : programs.length === 0 ? (
          <EmptyState
            icon="🎓"
            title="No programs yet"
            subtitle="Programs seeded via SQL should appear here. Check your Supabase connection."
            action={<Button onClick={openNew}>Add Program</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{lang === 'ar' ? 'البرنامج' : 'Program'}</th>
                  <th>{lang === 'ar' ? 'المدة' : 'Duration'}</th>
                  <th>{lang === 'ar' ? 'الساعات' : 'Credits'}</th>
                  <th>{lang === 'ar' ? 'اللغة' : 'Language'}</th>
                  <th>{lang === 'ar' ? 'الخطة' : 'Study Plan'}</th>
                  <th>{lang === 'ar' ? 'نشط' : 'Active'}</th>
                  <th>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {programs.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.icon}</span>
                        <div>
                          <div className="font-semibold text-sm text-gray-800">{p.name_en}</div>
                          <div className="text-xs text-gray-400 font-cairo">{p.name_ar}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{p.duration_years} {lang === 'ar' ? 'سنوات' : 'yrs'}</td>
                    <td className="text-sm">{p.credit_hours}</td>
                    <td className="text-sm">{p.language}</td>
                    <td>
                      {p.study_plan_url
                        ? <a href={p.study_plan_url} target="_blank" rel="noreferrer"><Badge variant="green">✅ PDF</Badge></a>
                        : <Badge variant="gray">None</Badge>}
                    </td>
                    <td>
                      <Toggle
                        checked={p.is_active}
                        onChange={() => handleToggleActive(p)}
                      />
                    </td>
                    <td>
                      <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>
                        ✏️ {lang === 'ar' ? 'تعديل' : 'Edit'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Create Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isNew
          ? (lang === 'ar' ? 'إضافة برنامج جديد' : 'Add New Program')
          : (lang === 'ar' ? 'تعديل البرنامج' : 'Edit Program')}
        size="xl"
      >
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Program Name (English)"
              value={editing.name_en || ''}
              onChange={e => upd('name_en', e.target.value)}
              required
            />
            <Input
              label="اسم البرنامج (عربي)"
              value={editing.name_ar || ''}
              onChange={e => upd('name_ar', e.target.value)}
              required
              dir="rtl"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Textarea
              label="Description (English)"
              value={editing.description_en || ''}
              onChange={e => upd('description_en', e.target.value)}
            />
            <Textarea
              label="الوصف (عربي)"
              value={editing.description_ar || ''}
              onChange={e => upd('description_ar', e.target.value)}
              dir="rtl"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Icon (Emoji)"
              value={editing.icon || ''}
              onChange={e => upd('icon', e.target.value)}
            />
            <div>
              <label className="form-label">Duration (Years)</label>
              <select
                className="form-input"
                value={editing.duration_years}
                onChange={e => upd('duration_years', Number(e.target.value))}
              >
                {[3, 4, 5].map(y => <option key={y} value={y}>{y} Years</option>)}
              </select>
            </div>
            <Input
              label="Credit Hours"
              type="number"
              value={editing.credit_hours || ''}
              onChange={e => upd('credit_hours', Number(e.target.value))}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Textarea
              label="Vision (English)"
              value={editing.vision_en || ''}
              onChange={e => upd('vision_en', e.target.value)}
            />
            <Textarea
              label="الرؤية (عربي)"
              value={editing.vision_ar || ''}
              onChange={e => upd('vision_ar', e.target.value)}
              dir="rtl"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Textarea
              label="Mission (English)"
              value={editing.mission_en || ''}
              onChange={e => upd('mission_en', e.target.value)}
            />
            <Textarea
              label="الرسالة (عربي)"
              value={editing.mission_ar || ''}
              onChange={e => upd('mission_ar', e.target.value)}
              dir="rtl"
            />
          </div>

          {/* Program Coordinator */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-bold text-gray-700 text-xs uppercase tracking-widest mb-3">
              {lang === 'ar' ? 'منسق البرنامج' : 'Program Coordinator'}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Coordinator Name (English)"
                value={editing.coordinator_name_en || ''}
                onChange={e => upd('coordinator_name_en', e.target.value)}
                placeholder="Dr. John Smith"
              />
              <Input
                label="اسم المنسق (عربي)"
                value={editing.coordinator_name_ar || ''}
                onChange={e => upd('coordinator_name_ar', e.target.value)}
                placeholder="د. أحمد محمد"
                dir="rtl"
              />
            </div>
            <div className="mt-4">
              <Input
                label="Coordinator Email"
                type="email"
                value={editing.coordinator_email || ''}
                onChange={e => upd('coordinator_email', e.target.value)}
                placeholder="coordinator@nmu.edu.eg"
              />
            </div>
          </div>

          {/* Study Plan Upload */}
          <div>
            <label className="form-label">Study Plan PDF</label>
            {editing.study_plan_url && (
              <div className="mb-2 flex items-center gap-2">
                <a
                  href={editing.study_plan_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-nmu-red underline"
                >
                  📄 View current study plan
                </a>
              </div>
            )}
            <input
              type="file"
              accept=".pdf"
              className="form-input"
              onChange={e => setStudyPlanFile(e.target.files?.[0] || null)}
            />
            {studyPlanFile && (
              <p className="text-xs text-emerald-600 mt-1">✅ {studyPlanFile.name} ready to upload</p>
            )}
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <Toggle
              checked={editing.is_active ?? true}
              onChange={v => upd('is_active', v)}
              label={lang === 'ar' ? 'البرنامج نشط' : 'Program Active'}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSave} loading={saving}>
              💾 {lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminPrograms
