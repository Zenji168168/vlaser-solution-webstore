import { products as staticProducts, CATEGORIES as staticCategories, BRANDS as staticBrands } from '@/lib/products-data'
import type { StorefrontProduct } from '@/lib/repositories/product-repository'

// Data source configuration
const DATA_SOURCE = process.env.PRODUCT_DATA_SOURCE || 'static'

function isDatabase(): boolean {
  return DATA_SOURCE === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)
}

export type { StorefrontProduct }

export async function getProducts(filters: {
  search?: string; category?: string; brand?: string; sort?: string; page?: number; perPage?: number;
} = {}): Promise<{ products: StorefrontProduct[]; total: number }> {
  if (isDatabase()) {
    const repo = await import('@/lib/repositories/product-repository')
    return repo.getPublishedProducts(filters)
  }
  // Static fallback
  const { search, category, brand, sort = 'name', page = 1, perPage = 24 } = filters
  let result = [...staticProducts] as StorefrontProduct[]
  if (category && category !== 'All') result = result.filter(p => p.category === category)
  if (brand && brand !== 'All') result = result.filter(p => p.brand === brand)
  if (search) { const q = search.toLowerCase(); result = result.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) }
  if (sort === 'price-asc') result.sort((a, b) => a.price - b.price)
  else if (sort === 'price-desc') result.sort((a, b) => b.price - a.price)
  else result.sort((a, b) => a.name.localeCompare(b.name))
  const total = result.length
  const products = result.slice((page - 1) * perPage, page * perPage)
  return { products, total }
}

export async function getProductById(publicId: string): Promise<StorefrontProduct | null> {
  if (isDatabase()) {
    const repo = await import('@/lib/repositories/product-repository')
    return repo.getProductByPublicId(publicId)
  }
  const p = staticProducts.find(p => p.id === publicId)
  return p ? p as StorefrontProduct : null
}

export async function getRelatedProductsForProduct(publicId: string, category: string, brand: string): Promise<StorefrontProduct[]> {
  if (isDatabase()) {
    const repo = await import('@/lib/repositories/product-repository')
    return repo.getRelatedProducts(publicId, category, brand)
  }
  // Static fallback with relevance scoring
  const { getRelatedProducts } = await import('@/lib/product-utils')
  const current = staticProducts.find(p => p.id === publicId)
  if (!current) return []
  return getRelatedProducts(current, staticProducts, 4) as StorefrontProduct[]
}

export async function getCategories(): Promise<string[]> {
  if (isDatabase()) {
    const repo = await import('@/lib/repositories/product-repository')
    return repo.getCategories()
  }
  return staticCategories
}

export async function getBrands(): Promise<string[]> {
  if (isDatabase()) {
    const repo = await import('@/lib/repositories/product-repository')
    return repo.getBrands()
  }
  return staticBrands
}

export function getDataSource(): string { return DATA_SOURCE }
