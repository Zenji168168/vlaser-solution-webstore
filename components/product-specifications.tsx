'use client'

import { useApp } from '@/components/app-context'
import { cleanText } from '@/lib/product-utils'

interface Props {
  brand: string
  category: string
  sku: string
  status: string
  qty: number
  description: string
}

const LABELS: Record<string, { en: string; km: string }> = {
  brand: { en: 'Brand', km: 'ម៉ាក' },
  category: { en: 'Category', km: 'ប្រភេទ' },
  sku: { en: 'SKU', km: 'SKU' },
  status: { en: 'Availability', km: 'ស្ថានភាព' },
  stock: { en: 'Stock', km: 'ស្តុក' },
}

export function ProductSpecifications({ brand, category, sku, status, qty, description }: Props) {
  const { t, lang } = useApp()

  const specs = [
    { key: 'brand', value: brand },
    { key: 'category', value: category },
    { key: 'sku', value: sku },
    { key: 'status', value: status === 'Price List' ? t('Available to Order', 'អាចបញ្ជាទិញបាន') : status === 'Available' ? t('In Stock', 'មានក្នុងស្តុក') : status === 'Out of Stock' ? t('Out of Stock', 'អស់ពីស្តុក') : status },
    { key: 'stock', value: qty > 0 ? `${qty} ${t('units', 'គ្រឿង')}` : t('On order', 'បញ្ជាទិញ') },
  ]

  return (
    <div className="surface-panel overflow-hidden rounded-[1.5rem]">
      <div className="border-b border-black/[0.06] bg-stone-50 px-5 py-4">
        <p className="section-eyebrow">Product data</p>
        <h3 className="mt-1 text-base font-black text-gray-950">{t('Specifications', 'លក្ខណៈបច្ចេកទេស')}</h3>
      </div>
      <div className="divide-y divide-black/[0.06]">
        {specs.map(({ key, value }) => (
          <div key={key} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
            <span className="text-gray-500">{LABELS[key]?.[lang] || key}</span>
            <span className="font-bold text-gray-950 text-right max-w-[60%] truncate">{cleanText(value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
