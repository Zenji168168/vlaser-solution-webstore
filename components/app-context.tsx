'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Lang = 'en' | 'km'
type Currency = 'USD' | 'KHR'

interface AppContextType {
  lang: Lang
  setLang: (l: Lang) => void
  currency: Currency
  setCurrency: (c: Currency) => void
  formatPrice: (usd: number) => string
  t: (en: string, km: string) => string
}

const KHR_RATE = 4100

const AppContext = createContext<AppContextType>({
  lang: 'en', setLang: () => {}, currency: 'USD', setCurrency: () => {},
  formatPrice: (usd) => `$${usd.toFixed(2)}`, t: (en) => en,
})

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')
  const [currency, setCurrencyState] = useState<Currency>('USD')

  useEffect(() => {
    const saved = localStorage.getItem('vlaser-lang') as Lang
    const savedCur = localStorage.getItem('vlaser-currency') as Currency
    if (saved === 'km' || saved === 'en') setLangState(saved)
    if (savedCur === 'USD' || savedCur === 'KHR') setCurrencyState(savedCur)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('vlaser-lang', l)
    document.documentElement.lang = l
    if (l === 'km') document.body.classList.add('font-khmer')
    else document.body.classList.remove('font-khmer')
  }

  const setCurrency = (c: Currency) => {
    setCurrencyState(c)
    localStorage.setItem('vlaser-currency', c)
  }

  const formatPrice = (usd: number) => {
    if (currency === 'KHR') return `${Math.round(usd * KHR_RATE).toLocaleString()}៛`
    return `$${usd.toFixed(2)}`
  }

  const t = (en: string, km: string) => lang === 'km' ? km : en

  return (
    <AppContext.Provider value={{ lang, setLang, currency, setCurrency, formatPrice, t }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() { return useContext(AppContext) }
