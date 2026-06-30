'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { products, CATEGORIES } from '@/lib/products-data'
import { useApp, LangCurrencyToggle } from '@/components/app-context'

function useVis(ref: React.RefObject<HTMLElement|null>) {
  const [v, setV] = useState(false)
  useEffect(() => { const el=ref.current; if(!el) return; const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)setV(true)},{threshold:0.1}); o.observe(el); return()=>o.disconnect() }, [ref])
  return v
}

export default function Home() {
  const { formatPrice, t } = useApp()
  const heroRef = useRef<HTMLDivElement>(null)
  const catRef = useRef<HTMLDivElement>(null)
  const featRef = useRef<HTMLDivElement>(null)
  const hVis = useVis(heroRef)
  const cVis = useVis(catRef)
  const fVis = useVis(featRef)

  const cats = CATEGORIES.filter(c=>c!=='All').map(c=>({
    name:c, count:products.filter(p=>p.category===c).length,
    icon:c==='CCTV'?'📹':c==='Access Control'?'🔐':c==='Network'?'🌐':c==='Alarm System'?'🚨':c==='Attendance'?'⏰':c==='Accessories'?'��':c==='Audio / PA System'?'🔊':c==='Cabinet'?'🗄️':c==='Smart Lock'?'🔒':'📦'
  }))
  const featured = products.filter(p=>p.price>=30&&p.price<=500&&p.image.startsWith('http')&&!p.image.includes('placehold')).slice(0,8)

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/vlaser-logo.png" alt="Vlaser Solution" className="h-10 object-contain" />
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/products" className="hidden md:flex px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors rounded-lg hover:bg-gray-50">Products</Link>
            <Link href="/products?category=CCTV" className="hidden lg:flex px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors rounded-lg hover:bg-gray-50">CCTV</Link>
            <Link href="/products?category=Network" className="hidden lg:flex px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors rounded-lg hover:bg-gray-50">Network</Link>
            <LangCurrencyToggle />
            <Link href="/products" className="ml-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-full transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0">
              {t('Shop Now','ទិញឥឡូវ')}
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="pt-28 pb-20 px-4 lg:px-8">
        <div className={`max-w-5xl mx-auto text-center transition-all duration-700 ${hVis?'opacity-100 translate-y-0':'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-primary text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {t(`${products.length.toLocaleString()} Products Available`,`ផលិតផល ${products.length.toLocaleString()} មាន`)}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-gray-900">
            {t('Professional','វិជ្ជាជីវៈ')}<br/>
            <span className="text-primary">{t('Security Solutions','ដំណោះស្រាយសុវត្ថិភាព')}</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
            {t('CCTV, Network, Access Control & Smart Technology from world-class brands. Serving Cambodia since 2019.','ប្រព័ន្ធ CCTV បណ្ដាញ ប្រព័ន្ធគ្រប់គ្រងការចូល និង Smart Technology ពីម៉ាកល្បីៗ។')}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/products" className="shimmer-hover px-8 py-3.5 bg-primary text-white font-medium rounded-full transition-all hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5">
              {t('Browse All Products →','មើលផលិតផលទាំងអស់ →')}
            </Link>
            <a href="https://t.me/SANGHAMEUK" target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 border border-gray-200 text-gray-700 font-medium rounded-full transition-all hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5">
              {t('Contact Us','ទាក់ទងយើង')}
            </a>
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="border-y border-gray-100 py-6 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
        <div className="flex marquee items-center">
          {Array(3).fill(['Hikvision','UNV','ZKTeco','EZVIZ','HUAWEI','Watashi','ITC','Toten','Ruijie','Seagate']).flat().map((b,i)=>(
            <span key={i} className="mx-8 text-sm font-semibold text-gray-300 hover:text-gray-500 transition-colors whitespace-nowrap flex-shrink-0">{b}</span>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section ref={catRef} className="py-20 px-4 lg:px-8">
        <div className={`max-w-7xl mx-auto transition-all duration-700 ${cVis?'opacity-100 translate-y-0':'opacity-0 translate-y-6'}`}>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-gray-900">{t('Shop by Category','ទិញតាមប្រភេទ')}</h2>
          <p className="text-center text-gray-500 text-sm mb-12">{t('Find the right solution for your needs','ស្វែងរកដំណោះស្រាយសម្រាប់តម្រូវការរបស់អ្នក')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {cats.map((c,i)=>(
              <Link key={c.name} href={`/products?category=${encodeURIComponent(c.name)}`} className={`fade-up d${i+1}`}>
                <div className="group bg-white border border-gray-100 hover:border-primary/20 rounded-2xl p-5 text-center transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                  <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{c.icon}</span>
                  <h3 className="font-semibold text-sm text-gray-800 group-hover:text-primary transition-colors">{c.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{c.count} {t('items','ផលិតផល')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section ref={featRef} className="py-20 px-4 lg:px-8 bg-gray-50/50">
        <div className={`max-w-7xl mx-auto transition-all duration-700 ${fVis?'opacity-100 translate-y-0':'opacity-0 translate-y-6'}`}>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('Featured Products','ផលិតផលពេញនិយម')}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('Popular picks from our catalog','ជម្រើសពេញនិយមពីកាតាឡុករបស់យើង')}</p>
            </div>
            <Link href="/products" className="hidden sm:inline text-sm text-primary font-medium hover:underline">{t('View all →','មើលទាំងអស់ →')}</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((p,i)=>(
              <Link key={p.id} href={`/products/${p.id}`} className={`fade-up d${i+1}`}>
                <div className="product-card bg-white border border-gray-100 rounded-2xl overflow-hidden h-full flex flex-col group">
                  <div className="aspect-square bg-gray-50 overflow-hidden flex items-center justify-center p-4">
                    <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-4 flex-grow flex flex-col border-t border-gray-50">
                    <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider">{p.brand}</span>
                    <h3 className="font-medium text-sm mt-1 line-clamp-2 text-gray-800 group-hover:text-primary transition-colors leading-snug">{p.name}</h3>
                    <div className="mt-auto pt-3">
                      <span className="text-base font-bold text-gray-900">{formatPrice(p.price)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[{n:'5+',l:t('Years','ឆ្នាំ')},{n:'100+',l:t('Clients','អតិថិជន')},{n:'1,382',l:t('Products','ផលិតផល')},{n:'24/7',l:t('Support','គាំទ្រ')}].map((s,i)=>(
            <div key={i}>
              <div className="text-3xl font-bold text-primary">{s.n}</div>
              <div className="text-xs text-gray-500 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 lg:px-8 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t('Need a Quote?','ត្រូវការតម្លៃ?')}</h2>
          <p className="text-gray-500 text-sm mb-8">{t('Get competitive pricing on bulk orders and installations','ទទួលបានតម្លៃប្រកួតប្រជែងសម្រាប់ការបញ្ជាទិញច្រើន')}</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="https://t.me/SANGHAMEUK" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full transition-all hover:shadow-lg text-sm">✈️ Telegram</a>
            <a href="tel:096666954" className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-full transition-all hover:border-gray-300 text-sm">📞 096 666 9545</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <img src="/vlaser-logo.png" alt="Vlaser" className="h-10 object-contain mb-3" />
            <p className="text-xs text-gray-500 leading-relaxed">Vlaser Solution Cambodia Co., Ltd<br/>IT Solutions since 2019</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Shop</h4>
            <div className="space-y-2">{['CCTV','Network','Access Control','Smart Lock','Attendance'].map(c=><Link key={c} href={`/products?category=${encodeURIComponent(c)}`} className="block text-sm text-gray-600 hover:text-primary transition-colors">{c}</Link>)}</div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Brands</h4>
            <div className="space-y-2">{['Hikvision','UNV','ZKTeco','HUAWEI','EZVIZ'].map(b=><Link key={b} href={`/products?brand=${encodeURIComponent(b)}`} className="block text-sm text-gray-600 hover:text-primary transition-colors">{b}</Link>)}</div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Contact</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>096 666 9545</p>
              <p>012 989 784</p>
              <p>info@vlasersolutions.com</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-6 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">&copy; 2026 Vlaser Solution Cambodia Co., Ltd.</p>
          <div className="flex gap-3">
            <a href="https://web.facebook.com/profile.php?id=61583380988974" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-primary">Facebook</a>
            <a href="https://t.me/SANGHAMEUK" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-primary">Telegram</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
