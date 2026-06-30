'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type Lang = 'en' | 'km'
type Currency = 'USD' | 'KHR'

const KHR_RATE = 4100

interface StoreContextType {
  lang: Lang
  currency: Currency
  toggleLang: () => void
  toggleCurrency: () => void
  t: (en: string, km: string) => string
  formatPrice: (usd: number) => string
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const [currency, setCurrency] = useState<Currency>('USD')

  const toggleLang = () => setLang(l => l === 'en' ? 'km' : 'en')
  const toggleCurrency = () => setCurrency(c => c === 'USD' ? 'KHR' : 'USD')
  const t = (en: string, km: string) => lang === 'en' ? en : km
  const formatPrice = (usd: number) => {
    if (currency === 'USD') return `$${usd.toFixed(2)}`
    const khr = Math.round(usd * KHR_RATE)
    return `${khr.toLocaleString()}៛`
  }

  return (
    <StoreContext.Provider value={{ lang, currency, toggleLang, toggleCurrency, t, formatPrice }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be inside StoreProvider')
  return ctx
}
