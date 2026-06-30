'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { products, CATEGORIES } from '@/lib/products-data'

function useVisible(ref: React.RefObject<HTMLElement | null>, threshold = 0.15) {
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting) setVis(true) }, { threshold })
    obs.observe(el); return () => obs.disconnect()
  }, [ref, threshold])
  return vis
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const catRef = useRef<HTMLDivElement>(null)
  const featRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const heroVis = useVisible(heroRef)
  const catVis = useVisible(catRef)
  const featVis = useVisible(featRef)
  const statsVis = useVisible(statsRef)
  useEffect(() => { setMounted(true) }, [])

  const cats = CATEGORIES.filter(c=>c!=='All').map(c=>({
    name:c, count:products.filter(p=>p.category===c).length,
    icon:c==='CCTV'?'📹':c==='Access Control'?'🔐':c==='Network'?'🌐':c==='Alarm System'?'🚨':c==='Attendance'?'⏰':c==='Accessories'?'🔧':c==='Audio / PA System'?'🔊':c==='Cabinet'?'🗄️':c==='Smart Lock'?'🔒':'📦',
    color:c==='CCTV'?'from-red-500/10 to-red-900/5':c==='Network'?'from-cyan-500/10 to-cyan-900/5':c==='Access Control'?'from-amber-500/10 to-amber-900/5':'from-purple-500/10 to-purple-900/5'
  }))
  const featured = products.filter(p=>p.price>=30&&p.price<=400&&p.image.startsWith('http')).slice(0,8)
  const brands = [
    { name: 'Hikvision', logo: 'https://www.hikvision.com/content/dam/hikvision/en/marketing/image/latest-news/20211013/Hikvision_logo_B.png' },
    { name: 'UNV', logo: 'https://www.uniview.com/uploadfile/image/Uniview-logo.png' },
    { name: 'ZKTeco', logo: 'https://www.zkteco.com/uploads/allimg/20210901/1-210Z1094321613.png' },
    { name: 'EZVIZ', logo: 'https://www.ezviz.com/Content/imgs/ezviz-logo.svg' },
    { name: 'HUAWEI', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Huawei_Logo.svg/512px-Huawei_Logo.svg.png' },
    { name: 'Watashi', logo: 'https://www.watashi.co.th/wp-content/uploads/2020/01/watashi-logo.png' },
    { name: 'ITC', logo: 'https://www.itctech.com.cn/Public/Uploads/uploadfile/images/20210901/itc-logo.png' },
    { name: 'Toten', logo: 'https://toten.com/wp-content/uploads/2020/03/toten-logo.png' },
    { name: 'Ruijie', logo: 'https://www.ruijienetworks.com/resource/upload/image/20220506/1651826968.png' },
    { name: 'Seagate', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Seagate_logo_%282019%29.svg/512px-Seagate_logo_%282019%29.svg.png' },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* === NAV === */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/vlaser-logo.png" alt="Vlaser Solution" className="h-9 sm:h-10 object-contain" />
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/products" className="hidden md:flex px-3.5 py-2 text-xs text-muted-foreground hover:text-foreground transition-all rounded-lg hover:bg-white/5">Products</Link>
            <Link href="/products?category=CCTV" className="hidden lg:flex px-3.5 py-2 text-xs text-muted-foreground hover:text-foreground transition-all rounded-lg hover:bg-white/5">CCTV</Link>
            <Link href="/products?category=Network" className="hidden lg:flex px-3.5 py-2 text-xs text-muted-foreground hover:text-foreground transition-all rounded-lg hover:bg-white/5">Network</Link>
            <a href="https://wa.me/85512345678" target="_blank" rel="noopener noreferrer" className="hidden sm:flex ml-1 px-3.5 py-2 text-xs text-green-400 hover:text-green-300 transition-all rounded-lg hover:bg-green-500/5 border border-green-900/30">💬 Chat</a>
            <Link href="/products" className="ml-2 px-4 py-2.5 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white text-xs font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-red-900/30 hover:-translate-y-0.5 active:translate-y-0">
              Shop Now
            </Link>
          </div>
        </div>
      </nav>

      {/* === HERO === */}
      <section ref={heroRef} className="relative pt-32 pb-28 px-4 lg:px-8 overflow-hidden">
        {/* BG Effects */}
        <div className="absolute inset-0 pointer-events-none grid-pattern opacity-40" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-950/30 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-950/15 rounded-full blur-[120px]" />
        <div className="absolute top-40 left-20 w-3 h-3 bg-red-500/30 rounded-full animate-float" />
        <div className="absolute top-60 right-32 w-2 h-2 bg-amber-500/30 rounded-full animate-float delay-3" />
        <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-cyan-500/20 rounded-full animate-float delay-5" />

        <div className={`relative max-w-5xl mx-auto text-center transition-all duration-1000 ${heroVis?'opacity-100 translate-y-0':'opacity-0 translate-y-12'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-900/30 bg-red-950/20 mb-8 animate-pulse-glow">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>
            <span className="text-xs font-medium text-red-300">{products.length.toLocaleString()} Products Live</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6">
            <span className="block">Enterprise</span>
            <span className="block text-shimmer">Security Tech</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Professional CCTV, network, access control & smart solutions.<br className="hidden sm:block"/>Trusted by businesses across Cambodia.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 flex-wrap mb-14">
            <Link href="/products" className="group relative px-8 py-4 bg-gradient-to-r from-red-800 to-red-700 text-white font-semibold rounded-2xl transition-all hover:shadow-2xl hover:shadow-red-900/30 hover:-translate-y-1 overflow-hidden">
              <span className="relative z-10">Explore Products →</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            </Link>
            <a href="https://wa.me/85512345678" target="_blank" rel="noopener noreferrer" className="px-8 py-4 border border-border/60 text-foreground font-semibold rounded-2xl transition-all hover:border-green-800/60 hover:bg-green-950/10 hover:-translate-y-1 hover:shadow-lg">
              Contact Sales
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 text-xs text-muted-foreground">
            {[{icon:'🏢',text:'Founded 2019'},{icon:'🛡️',text:'Hikvision Authorized'},{icon:'👥',text:'100+ Clients'},{icon:'🔧',text:'Installation Service'}].map((b,i)=>(
              <div key={i} className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"><span>{b.icon}</span><span className="hidden sm:inline">{b.text}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* === BRANDS MARQUEE === */}
      <section className="border-y border-border/20 py-6 overflow-hidden relative bg-card/20">
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex marquee-left items-center">
          {[...brands,...brands,...brands].map((b,i)=>(
            <div key={i} className="mx-10 flex-shrink-0 opacity-40 hover:opacity-90 transition-opacity duration-300 grayscale hover:grayscale-0">
              <img src={b.logo} alt={b.name} className="h-7 sm:h-8 w-auto object-contain" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
            </div>
          ))}
        </div>
      </section>

      {/* === CATEGORIES === */}
      <section ref={catRef} className="py-24 px-4 lg:px-8 relative">
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-red-950/10 rounded-full blur-[100px]" /></div>
        <div className={`relative max-w-7xl mx-auto transition-all duration-700 ${catVis?'opacity-100 translate-y-0':'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Shop by Category</h2>
            <p className="text-sm text-muted-foreground">Find the perfect solution for your security needs</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {cats.map((c,i)=>(
              <Link key={c.name} href={`/products?category=${encodeURIComponent(c.name)}`} className={`fade-up delay-${i+1}`}>
                <div className={`group gradient-border bg-gradient-to-br ${c.color} rounded-2xl p-6 h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-red-950/10`}>
                  <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform origin-left">{c.icon}</span>
                  <h3 className="font-semibold text-sm mb-0.5 group-hover:text-red-400 transition-colors">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.count} products</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURED === */}
      <section ref={featRef} className="py-24 px-4 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent pointer-events-none" />
        <div className={`relative max-w-7xl mx-auto transition-all duration-700 ${featVis?'opacity-100 translate-y-0':'opacity-0 translate-y-10'}`}>
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Featured</h2>
              <p className="text-sm text-muted-foreground">Popular picks from our catalog</p>
            </div>
            <Link href="/products" className="hidden sm:inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium px-4 py-2 rounded-lg border border-red-900/30 hover:bg-red-950/20 transition-all">All Products →</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {featured.map((p,i)=>(
              <Link key={p.id} href={`/products/${p.id}`} className={`fade-up delay-${i+1}`}>
                <div className="product-card gradient-border bg-card rounded-2xl overflow-hidden h-full flex flex-col group">
                  <div className="aspect-[4/3] overflow-hidden relative bg-muted/10">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700" loading="lazy"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <span className="inline-block px-3 py-1.5 bg-red-700/90 text-white text-[10px] font-semibold rounded-lg backdrop-blur-sm">View Details →</span>
                    </div>
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-wider">{p.brand}</span>
                    <h3 className="font-medium text-sm mt-1 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">{p.name}</h3>
                    <div className="mt-auto pt-3 flex items-baseline gap-1">
                      <span className="text-lg font-bold">${p.price.toFixed(2)}</span>
                      <span className="text-[10px] text-muted-foreground">USD</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link href="/products" className="inline-flex px-6 py-3 bg-red-900 text-white text-sm font-semibold rounded-xl">View All Products</Link>
          </div>
        </div>
      </section>

      {/* === STATS === */}
      <section ref={statsRef} className="py-20 px-4 lg:px-8 border-y border-border/30">
        <div className={`max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-700 ${statsVis?'opacity-100 translate-y-0':'opacity-0 translate-y-10'}`}>
          {[{n:'5+',l:'Years Experience',icon:'📅'},{n:'100+',l:'Happy Clients',icon:'👥'},{n:'1,382',l:'Products Available',icon:'📦'},{n:'24/7',l:'Technical Support',icon:'🛠️'}].map((s,i)=>(
            <div key={i} className="text-center group">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">{s.n}</div>
              <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-medium">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* === CLIENTS === */}
      <section className="py-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Trusted by Leading Businesses</h2>
          <p className="text-sm text-muted-foreground mb-10">Serving clients across Cambodia since 2019</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {['Northbridge International School','NorthPark Condominium','Caltex Station Sensok','Ohana Hotel','MEGABELLE BEAUTY CLINIC','AMATA RESIDENCE','MONY Clinic','Inkyung Cambodia Co. Ltd','ActivateC3 Hostel','ផ្សារលើក្រុងកំពុងឆ្នាំង','ស្កាយលេន ផនសប','ផ្សារស្រែអំបិល'].map((c,i)=>(
              <div key={i} className="px-3 py-4 bg-card/60 border border-border/30 rounded-xl flex items-center justify-center hover:border-red-900/30 transition-colors">
                <span className="text-[10px] text-muted-foreground text-center font-medium leading-tight">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA === */}
      <section className="py-28 px-4 lg:px-8 relative overflow-hidden border-t border-border/30">
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-950/20 rounded-full blur-[120px]" /></div>
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Ready to Upgrade<br/>Your Security?</h2>
          <p className="text-muted-foreground text-sm mb-8">Get competitive quotes on enterprise projects. Free consultation available.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="https://wa.me/85596666545" target="_blank" rel="noopener noreferrer" className="px-7 py-3.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-green-900/20 hover:-translate-y-0.5 text-sm">💬 WhatsApp Us</a>
            <a href="https://t.me/SANGHAMEUK" target="_blank" rel="noopener noreferrer" className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm">✈️ Telegram</a>
            <Link href="/products" className="px-7 py-3.5 border border-border/60 text-foreground font-semibold rounded-xl transition-all hover:bg-card hover:-translate-y-0.5 text-sm">Browse Catalog</Link>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="border-t border-border/30 bg-card/20 py-14 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/vlaser-logo.png" alt="Vlaser Solution" className="h-8 object-contain" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Vlaser Solution Cambodia Co., Ltd<br/>Delivering cutting-edge IT solutions since 2019.<br/>CCTV, Network, Access Control & more.</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">Shop</h4>
            <div className="space-y-2.5">{['CCTV','Network','Access Control','Smart Lock','Attendance','Cabinet'].map(c=><Link key={c} href={`/products?category=${encodeURIComponent(c)}`} className="block text-xs text-muted-foreground hover:text-foreground transition-colors">{c}</Link>)}</div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">Brands</h4>
            <div className="space-y-2.5">{['Hikvision','UNV','ZKTeco','HUAWEI','EZVIZ','ITC'].map(b=><Link key={b} href={`/products?brand=${encodeURIComponent(b)}`} className="block text-xs text-muted-foreground hover:text-foreground transition-colors">{b}</Link>)}</div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">Contact</h4>
            <div className="space-y-2.5 text-xs text-muted-foreground">
              <p>012 989 784</p>
              <p>096 666 9545</p>
              <p>010 / 078 322 295</p>
              <p>info@vlasersolutions.com</p>
              <p>No.8Eo, St14 Borey Piphum Tmey,<br/>Steung Meanchey, Phnom Penh</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-muted-foreground/60">&copy; 2026 Vlaser Solution Cambodia Co., Ltd. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a href="https://web.facebook.com/profile.php?id=61583380988974" target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground/40 hover:text-foreground transition-colors">Facebook</a>
            <a href="https://t.me/SANGHAMEUK" target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground/40 hover:text-foreground transition-colors">Telegram</a>
            <a href="https://www.vlasersolution.com" target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground/40 hover:text-foreground transition-colors">vlasersolution.com</a>
          </div>
        </div>
      </footer>
    </div>
  )
}


