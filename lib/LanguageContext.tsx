'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Lang, translations, Translations } from './i18n'

interface LanguageContextType {
  lang: Lang
  t: Translations
  toggleLang: () => void
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'th',
  t: translations.th,
  toggleLang: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('th')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved === 'en' || saved === 'th') setLang(saved)
  }, [])

  const toggleLang = () => {
    const next: Lang = lang === 'th' ? 'en' : 'th'
    setLang(next)
    localStorage.setItem('lang', next)
  }

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
