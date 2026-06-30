import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Vlaser Store - Professional Security & IT Solutions',
  description: 'Professional CCTV, network, access control, alarm systems & smart locks from Hikvision, UNV, ZKTeco, EZVIZ, HUAWEI. Vlaser Solution - Cambodia\'s trusted security technology provider.',
  generator: 'Vlaser Solution',
  icons: {
    icon: { url: '/favicon.svg', type: 'image/svg+xml' },
    apple: '/vlaser-logo.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8B3A42' },
    { media: '(prefers-color-scheme: dark)', color: '#8B3A42' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

