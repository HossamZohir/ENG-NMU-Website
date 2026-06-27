import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import toast from 'react-hot-toast'

interface NavItem {
  icon: string
  labelKey: string
  to: string
  superAdminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { icon: '📊', labelKey: 'admin.dashboard', to: '/admin' },
  { icon: '🏠', labelKey: 'admin.homepage', to: '/admin/homepage' },
  { icon: '🎓', labelKey: 'admin.programs', to: '/admin/programs' },
  { icon: '👥', labelKey: 'admin.members', to: '/admin/members' },
  { icon: '📰', labelKey: 'admin.news', to: '/admin/news' },
  { icon: '📅', labelKey: 'admin.events', to: '/admin/events' },
  { icon: '🔬', labelKey: 'admin.research', to: '/admin/research' },
  { icon: '📄', labelKey: 'admin.downloads', to: '/admin/downloads' },
  { icon: '🖼', labelKey: 'admin.gallery', to: '/admin/gallery' },
  { icon: '📞', labelKey: 'admin.contact', to: '/admin/contact' },
  { icon: '🔐', labelKey: 'admin.users', to: '/admin/users', superAdminOnly: true },
  { icon: '⚙️', labelKey: 'admin.settings', to: '/admin/settings' },
]

const AdminLayout: React.FC = () => {
  const { t, lang, toggle } = useTranslation()
  const { user, logout, isSuperAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success(lang === 'ar' ? 'تم تسجيل الخروج' : 'Signed out successfully')
    navigate('/admin/login')
  }

  const isActive = (to: string) =>
    to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to)

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.superAdminOnly || isSuperAdmin
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="NMU Logo" className="w-9 h-9 flex-shrink-0" />
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-nmu-red leading-tight whitespace-nowrap">
                {lang === 'ar' ? 'كلية الهندسة' : 'Faculty of Engineering'}
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">
                {lang === 'ar' ? 'لوحة التحكم' : 'Admin CMS'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {/* Group: Main */}
        {!collapsed && (
          <p className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            {lang === 'ar' ? 'عام' : 'Overview'}
          </p>
        )}
        <Link
          to="/admin"
          className={`admin-nav-item ${isActive('/admin') && location.pathname === '/admin' ? 'active' : ''}`}
        >
          <span className="text-base">📊</span>
          {!collapsed && <span>{t('admin.dashboard')}</span>}
        </Link>

        {!collapsed && (
          <p className="px-3 mt-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            {lang === 'ar' ? 'المحتوى' : 'Content'}
          </p>
        )}
        {visibleItems.slice(1).map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`admin-nav-item ${isActive(item.to) ? 'active' : ''}`}
            title={collapsed ? t(item.labelKey) : undefined}
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{t(item.labelKey)}</span>}
            {item.superAdminOnly && !collapsed && (
              <span className="ms-auto text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">
                SA
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* User + actions */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-2">
        {!collapsed && user && (
          <div className="px-2 py-2 rounded-lg bg-gray-50 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-nmu-red flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user.full_name?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-gray-800 truncate">{user.full_name}</div>
                <div className="text-xs text-gray-400 truncate">{user.email}</div>
              </div>
            </div>
            <div className="mt-2">
              <span className="badge badge-red text-xs">
                {user.role === 'super_admin'
                  ? (lang === 'ar' ? 'مشرف عام' : 'Super Admin')
                  : (lang === 'ar' ? 'مشرف' : 'Admin')}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={toggle}
          className="admin-nav-item w-full"
          title={collapsed ? (lang === 'ar' ? 'English' : 'عربي') : undefined}
        >
          <span>🌐</span>
          {!collapsed && <span>{lang === 'ar' ? 'English' : 'عربي'}</span>}
        </button>
        <Link to="/" className="admin-nav-item">
          <span>🌍</span>
          {!collapsed && <span>{lang === 'ar' ? 'عرض الموقع' : 'View Site'}</span>}
        </Link>
        <button onClick={handleLogout} className="admin-nav-item w-full text-red-500 hover:text-red-700 hover:bg-red-50">
          <span>🚪</span>
          {!collapsed && <span>{t('admin.logout')}</span>}
        </button>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="admin-nav-item w-full"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <span>{collapsed ? '→' : '←'}</span>
          {!collapsed && <span className="text-xs">{lang === 'ar' ? 'طي القائمة' : 'Collapse'}</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-e border-gray-200 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <aside
        className={`lg:hidden fixed inset-y-0 start-0 z-50 w-60 bg-white border-e border-gray-200 transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="flex-1" />
          {/* Breadcrumb label */}
          <span className="text-sm font-semibold text-gray-600">
            {visibleItems.find((i) => isActive(i.to))
              ? t(visibleItems.find((i) => isActive(i.to))!.labelKey)
              : t('admin.dashboard')}
          </span>
          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className="w-7 h-7 rounded-full bg-nmu-red flex items-center justify-center text-white text-xs font-bold">
                  {user.full_name?.charAt(0) || 'A'}
                </div>
                <span className="text-gray-600 font-medium">{user.full_name}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
