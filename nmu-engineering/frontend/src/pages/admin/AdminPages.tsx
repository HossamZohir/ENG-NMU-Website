import React, { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/hooks/useAuth'
import { Button, Badge, Modal, Input, Textarea, Select, Toggle, ConfirmDialog, EmptyState, CardSkeleton } from '@/components/ui'
import { facultyApi, eventsApi, researchApi, laboratoriesApi, downloadsApi, contactApi, usersApi, authApi, programsApi } from '@/api'
import { apiClient } from '@/api/client'
import type { FacultyMember, Event, ResearchProject, Laboratory, Download, ContactInfo, User } from '@/types'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────────────────────────────────────
// Admin: Faculty Members Management
// ─────────────────────────────────────────────────────────────────────────────
const RANKS = [
  { value: 'professor', label: 'Professor' },
  { value: 'associate_professor', label: 'Associate Professor' },
  { value: 'assistant_professor', label: 'Assistant Professor' },
  { value: 'lecturer', label: 'Lecturer' },
  { value: 'teaching_assistant', label: 'Teaching Assistant' },
]
const DEPTS = [
  { value: 'aerospace', label: 'Aerospace Engineering' },
  { value: 'civil', label: 'Civil Construction' },
  { value: 'mechatronics', label: 'Mechatronics' },
  { value: 'energy', label: 'Energy' },
  { value: 'biomedical', label: 'Biomedical' },
  { value: 'petroleum', label: 'Petroleum & Gas' },
  { value: 'architecture', label: 'Architecture' },
]
const RANK_LABEL: Record<string, string> = {
  professor: 'Professor',
  associate_professor: 'Associate Professor',
  assistant_professor: 'Assistant Professor',
  lecturer: 'Lecturer',
  teaching_assistant: 'Teaching Assistant',
}

const emptyMember = { name_en: '', name_ar: '', title_en: '', title_ar: '', rank: 'lecturer' as const, department_id: 'aerospace', email: '', phone: '', office: '', office_hours: '', bio_en: '', bio_ar: '' }

export const AdminMembers: React.FC = () => {
  const { lang } = useTranslation()
  const [members, setMembers] = useState<FacultyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [isNew, setIsNew] = useState(true)
  const [editing, setEditing] = useState<typeof emptyMember & { id?: string }>(emptyMember)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  useEffect(() => {
    facultyApi.list({ limit: 100 })
      .then(res => setMembers(res.data))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }, [])

  const upd = (k: string, v: string) => setEditing(p => ({ ...p, [k]: v }))

  const openNew = () => { setEditing({ ...emptyMember }); setIsNew(true); setModalOpen(true); setPhotoFile(null) }
  const openEdit = (m: FacultyMember) => {
    setEditing({ id: m.id, name_en: m.name_en, name_ar: m.name_ar, title_en: m.title_en, title_ar: m.title_ar, rank: m.rank, department_id: m.department_id, email: m.email, phone: m.phone || '', office: m.office || '', office_hours: m.office_hours || '', bio_en: m.bio_en, bio_ar: m.bio_ar })
    setIsNew(false); setModalOpen(true); setPhotoFile(null)
  }

  const handleSave = async () => {
    if (!editing.name_en || !editing.email) { toast.error('Name and email are required'); return }
    setSaving(true)
    try {
      if (isNew) {
        let created = await facultyApi.create({ ...editing, research_interests_en: [], research_interests_ar: [], is_active: true } as Partial<FacultyMember>)
        if (photoFile) {
          const { url } = await facultyApi.uploadPhoto(created.id, photoFile)
          created = { ...created, photo_url: url }
        }
        setMembers(p => [created, ...p])
        toast.success(lang === 'ar' ? 'تم الإضافة!' : 'Member added!')
      } else {
        let updated = await facultyApi.update(editing.id!, editing as Partial<FacultyMember>)
        if (photoFile) {
          const { url } = await facultyApi.uploadPhoto(editing.id!, photoFile)
          updated = { ...updated, photo_url: url }
        }
        setMembers(p => p.map(m => m.id === updated.id ? updated : m))
        toast.success(lang === 'ar' ? 'تم الحفظ!' : 'Saved!')
      }
      setModalOpen(false)
      setPhotoFile(null)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Error saving member')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await facultyApi.delete(deleteId)
      setMembers(p => p.filter(m => m.id !== deleteId))
      toast.success('Deleted')
    } catch { toast.error('Error deleting') }
    finally { setDeleteId(null); setDeleting(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-800">{lang === 'ar' ? 'إدارة أعضاء هيئة التدريس' : 'Faculty Members'}</h1>
        <Button onClick={openNew}>+ {lang === 'ar' ? 'إضافة عضو' : 'Add Member'}</Button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? <div className="p-6 space-y-3">{[0,1,2].map(i=><CardSkeleton key={i}/>)}</div>
        : members.length === 0 ? <EmptyState icon="👥" title="No faculty members yet" action={<Button onClick={openNew}>Add First Member</Button>} />
        : <div className="overflow-x-auto"><table className="data-table">
            <thead><tr><th>Name</th><th>Rank</th><th>Department</th><th>Email</th><th>Actions</th></tr></thead>
            <tbody>{members.map(m => (
              <tr key={m.id}>
                <td><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-nmu-red text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{m.name_en.charAt(0)}</div><div><div className="font-semibold text-sm">{m.name_en}</div><div className="text-xs text-gray-400">{m.name_ar}</div></div></div></td>
                <td><Badge variant="blue">{RANK_LABEL[m.rank] || m.rank}</Badge></td>
                <td className="text-sm text-gray-500 capitalize">{m.department_id}</td>
                <td className="text-xs text-gray-500">{m.email}</td>
                <td><div className="flex gap-1.5"><Button variant="secondary" size="sm" onClick={() => openEdit(m)}>✏️</Button><Button variant="danger" size="sm" onClick={() => setDeleteId(m.id)}>🗑</Button></div></td>
              </tr>
            ))}</tbody>
          </table></div>}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isNew ? 'Add Faculty Member' : 'Edit Faculty Member'} size="xl">
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Name (English)" value={editing.name_en} onChange={e => upd('name_en', e.target.value)} required />
            <Input label="الاسم (عربي)" value={editing.name_ar} onChange={e => upd('name_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Title (English)" value={editing.title_en} onChange={e => upd('title_en', e.target.value)} />
            <Input label="اللقب (عربي)" value={editing.title_ar} onChange={e => upd('title_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Select label="Academic Rank" value={editing.rank} onChange={e => upd('rank', e.target.value)} options={RANKS} />
            <Select label="Department" value={editing.department_id} onChange={e => upd('department_id', e.target.value)} options={DEPTS} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Email" type="email" value={editing.email} onChange={e => upd('email', e.target.value)} required />
            <Input label="Phone" value={editing.phone} onChange={e => upd('phone', e.target.value)} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Office" value={editing.office} onChange={e => upd('office', e.target.value)} />
            <Input label="Office Hours" value={editing.office_hours} onChange={e => upd('office_hours', e.target.value)} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Textarea label="Bio (English)" value={editing.bio_en} onChange={e => upd('bio_en', e.target.value)} />
            <Textarea label="السيرة (عربي)" value={editing.bio_ar} onChange={e => upd('bio_ar', e.target.value)} dir="rtl" />
          </div>
          <div><label className="form-label">Profile Photo</label><input type="file" accept="image/*" className="form-input" onChange={e => setPhotoFile(e.target.files?.[0] || null)} /></div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>💾 Save</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Member" message="Are you sure you want to delete this faculty member?" confirmLabel="Delete" loading={deleting} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin: Events Management
// ─────────────────────────────────────────────────────────────────────────────
const emptyEvent = { title_en: '', title_ar: '', description_en: '', description_ar: '', location_en: '', location_ar: '', start_date: '', end_date: '', registration_url: '', is_published: false }

export const AdminEvents: React.FC = () => {
  const { lang } = useTranslation()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [isNew, setIsNew] = useState(true)
  const [editing, setEditing] = useState<typeof emptyEvent & { id?: string }>(emptyEvent)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    eventsApi.listAll()
      .then(res => setEvents(res.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  const upd = (k: string, v: any) => setEditing(p => ({ ...p, [k]: v }))
  const openNew = () => { setEditing({ ...emptyEvent }); setIsNew(true); setModalOpen(true) }
  const openEdit = (e: Event) => {
    setEditing({ id: e.id, title_en: e.title_en, title_ar: e.title_ar, description_en: e.description_en, description_ar: e.description_ar, location_en: e.location_en, location_ar: e.location_ar, start_date: e.start_date?.slice(0,16) || '', end_date: e.end_date?.slice(0,16) || '', registration_url: e.registration_url || '', is_published: e.is_published })
    setIsNew(false); setModalOpen(true)
  }

  const handleSave = async () => {
    if (!editing.title_en || !editing.start_date) { toast.error('Title and start date are required'); return }
    setSaving(true)
    try {
      const payload = { ...editing, start_date: new Date(editing.start_date).toISOString(), end_date: editing.end_date ? new Date(editing.end_date).toISOString() : undefined }
      if (isNew) {
        const created = await eventsApi.create(payload as any)
        setEvents(p => [created, ...p])
        toast.success('Event created!')
      } else {
        const updated = await eventsApi.update(editing.id!, payload as any)
        setEvents(p => p.map(e => e.id === updated.id ? updated : e))
        toast.success('Event saved!')
      }
      setModalOpen(false)
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Error saving event') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try { await eventsApi.delete(deleteId); setEvents(p => p.filter(e => e.id !== deleteId)); toast.success('Deleted') }
    catch { toast.error('Error deleting') }
    setDeleteId(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-800">{lang === 'ar' ? 'إدارة الفعاليات' : 'Events Management'}</h1>
        <Button onClick={openNew}>+ {lang === 'ar' ? 'فعالية جديدة' : 'New Event'}</Button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? <div className="p-6 space-y-3">{[0,1,2].map(i=><CardSkeleton key={i}/>)}</div>
        : events.length === 0 ? <EmptyState icon="📅" title="No events yet" action={<Button onClick={openNew}>Add First Event</Button>} />
        : <table className="data-table"><thead><tr><th>Title</th><th>Date</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{events.map(e => (
              <tr key={e.id}>
                <td><div className="font-semibold text-sm">{e.title_en}</div><div className="text-xs text-gray-400">{e.title_ar}</div></td>
                <td className="text-sm">{new Date(e.start_date).toLocaleDateString()}</td>
                <td className="text-sm text-gray-500">{e.location_en}</td>
                <td><Badge variant={e.is_published ? 'green' : 'gray'}>{e.is_published ? 'Published' : 'Draft'}</Badge></td>
                <td><div className="flex gap-1.5"><Button variant="secondary" size="sm" onClick={() => openEdit(e)}>✏️</Button><Button variant="danger" size="sm" onClick={() => setDeleteId(e.id)}>🗑</Button></div></td>
              </tr>
            ))}</tbody></table>}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isNew ? 'New Event' : 'Edit Event'} size="xl">
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Title (English)" value={editing.title_en} onChange={e => upd('title_en', e.target.value)} required />
            <Input label="العنوان (عربي)" value={editing.title_ar} onChange={e => upd('title_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Start Date & Time" type="datetime-local" value={editing.start_date} onChange={e => upd('start_date', e.target.value)} required />
            <Input label="End Date & Time (optional)" type="datetime-local" value={editing.end_date} onChange={e => upd('end_date', e.target.value)} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Location (English)" value={editing.location_en} onChange={e => upd('location_en', e.target.value)} />
            <Input label="الموقع (عربي)" value={editing.location_ar} onChange={e => upd('location_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Textarea label="Description (English)" value={editing.description_en} onChange={e => upd('description_en', e.target.value)} />
            <Textarea label="الوصف (عربي)" value={editing.description_ar} onChange={e => upd('description_ar', e.target.value)} dir="rtl" />
          </div>
          <Input label="Registration URL (optional)" value={editing.registration_url} onChange={e => upd('registration_url', e.target.value)} placeholder="https://..." />
          <Toggle checked={editing.is_published} onChange={v => upd('is_published', v)} label="Publish Event" />
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>💾 Save</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Event" message="Are you sure you want to delete this event?" confirmLabel="Delete" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin: Research Management
// ─────────────────────────────────────────────────────────────────────────────
const emptyProject = { title_en: '', title_ar: '', description_en: '', description_ar: '', status: 'active' as const, start_date: '', funding_source: '', is_published: true }

export const AdminResearch: React.FC = () => {
  const { lang } = useTranslation()
  const [projects, setProjects] = useState<ResearchProject[]>([])
  const [labs, setLabs] = useState<Laboratory[]>([])
  const [programsList, setProgramsList] = useState<{ id: string; name_en: string; name_ar: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [labModalOpen, setLabModalOpen] = useState(false)
  const [isNew, setIsNew] = useState(true)
  const [editing, setEditing] = useState<typeof emptyProject & { id?: string }>(emptyProject)
  const [editingLab, setEditingLab] = useState<{ id: string; name_en: string; name_ar: string; description_en: string; description_ar: string; department_id: string; program_ids: string[]; is_active: boolean }>({ id: '', name_en: '', name_ar: '', description_en: '', description_ar: '', department_id: 'aerospace', program_ids: [], is_active: true })
  const [labImageFile, setLabImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [tab, setTab] = useState<'projects' | 'labs'>('projects')

  useEffect(() => {
    Promise.allSettled([
      researchApi.listAll(),
      laboratoriesApi.listAll(),
      programsApi.list({ limit: 20 }),
    ]).then(([p, l, progs]) => {
      if (p.status === 'fulfilled') setProjects(p.value.data)
      if (l.status === 'fulfilled') setLabs(l.value.data)
      if (progs.status === 'fulfilled') setProgramsList(progs.value.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const upd = (k: string, v: any) => setEditing(p => ({ ...p, [k]: v }))
  const openNew = () => { setEditing({ ...emptyProject }); setIsNew(true); setModalOpen(true) }
  const openEdit = (p: ResearchProject) => {
    setEditing({ id: p.id, title_en: p.title_en, title_ar: p.title_ar, description_en: p.description_en, description_ar: p.description_ar, status: p.status, start_date: p.start_date?.slice(0, 10) || '', funding_source: p.funding_source || '', is_published: p.is_published })
    setIsNew(false); setModalOpen(true)
  }

  const openNewLab = () => {
    setEditingLab({ id: '', name_en: '', name_ar: '', description_en: '', description_ar: '', department_id: 'aerospace', program_ids: [], is_active: true })
    setLabImageFile(null)
    setLabModalOpen(true)
  }
  const openEditLab = (l: Laboratory) => {
    setEditingLab({ id: l.id, name_en: l.name_en, name_ar: l.name_ar, description_en: l.description_en, description_ar: l.description_ar, department_id: l.department_id, program_ids: l.program_ids || [], is_active: l.is_active })
    setLabImageFile(null)
    setLabModalOpen(true)
  }

  const toggleLabProgram = (programId: string) => {
    setEditingLab(p => ({
      ...p,
      program_ids: p.program_ids.includes(programId)
        ? p.program_ids.filter(id => id !== programId)
        : [...p.program_ids, programId]
    }))
  }

  const handleSave = async () => {
    if (!editing.title_en || !editing.start_date) { toast.error('Title and start date required'); return }
    setSaving(true)
    try {
      const payload = { ...editing, start_date: new Date(editing.start_date).toISOString() }
      if (isNew) {
        const created = await researchApi.create(payload as any)
        setProjects(p => [created, ...p])
        toast.success('Project created!')
      } else {
        const updated = await researchApi.update(editing.id!, payload as any)
        setProjects(p => p.map(x => x.id === updated.id ? updated : x))
        toast.success('Project saved!')
      }
      setModalOpen(false)
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Error saving') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      if (tab === 'projects') { await researchApi.delete(deleteId); setProjects(p => p.filter(x => x.id !== deleteId)) }
      else { await laboratoriesApi.delete(deleteId); setLabs(p => p.filter(x => x.id !== deleteId)) }
      toast.success('Deleted')
    } catch { toast.error('Error deleting') }
    setDeleteId(null)
  }

  const handleLabSave = async () => {
    if (!editingLab.name_en) { toast.error('Lab name required'); return }
    setSaving(true)
    try {
      let result: Laboratory
      if (!editingLab.id) {
        result = await laboratoriesApi.create(editingLab as any)
      } else {
        result = await laboratoriesApi.update(editingLab.id, editingLab as any)
      }
      if (labImageFile) {
        const { url } = await laboratoriesApi.uploadImage(result.id, labImageFile)
        result = { ...result, image_url: url }
      }
      if (!editingLab.id) {
        setLabs(p => [result, ...p])
        toast.success('Lab created!')
      } else {
        setLabs(p => p.map(x => x.id === result.id ? result : x))
        toast.success('Lab saved!')
      }
      setLabModalOpen(false)
      setLabImageFile(null)
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Error saving lab') }
    finally { setSaving(false) }
  }

  const statusOptions = [{ value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }, { value: 'pending', label: 'Pending' }]
  const statusVariant: Record<string, 'green' | 'blue' | 'amber'> = { active: 'green', completed: 'blue', pending: 'amber' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-800">{lang === 'ar' ? 'البحث العلمي' : 'Research Management'}</h1>
        <Button onClick={tab === 'projects' ? openNew : openNewLab}>
          + {tab === 'projects' ? 'New Project' : 'New Lab'}
        </Button>
      </div>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['projects', 'labs'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? 'bg-white text-nmu-red shadow-sm' : 'text-gray-500'}`}>
            {t === 'projects' ? `🔬 Projects (${projects.length})` : `🧪 Labs (${labs.length})`}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? <div className="p-6 space-y-3">{[0,1,2].map(i=><CardSkeleton key={i}/>)}</div>
        : tab === 'projects' ? (
          projects.length === 0 ? <EmptyState icon="🔬" title="No projects yet" action={<Button onClick={openNew}>Add First Project</Button>} />
          : <table className="data-table"><thead><tr><th>Title</th><th>Status</th><th>Start Date</th><th>Actions</th></tr></thead>
              <tbody>{projects.map(p => (
                <tr key={p.id}>
                  <td><div className="font-semibold text-sm">{p.title_en}</div><div className="text-xs text-gray-400">{p.title_ar}</div></td>
                  <td><Badge variant={statusVariant[p.status] || 'gray'}>{p.status}</Badge></td>
                  <td className="text-sm text-gray-500">{new Date(p.start_date).toLocaleDateString()}</td>
                  <td><div className="flex gap-1.5"><Button variant="secondary" size="sm" onClick={() => openEdit(p)}>✏️</Button><Button variant="danger" size="sm" onClick={() => setDeleteId(p.id)}>🗑</Button></div></td>
                </tr>
              ))}</tbody></table>
        ) : (
          labs.length === 0 ? <EmptyState icon="🧪" title="No labs yet" action={<Button onClick={openNewLab}>Add First Lab</Button>} />
          : <table className="data-table"><thead><tr><th>Lab Name</th><th>Department</th><th>Programs</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{labs.map(l => (
                <tr key={l.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      {l.image_url && <img src={l.image_url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />}
                      <div><div className="font-semibold text-sm">{l.name_en}</div><div className="text-xs text-gray-400">{l.name_ar}</div></div>
                    </div>
                  </td>
                  <td className="text-sm text-gray-500 capitalize">{l.department_id}</td>
                  <td className="text-xs text-gray-500">{(l.program_ids || []).length} {lang === 'ar' ? 'برنامج' : 'program(s)'}</td>
                  <td><Badge variant={l.is_active ? 'green' : 'gray'}>{l.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  <td><div className="flex gap-1.5"><Button variant="secondary" size="sm" onClick={() => openEditLab(l)}>✏️</Button><Button variant="danger" size="sm" onClick={() => setDeleteId(l.id)}>🗑</Button></div></td>
                </tr>
              ))}</tbody></table>
        )}
      </div>

      {/* Project Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isNew ? 'New Research Project' : 'Edit Project'} size="xl">
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Title (English)" value={editing.title_en} onChange={e => upd('title_en', e.target.value)} required />
            <Input label="العنوان (عربي)" value={editing.title_ar} onChange={e => upd('title_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Textarea label="Description (English)" value={editing.description_en} onChange={e => upd('description_en', e.target.value)} />
            <Textarea label="الوصف (عربي)" value={editing.description_ar} onChange={e => upd('description_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Select label="Status" value={editing.status} onChange={e => upd('status', e.target.value)} options={statusOptions} />
            <Input label="Start Date" type="date" value={editing.start_date} onChange={e => upd('start_date', e.target.value)} required />
          </div>
          <Input label="Funding Source (optional)" value={editing.funding_source} onChange={e => upd('funding_source', e.target.value)} />
          <Toggle checked={editing.is_published} onChange={v => upd('is_published', v)} label="Published" />
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>💾 Save</Button>
          </div>
        </div>
      </Modal>

      {/* Lab Modal */}
      <Modal open={labModalOpen} onClose={() => setLabModalOpen(false)} title={editingLab.id ? 'Edit Laboratory' : 'New Laboratory'} size="lg">
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Lab Name (English)" value={editingLab.name_en} onChange={e => setEditingLab(p => ({ ...p, name_en: e.target.value }))} required />
            <Input label="اسم المعمل (عربي)" value={editingLab.name_ar} onChange={e => setEditingLab(p => ({ ...p, name_ar: e.target.value }))} dir="rtl" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Textarea label="Description (English)" value={editingLab.description_en} onChange={e => setEditingLab(p => ({ ...p, description_en: e.target.value }))} />
            <Textarea label="الوصف (عربي)" value={editingLab.description_ar} onChange={e => setEditingLab(p => ({ ...p, description_ar: e.target.value }))} dir="rtl" />
          </div>
          <Select label="Department" value={editingLab.department_id} onChange={e => setEditingLab(p => ({ ...p, department_id: e.target.value }))} options={DEPTS} />

          {/* Program assignment */}
          <div>
            <label className="form-label">{lang === 'ar' ? 'البرامج المرتبطة' : 'Linked Programs'}</label>
            <p className="text-xs text-gray-400 mb-2">
              {lang === 'ar' ? 'حدد البرامج التي تظهر هذا المختبر في صفحتها' : 'Select which program pages should display this lab'}
            </p>
            <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3">
              {programsList.length === 0 ? (
                <p className="text-xs text-gray-400 col-span-2">Loading programs...</p>
              ) : programsList.map(prog => (
                <label key={prog.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={editingLab.program_ids.includes(prog.id)}
                    onChange={() => toggleLabProgram(prog.id)}
                    className="rounded border-gray-300 text-nmu-red focus:ring-nmu-red"
                  />
                  <span className="text-gray-700">{lang === 'ar' ? prog.name_ar : prog.name_en}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lab Image */}
          <div>
            <label className="form-label">Lab Image</label>
            <input type="file" accept="image/*" className="form-input" onChange={e => setLabImageFile(e.target.files?.[0] || null)} />
            {labImageFile && <p className="text-xs text-emerald-600 mt-1">✅ {labImageFile.name}</p>}
          </div>

          <Toggle checked={editingLab.is_active} onChange={v => setEditingLab(p => ({ ...p, is_active: v }))} label="Active" />
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setLabModalOpen(false)}>Cancel</Button>
            <Button onClick={handleLabSave} loading={saving}>💾 Save</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete" message="Are you sure?" confirmLabel="Delete" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin: Downloads Management
// ─────────────────────────────────────────────────────────────────────────────
const CAT_OPTIONS = [
  { value: 'study_plan', label: 'Study Plan' },
  { value: 'regulation', label: 'Regulation' },
  { value: 'guide', label: 'Academic Guide' },
  { value: 'form', label: 'Form' },
  { value: 'other', label: 'Other' },
]

export const AdminDownloads: React.FC = () => {
  const { lang } = useTranslation()
  const [docs, setDocs] = useState<Download[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [meta, setMeta] = useState({ title_en: '', title_ar: '', category: 'other' })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    downloadsApi.listAll()
      .then(res => setDocs(res.data))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false))
  }, [])

  const handleUpload = async () => {
    if (!file) { toast.error('Please select a file'); return }
    if (!meta.title_en) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const created = await downloadsApi.uploadFile(file, meta as any)
      setDocs(p => [created, ...p])
      toast.success('File uploaded!')
      setUploadOpen(false)
      setFile(null)
      setMeta({ title_en: '', title_ar: '', category: 'other' })
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Upload failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try { await downloadsApi.delete(deleteId); setDocs(p => p.filter(d => d.id !== deleteId)); toast.success('Deleted') }
    catch { toast.error('Error deleting') }
    setDeleteId(null)
  }

  const formatSize = (b?: number) => b ? `${(b / 1000000).toFixed(1)} MB` : ''
  const CAT_ICON: Record<string, string> = { study_plan: '📘', regulation: '📋', guide: '📖', form: '📝', other: '📄' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-800">{lang === 'ar' ? 'إدارة التنزيلات' : 'Downloads Management'}</h1>
        <Button onClick={() => setUploadOpen(true)}>📤 {lang === 'ar' ? 'رفع ملف' : 'Upload File'}</Button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? <div className="p-6 space-y-3">{[0,1,2].map(i=><CardSkeleton key={i}/>)}</div>
        : docs.length === 0 ? <EmptyState icon="📄" title="No documents yet" action={<Button onClick={() => setUploadOpen(true)}>Upload First Document</Button>} />
        : <table className="data-table"><thead><tr><th>Document</th><th>Category</th><th>Size</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>{docs.map(d => (
              <tr key={d.id}>
                <td><div className="flex items-center gap-2"><span className="text-xl">{CAT_ICON[d.category] || '📄'}</span><div><div className="font-semibold text-sm">{d.title_en}</div><div className="text-xs text-gray-400">{d.title_ar}</div></div></div></td>
                <td><Badge variant="blue" className="capitalize">{d.category.replace('_', ' ')}</Badge></td>
                <td className="text-xs text-gray-400">{formatSize(d.file_size)}</td>
                <td className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString()}</td>
                <td><div className="flex gap-1.5"><a href={d.file_url} target="_blank" rel="noreferrer"><Button variant="secondary" size="sm">👁</Button></a><Button variant="danger" size="sm" onClick={() => setDeleteId(d.id)}>🗑</Button></div></td>
              </tr>
            ))}</tbody></table>}
      </div>
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Document" size="md">
        <div className="space-y-4">
          <div><label className="form-label">File (PDF) <span className="text-nmu-red">*</span></label><input type="file" accept=".pdf,application/pdf" className="form-input" onChange={e => setFile(e.target.files?.[0] || null)} /></div>
          <Input label="Title (English)" value={meta.title_en} onChange={e => setMeta(p => ({ ...p, title_en: e.target.value }))} required />
          <Input label="العنوان (عربي)" value={meta.title_ar} onChange={e => setMeta(p => ({ ...p, title_ar: e.target.value }))} dir="rtl" />
          <Select label="Category" value={meta.category} onChange={e => setMeta(p => ({ ...p, category: e.target.value }))} options={CAT_OPTIONS} />
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} loading={saving} disabled={!file}>📤 Upload</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Document" message="Are you sure you want to delete this document?" confirmLabel="Delete" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin: Contact Info
// ─────────────────────────────────────────────────────────────────────────────
export const AdminContact: React.FC = () => {
  const { lang } = useTranslation()
  const [form, setForm] = useState<Partial<ContactInfo>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    contactApi.get().then(setForm).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await contactApi.update(form)
      setForm(updated)
      toast.success(lang === 'ar' ? 'تم الحفظ!' : 'Contact info saved!')
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Error saving') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="space-y-4">{[0,1,2,3].map(i=><CardSkeleton key={i}/>)}</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-800">{lang === 'ar' ? 'معلومات التواصل' : 'Contact Information'}</h1>
        <Button onClick={handleSave} loading={saving}>💾 {lang === 'ar' ? 'حفظ' : 'Save Changes'}</Button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Address (English)" value={form.address_en || ''} onChange={e => upd('address_en', e.target.value)} />
          <Input label="العنوان (عربي)" value={form.address_ar || ''} onChange={e => upd('address_ar', e.target.value)} dir="rtl" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Primary Phone" value={form.phone_primary || ''} onChange={e => upd('phone_primary', e.target.value)} />
          <Input label="Secondary Phone (optional)" value={form.phone_secondary || ''} onChange={e => upd('phone_secondary', e.target.value)} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="General Email" type="email" value={form.email_general || ''} onChange={e => upd('email_general', e.target.value)} />
          <Input label="Admissions Email" type="email" value={form.email_admissions || ''} onChange={e => upd('email_admissions', e.target.value)} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Working Hours (English)" value={form.working_hours_en || ''} onChange={e => upd('working_hours_en', e.target.value)} />
          <Input label="ساعات العمل (عربي)" value={form.working_hours_ar || ''} onChange={e => upd('working_hours_ar', e.target.value)} dir="rtl" />
        </div>
        <Input label="Google Maps Embed URL" value={form.google_maps_url || ''} onChange={e => upd('google_maps_url', e.target.value)} placeholder="https://maps.google.com/..." />
        <hr className="border-gray-100" />
        <h3 className="font-bold text-gray-700 text-sm">Social Media Links</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Facebook URL" value={form.facebook_url || ''} onChange={e => upd('facebook_url', e.target.value)} placeholder="https://facebook.com/..." />
          <Input label="Twitter/X URL" value={form.twitter_url || ''} onChange={e => upd('twitter_url', e.target.value)} placeholder="https://twitter.com/..." />
          <Input label="LinkedIn URL" value={form.linkedin_url || ''} onChange={e => upd('linkedin_url', e.target.value)} placeholder="https://linkedin.com/..." />
          <Input label="YouTube URL" value={form.youtube_url || ''} onChange={e => upd('youtube_url', e.target.value)} placeholder="https://youtube.com/..." />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin: Gallery
// ─────────────────────────────────────────────────────────────────────────────
export const AdminGallery: React.FC = () => {
  const { lang } = useTranslation()
  const [albums, setAlbums] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newAlbumOpen, setNewAlbumOpen] = useState(false)
  const [albumName, setAlbumName] = useState({ en: '', ar: '' })
  const [saving, setSaving] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [media, setMedia] = useState<any[]>([])

  useEffect(() => {
    apiClient.get('/gallery/albums')
      .then(r => setAlbums(r.data.data || []))
      .catch(() => setAlbums([]))
      .finally(() => setLoading(false))
  }, [])

  const loadMedia = async (albumId: string) => {
    setSelectedAlbum(albumId)
    try {
      const r = await apiClient.get(`/gallery/albums/${albumId}/media`)
      setMedia(r.data.data || [])
    } catch {
      setMedia([])
    }
  }

  const handleCreateAlbum = async () => {
    if (!albumName.en) { toast.error('Album name required'); return }
    setSaving(true)
    try {
      const r = await apiClient.post(
        `/gallery/albums?name_en=${encodeURIComponent(albumName.en)}&name_ar=${encodeURIComponent(albumName.ar)}`
      )
      setAlbums(p => [r.data, ...p])
      setAlbumName({ en: '', ar: '' })
      setNewAlbumOpen(false)
      toast.success('Album created!')
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Error creating album') }
    finally { setSaving(false) }
  }

  const handleUploadMedia = async () => {
    if (!uploadFile || !selectedAlbum) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', uploadFile)
      const r = await apiClient.post(`/gallery/albums/${selectedAlbum}/media`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMedia(p => [r.data, ...p])
      setUploadFile(null)
      toast.success('Photo uploaded!')
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Upload failed') }
    finally { setUploading(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-800">{lang === 'ar' ? 'معرض الصور' : 'Gallery Management'}</h1>
        <Button onClick={() => setNewAlbumOpen(true)}>+ {lang === 'ar' ? 'ألبوم جديد' : 'New Album'}</Button>
      </div>
      {loading ? <div className="grid sm:grid-cols-3 gap-4">{[0,1,2].map(i=><CardSkeleton key={i}/>)}</div>
      : albums.length === 0 ? <EmptyState icon="🖼" title="No albums yet" action={<Button onClick={() => setNewAlbumOpen(true)}>Create First Album</Button>} />
      : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {albums.map(a => (
            <div key={a.id} className={`bg-white border rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md ${selectedAlbum === a.id ? 'border-nmu-red shadow-md' : 'border-gray-200'}`} onClick={() => loadMedia(a.id)}>
              <div className="h-28 bg-gray-100 rounded-xl mb-3 flex items-center justify-center text-4xl text-gray-300">🖼️</div>
              <h3 className="font-bold text-gray-800 text-sm">{a.name_en}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{a.name_ar}</p>
            </div>
          ))}
        </div>}

      {selectedAlbum && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Album Photos</h3>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" className="form-input text-sm" onChange={e => setUploadFile(e.target.files?.[0] || null)} />
              <Button size="sm" onClick={handleUploadMedia} loading={uploading} disabled={!uploadFile}>📤 Upload</Button>
            </div>
          </div>
          {media.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No photos yet — upload one above</p>
          : <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {media.map(m => (
                <div key={m.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>}
        </div>
      )}

      <Modal open={newAlbumOpen} onClose={() => setNewAlbumOpen(false)} title="New Album" size="sm">
        <div className="space-y-4">
          <Input label="Album Name (English)" value={albumName.en} onChange={e => setAlbumName(p => ({ ...p, en: e.target.value }))} required />
          <Input label="اسم الألبوم (عربي)" value={albumName.ar} onChange={e => setAlbumName(p => ({ ...p, ar: e.target.value }))} dir="rtl" />
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setNewAlbumOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateAlbum} loading={saving}>Create Album</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin: Settings
// ─────────────────────────────────────────────────────────────────────────────
export const AdminSettings: React.FC = () => {
  const { lang } = useTranslation()
  const { user } = useAuth()
  const [pwForm, setPwForm] = useState({ current: '', new_: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.new_ !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    if (pwForm.new_.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setSaving(true)
    try {
      await authApi.updatePassword({ current_password: pwForm.current, new_password: pwForm.new_ })
      toast.success(lang === 'ar' ? 'تم تغيير كلمة المرور!' : 'Password changed successfully!')
      setPwForm({ current: '', new_: '', confirm: '' })
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Error changing password')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-gray-800">{lang === 'ar' ? 'الإعدادات' : 'Settings'}</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-700">{lang === 'ar' ? 'معلومات الحساب' : 'Account Info'}</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-nmu-red flex items-center justify-center text-white text-xl font-bold">{user?.full_name?.charAt(0) || 'A'}</div>
            <div>
              <div className="font-bold text-gray-800">{user?.full_name}</div>
              <div className="text-sm text-gray-400" dir="ltr">{user?.email}</div>
              <Badge variant={user?.role === 'super_admin' ? 'red' : 'blue'} className="mt-1">{user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</Badge>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-700 mb-4">{lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}</h2>
          <form onSubmit={handlePwChange} className="space-y-3">
            <Input label="Current Password" type="password" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} required />
            <Input label="New Password" type="password" value={pwForm.new_} onChange={e => setPwForm(p => ({ ...p, new_: e.target.value }))} required hint="Minimum 8 characters" />
            <Input label="Confirm New Password" type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required />
            <Button type="submit" loading={saving}>🔒 {lang === 'ar' ? 'تغيير كلمة المرور' : 'Update Password'}</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
