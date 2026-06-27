import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import { Input, Button } from '@/components/ui'
import toast from 'react-hot-toast'

const AdminLogin: React.FC = () => {
  const { t, lang } = useTranslation()
  const { login, isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin'

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, navigate, from])

  const validate = () => {
    const errs: typeof errors = {}
    if (!email) errs.email = lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email))
      errs.email = lang === 'ar' ? 'بريد إلكتروني غير صالح' : 'Invalid email address'
    if (!password) errs.password = lang === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required'
    else if (password.length < 6)
      errs.password =
        lang === 'ar' ? 'كلمة المرور قصيرة جداً' : 'Password must be at least 6 characters'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    try {
      await login(email, password)
      toast.success(
        lang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Welcome back!'
      )
      navigate(from, { replace: true })
    } catch {
      setErrors({ general: t('admin.login.error') })
      toast.error(t('admin.login.error'))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nmu-dark via-[#2d0a10] to-[#1a0507] flex items-center justify-center p-4">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(139,20,30,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(139,20,30,.15) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header strip */}
          <div className="bg-nmu-red px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 p-2">
              <img src="/logo.svg" alt="NMU Logo" className="w-full h-full" />
            </div>
            <h1 className="text-xl font-extrabold text-white">
              {t('admin.login.title')}
            </h1>
            <p className="text-white/70 text-sm mt-1">
              {t('admin.login.subtitle')}
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {errors.general && (
              <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                <span className="text-lg">⚠️</span>
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Input
                label={t('admin.login.email')}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }))
                }}
                error={errors.email}
                placeholder="admin@nmu.edu.eg"
                autoComplete="email"
                required
                leftIcon={<span className="text-sm">✉️</span>}
              />

              <div>
                <Input
                  label={t('admin.login.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }))
                  }}
                  error={errors.password}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  leftIcon={<span className="text-sm">🔒</span>}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="mt-1.5 text-xs text-nmu-red hover:underline float-end"
                >
                  {showPassword
                    ? (lang === 'ar' ? 'إخفاء' : 'Hide')
                    : (lang === 'ar' ? 'إظهار' : 'Show')}
                </button>
                <div className="clear-both" />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full mt-2"
              >
                {isLoading ? t('admin.login.loading') : t('admin.login.submit')}
              </Button>
            </form>

            {/* Demo credentials hint */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2 text-center uppercase tracking-wide">
                {lang === 'ar' ? 'بيانات تجريبية' : 'Demo Credentials'}
              </p>
              <div className="space-y-1 text-xs text-gray-600 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">Super Admin:</span>
                  <span>superadmin@nmu.edu.eg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Password:</span>
                  <span>NMU@2025!</span>
                </div>
              </div>
            </div>

            <p className="text-center mt-5 text-xs text-gray-400">
              <Link to="/" className="text-nmu-red hover:underline">
                ← {lang === 'ar' ? 'العودة إلى الموقع' : 'Back to website'}
              </Link>
            </p>
          </div>
        </div>

        {/* JWT badge */}
        <div className="text-center mt-4 flex items-center justify-center gap-2 text-white/40 text-xs">
          <span>🔐</span>
          <span>
            {lang === 'ar'
              ? 'محمي بتشفير JWT · تنتهي الجلسة بعد 8 ساعات'
              : 'Secured with JWT · Session expires in 8 hours'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
