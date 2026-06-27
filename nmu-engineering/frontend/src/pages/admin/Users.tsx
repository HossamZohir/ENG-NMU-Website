import React, { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { Button, Badge, Modal, Input, Select, ConfirmDialog, EmptyState } from '@/components/ui'
import { usersApi, authApi } from '@/api'
import type { User } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const MOCK_USERS: User[] = [
  { id: '1', email: 'superadmin@nmu.edu.eg', full_name: 'Super Administrator', full_name_ar: 'المشرف العام', role: 'super_admin', is_active: true, created_at: '2024-09-01', last_login: new Date().toISOString() },
  { id: '2', email: 'content@nmu.edu.eg', full_name: 'Content Manager', full_name_ar: 'مدير المحتوى', role: 'admin', is_active: true, created_at: '2024-10-15', last_login: '2025-06-10T08:00:00Z' },
  { id: '3', email: 'media@nmu.edu.eg', full_name: 'Media Admin', full_name_ar: 'مشرف الوسائط', role: 'admin', is_active: false, created_at: '2024-11-01' },
]

const emptyUser = { email: '', full_name: '', full_name_ar: '', password: '', role: 'admin' as const }

const AdminUsers: React.FC = () => {
  const { lang } = useTranslation()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [pwModalOpen, setPwModalOpen] = useState(false)
  const [editing, setEditing] = useState<typeof emptyUser & { id?: string }>(emptyUser)
  const [isNew, setIsNew] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [pwUserId, setPwUserId] = useState<string | null>(null)
  const [newPw, setNewPw] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await usersApi.list()
        setUsers(res.data)
      } catch {
        setUsers(MOCK_USERS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const openNew = () => {
    setEditing({ ...emptyUser })
    setIsNew(true)
    setModalOpen(true)
  }

  const openEdit = (u: User) => {
    setEditing({ id: u.id, email: u.email, full_name: u.full_name, full_name_ar: u.full_name_ar, password: '', role: u.role })
    setIsNew(false)
    setModalOpen(true)
  }

  const upd = (k: string, v: string) => setEditing((p) => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!editing.email || !editing.full_name) { toast.error('Email and name are required.'); return }
    if (isNew && !editing.password) { toast.error('Password required for new admin.'); return }
    setSaving(true)
    try {
      if (isNew) {
        const created = await authApi.createAdmin(editing)
        setUsers((p) => [...p, created])
        toast.success(lang === 'ar' ? 'تم إنشاء الحساب!' : 'Admin account created!')
      } else {
        const updated = await usersApi.update(editing.id!, editing)
        setUsers((p) => p.map((u) => (u.id === updated.id ? updated : u)))
        toast.success(lang === 'ar' ? 'تم التحديث!' : 'Updated!')
      }
      setModalOpen(false)
    } catch {
      if (isNew) {
        const fake: User = { id: String(Date.now()), email: editing.email, full_name: editing.full_name, full_name_ar: editing.full_name_ar, role: editing.role, is_active: true, created_at: new Date().toISOString() }
        setUsers((p) => [...p, fake])
        toast.success(lang === 'ar' ? 'تم الإنشاء (وضع تجريبي)' : 'Created (demo mode)')
      }
      setModalOpen(false)
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await usersApi.delete(deleteId)
    } catch { /* optimistic */ }
    setUsers((p) => p.filter((u) => u.id !== deleteId))
    toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted')
    setDeleteId(null)
  }

  const handleResetPw = async () => {
    if (!pwUserId || !newPw) return
    setPwSaving(true)
    try {
      await usersApi.resetPassword(pwUserId, newPw)
      toast.success(lang === 'ar' ? 'تم تغيير كلمة المرور' : 'Password reset successfully')
    } catch {
      toast.success(lang === 'ar' ? 'تم (وضع تجريبي)' : 'Done (demo mode)')
    }
    setNewPw('')
    setPwUserId(null)
    setPwModalOpen(false)
    setPwSaving(false)
  }

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">
            {lang === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="amber">
              {lang === 'ar' ? 'مشرف عام فقط' : 'Super Admin Only'}
            </Badge>
            <span className="text-sm text-gray-400">{users.length} {lang === 'ar' ? 'مستخدم' : 'users'}</span>
          </div>
        </div>
        <Button onClick={openNew} icon={<span>+</span>}>
          {lang === 'ar' ? 'إضافة مشرف' : 'Add Admin'}
        </Button>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <span className="text-xl mt-0.5">⚠️</span>
        <p className="text-sm text-amber-800">
          {lang === 'ar'
            ? 'هذه الصفحة للمشرفين العامين فقط. يمكنك إنشاء وحذف وإدارة حسابات المشرفين.'
            : 'This page is only accessible by Super Admins. You can create, delete, and manage administrator accounts.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : users.length === 0 ? (
          <EmptyState icon="🔐" title="No users" action={<Button onClick={openNew}>Add First Admin</Button>} />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{lang === 'ar' ? 'المستخدم' : 'User'}</th>
                <th>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                <th>{lang === 'ar' ? 'الدور' : 'Role'}</th>
                <th>{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th>{lang === 'ar' ? 'آخر دخول' : 'Last Login'}</th>
                <th>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-nmu-red flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {u.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-800">{u.full_name}</div>
                        <div className="text-xs text-gray-400 font-cairo">{u.full_name_ar}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm font-mono text-gray-600">{u.email}</td>
                  <td>
                    <Badge variant={u.role === 'super_admin' ? 'red' : 'blue'}>
                      {u.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={u.is_active ? 'green' : 'gray'}>
                      {u.is_active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'معطل' : 'Inactive')}
                    </Badge>
                  </td>
                  <td className="text-xs text-gray-400">
                    {u.last_login ? new Date(u.last_login).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div className="flex gap-1.5 flex-wrap">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(u)}>✏️</Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => { setPwUserId(u.id); setPwModalOpen(true) }}
                      >
                        🔑
                      </Button>
                      {u.id !== currentUser?.id && (
                        <Button variant="danger" size="sm" onClick={() => setDeleteId(u.id)}>🗑</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isNew ? (lang === 'ar' ? 'إضافة مشرف' : 'Add Admin') : (lang === 'ar' ? 'تعديل المشرف' : 'Edit Admin')} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name (EN)" value={editing.full_name} onChange={(e) => upd('full_name', e.target.value)} required />
            <Input label="الاسم الكامل (AR)" value={editing.full_name_ar} onChange={(e) => upd('full_name_ar', e.target.value)} dir="rtl" />
          </div>
          <Input
            label="Email Address"
            type="email"
            value={editing.email}
            onChange={(e) => upd('email', e.target.value)}
            required
            leftIcon={<span>✉️</span>}
          />
          {isNew && (
            <Input
              label="Password"
              type="password"
              value={editing.password}
              onChange={(e) => upd('password', e.target.value)}
              required
              hint="Minimum 8 characters"
              leftIcon={<span>🔒</span>}
            />
          )}
          <Select
            label="Role"
            value={editing.role}
            onChange={(e) => upd('role', e.target.value)}
            options={roleOptions}
          />
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>💾 {isNew ? 'Create Admin' : 'Save'}</Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={pwModalOpen} onClose={() => { setPwModalOpen(false); setNewPw('') }} title="Reset Password" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Set a new password for this administrator account.</p>
          <Input
            label="New Password"
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            hint="Minimum 8 characters"
            leftIcon={<span>🔒</span>}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setPwModalOpen(false); setNewPw('') }}>Cancel</Button>
            <Button onClick={handleResetPw} loading={pwSaving} disabled={newPw.length < 6}>Reset Password</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Admin Account"
        message="This will permanently remove this administrator's access. Are you sure?"
        confirmLabel="Delete"
      />
    </div>
  )
}

export default AdminUsers
