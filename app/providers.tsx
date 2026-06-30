'use client'

import { AppProvider } from '@/components/app-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>
}
