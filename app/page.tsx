'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Page() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    setIsVisible(true)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const products = [
    {
      id: 1,
      name: 'Pro CCTV System',
      description: '4K Ultra HD surveillance cameras with AI detection',
      price: '$2,499',
      image: '/cctv-camera.png',
      category: 'CCTV',
      features: ['AI Detection', '4K Resolution', 'Night Vision'],
      rating: 4.9,
      reviews: 328,
    },
    {
      id: 2,
      name: 'Network Security Suite',
      description: 'Advanced network monitoring and protection',
      price: '$1,899',
      image: '/network-device.png',
      category: 'Network',
      features: ['Real-time Monitoring', 'DDoS Protection', 'Encryption'],
      rating: 4.8,
      reviews: 245,
    },
    {
      id: 3,
      name: 'Smart Alarm System',
      description: 'Integrated smart alarm with mobile alerts',
      price: '$899',
      image: '/alarm-system.png',
      category: 'Alarm',
      features: ['Mobile Alerts', 'Smart Integration', '24/7 Response'],
      rating: 4.7,
      reviews: 412,
    },
    {
      id: 4,
      name: 'Monitoring Hub Pro',
      description: 'Central control & monitoring dashboard',
      price: '$3,299',
      image: '/monitoring-hub.png',
      category: 'Control',
      features: ['Multi-Zone Control', 'Analytics', 'Cloud Sync'],
      rating: 5.0,
      reviews: 189,
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Premium Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/70 border-b border-primary/10 animate-slide-in-down shadow-2xl shadow-primary/5" style={{animationDuration: '0.8s'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-lg hover:scale-110 transition-transform duration-300 animate-pulse-glow">
              V
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent hover:animate-text-glow transition-all">
              VlaserStore
            </div>
          </div>
          <div className="flex gap-8 items-center">
            <Link href="#products" className="text-sm font-medium hover:text-primary transition-colors relative group">
              Products
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors relative group">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="#stats" className="text-sm font-medium hover:text-primary transition-colors relative group">
              Why Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
            </Link>
            <button className="group relative px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-semibold overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 active:scale-95">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            </button>
          </div>
        </div>
      </nav>

      {/* Epic Hero Section */}
      <section className="pt-40 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/4 w-96 h-96 bg-primary/30 rounded-full mix-blend-screen blur-3xl animate-float" />
          <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-secondary/30 rounded-full mix-blend-screen blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute left-1/2 top-1/3 w-[500px] h-[500px] bg-accent/20 rounded-full mix-blend-screen blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute -left-40 -bottom-40 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen blur-3xl animate-pulse" style={{animationDuration: '8s'}} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="animate-slide-in-up mb-8 inline-block">
            <div className="px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/40 backdrop-blur-sm hover:border-primary/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30">
              <span className="text-primary text-sm font-bold tracking-wider uppercase">🏆 Cambodia's #1 Security Platform</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 text-balance animate-slide-in-up leading-tight" style={{animationDelay: '0.1s'}}>
            Enterprise-Grade <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent inline-block animate-text-glow">Security</span> Solutions
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-balance animate-slide-in-up max-w-3xl mx-auto leading-relaxed" style={{animationDelay: '0.2s'}}>
            Advanced CCTV, network surveillance, and alarm systems trusted by Cambodia's leading enterprises. Powered by AI innovation.
          </p>
          
          <div className="flex gap-6 justify-center flex-wrap animate-slide-in-up mb-12" style={{animationDelay: '0.3s'}}>
            <button className="group relative px-10 py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/50 hover:scale-110 active:scale-95 transform">
              <span className="relative z-10">Shop Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/30 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            </button>
            <button className="group relative px-10 py-4 border-2 border-primary/50 text-primary rounded-xl font-bold text-lg hover:bg-primary/10 hover:border-primary transition-all duration-300 hover:scale-105 active:scale-95">
              <span>Watch Demo</span>
              <div className="absolute inset-0 border-2 border-primary rounded-xl opacity-0 group-hover:animate-ping" style={{animationDuration: '1.5s'}} />
            </button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 animate-slide-in-up" style={{animationDelay: '0.4s'}}>
            {[
              { label: '10K+', desc: 'Customers' },
              { label: '150+', desc: 'Countries' },
              { label: '99.9%', desc: 'Uptime' },
              { label: '24/7', desc: 'Support' },
              { label: '5★', desc: 'Rating' },
              { label: '0', desc: 'Downtime' },
            ].map((stat, i) => (
              <div key={i} className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="font-bold text-xl md:text-2xl text-primary group-hover:text-secondary transition-colors">{stat.label}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Running Banner - Premium */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-background to-secondary/10 border-y border-primary/20 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shine" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <h3 className="text-center text-sm font-bold text-primary mb-8 uppercase tracking-widest animate-slide-in-up">Core Features</h3>
          
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />
            
            <style>{`
              @keyframes features-scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(calc(-100% - 2rem)); }
              }
              .features-banner {
                display: flex;
                gap: 2rem;
                animation: features-scroll 50s linear infinite;
                width: fit-content;
              }
              .features-banner:hover {
                animation-play-state: paused;
              }
            `}</style>
            
            <div className="overflow-hidden py-6">
              <div className="features-banner">
                {[
                  { icon: '⚡', text: 'Lightning Fast Processing' },
                  { icon: '🔒', text: 'Military Grade Encryption' },
                  { icon: '📡', text: '24/7 Live Monitoring' },
                  { icon: '🌐', text: 'Global Cloud Coverage' },
                  { icon: '🤖', text: 'AI-Powered Detection' },
                  { icon: '📊', text: 'Real-time Analytics' },
                  { icon: '💎', text: 'Premium Support' },
                  { icon: '🚀', text: 'Instant Deployment' },
                  { icon: '⚡', text: 'Lightning Fast Processing' },
                  { icon: '🔒', text: 'Military Grade Encryption' },
                ].map((feature, index) => (
                  <div key={index} className="flex-shrink-0 flex items-center gap-3 px-6 py-3 rounded-lg bg-card/40 border border-primary/20 hover:border-primary/60 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 backdrop-blur-sm group cursor-pointer">
                    <span className="text-2xl animate-bounce group-hover:animate-icon-pop transition-all" style={{animationDelay: `${index * 0.1}s`}}>{feature.icon}</span>
                    <span className="font-semibold text-primary whitespace-nowrap text-sm group-hover:text-secondary transition-colors">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section - Premium */}
      <section id="products" className="py-32 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-background via-primary/3 to-background overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{animationDuration: '8s'}} />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{animationDuration: '10s', animationDelay: '2s'}} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20 animate-slide-in-up">
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
              Premium Product Line
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Industry-leading security solutions designed for modern enterprises
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="group relative animate-slide-in-up"
                style={{animationDelay: `${0.1 * index}s`}}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-gradient-flow" />
                
                <div className="relative bg-card/60 backdrop-blur-xl border border-primary/30 hover:border-primary/80 rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 group-hover:-translate-y-2">
                  {/* Image Container */}
                  <div className="relative h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-grid opacity-10" />
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={240}
                      height={240}
                      className="group-hover:scale-125 group-hover:rotate-6 transition-transform duration-500 relative z-10"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-8 flex-grow flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-primary/80 uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                        {product.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400">★</span>
                        <span className="text-sm font-bold text-foreground">{product.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-black text-xl mb-2 group-hover:text-primary transition-colors duration-300">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-grow">{product.description}</p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {product.features.map((feat, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-semibold">
                          {feat}
                        </span>
                      ))}
                    </div>
                    
                    {/* Price & Button */}
                    <div className="flex items-center justify-between pt-6 border-t border-border/30">
                      <span className="text-3xl font-black text-primary">{product.price}</span>
                      <button className="group/btn relative px-6 py-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-bold overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-110 active:scale-95">
                        <span className="relative z-10 text-sm">Buy Now</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beautiful Loading Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s'}} />
          <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: '7s', animationDelay: '1s'}} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-16 animate-slide-in-up">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Status</span>
          </h2>

          {/* Animated Progress Bars */}
          <div className="space-y-8 mb-16">
            {[
              { label: 'Infrastructure', percentage: 100, color: 'from-primary to-secondary' },
              { label: 'Security Modules', percentage: 95, color: 'from-secondary to-primary' },
              { label: 'Database Sync', percentage: 98, color: 'from-primary via-secondary to-primary' },
              { label: 'Global Coverage', percentage: 100, color: 'from-accent to-secondary' },
            ].map((item, index) => (
              <div key={index} className="animate-slide-in-up" style={{animationDelay: `${0.1 * index}s`}}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{item.label}</span>
                  <span className="text-lg font-black text-primary">{item.percentage}%</span>
                </div>
                <div className="w-full h-3 bg-border/50 rounded-full overflow-hidden border border-border/30">
                  <div 
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full shadow-lg shadow-primary/50 animate-gradient-flow`}
                    style={{
                      width: `${item.percentage}%`,
                      animation: 'gradient-flow 3s ease infinite'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Animated Status Indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {[0, 1, 2, 3].map((dot) => (
              <div
                key={dot}
                className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse shadow-lg shadow-primary/50"
                style={{
                  animationDelay: `${dot * 0.15}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
          <p className="text-muted-foreground font-semibold">All systems operational • Uptime: 99.97%</p>
        </div>
      </section>

      {/* Premium Stats Section */}
      <section id="stats" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-r from-primary/15 via-background to-secondary/15 border-y border-primary/20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20 animate-slide-in-up">
        <h2 className="text-5xl md:text-6xl font-black mb-6">
          Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">VlaserStore</span>
        </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trusted by Cambodia's largest enterprises and organizations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              { icon: '🌟', number: '10K+', label: 'Happy Customers', color: 'from-primary' },
              { icon: '🔒', number: '150+', label: 'Countries Served', color: 'from-secondary' },
              { icon: '⏱️', number: '99.9%', label: 'System Uptime', color: 'from-accent' },
              { icon: '🚀', number: '24/7', label: 'Expert Support', color: 'from-primary' },
            ].map((stat, index) => (
              <div
                key={index}
                className="group relative animate-slide-in-up"
                style={{animationDelay: `${0.15 * index}s`}}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-300" />
                
                <div className="relative bg-card/60 backdrop-blur-xl border border-primary/30 hover:border-primary/80 rounded-2xl p-10 text-center transition-all duration-300 h-full flex flex-col justify-center items-center group-hover:shadow-2xl group-hover:shadow-primary/30 group-hover:scale-105">
                  <div className="text-5xl mb-4 group-hover:animate-icon-pop transition-all">{stat.icon}</div>
                  <div className="text-4xl font-black text-primary group-hover:text-secondary transition-colors mb-2">{stat.number}</div>
                  <div className="text-muted-foreground font-semibold">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Running Ticker */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-background to-secondary/20 border border-primary/30 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shine" />
            
            <div className="relative px-8 py-8">
              <p className="text-center text-xs font-bold text-primary mb-6 uppercase tracking-widest animate-slide-down-fade">
                Live Enterprise Deployments
              </p>
              
              <style>{`
                @keyframes ticker-scroll {
                  0% { transform: translateX(100%); }
                  100% { transform: translateX(-100%); }
                }
                .ticker-container {
                  display: flex;
                  gap: 4rem;
                  animation: ticker-scroll 25s linear infinite;
                  width: fit-content;
                }
                .ticker-container:hover {
                  animation-play-state: paused;
                }
              `}</style>
              
              <div className="overflow-hidden">
                <div className="ticker-container">
                  {[
                    '✓ FinanceGuard Inc - CCTV Network Active',
                    '✓ TechSecure Corp - AI Module Deployed',
                    '✓ GlobalProtect Ltd - Full Suite Live',
                    '✓ SecureFlow Systems - Integration 100%',
                    '✓ EnterpriseShield Co - Monitoring Active',
                    '✓ VisionTech Systems - Alerts Enabled',
                    '✓ FinanceGuard Inc - CCTV Network Active',
                  ].map((ticker, index) => (
                    <div key={index} className="flex-shrink-0 text-sm font-bold text-primary/90 whitespace-nowrap">
                      {ticker}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Running Carousel */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-in-up">
            <h2 className="text-5xl font-black mb-4">
              Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Industry Leaders</span>
            </h2>
            <p className="text-lg text-muted-foreground">Real results from real enterprises</p>
          </div>

          {/* Testimonials Carousel */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <style>{`
              @keyframes testimonials-scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(calc(-100% - 2rem)); }
              }
              .testimonials-carousel {
                display: flex;
                gap: 2rem;
                animation: testimonials-scroll 45s linear infinite;
                width: fit-content;
              }
              .testimonials-carousel:hover {
                animation-play-state: paused;
              }
            `}</style>
            
            <div className="overflow-hidden py-6">
              <div className="testimonials-carousel">
                {[
                  { name: 'John Kouprey', company: 'FinanceGuard Inc', text: 'VlaserStore transformed our security. Exceptional service!', rating: 5 },
                  { name: 'Sarah Mekong', company: 'Global Enterprises', text: 'Best investment in security infrastructure we\'ve made.', rating: 5 },
                  { name: 'Mike Chen', company: 'TechSecure Corp', text: 'Outstanding support team. Always responsive and professional.', rating: 5 },
                  { name: 'Emma Davis', company: 'SecureFlow Inc', text: '24/7 monitoring gives us complete peace of mind. Worth every penny!', rating: 5 },
                  { name: 'James Wilson', company: 'Future Systems', text: 'Seamless integration and professional deployment process.', rating: 5 },
                  { name: 'Lisa Anderson', company: 'Enterprise Shield', text: 'The best security solution in the market. Highly recommended!', rating: 5 },
                  { name: 'John Kouprey', company: 'FinanceGuard Inc', text: 'VlaserStore transformed our security. Exceptional service!', rating: 5 },
                ].map((testimonial, index) => (
                  <div key={index} className="flex-shrink-0 group w-96">
                    <div className="bg-card/70 backdrop-blur-xl border border-primary/40 hover:border-primary/80 rounded-2xl p-8 h-full hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:bg-card/90">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl group-hover:scale-110 transition-transform">
                          {testimonial.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{testimonial.name}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 min-h-[60px]">{testimonial.text}</p>
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className="text-amber-400 text-lg">★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Epic CTA Section */}
      <section id="contact" className="py-40 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 border-t border-primary/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="animate-slide-in-up mb-8 inline-block">
            <div className="px-6 py-3 rounded-full bg-primary/20 border border-primary/50 backdrop-blur-sm">
              <span className="text-primary text-sm font-bold uppercase tracking-wider">🚀 Ready to Secure Your Enterprise?</span>
            </div>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-black mb-8 animate-slide-in-up leading-tight" style={{animationDelay: '0.1s'}}>
            Start Your Security Journey <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Today</span>
          </h2>
          
        <p className="text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-slide-in-up" style={{animationDelay: '0.2s'}}>
          Join thousands of enterprises securing their operations with VlaserStore
        </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-in-up" style={{animationDelay: '0.3s'}}>
            <button className="group relative px-12 py-6 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-2xl font-black text-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/60 hover:scale-110 active:scale-95">
              <span className="relative z-10">Start Free Trial</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/30 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            </button>
            <button className="group relative px-12 py-6 border-3 border-primary text-primary rounded-2xl font-black text-xl hover:bg-primary/10 hover:border-secondary transition-all duration-300 hover:scale-105 active:scale-95">
              Schedule Demo Call
              <div className="absolute inset-0 border-3 border-primary rounded-2xl opacity-0 group-hover:animate-pulse-border" />
            </button>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="border-t border-primary/20 bg-gradient-to-b from-card/50 to-background py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-secondary/5 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="animate-slide-in-up">
              <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">V</div>
            <span className="font-black text-lg">VlaserStore</span>
              </div>
              <p className="text-muted-foreground">Enterprise security for the modern age</p>
            </div>
            {[
              { title: 'Products', links: ['CCTV Systems', 'Network Security', 'Alarm Systems', 'Monitoring Hub'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'News'] },
              { title: 'Support', links: ['Documentation', 'Help Center', 'Contact', 'Status'] },
            ].map((col, i) => (
              <div key={i} className="animate-slide-in-up" style={{animationDelay: `${0.1 * (i + 1)}s`}}>
                <h4 className="font-black mb-6">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <Link href="#" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-primary/20 pt-8 flex flex-col md:flex-row justify-between items-center animate-fade-in" style={{animationDelay: '0.5s'}}>
            <p className="text-muted-foreground text-sm font-semibold">© 2026 VlaserStore. All rights reserved. Based in Cambodia 🇰🇭</p>
            <div className="flex gap-8 mt-6 md:mt-0">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item, index) => (
                <Link key={index} href="#" className="text-muted-foreground hover:text-primary transition-all duration-300 text-sm font-semibold">
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
