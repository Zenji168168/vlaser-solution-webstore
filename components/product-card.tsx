'use client'

import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { useApp } from '@/components/app-context'
import type { StorefrontProduct } from '@/lib/types/storefront-product'

function stockLabel(product: StorefrontProduct, t: (en: string, km: string) => string) {
  if (product.status === 'Out of Stock') return { text: t('Sold out', 'អស់ពីស្តុក'), className: 'badge-danger' }
  if (product.status === 'Low Stock') return { text: t('Low stock', 'ស្តុកតិច'), className: 'badge-warning' }
  if (product.status === 'Available' && product.qty > 0) return { text: t(`${product.qty} in stock`, `មាន ${product.qty}`), className: 'badge-success' }
  return { text: t('Available', 'មាន'), className: 'badge-info' }
}

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const { formatPrice, t } = useApp()
  const stock = stockLabel(product, t)

  return (
    <article className="group h-full min-w-0">
      <Link href={`/products/${product.id}`} className="card flex h-full min-w-0 flex-col focus-ring" aria-label={`${t('View details for', 'មើលព័ត៌មាន')} ${product.name}`}>
        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gray-50 p-3 sm:p-4">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain transition-transform duration-300 ease-[var(--ease-store)] group-hover:scale-[1.035]"
            loading="lazy"
            onError={(event) => { (event.currentTarget as HTMLImageElement).src = '/placeholder.svg' }}
          />
          <span className={`badge ${stock.className} absolute left-2 top-2 shadow-sm`}>{stock.text}</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)]">{product.brand}</span>
            <span className="shrink-0 rounded-full bg-gray-50 px-2 py-1 text-[10px] font-mono text-gray-500">{product.sku.slice(0, 12)}</span>
          </div>

          <h3 className="mt-2 min-h-[2.65rem] text-sm font-bold leading-snug text-gray-950 line-clamp-2 transition-colors duration-200 group-hover:text-[var(--color-primary)] [overflow-wrap:anywhere]">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-gray-500">{product.category}</p>

          <div className="mt-auto pt-4">
            <div className="flex items-end justify-between gap-2">
              <span className="text-base font-black text-gray-950">{formatPrice(product.price)}</span>
              <span className="hidden text-[11px] font-semibold text-gray-400 sm:inline">{t('Details', 'លម្អិត')}</span>
            </div>
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <span className="inline-flex min-h-10 min-w-0 items-center justify-center rounded-xl bg-gray-950 px-2 text-center text-xs font-bold text-white transition-colors duration-200 group-hover:bg-[var(--color-primary)] sm:px-3">
                {t('View Details', 'មើលលម្អិត')}
              </span>
              <span className="inline-flex min-h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-[var(--color-primary)] transition-colors duration-200 group-hover:border-red-100 group-hover:bg-red-50" aria-hidden="true">
                <MessageCircle className="size-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
