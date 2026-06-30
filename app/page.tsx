'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { products, CATEGORIES } from '@/lib/products-data'
import { useApp } from '@/components/app-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'

function useVisible(ref: React.RefObject<HTMLElement|null>) {
  const [v, setV] = useState(false)
  useEffect(() => { const el=ref.current; if(!el) return; const o = new IntersectionObserver(([e])=>{if(e.isIntersecting)setV(true)},{threshold:0.1}); o.observe(el); return()=>o.disconnect() }, [ref])
  return v
}

export default function Home() {
  const { formatPrice, t } = useApp()
  const catRef = useRef<HTMLDivElement>(null)
  const featRef = useRef<HTMLDivElement>(null)
  const catVis = useVisible(catRef)
  const featVis = useVisible(featRef)

  const cats = CATEGORIES.filter(c => c !== 'All' && c !== 'Other').map(c => ({
    name: c, count: products.filter(p => p.category === c).length
  }))
  const featured = products.filter(p => p.price >= 25 && p.price <= 400 && p.image.startsWith('http') && !p.image.includes('placehold')).slice(0, 8)

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium text-[var(--color-primary)] mb-4 animate-fade-up">
            {t('Authorized Hikvision Dealer • 1,382 Products','ភ្នាក់ងារ Hikvision ផ្លូវការ • ផលិតផល ១,៣៨២')}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-5 animate-fade-up delay-1">
            {t('Professional Security & Network Solutions','ដំណោះស្រាយសុវត្ថិភាព និងបណ្ដាញវិជ្ជាជីវៈ')}
          </h1>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-8 animate-fade-up delay-2">
            {t('CCTV cameras, network equipment, access control, smart locks & more from trusted global brands. Installation & support included.',
               'កាមេរ៉ា CCTV ឧបករណ៍បណ្ដាញ ប្រព័ន្ធគ្រប់គ្រងការចូល សោឆ្លាត និងច្រើនទៀតពីម៉ាកល្បីៗ។ រួមទាំងការដំឡើង និងជំនួយ។')}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap animate-fade-up delay-3">
            <Link href="/products" className="btn-primary px-7 py-3">{t('Browse Products','មើលផលិតផល')}</Link>
            <a href="https://t.me/SANGHAMEUK" target="_blank" rel="noopener noreferrer" className="btn-secondary px-7 py-3">
              {t('Contact Sales','ទាក់ទងផ្នែកលក់')}
            </a>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section ref={catRef} className="py-16 bg-[var(--color-surface)]">
        <div className={`container-page transition-all duration-700 ${catVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">{t('Shop by Category','ទិញតាមប្រភេទ')}</h2>
            <p className="text-sm text-gray-500 mt-2">{t('Find solutions for every security need','ស្វែងរកដំណោះស្រាយសម្រាប់រាល់តម្រូវការសុវត្ថិភាព')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {cats.map(c => (
              <Link key={c.name} href={`/products?category=${encodeURIComponent(c.name)}`}
                className="bg-white border border-gray-100 hover:border-[var(--color-primary)]/20 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group">
                <h3 className="text-sm font-medium text-gray-800 group-hover:text-[var(--color-primary)] transition-colors">{c.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{c.count} {t('products','ផលិតផល')}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section ref={featRef} className="py-16">
        <div className={`container-page transition-all duration-700 ${featVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('Featured Products','ផលិតផលពេញនិយម')}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('Popular security solutions','ដំណោះស្រាយសុវត្ថិភាពពេញនិយម')}</p>
            </div>
            <Link href="/products" className="hidden sm:inline text-sm font-medium text-[var(--color-primary)] hover:underline">{t('View all','មើលទាំងអស់')} &rarr;</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link href="/products" className="btn-primary">{t('View All Products','មើលផលិតផលទាំងអស់')}</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-[var(--color-surface)] border-y border-gray-100">
        <div className="container-page grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[{n:'5+',l:t('Years','ឆ្នាំ')},{n:'100+',l:t('Clients','អតិថិជន')},{n:'1,382',l:t('Products','ផលិតផល')},{n:'24/7',l:t('Support','គាំទ្រ')}].map((s,i) => (
            <div key={i}>
              <div className="text-2xl font-bold text-[var(--color-primary)]">{s.n}</div>
              <div className="text-xs text-gray-500 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container-page max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('Need a Quote?','ត្រូវការតម្លៃ?')}</h2>
          <p className="text-gray-500 text-sm mb-6">{t('Get competitive pricing for projects and bulk orders.','ទទួលបានតម្លៃប្រកួតប្រជែងសម្រាប់គម្រោង និងការបញ្ជាទិញច្រើន។')}</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="https://t.me/SANGHAMEUK" target="_blank" rel="noopener noreferrer" className="btn-primary">✈️ {t('Telegram','តេឡេក្រាម')}</a>
            <a href="tel:096666954" className="btn-secondary">📞 096 666 9545</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
