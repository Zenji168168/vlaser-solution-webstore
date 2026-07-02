'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Boxes, Building2, FolderTree, Home, ImageIcon, LogOut, Menu, Settings, ShieldCheck, X } from 'lucide-react'
import { signOutAdmin } from '@/app/admin/actions'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/products', label: 'Products', icon: Boxes },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree, disabled: true },
  { href: '/admin/brands', label: 'Brands', icon: Building2, disabled: true },
  { href: '/admin/media', label: 'Media', icon: ImageIcon, disabled: true },
  { href: '/admin/settings', label: 'Settings', icon: Settings, disabled: true },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-full flex-col bg-slate-950 text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/admin" onClick={onNavigate} className="flex items-center gap-3 rounded-lg focus-ring">
          <span className="grid size-10 place-items-center rounded-lg bg-cyan-500 text-slate-950">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-black tracking-wide">Vlaser Admin</span>
            <span className="block text-xs text-slate-400">Secure catalog operations</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Admin navigation">
        {navItems.map(item => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`))
          if (item.disabled) {
            return (
              <div key={item.href} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-slate-500" aria-disabled="true">
                <Icon className="size-4" aria-hidden="true" />
                <span>{item.label}</span>
                <span className="ml-auto rounded bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide">Soon</span>
              </div>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors focus-ring',
                active ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-3">
        <Link href="/" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white focus-ring">
          <Home className="size-4" aria-hidden="true" />
          View Store
        </Link>
        <form action={signOutAdmin}>
          <button type="submit" className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white focus-ring">
            <LogOut className="size-4" aria-hidden="true" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}

export function AdminShell({ children, adminName }: { children: React.ReactNode; adminName: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <button type="button" className="absolute inset-0 bg-slate-950/55" onClick={() => setOpen(false)} aria-label="Close navigation overlay" />
          <div className="absolute inset-y-0 left-0 w-[min(86vw,320px)] shadow-2xl">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <button type="button" onClick={() => setOpen(true)} className="tap-target inline-flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden focus-ring" aria-label="Open admin navigation">
              <Menu className="size-5" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin Console</p>
              <p className="truncate text-sm font-bold text-slate-950">{adminName}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="hidden tap-target items-center justify-center rounded-lg text-slate-500" aria-label="Close">
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
