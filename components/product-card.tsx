'use client'

import Link from 'next/link'
import { useApp } from '@/components/app-context'
import type { Product } from '@/lib/products-data'

export function ProductCard({ product }: { product: Product }) {
  const { formatPrice } = useApp()

  return (
    <Link href={`/products/${product.id}`} className="block h-full">
      <div className="card h-full flex flex-col group">
        {/* Image */}
        <div className="aspect-square bg-gray-50 overflow-hidden relative flex items-center justify-center p-4">
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
          />
          {/* Status badge */}
          {product.status === 'Available' && product.qty > 0 && (
            <span className="absolute top-2 left-2 badge badge-success">{product.qty} in stock</span>
          )}
          {product.status === 'Out of Stock' && (
            <span className="absolute top-2 left-2 badge badge-danger">Sold out</span>
          )}
          {product.status === 'Low Stock' && (
            <span className="absolute top-2 left-2 badge badge-warning">Low stock</span>
          )}
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4 flex-grow flex flex-col">
          <span className="text-[10px] font-semibold text-[var(--color-primary)] uppercase tracking-wider">{product.brand}</span>
          <h3 className="text-sm font-medium text-gray-800 mt-1 line-clamp-2 leading-snug group-hover:text-[var(--color-primary)] transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1 hidden sm:block">{product.category}</p>
          <div className="mt-auto pt-3 flex items-baseline justify-between">
            <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
            <span className="text-[10px] text-gray-400 font-mono">{product.sku.substring(0, 12)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
