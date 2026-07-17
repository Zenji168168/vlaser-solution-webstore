'use client'

import Link from 'next/link'
import { useApp } from '@/components/app-context'

export function Footer() {
  const { t } = useApp()
  return (
    <footer className="mt-16 border-t border-white/10 bg-[var(--color-ink)] text-white">
      <div className="container-page py-12 sm:py-14">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/vlaser-logo.png" alt="Vlaser" className="h-8 object-contain" />
              <span className="font-bold text-sm text-white">Vlaser Store</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              {t('Vlaser Solution Cambodia Co., Ltd. Professional IT & security solutions since 2019.',
                 'Vlaser Solution Cambodia Co., Ltd. ដំណោះស្រាយ IT និងសុវត្ថិភាពវិជ្ជាជីវៈ ចាប់តាំងពីឆ្នាំ 2019។')}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/55 mb-3">{t('Shop','ទិញទំនិញ')}</h4>
            <div className="space-y-2.5">
              {['CCTV','Network','Access Control','Smart Lock','Attendance','Cabinet'].map(c => (
                <Link key={c} href={`/products?category=${encodeURIComponent(c)}`} className="block rounded-md text-sm text-white/70 transition-colors hover:text-white focus-ring">{c}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/55 mb-3">{t('Brands','ម៉ាក')}</h4>
            <div className="space-y-2.5">
              {['Hikvision','UNV','ZKTeco','HUAWEI','EZVIZ','ITC'].map(b => (
                <Link key={b} href={`/products?brand=${encodeURIComponent(b)}`} className="block rounded-md text-sm text-white/70 transition-colors hover:text-white focus-ring">{b}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/55 mb-3">{t('Contact','ទំនាក់ទំនង')}</h4>
            <div className="space-y-2.5 text-sm text-white/70">
              <a href="tel:096666954" className="block rounded-md hover:text-white focus-ring">096 666 9545</a>
              <a href="tel:012989784" className="block rounded-md hover:text-white focus-ring">012 989 784</a>
              <a href="mailto:info@vlasersolutions.com" className="block rounded-md hover:text-white focus-ring">info@vlasersolutions.com</a>
              <p className="text-white/50 text-xs leading-relaxed">No.8Eo, St14 Borey Piphum Tmey, Steung Meanchey, Phnom Penh</p>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-white/10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-xs text-white/40">&copy; 2026 Vlaser Solution Cambodia Co., Ltd.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href="https://web.facebook.com/profile.php?id=61583380988974" target="_blank" rel="noopener noreferrer" className="rounded-md text-xs text-white/45 transition-colors hover:text-white focus-ring">Facebook</a>
            <a href="https://t.me/SANGHAMEUK" target="_blank" rel="noopener noreferrer" className="rounded-md text-xs text-white/45 transition-colors hover:text-white focus-ring">Telegram</a>
            <a href="https://www.vlasersolution.com" target="_blank" rel="noopener noreferrer" className="rounded-md text-xs text-white/45 transition-colors hover:text-white focus-ring">vlasersolution.com</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
