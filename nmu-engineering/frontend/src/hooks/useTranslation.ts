import { useCallback } from 'react'
import { useLangStore } from '@/store/langStore'
import { t as translate } from '@/i18n'

// Re-export t() as a hook so components re-render on lang change
export function useTranslation() {
  const lang = useLangStore((s) => s.lang)
  const toggle = useLangStore((s) => s.toggle)

  const t = useCallback(
    (key: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      lang // subscribe to lang changes
      return translate(key)
    },
    [lang]
  )

  return { t, lang, toggle }
}
