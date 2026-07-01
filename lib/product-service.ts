import type { Product } from '@/lib/products-data'

// === TYPES ===
export interface StorefrontProduct {
  id: string; sku: string; name: string; description: string;
  price: number; brand: string; category: string; status: string; qty: number; image: string;
}

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

// === PUBLIC API ===
export async function getProducts(opts: ProductQueryOptions = {}): Promise<PaginatedProducts> {
  const normalized = normalize(opts)
  if (isDatabase()) return dbGetProducts(normalized)
  return staticGetProducts(normalized)
}

export async function getProductById(publicId: string): Promise<StorefrontProduct | null> {
  if (isDatabase()) return dbGetProductById(publicId)
  return staticGetProductById(publicId)
}

export async function getRelatedProducts(publicId: string, category: string, brand: string, limit = 4): Promise<StorefrontProduct[]> {
  if (isDatabase()) return dbGetRelated(publicId, category, brand)
  return staticGetRelated(publicId, category, brand)
}

export async function getCategories(): Promise<string[]> {
  if (isDatabase()) return dbGetCategories()
  return staticGetCategories()
}

export async function getBrands(): Promise<string[]> {
  if (isDatabase()) return dbGetBrands()
  return staticGetBrands()
}

export async function getFeaturedProducts(limit = 8): Promise<StorefrontProduct[]> {
  if (isDatabase()) return dbGetFeatured(limit)
  return staticGetFeatured(limit)
}

export function getDataSource(): string { return DATA_SOURCE }
