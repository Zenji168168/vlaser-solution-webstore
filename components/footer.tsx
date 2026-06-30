'use client'

import Link from 'next/link'
import { useApp } from '@/components/app-context'

export function Footer() {
  const { t } = useApp()
  return (
    <footer className="border-t border-gray-100 bg-gray-50/50 mt-16">
      <div className="container-page py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/vlaser-logo.png" alt="Vlaser" className="h-8 object-contain" />
              <span className="font-bold text-sm text-gray-900">Vlaser Store</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t('Vlaser Solution Cambodia Co., Ltd. Professional IT & security solutions since 2019.',
                 'Vlaser Solution Cambodia Co., Ltd. ដំណោះស្រាយ IT និងសុវត្ថិភាពវិជ្ជាជីវៈ ចាប់តាំងពីឆ្នាំ 2019។')}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{t('Shop','ទិញទំនិញ')}</h4>
            <div className="space-y-2">
              {['CCTV','Network','Access Control','Smart Lock','Attendance','Cabinet'].map(c => (
                <Link key={c} href={`/products?category=${encodeURIComponent(c)}`} className="block text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">{c}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{t('Brands','ម៉ាក')}</h4>
            <div className="space-y-2">
              {['Hikvision','UNV','ZKTeco','HUAWEI','EZVIZ','ITC'].map(b => (
                <Link key={b} href={`/products?brand=${encodeURIComponent(b)}`} className="block text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">{b}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{t('Contact','ទំនាក់ទំនង')}</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <a href="tel:096666954" className="block hover:text-[var(--color-primary)]">096 666 9545</a>
              <a href="tel:012989784" className="block hover:text-[var(--color-primary)]">012 989 784</a>
              <a href="mailto:info@vlasersolutions.com" className="block hover:text-[var(--color-primary)]">info@vlasersolutions.com</a>
              <p className="text-gray-500 text-xs leading-relaxed">No.8Eo, St14 Borey Piphum Tmey, Steung Meanchey, Phnom Penh</p>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">&copy; 2026 Vlaser Solution Cambodia Co., Ltd.</p>
          <div className="flex items-center gap-4">
            <a href="https://web.facebook.com/profile.php?id=61583380988974" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-[var(--color-primary)] transition-colors">Facebook</a>
            <a href="https://t.me/SANGHAMEUK" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-[var(--color-primary)] transition-colors">Telegram</a>
            <a href="https://www.vlasersolution.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-[var(--color-primary)] transition-colors">vlasersolution.com</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
