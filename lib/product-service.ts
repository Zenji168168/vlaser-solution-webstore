import 'server-only'
import type { Product } from '@/lib/products-data'
import type { StorefrontProduct } from '@/lib/types/storefront-product'
import { unstable_cache } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache-helpers'

export type { StorefrontProduct }

export interface ProductQueryOptions {
  search?: string; category?: string; brand?: string; availability?: string;
  sort?: string; page?: number; pageSize?: number;
}

export interface PaginatedProducts {
  products: StorefrontProduct[]; total: number; page: number; pageSize: number; totalPages: number;
}

// === CONFIG ===
const DATA_SOURCE = process.env.PRODUCT_DATA_SOURCE || 'static'
const MAX_PAGE_SIZE = 48
const DEFAULT_PAGE_SIZE = 24
const STOREFRONT_IMAGE_CACHE_VERSION = 'storefront-images-v2'

function normalize(opts: ProductQueryOptions): ProductQueryOptions {
  return {
    search: (opts.search || '').trim() || undefined,
    category: opts.category && opts.category !== 'All' ? opts.category : undefined,
    brand: opts.brand && opts.brand !== 'All' ? opts.brand : undefined,
    availability: opts.availability || undefined,
    sort: ['name', 'price-asc', 'price-desc'].includes(opts.sort || '') ? opts.sort : 'name',
    page: Math.max(1, parseInt(String(opts.page)) || 1),
    pageSize: Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(String(opts.pageSize)) || DEFAULT_PAGE_SIZE)),
  }
}

function isDatabase(): boolean {
  return DATA_SOURCE === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)
}

// === STATIC IMPLEMENTATION ===
async function staticGetProducts(opts: ProductQueryOptions): Promise<PaginatedProducts> {
  const { products: allProducts, CATEGORIES, BRANDS } = await import('@/lib/products-data')
  const { search, category, brand, sort, page = 1, pageSize = DEFAULT_PAGE_SIZE } = opts
  let result = [...allProducts] as unknown as StorefrontProduct[]
  if (category) result = result.filter(p => p.category === category)
  if (brand) result = result.filter(p => p.brand === brand)
  if (search) { const q = search.toLowerCase(); result = result.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) }
  if (sort === 'price-asc') result.sort((a, b) => a.price - b.price)
  else if (sort === 'price-desc') result.sort((a, b) => b.price - a.price)
  else result.sort((a, b) => a.name.localeCompare(b.name))
  const total = result.length
  const totalPages = Math.ceil(total / pageSize)
  const products = result.slice((page - 1) * pageSize, page * pageSize)
  return { products, total, page, pageSize, totalPages }
}

async function staticGetProductById(publicId: string): Promise<StorefrontProduct | null> {
  const { products } = await import('@/lib/products-data')
  const p = products.find(p => p.id === publicId)
  return p ? (p as unknown as StorefrontProduct) : null
}

async function staticGetRelated(publicId: string, category: string, brand: string): Promise<StorefrontProduct[]> {
  const { products } = await import('@/lib/products-data')
  const { getRelatedProducts } = await import('@/lib/product-utils')
  const current = products.find(p => p.id === publicId)
  if (!current) return []
  return getRelatedProducts(current, products, 4) as unknown as StorefrontProduct[]
}

async function staticGetCategories(): Promise<string[]> {
  const { CATEGORIES } = await import('@/lib/products-data')
  return CATEGORIES
}

async function staticGetBrands(): Promise<string[]> {
  const { BRANDS } = await import('@/lib/products-data')
  return BRANDS
}

async function staticGetFeatured(limit: number): Promise<StorefrontProduct[]> {
  const { products } = await import('@/lib/products-data')
  return (products.filter(p => p.price >= 25 && p.price <= 400 && p.image.startsWith('http') && !p.image.includes('placehold')).slice(0, limit)) as unknown as StorefrontProduct[]
}

async function staticGetCategoryCounts(): Promise<Record<string, number>> {
  const { products, CATEGORIES } = await import('@/lib/products-data')
  const counts: Record<string, number> = {}
  CATEGORIES.filter(c => c !== 'All').forEach(c => {
    counts[c] = products.filter(p => p.category === c).length
  })
  return counts
}

async function staticGetProductCount(): Promise<number> {
  const { products } = await import('@/lib/products-data')
  return products.length
}

// === DATABASE IMPLEMENTATION ===
async function dbGetProducts(opts: ProductQueryOptions): Promise<PaginatedProducts> {
  const repo = await import('@/lib/repositories/product-repository')
  const { products, total } = await repo.getPublishedProducts({
    search: opts.search, category: opts.category, brand: opts.brand,
    sort: opts.sort, page: opts.page, perPage: opts.pageSize,
  })
  const pageSize = opts.pageSize || DEFAULT_PAGE_SIZE
  return { products, total, page: opts.page || 1, pageSize, totalPages: Math.ceil(total / pageSize) }
}

async function dbGetProductById(publicId: string): Promise<StorefrontProduct | null> {
  const repo = await import('@/lib/repositories/product-repository')
  return repo.getProductByPublicId(publicId)
}

async function dbGetRelated(publicId: string, category: string, brand: string): Promise<StorefrontProduct[]> {
  const repo = await import('@/lib/repositories/product-repository')
  return repo.getRelatedProducts(publicId, category, brand)
}

async function dbGetCategories(): Promise<string[]> {
  const repo = await import('@/lib/repositories/product-repository')
  return repo.getCategories()
}

async function dbGetBrands(): Promise<string[]> {
  const repo = await import('@/lib/repositories/product-repository')
  return repo.getBrands()
}

async function dbGetFeatured(limit: number): Promise<StorefrontProduct[]> {
  const repo = await import('@/lib/repositories/product-repository')
  const { products } = await repo.getPublishedProducts({ sort: 'name', page: 1, perPage: limit })
  return products
}

async function dbGetCategoryCounts(): Promise<Record<string, number>> {
  const repo = await import('@/lib/repositories/product-repository')
  return repo.getCategoryCounts()
}

async function dbGetProductCount(): Promise<number> {
  const repo = await import('@/lib/repositories/product-repository')
  return repo.getProductCount()
}

// === CACHED PUBLIC API WRAPPERS ===

const cachedGetProducts = unstable_cache(
  async (
    dataSource: string,
    search: string,
    category: string,
    brand: string,
    availability: string,
    sort: string,
    page: number,
    pageSize: number
  ) => {
    const opts = { search, category, brand, availability, sort, page, pageSize }
    if (dataSource === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)) {
      return dbGetProducts(opts)
    }
    return staticGetProducts(opts)
  },
  ['products-list', STOREFRONT_IMAGE_CACHE_VERSION],
  { tags: [CACHE_TAGS.products] }
)

const cachedGetCategories = unstable_cache(
  async (dataSource: string) => {
    if (dataSource === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)) {
      return dbGetCategories()
    }
    return staticGetCategories()
  },
  ['categories-list'],
  { tags: [CACHE_TAGS.categories] }
)

const cachedGetBrands = unstable_cache(
  async (dataSource: string) => {
    if (dataSource === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)) {
      return dbGetBrands()
    }
    return staticGetBrands()
  },
  ['brands-list'],
  { tags: [CACHE_TAGS.brands] }
)

const cachedGetFeaturedProducts = unstable_cache(
  async (dataSource: string, limit: number) => {
    if (dataSource === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)) {
      return dbGetFeatured(limit)
    }
    return staticGetFeatured(limit)
  },
  ['featured-list'],
  { tags: [CACHE_TAGS.homepageProducts] }
)

const cachedGetCategoryCounts = unstable_cache(
  async (dataSource: string) => {
    if (dataSource === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)) {
      return dbGetCategoryCounts()
    }
    return staticGetCategoryCounts()
  },
  ['category-counts'],
  { tags: [CACHE_TAGS.products] }
)

const cachedGetProductCount = unstable_cache(
  async (dataSource: string) => {
    if (dataSource === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)) {
      return dbGetProductCount()
    }
    return staticGetProductCount()
  },
  ['product-count'],
  { tags: [CACHE_TAGS.products] }
)

const productCacheMap = new Map<string, any>()
const relatedCacheMap = new Map<string, any>()
const batchCacheMap = new Map<string, any>()

// === PUBLIC API ===
export async function getProducts(opts: ProductQueryOptions = {}): Promise<PaginatedProducts> {
  const normalized = normalize(opts)
  if (process.env.NODE_ENV === 'test') {
    if (DATA_SOURCE === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)) {
      return dbGetProducts(normalized)
    }
    return staticGetProducts(normalized)
  }
  return cachedGetProducts(
    DATA_SOURCE,
    normalized.search || '',
    normalized.category || '',
    normalized.brand || '',
    normalized.availability || '',
    normalized.sort || '',
    normalized.page || 1,
    normalized.pageSize || 24
  )
}

export async function getProductById(publicId: string): Promise<StorefrontProduct | null> {
  if (!publicId) return null
  if (process.env.NODE_ENV === 'test') {
    return DATA_SOURCE === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)
      ? dbGetProductById(publicId)
      : staticGetProductById(publicId)
  }
  let cachedFn = productCacheMap.get(publicId)
  if (!cachedFn) {
    cachedFn = unstable_cache(
      async (dataSource: string, pid: string) => {
        const product = dataSource === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)
          ? await dbGetProductById(pid)
          : await staticGetProductById(pid)
        if (!product) {
          throw new Error('PRODUCT_NOT_FOUND')
        }
        return product
      },
      ['product', publicId, STOREFRONT_IMAGE_CACHE_VERSION],
      { tags: [CACHE_TAGS.product(publicId), CACHE_TAGS.products] }
    )
    productCacheMap.set(publicId, cachedFn)
  }
  try {
    return await cachedFn(DATA_SOURCE, publicId)
  } catch (err: any) {
    if (err.message === 'PRODUCT_NOT_FOUND') return null
    throw err
  }
}

export async function getRelatedProducts(publicId: string, category: string, brand: string, limit = 4): Promise<StorefrontProduct[]> {
  if (!publicId) return []
  if (process.env.NODE_ENV === 'test') {
    if (DATA_SOURCE === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)) {
      return dbGetRelated(publicId, category, brand)
    }
    return staticGetRelated(publicId, category, brand)
  }
  const cacheKey = `${publicId}:${category}:${brand}:${limit}`
  let cachedFn = relatedCacheMap.get(cacheKey)
  if (!cachedFn) {
    cachedFn = unstable_cache(
      async (dataSource: string, pid: string, cat: string, br: string, lim: number) => {
        if (dataSource === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)) {
          return dbGetRelated(pid, cat, br)
        }
        return staticGetRelated(pid, cat, br)
      },
      ['related', publicId, category, brand, String(limit), STOREFRONT_IMAGE_CACHE_VERSION],
      { tags: [CACHE_TAGS.related(publicId)] }
    )
    relatedCacheMap.set(cacheKey, cachedFn)
  }
  return cachedFn(DATA_SOURCE, publicId, category, brand, limit)
}

export async function getCategories(): Promise<string[]> {
  if (process.env.NODE_ENV === 'test') {
    return DATA_SOURCE === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)
      ? dbGetCategories()
      : staticGetCategories()
  }
  return cachedGetCategories(DATA_SOURCE)
}

export async function getBrands(): Promise<string[]> {
  if (process.env.NODE_ENV === 'test') {
    return DATA_SOURCE === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)
      ? dbGetBrands()
      : staticGetBrands()
  }
  return cachedGetBrands(DATA_SOURCE)
}

export async function getFeaturedProducts(limit = 8): Promise<StorefrontProduct[]> {
  if (process.env.NODE_ENV === 'test') {
    return DATA_SOURCE === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)
      ? dbGetFeatured(limit)
      : staticGetFeatured(limit)
  }
  return cachedGetFeaturedProducts(DATA_SOURCE, limit)
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  if (process.env.NODE_ENV === 'test') {
    return DATA_SOURCE === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)
      ? dbGetCategoryCounts()
      : staticGetCategoryCounts()
  }
  return cachedGetCategoryCounts(DATA_SOURCE)
}

export async function getProductCount(): Promise<number> {
  if (process.env.NODE_ENV === 'test') {
    return DATA_SOURCE === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)
      ? dbGetProductCount()
      : staticGetProductCount()
  }
  return cachedGetProductCount(DATA_SOURCE)
}

export function getDataSource(): string { return DATA_SOURCE }

export async function getProductsByIds(ids: string[]): Promise<StorefrontProduct[]> {
  if (!ids || ids.length === 0) return []
  const safeIds = [...new Set(ids)].slice(0, 10)
  if (safeIds.length === 0) return []
  if (process.env.NODE_ENV === 'test') {
    if (DATA_SOURCE === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)) {
      const repo = await import('@/lib/repositories/product-repository')
      return repo.getProductsByIds(safeIds)
    }
    const { products } = await import('@/lib/products-data')
    return safeIds.map(id => products.find(p => p.id === id)).filter(Boolean) as unknown as StorefrontProduct[]
  }
  const cacheKey = [...safeIds].sort().join(',')
  let cachedFn = batchCacheMap.get(cacheKey)
  if (!cachedFn) {
    cachedFn = unstable_cache(
      async (dataSource: string, batchIds: string[]) => {
        if (dataSource === 'database' && !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)) {
          const repo = await import('@/lib/repositories/product-repository')
          return repo.getProductsByIds(batchIds)
        }
        const { products } = await import('@/lib/products-data')
        return batchIds.map(id => products.find(p => p.id === id)).filter(Boolean) as unknown as StorefrontProduct[]
      },
      ['products-by-ids', cacheKey, STOREFRONT_IMAGE_CACHE_VERSION],
      { tags: [CACHE_TAGS.productsByIds] }
    )
    batchCacheMap.set(cacheKey, cachedFn)
  }
  return cachedFn(DATA_SOURCE, safeIds)
}
