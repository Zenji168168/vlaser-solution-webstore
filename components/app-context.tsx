'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type Lang = 'en' | 'km'

interface AppContextType {
  lang: Lang
  setLang: (l: Lang) => void
  currency: 'USD' | 'KHR'
  setCurrency: (c: 'USD' | 'KHR') => void
  formatPrice: (usd: number) => string
  t: (en: string, km: string) => string
}

const KHR_RATE = 4100 // NBC rate

const AppContext = createContext<AppContextType>({
  lang: 'en', setLang: () => {}, currency: 'USD', setCurrency: () => {},
  formatPrice: (usd) => `$${usd.toFixed(2)}`,
  t: (en) => en,
})

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const [currency, setCurrency] = useState<'USD' | 'KHR'>('USD')

  const formatPrice = (usd: number) => {
    if (currency === 'KHR') {
      const khr = Math.round(usd * KHR_RATE)
      return `${khr.toLocaleString()}៛`
    }
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

export function LangCurrencyToggle() {
  const { lang, setLang, currency, setCurrency } = useApp()
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setLang(lang === 'en' ? 'km' : 'en')}
        className="px-2.5 py-1.5 text-[10px] font-bold rounded-lg border border-border/50 hover:border-red-900/50 hover:bg-red-950/10 transition-all uppercase tracking-wider"
        title={lang === 'en' ? 'Switch to Khmer' : 'Switch to English'}
      >
        {lang === 'en' ? 'ខ្មែរ' : 'EN'}
      </button>
      <button
        onClick={() => setCurrency(currency === 'USD' ? 'KHR' : 'USD')}
        className="px-2.5 py-1.5 text-[10px] font-bold rounded-lg border border-border/50 hover:border-amber-900/50 hover:bg-amber-950/10 transition-all"
        title={currency === 'USD' ? 'Switch to Riel' : 'Switch to USD'}
      >
        {currency === 'USD' ? '៛ KHR' : '$ USD'}
      </button>
    </div>
  )
}
