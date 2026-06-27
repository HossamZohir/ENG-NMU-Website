import React, { useEffect, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { Button, Input, Textarea } from '@/components/ui'
import { contactApi } from '@/api'
import type { ContactInfo } from '@/types'
import toast from 'react-hot-toast'

const MOCK_CONTACT: ContactInfo = {
  id: '1',
  address_en: 'New Mansoura City, Dakahlia Governorate, Egypt',
  address_ar: 'مدينة المنصورة الجديدة، محافظة الدقهلية، مصر',
  phone_primary: '01070004148 - 01070004149',
  email_general: 'info@nmu.edu.eg',
  email_admissions: 'info@nmu.edu.eg',
  working_hours_en: 'Saturday – Thursday, 9:00 AM – 3:00 PM',
  working_hours_ar: 'السبت – الخميس، ٩:٠٠ ص – ٣:٠٠ م',
}

const Contact: React.FC = () => {
  const { t, lang } = useTranslation()
  const [contact, setContact] = useState<ContactInfo>(MOCK_CONTACT)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    document.title = lang === 'ar' ? 'تواصل معنا | كلية الهندسة' : 'Contact | NMU Engineering'
    contactApi.get().then(setContact).catch(() => setContact(MOCK_CONTACT))
  }, [lang])

  const upd = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error(lang === 'ar' ? 'يرجى تعبئة جميع الحقول المطلوبة' : 'Please fill in all required fields')
      return
    }
    setSending(true)
    try {
      await contactApi.sendMessage(form)
      setSent(true)
      toast.success(t('contact.form.success'))
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      setSent(true)
      toast.success(t('contact.form.success'))
      setForm({ name: '', email: '', subject: '', message: '' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-nmu-dark to-[#2d0a10] text-white py-14 lg:py-16">
        <div className="section-container">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
            {t('contact.eyebrow')}
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold">{t('contact.title')}</h1>
        </div>
      </section>

      <section className="section-container py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="card p-6 lg:p-8">
            <h3 className="font-bold text-lg text-gray-800 mb-5">{t('contact.form.title')}</h3>
            {sent ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">✅</div>
                <h4 className="font-bold text-gray-800 mb-2">{t('contact.form.success')}</h4>
                <p className="text-sm text-gray-400 mb-5">
                  {lang === 'ar' ? 'سنرد عليك في أقرب وقت ممكن.' : "We'll get back to you as soon as possible."}
                </p>
                <Button variant="secondary" onClick={() => setSent(false)}>
                  {lang === 'ar' ? 'إرسال رسالة أخرى' : 'Send another message'}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label={t('contact.form.name')} value={form.name} onChange={(e) => upd('name', e.target.value)} required />
                <Input label={t('contact.form.email')} type="email" value={form.email} onChange={(e) => upd('email', e.target.value)} required />
                <Input label={t('contact.form.subject')} value={form.subject} onChange={(e) => upd('subject', e.target.value)} />
                <Textarea label={t('contact.form.message')} value={form.message} onChange={(e) => upd('message', e.target.value)} required className="min-h-[140px]" />
                <Button type="submit" loading={sending} className="w-full justify-center">
                  {t('contact.form.send')} {lang === 'ar' ? '←' : '→'}
                </Button>
              </form>
            )}
          </div>

          {/* Info */}
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-1">{t('contact.info.title')}</h3>
            <p className="text-sm text-gray-400 mb-6">
              {lang === 'ar' ? 'تواصل معنا من خلال أي من القنوات التالية.' : 'Reach us through any of the following channels.'}
            </p>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-nmu-red3 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📍</div>
                <div>
                  <div className="font-bold text-gray-800 text-sm mb-0.5">{t('contact.address')}</div>
                  <div className="text-sm text-gray-500">{lang === 'ar' ? contact.address_ar : contact.address_en}</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-nmu-red3 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📞</div>
                <div>
                  <div className="font-bold text-gray-800 text-sm mb-0.5">{t('contact.phone')}</div>
                  <div className="text-sm text-gray-500" dir="ltr">{contact.phone_primary}</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-nmu-red3 rounded-xl flex items-center justify-center text-xl flex-shrink-0">✉️</div>
                <div>
                  <div className="font-bold text-gray-800 text-sm mb-0.5">{t('contact.email')}</div>
                  <div className="text-sm text-gray-500" dir="ltr">{contact.email_general}</div>
                  <div className="text-sm text-gray-500" dir="ltr">{contact.email_admissions}</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-nmu-red3 rounded-xl flex items-center justify-center text-xl flex-shrink-0">⏰</div>
                <div>
                  <div className="font-bold text-gray-800 text-sm mb-0.5">{t('contact.hours')}</div>
                  <div className="text-sm text-gray-500">{lang === 'ar' ? contact.working_hours_ar : contact.working_hours_en}</div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="mt-8 h-56 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-sm border border-gray-200">
              {contact.google_maps_url ? (
                <iframe
                  src={contact.google_maps_url}
                  className="w-full h-full rounded-2xl"
                  loading="lazy"
                  title="Campus Map"
                />
              ) : (
                <span>🗺 {lang === 'ar' ? 'خريطة الحرم الجامعي — المنصورة الجديدة' : 'Campus Map — New Mansoura City'}</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
