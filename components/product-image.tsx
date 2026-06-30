'use client'

export function ProductImage({ src, name, brand, category, className = '' }: { src: string; name: string; brand: string; category: string; className?: string }) {
  if (src) {
    return (
      <img 
        src={src} 
        alt={name} 
        className={`w-full h-full object-cover ${className}`}
        loading="lazy"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden') }}
      />
    )
  }

  // Beautiful gradient placeholder with brand initial and category icon
  const icon = category === 'CCTV' ? '📹' : category === 'Access Control' ? '🔐' : category === 'Network' ? '🌐' : category === 'Alarm System' ? '🚨' : category === 'Attendance' ? '⏰' : category === 'Accessories' ? '🔧' : category === 'Audio / PA System' ? '🔊' : category === 'Cabinet' ? '🗄️' : category === 'Smart Lock' ? '🔒' : '📦'
  
  const colors: Record<string, string> = {
    'Hikvision': 'from-red-950/80 to-zinc-900',
    'UNV': 'from-blue-950/80 to-zinc-900',
    'ZKTeco': 'from-green-950/80 to-zinc-900',
    'EZVIZ': 'from-orange-950/80 to-zinc-900',
    'HUAWEI': 'from-red-950/60 to-zinc-900',
    'Watashi': 'from-purple-950/80 to-zinc-900',
    'ITC': 'from-cyan-950/80 to-zinc-900',
    'Toten': 'from-amber-950/80 to-zinc-900',
    'ATECH': 'from-emerald-950/80 to-zinc-900',
  }
  const bg = colors[brand] || 'from-zinc-800 to-zinc-900'

  return (
    <div className={`w-full h-full bg-gradient-to-br ${bg} flex flex-col items-center justify-center gap-2 p-4`}>
      <span className="text-3xl opacity-80">{icon}</span>
      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-center">{brand}</span>
      <span className="text-[9px] text-white/20 text-center line-clamp-1 max-w-[80%]">{name.substring(0, 30)}</span>
    </div>
  )
}
