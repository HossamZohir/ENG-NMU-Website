import { create } from 'zustand'
import { getLang, setLang } from '@/i18n'
import type { Lang } from '@/types'

interface LangState {
  lang: Lang
  toggle: () => void
  set: (lang: Lang) => void
}

export const useLangStore = create<LangState>((set) => ({
  lang: getLang(),
  toggle: () =>
    set((state) => {
      const next: Lang = state.lang === 'en' ? 'ar' : 'en'
      setLang(next)
      return { lang: next }
    }),
  set: (lang: Lang) => {
    setLang(lang)
    set({ lang })
  },
}))
