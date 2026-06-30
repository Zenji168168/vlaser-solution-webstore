import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Noto_Sans_Khmer } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const notoKhmer = Noto_Sans_Khmer({
  variable: '--font-khmer',
  subsets: ['khmer'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Vlaser Store | CCTV, Network & Security Solutions Cambodia',
  description: 'Professional CCTV cameras, network equipment, access control, alarm systems & smart locks. Hikvision, UNV, ZKTeco, EZVIZ, HUAWEI authorized dealer. Vlaser Solution Cambodia.',
  icons: {
    icon: { url: '/favicon.svg', type: 'image/svg+xml' },
    apple: '/vlaser-logo.png',
  },
  openGraph: {
    title: 'Vlaser Store | Professional Security Solutions',
    description: 'Cambodia\'s trusted technology service provider. CCTV, Network, Access Control & more.',
    siteName: 'Vlaser Store',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${notoKhmer.variable}`}>
      <body className="font-sans antialiased bg-white text-gray-900 min-h-screen">
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
