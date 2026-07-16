'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/components/app-context'
import type { StorefrontProduct } from '@/lib/types/storefront-product'

function stockLabel(product: StorefrontProduct, t: (en: string, km: string) => string) {
  if (product.status === 'Out of Stock') return { text: t('Sold out', 'អស់ពីស្តុក'), className: 'badge-danger' }
  if (product.status === 'Low Stock') return { text: t('Low stock', 'ស្តុកតិច'), className: 'badge-warning' }
  if (product.status === 'Available' && product.qty > 0) return { text: t('Available', 'មាន'), className: 'badge-success' }
  return { text: t('Available', 'មាន'), className: 'badge-info' }
}

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const { formatPrice, t } = useApp()
  const stock = stockLabel(product, t)
  const [imageSrc, setImageSrc] = useState(product.image || '/placeholder.svg')

  useEffect(() => {
    setImageSrc(product.image || '/placeholder.svg')
  }, [product.id, product.image])

  return (
    <article className="group h-full min-w-0 animate-fade-up">
      <Link href={`/products/${product.id}`} className="card flex h-full min-w-0 flex-col focus-ring bg-white" aria-label={`${t('View details for', 'មើលព័ត៌មាន')} ${product.name}`}>
        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#fafafa_0%,#f2f2f1_100%)] p-4 sm:p-5">
          <div className="absolute inset-x-6 bottom-3 h-10 rounded-full bg-black/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
          <img
            src={imageSrc}
            alt={product.name}
            className="relative max-h-full max-w-full object-contain transition-transform duration-300 ease-[var(--ease-store)] group-hover:scale-[1.04]"
            loading="lazy"
            onError={() => { if (imageSrc !== '/placeholder.svg') setImageSrc('/placeholder.svg') }}
          />
          <span className={`badge ${stock.className} absolute left-3 top-3 shadow-sm`}>{stock.text}</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-3.5 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)]">{product.brand}</span>
            <span className="shrink-0 rounded-full bg-stone-100 px-2 py-1 text-[10px] font-mono text-gray-500">{product.sku.slice(0, 12)}</span>
          </div>

          <h3 className="mt-2 min-h-[4.15rem] text-sm font-black leading-snug text-[var(--color-ink)] line-clamp-3 transition-colors duration-200 group-hover:text-[var(--color-primary)] [overflow-wrap:anywhere]">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs font-medium text-gray-500">{product.category}</p>

          <div className="mt-auto pt-4">
            <div className="flex items-end justify-between gap-2">
              <span className="text-lg font-black text-[var(--color-ink)]">{formatPrice(product.price)}</span>
              <span className="hidden text-[11px] font-bold text-gray-500 sm:inline">{t('Details', 'លម្អិត')}</span>
            </div>
            <div className="mt-3">
              <span className="inline-flex min-h-10 w-full min-w-0 items-center justify-center rounded-xl bg-[var(--color-ink)] px-2 text-center text-xs font-bold text-white transition-all duration-200 group-hover:bg-[var(--color-primary)] group-hover:shadow-md sm:px-3">
                {t('View Details', 'មើលលម្អិត')}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
