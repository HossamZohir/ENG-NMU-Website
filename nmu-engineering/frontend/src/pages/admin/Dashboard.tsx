import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import { StatCard, CardSkeleton } from '@/components/ui'
import { dashboardApi, type DashboardStats } from '@/api'

const quickLinks = [
  { to: '/admin/homepage', icon: '🏠', labelEn: 'Edit Homepage',    labelAr: 'تعديل الرئيسية' },
  { to: '/admin/programs', icon: '🎓', labelEn: 'Manage Programs',  labelAr: 'إدارة البرامج' },
  { to: '/admin/members',  icon: '👥', labelEn: 'Manage Faculty',   labelAr: 'إدارة هيئة التدريس' },
  { to: '/admin/news',     icon: '📰', labelEn: 'Write News',       labelAr: 'كتابة الأخبار' },
  { to: '/admin/events',   icon: '📅', labelEn: 'Add Event',        labelAr: 'إضافة فعالية' },
  { to: '/admin/downloads',icon: '📄', labelEn: 'Upload Docs',      labelAr: 'رفع وثائق' },
]

const typeColor: Record<string, string> = {
  create: 'text-emerald-600 bg-emerald-50',
  update: 'text-blue-600 bg-blue-50',
  upload: 'text-amber-600 bg-amber-50',
  delete: 'text-red-600 bg-red-50',
  login:  'text-purple-600 bg-purple-50',
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth()
  const { lang } = useTranslation()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    dashboardApi.stats()
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (lang === 'ar') {
      if (h < 12) return 'صباح الخير'
      if (h < 17) return 'مساء الخير'
      return 'مساء النور'
    }
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-nmu-red to-nmu-red2 rounded-2xl p-6 text-white">
        <p className="text-white/70 text-sm mb-1">{greeting()},</p>
        <h1 className="text-2xl font-extrabold">
          {user?.full_name || (lang === 'ar' ? 'المشرف' : 'Administrator')} 👋
        </h1>
        <p className="text-white/70 text-sm mt-1">
          {lang === 'ar'
            ? 'مرحباً بك في نظام إدارة محتوى كلية الهندسة'
            : 'Welcome to NMU Faculty of Engineering Content Management System'}
        </p>
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
            {user?.role === 'super_admin'
              ? (lang === 'ar' ? 'مشرف عام' : 'Super Admin')
              : (lang === 'ar' ? 'مشرف' : 'Admin')}
          </span>
          <span className="text-white/50 text-xs">
            {new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          ⚠️ Could not load statistics. Check your backend connection at{' '}
          <code className="font-mono">http://localhost:8000/health</code>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon="🎓" label={lang === 'ar' ? 'البرامج' : 'Programs'}     value={stats.programs}  />
          <StatCard icon="👥" label={lang === 'ar' ? 'هيئة التدريس' : 'Faculty'} value={stats.faculty}   />
          <StatCard icon="📰" label={lang === 'ar' ? 'الأخبار' : 'News'}         value={stats.news}      />
          <StatCard icon="📅" label={lang === 'ar' ? 'الفعاليات' : 'Events'}     value={stats.events}    />
          <StatCard icon="📄" label={lang === 'ar' ? 'التنزيلات' : 'Downloads'}  value={stats.downloads} />
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>⚡</span>
            {lang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map(ql => (
              <Link
                key={ql.to}
                to={ql.to}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-nmu-red3 border border-transparent hover:border-nmu-red transition-colors text-center group"
              >
                <span className="text-2xl">{ql.icon}</span>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-nmu-red">
                  {lang === 'ar' ? ql.labelAr : ql.labelEn}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📋</span>
            {lang === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-16 h-5 bg-gray-200 rounded animate-pulse" />
                  <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : !stats || stats.recent_activity.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              {lang === 'ar' ? 'لا يوجد نشاط حديث' : 'No recent activity yet'}
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recent_activity.map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-lg capitalize ${typeColor[act.type] || 'bg-gray-100 text-gray-500'}`}>
                    {act.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{act.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {act.user} · {act.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>ℹ️</span>
          {lang === 'ar' ? 'معلومات النظام' : 'System Info'}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="text-gray-400 text-xs mb-1">{lang === 'ar' ? 'إصدار النظام' : 'System Version'}</div>
            <div className="font-bold text-gray-700">NMU CMS v1.0.0</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="text-gray-400 text-xs mb-1">{lang === 'ar' ? 'آخر تسجيل دخول' : 'Last Login'}</div>
            <div className="font-bold text-gray-700">
              {user?.last_login
                ? new Date(user.last_login).toLocaleString()
                : (lang === 'ar' ? 'هذه الجلسة' : 'This session')}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="text-gray-400 text-xs mb-1">{lang === 'ar' ? 'انتهاء الجلسة' : 'Session Expires'}</div>
            <div className="font-bold text-gray-700">{lang === 'ar' ? 'بعد 8 ساعات' : 'In 8 hours'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
