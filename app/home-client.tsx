'use client'

import Link from 'next/link'
import {
  Cable,
  CheckCircle2,
  Clock,
  Fingerprint,
  ArrowRight,
  Layers,
  Lock,
  MessageCircle,
  Network,
  PackageSearch,
  Server,
  ShieldCheck,
  ShoppingBag,
  Video,
  Volume2,
  Wrench,
} from 'lucide-react'
import { useApp } from '@/components/app-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import type { StorefrontProduct } from '@/lib/product-service'

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Access Control': Fingerprint,
  Accessories: Cable,
  'Alarm System': ShieldCheck,
  Attendance: Clock,
  'Audio / PA System': Volume2,
  CCTV: Video,
  Cabinet: Server,
  Network,
  'Smart Lock': Lock,
}

interface Props {
  categories: string[]
  featured: StorefrontProduct[]
  catCounts: Record<string, number>
  totalProducts: number
}

export function HomeClient({ categories, featured, catCounts, totalProducts }: Props) {
  const { t } = useApp()
  const cats = categories.filter(c => c !== 'All').map(c => ({ name: c, count: catCounts[c] || 0 }))
  const heroProducts = featured.slice(0, 3)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="premium-gradient relative overflow-hidden border-b border-black/[0.06]">
        <div className="container-page grid grid-cols-1 items-center gap-10 py-14 sm:py-18 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/90 px-3.5 py-1.5 text-xs font-black text-[var(--color-primary)] shadow-sm animate-fade-up">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              {t(`${totalProducts.toLocaleString()} security and network products`, `${totalProducts.toLocaleString()} ផលិតផលសុវត្ថិភាព និងបណ្ដាញ`)}
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.03] tracking-tight text-[var(--color-ink)] sm:text-6xl lg:text-7xl animate-fade-up delay-1 [overflow-wrap:anywhere]">
              {t('Security, network, and smart access products for real projects.', 'ផលិតផលសុវត្ថិភាព បណ្ដាញ និងគ្រប់គ្រងការចូល សម្រាប់គម្រោងពិតប្រាកដ។')}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-ink-soft)] sm:text-lg animate-fade-up delay-2">
              {t('Browse CCTV, network equipment, access control, alarm systems, cabinets, smart locks, and accessories from Vlaser Solution Cambodia.', 'ស្វែងរក CCTV ឧបករណ៍បណ្ដាញ ប្រព័ន្ធគ្រប់គ្រងការចូល ប្រព័ន្ធរោទិ៍ ទូ Cabinet សោឆ្លាត និងគ្រឿងបន្លាស់ពី Vlaser Solution Cambodia។')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row animate-fade-up delay-3">
              <Link href="/products" className="btn-primary h-12 px-7">
                <ShoppingBag className="size-4" aria-hidden="true" />
                {t('Shop Products', 'ទិញផលិតផល')}
              </Link>
              <a href="https://t.me/SANGHAMEUK" target="_blank" rel="noopener noreferrer" className="btn-secondary h-12 px-7">
                <MessageCircle className="size-4" aria-hidden="true" />
                {t('Contact Sales', 'ទាក់ទងផ្នែកលក់')}
              </a>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 animate-fade-up delay-4">
              {[
                { icon: PackageSearch, label: t('Broad product selection', 'ជម្រើសផលិតផលច្រើន') },
                { icon: Wrench, label: t('Installation support', 'ជំនួយការដំឡើង') },
                { icon: MessageCircle, label: t('Sales assistance by Telegram', 'ជំនួយលក់តាម Telegram') },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white/80 p-3 text-sm font-bold text-gray-800 shadow-sm backdrop-blur">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[var(--color-primary)]">
                    <item.icon className="size-4" aria-hidden="true" />
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-xl animate-fade-in delay-2">
              <div className="premium-panel rounded-[1.75rem] p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">Vlaser Store</p>
                    <p className="mt-1 text-sm text-gray-500">{t('Featured technical products', 'ផលិតផលបច្ចេកទេសដែលបានជ្រើស')}</p>
                  </div>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">{t('Live catalog', 'ទិន្នន័យថ្មី')}</span>
                </div>
                <div className="mt-4 grid gap-3">
                  {heroProducts.map(product => (
                    <Link key={product.id} href={`/products/${product.id}`} className="group grid grid-cols-[84px_1fr_auto] items-center gap-3 rounded-2xl border border-black/[0.06] bg-stone-50/70 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-100 hover:bg-white hover:shadow-md focus-ring">
                      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white p-2">
                        <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]" onError={event => { (event.currentTarget as HTMLImageElement).src = '/placeholder.svg' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">{product.brand}</p>
                        <p className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-gray-950">{product.name}</p>
                        <p className="mt-1 text-xs text-gray-500">{product.category}</p>
                      </div>
                      <span className="hidden rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-700 shadow-sm sm:inline-flex">{product.sku.slice(0, 10)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-18 bg-[var(--color-mist)]">
        <div className="container-page animate-fade-up">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-eyebrow">Catalog paths</p>
              <h2 className="section-title mt-2">{t('Shop by Category', 'ទិញតាមប្រភេទ')}</h2>
              <p className="section-copy">{t('Choose a product family and keep browsing with live counts.', 'ជ្រើសរើសប្រភេទផលិតផល ហើយមើលចំនួនផលិតផលជាក់ស្តែង។')}</p>
            </div>
            <Link href="/products" className="text-sm font-bold text-[var(--color-primary)] hover:underline">{t('View all products', 'មើលផលិតផលទាំងអស់')}</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {cats.map(c => {
              const Icon = categoryIcons[c.name] || Layers
              return (
                <Link key={c.name} href={`/products?category=${encodeURIComponent(c.name)}`} className="group surface-panel relative flex min-h-[140px] flex-col justify-between p-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-100 hover:shadow-lg focus-ring">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-cyan-50 text-[var(--color-primary)] transition-colors duration-300 group-hover:bg-[var(--color-primary)] group-hover:text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block line-clamp-1 text-sm font-bold text-gray-950">{c.name}</span>
                    <span className="mt-1 block text-xs text-gray-500">{c.count} {t('products', 'ផលិតផល')}</span>
                  </span>
                  <span className="absolute bottom-4 right-4 flex size-8 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]">
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-18">
        <div className="container-page animate-fade-up">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="section-eyebrow">Selected from the catalog</p>
              <h2 className="section-title mt-2">{t('Featured Products', 'ផលិតផលពេញនិយម')}</h2>
              <p className="section-copy">{t('A quick path into real products from the live catalog.', 'ចូលទៅកាន់ផលិតផលពិតពីបញ្ជីទិន្នន័យបច្ចុប្បន្ន។')}</p>
            </div>
            <Link href="/products" className="hidden text-sm font-bold text-[var(--color-primary)] hover:underline sm:inline-flex">{t('View all', 'មើលទាំងអស់')} &rarr;</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {featured.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-white py-10">
        <div className="container-page">
          <div className="mb-5 text-center">
            <p className="section-eyebrow">Common brands</p>
          </div>
          <div className="grid gap-3 text-center sm:grid-cols-3 lg:grid-cols-6">
            {['Hikvision', 'UNV', 'ZKTeco', 'HUAWEI', 'EZVIZ', 'ITC'].map(brand => (
              <Link key={brand} href={`/products?brand=${encodeURIComponent(brand)}`} className="rounded-2xl border border-black/[0.06] bg-stone-50 px-4 py-4 text-sm font-black tracking-wide text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-[var(--color-primary)] hover:shadow-sm focus-ring">
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-ink)] py-12 text-white sm:py-14">
        <div className="container-page">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: PackageSearch, title: t('Live catalog browsing', 'Live catalog browsing'), copy: t('Search, filter, and compare products from the current store catalog.', 'Search, filter, and compare products from the current store catalog.') },
              { icon: Wrench, title: t('Project-ready support', 'Project-ready support'), copy: t('Use the product page order flow or Telegram contact for equipment questions.', 'Use the product page order flow or Telegram contact for equipment questions.') },
              { icon: ShieldCheck, title: t('Security technology focus', 'Security technology focus'), copy: t('CCTV, networking, access control, smart locks, cabinets, and related systems.', 'CCTV, networking, access control, smart locks, cabinets, and related systems.') },
            ].map(item => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-sm">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-black">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-18">
        <div className="container-page animate-fade-up">
          <div className="grid gap-6 rounded-3xl border border-cyan-100 bg-[var(--color-primary-dark)] p-6 text-white shadow-xl sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-bold text-cyan-100">{t('Need help choosing equipment?', 'ត្រូវការជំនួយក្នុងការជ្រើសរើសឧបករណ៍?')}</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{t('Talk to Vlaser sales before you order.', 'ពិភាក្សាជាមួយផ្នែកលក់ Vlaser មុនពេលបញ្ជាទិញ។')}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-cyan-50">{t('Send the product link or your project list through Telegram. The buying flow prepares the message for you on product pages.', 'ផ្ញើតំណផលិតផល ឬបញ្ជីគម្រោងរបស់អ្នកតាម Telegram។ ប្រព័ន្ធបញ្ជាទិញនឹងរៀបចំសារឱ្យអ្នកនៅទំព័រផលិតផល។')}</p>
            </div>
            <a href="https://t.me/SANGHAMEUK" target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-[var(--color-primary)] transition-transform duration-200 hover:-translate-y-0.5 focus-ring">
              <MessageCircle className="size-4" aria-hidden="true" />
              Telegram
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
