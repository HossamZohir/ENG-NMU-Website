import React, { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { Button, Badge, Modal, Input, Textarea, Toggle, EmptyState, ConfirmDialog, CardSkeleton } from '@/components/ui'
import { newsApi } from '@/api'
import type { NewsArticle } from '@/types'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: '1', slug: 'research',     en: 'Research',     ar: 'بحث' },
  { id: '2', slug: 'events',       en: 'Events',       ar: 'فعاليات' },
  { id: '3', slug: 'achievement',  en: 'Achievement',  ar: 'إنجاز' },
  { id: '4', slug: 'partnership',  en: 'Partnership',  ar: 'شراكة' },
  { id: '5', slug: 'academic',     en: 'Academic',     ar: 'أكاديمي' },
  { id: '6', slug: 'announcement', en: 'Announcement', ar: 'إعلان' },
]

const emptyArticle: Partial<NewsArticle> = {
  title_en: '', title_ar: '', excerpt_en: '', excerpt_ar: '',
  content_en: '', content_ar: '', category_id: '1',
  is_featured: false, is_published: false,
}

const AdminNews: React.FC = () => {
  const { lang } = useTranslation()
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<NewsArticle>>(emptyArticle)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    // Load ALL articles (both published + drafts) for admin view
    newsApi.listAll()
      .then(res => {
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setArticles(sorted)
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [])

  const openEdit = (a: NewsArticle) => {
    setEditing({ ...a })
    setIsNew(false)
    setModalOpen(true)
    setImageFile(null)
  }

  const openNew = () => {
    setEditing({ ...emptyArticle })
    setIsNew(true)
    setModalOpen(true)
    setImageFile(null)
  }

  const upd = (key: keyof NewsArticle, val: unknown) =>
    setEditing(p => ({ ...p, [key]: val }))

  const handleSave = async () => {
    if (!editing.title_en || !editing.title_ar) {
      toast.error('Title in both languages is required.')
      return
    }
    setSaving(true)
    try {
      if (isNew) {
        let created = await newsApi.create(editing)
        if (imageFile) {
          const { url } = await newsApi.uploadImage(created.id, imageFile)
          created = { ...created, image_url: url }
        }
        setArticles(prev => [created, ...prev])
        toast.success(lang === 'ar' ? 'تم نشر المقالة!' : 'Article created!')
      } else {
        let updated = await newsApi.update(editing.id!, editing)
        if (imageFile) {
          const { url } = await newsApi.uploadImage(editing.id!, imageFile)
          updated = { ...updated, image_url: url }
        }
        setArticles(prev => prev.map(a => a.id === updated.id ? updated : a))
        toast.success(lang === 'ar' ? 'تم حفظ التغييرات!' : 'Article saved!')
      }
      setModalOpen(false)
      setImageFile(null)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Error saving article')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await newsApi.delete(deleteId)
      setArticles(prev => prev.filter(a => a.id !== deleteId))
      toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted')
    } catch {
      toast.error('Error deleting article')
    } finally {
      setDeleteId(null)
      setDeleting(false)
    }
  }

  const catOptions = CATEGORIES.map(c => ({ value: c.id, label: lang === 'ar' ? c.ar : c.en }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">
            {lang === 'ar' ? 'إدارة الأخبار' : 'News Management'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {articles.length} {lang === 'ar' ? 'مقالة' : 'articles'}
          </p>
        </div>
        <Button onClick={openNew} icon={<span>+</span>}>
          {lang === 'ar' ? 'مقالة جديدة' : 'New Article'}
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : articles.length === 0 ? (
          <EmptyState
            icon="📰"
            title="No articles yet"
            action={<Button onClick={openNew}>Write First Article</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{lang === 'ar' ? 'العنوان' : 'Title'}</th>
                  <th>{lang === 'ar' ? 'الفئة' : 'Category'}</th>
                  <th>{lang === 'ar' ? 'مميز' : 'Featured'}</th>
                  <th>{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th>{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {articles.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="font-semibold text-sm text-gray-800 max-w-xs truncate">{a.title_en}</div>
                      <div className="text-xs text-gray-400 font-cairo truncate max-w-xs">{a.title_ar}</div>
                    </td>
                    <td>
                      <Badge variant="blue">
                        {CATEGORIES.find(c => c.id === a.category_id)?.[lang === 'ar' ? 'ar' : 'en'] || 'General'}
                      </Badge>
                    </td>
                    <td>
                      {a.is_featured
                        ? <Badge variant="amber">⭐ {lang === 'ar' ? 'مميز' : 'Featured'}</Badge>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td>
                      <Badge variant={a.is_published ? 'green' : 'gray'}>
                        {a.is_published
                          ? (lang === 'ar' ? 'منشور' : 'Published')
                          : (lang === 'ar' ? 'مسودة' : 'Draft')}
                      </Badge>
                    </td>
                    <td className="text-xs text-gray-400">
                      {(a.published_at || a.created_at)?.slice(0, 10)}
                    </td>
                    <td>
                      <div className="flex gap-1.5">
                        <Button variant="secondary" size="sm" onClick={() => openEdit(a)}>✏️</Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteId(a.id)}>🗑</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / New Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isNew
          ? (lang === 'ar' ? 'مقالة جديدة' : 'New Article')
          : (lang === 'ar' ? 'تعديل المقالة' : 'Edit Article')}
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Title (English)"
              value={editing.title_en || ''}
              onChange={e => upd('title_en', e.target.value)}
              required
            />
            <Input
              label="العنوان (عربي)"
              value={editing.title_ar || ''}
              onChange={e => upd('title_ar', e.target.value)}
              required
              dir="rtl"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Textarea
              label="Excerpt (English)"
              value={editing.excerpt_en || ''}
              onChange={e => upd('excerpt_en', e.target.value)}
            />
            <Textarea
              label="المقتطف (عربي)"
              value={editing.excerpt_ar || ''}
              onChange={e => upd('excerpt_ar', e.target.value)}
              dir="rtl"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Textarea
              label="Full Content (English)"
              value={editing.content_en || ''}
              onChange={e => upd('content_en', e.target.value)}
              className="min-h-[180px]"
            />
            <Textarea
              label="المحتوى الكامل (عربي)"
              value={editing.content_ar || ''}
              onChange={e => upd('content_ar', e.target.value)}
              className="min-h-[180px]"
              dir="rtl"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={editing.category_id}
                onChange={e => upd('category_id', e.target.value)}
              >
                {catOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Cover Image</label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={e => setImageFile(e.target.files?.[0] || null)}
              />
              {imageFile && <p className="text-xs text-emerald-600 mt-1">✅ {imageFile.name}</p>}
              {editing.image_url && !imageFile && (
                <a href={editing.image_url} target="_blank" rel="noreferrer" className="text-xs text-nmu-red underline mt-1 block">View current image</a>
              )}
            </div>
          </div>
          <div className="flex gap-6 pt-2">
            <Toggle
              checked={editing.is_featured ?? false}
              onChange={v => upd('is_featured', v)}
              label="Featured Article"
            />
            <Toggle
              checked={editing.is_published ?? false}
              onChange={v => upd('is_published', v)}
              label="Publish Now"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSave} loading={saving}>
              💾 {lang === 'ar' ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={lang === 'ar' ? 'حذف المقالة' : 'Delete Article'}
        message={lang === 'ar'
          ? 'هل أنت متأكد من حذف هذه المقالة؟ لا يمكن التراجع.'
          : 'Are you sure you want to delete this article? This cannot be undone.'}
        confirmLabel={lang === 'ar' ? 'حذف' : 'Delete'}
        loading={deleting}
      />
    </div>
  )
}

export default AdminNews
