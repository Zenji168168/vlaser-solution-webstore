import 'server-only'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, ilike, or, and, desc, asc, sql, ne, count } from 'drizzle-orm'
import * as schema from '@/db/schema'
import type { StorefrontProduct } from '@/lib/types/storefront-product'

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('DATABASE_URL not configured')
  return drizzle(neon(url), { schema })
}

interface ProductFilters {
  search?: string
  category?: string
  brand?: string
  sort?: string
  page?: number
  perPage?: number
}

export async function getPublishedProducts(filters: ProductFilters = {}): Promise<{ products: StorefrontProduct[]; total: number }> {
  const db = getDb()
  const { search, category, brand, sort = 'name', page = 1, perPage = 24 } = filters
  const offset = (page - 1) * perPage

  // Build conditions
  const conditions = [eq(schema.products.published, true), eq(schema.products.archived, false)]
  
  if (category && category !== 'All') {
    const cat = await db.select().from(schema.categories).where(eq(schema.categories.nameEn, category)).limit(1)
    if (cat.length > 0) conditions.push(eq(schema.products.categoryId, cat[0].id))
  }
  if (brand && brand !== 'All') {
    const br = await db.select().from(schema.brands).where(eq(schema.brands.name, brand)).limit(1)
    if (br.length > 0) conditions.push(eq(schema.products.brandId, br[0].id))
  }
  if (search) {
    const term = `%${search}%`
    conditions.push(or(
      ilike(schema.products.nameEn, term),
      ilike(schema.products.sku, term),
      ilike(schema.products.descEn, term),
    )!)
  }

  const where = and(...conditions)

  // Sort
  let orderBy
  if (sort === 'price-asc') orderBy = asc(schema.products.price)
  else if (sort === 'price-desc') orderBy = desc(schema.products.price)
  else orderBy = asc(schema.products.nameEn)

  // Count
  const [{ value: total }] = await db.select({ value: count() }).from(schema.products).where(where)

  // Fetch products with joins
  const rows = await db.select({
    publicId: schema.products.publicId,
    sku: schema.products.sku,
    nameEn: schema.products.nameEn,
    descEn: schema.products.descEn,
    price: schema.products.price,
    stockQty: schema.products.stockQty,
    stockStatus: schema.products.stockStatus,
    brandName: schema.brands.name,
    categoryName: schema.categories.nameEn,
  })
    .from(schema.products)
    .leftJoin(schema.brands, eq(schema.products.brandId, schema.brands.id))
    .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .where(where)
    .orderBy(orderBy)
    .limit(perPage)
    .offset(offset)

  // Get images for these products
  const publicIds = rows.map(r => r.publicId)
  const images = publicIds.length > 0
    ? await db.select().from(schema.productImages).where(and(eq(schema.productImages.isPrimary, true)))
    : []

  // Get product IDs to match images
  const productIdMap = new Map<number, string>()
  if (publicIds.length > 0) {
    const prods = await db.select({ id: schema.products.id, publicId: schema.products.publicId }).from(schema.products).where(
      or(...publicIds.map(pid => eq(schema.products.publicId, pid)))!
    )
    prods.forEach(p => productIdMap.set(p.id, p.publicId))
  }

  const imageMap = new Map<string, string>()
  images.forEach(img => {
    const pid = productIdMap.get(img.productId)
    if (pid && !imageMap.has(pid)) imageMap.set(pid, img.url)
  })

  const products: StorefrontProduct[] = rows.map(r => ({
    id: r.publicId,
    sku: r.sku,
    name: r.nameEn || r.sku,
    description: r.descEn || '',
    price: parseFloat(r.price) || 0,
    brand: r.brandName || 'N/A',
    category: r.categoryName || 'Other',
    status: r.stockStatus || 'Price List',
    qty: r.stockQty || 0,
    image: imageMap.get(r.publicId) || '/placeholder.svg',
  }))

  return { products, total: Number(total) }
}

export async function getProductByPublicId(publicId: string): Promise<StorefrontProduct | null> {
  const db = getDb()
  const rows = await db.select({
    publicId: schema.products.publicId,
    sku: schema.products.sku,
    nameEn: schema.products.nameEn,
    descEn: schema.products.descEn,
    price: schema.products.price,
    stockQty: schema.products.stockQty,
    stockStatus: schema.products.stockStatus,
    brandName: schema.brands.name,
    categoryName: schema.categories.nameEn,
  })
    .from(schema.products)
    .leftJoin(schema.brands, eq(schema.products.brandId, schema.brands.id))
    .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .where(and(eq(schema.products.publicId, publicId), eq(schema.products.published, true)))
    .limit(1)

  if (rows.length === 0) return null
  const r = rows[0]

  // Get image
  const prod = await db.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.publicId, publicId)).limit(1)
  let imageUrl = '/placeholder.svg'
  if (prod.length > 0) {
    const imgs = await db.select().from(schema.productImages).where(and(eq(schema.productImages.productId, prod[0].id), eq(schema.productImages.isPrimary, true))).limit(1)
    if (imgs.length > 0) imageUrl = imgs[0].url
  }

  return {
    id: r.publicId,
    sku: r.sku,
    name: r.nameEn || r.sku,
    description: r.descEn || '',
    price: parseFloat(r.price) || 0,
    brand: r.brandName || 'N/A',
    category: r.categoryName || 'Other',
    status: r.stockStatus || 'Price List',
    qty: r.stockQty || 0,
    image: imageUrl,
  }
}

export async function getRelatedProducts(publicId: string, category: string, brand: string, limit = 4): Promise<StorefrontProduct[]> {
  const db = getDb()
  const cat = await db.select().from(schema.categories).where(eq(schema.categories.nameEn, category)).limit(1)
  if (cat.length === 0) return []

  const rows = await db.select({
    publicId: schema.products.publicId,
    sku: schema.products.sku,
    nameEn: schema.products.nameEn,
    descEn: schema.products.descEn,
    price: schema.products.price,
    stockQty: schema.products.stockQty,
    stockStatus: schema.products.stockStatus,
    brandName: schema.brands.name,
    categoryName: schema.categories.nameEn,
  })
    .from(schema.products)
    .leftJoin(schema.brands, eq(schema.products.brandId, schema.brands.id))
    .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .where(and(
      eq(schema.products.published, true),
      eq(schema.products.archived, false),
      ne(schema.products.publicId, publicId),
      eq(schema.products.categoryId, cat[0].id),
    ))
    .limit(limit)

  return rows.map(r => ({
    id: r.publicId,
    sku: r.sku,
    name: r.nameEn || r.sku,
    description: r.descEn || '',
    price: parseFloat(r.price) || 0,
    brand: r.brandName || 'N/A',
    category: r.categoryName || 'Other',
    status: r.stockStatus || 'Price List',
    qty: r.stockQty || 0,
    image: '/placeholder.svg',
  }))
}

export async function getCategories(): Promise<string[]> {
  const db = getDb()
  const rows = await db.select({ name: schema.categories.nameEn }).from(schema.categories).where(eq(schema.categories.active, true)).orderBy(asc(schema.categories.nameEn))
  return ['All', ...rows.map(r => r.name)]
}

export async function getBrands(): Promise<string[]> {
  const db = getDb()
  const rows = await db.select({ name: schema.brands.name }).from(schema.brands).where(eq(schema.brands.active, true)).orderBy(asc(schema.brands.name))
  return ['All', ...rows.map(r => r.name)]
}

export async function validateDatabase(): Promise<{ valid: boolean; counts: Record<string, number>; issues: string[] }> {
  const db = getDb()
  const issues: string[] = []
  const [prodCount] = await db.select({ value: count() }).from(schema.products)
  const [catCount] = await db.select({ value: count() }).from(schema.categories)
  const [brandCount] = await db.select({ value: count() }).from(schema.brands)
  const [imgCount] = await db.select({ value: count() }).from(schema.productImages)

  const counts = {
    products: Number(prodCount.value),
    categories: Number(catCount.value),
    brands: Number(brandCount.value),
    images: Number(imgCount.value),
  }

  if (counts.products < 1380) issues.push(`Expected ~1382 products, found ${counts.products}`)
  if (counts.categories < 9) issues.push(`Expected ~10 categories, found ${counts.categories}`)
  if (counts.brands < 14) issues.push(`Expected ~15 brands, found ${counts.brands}`)

  return { valid: issues.length === 0, counts, issues }
}

export async function getProductsByIds(ids: string[]): Promise<StorefrontProduct[]> {
  if (!ids.length) return []
  const db = getDb()
  // Build IN clause with individual conditions
  const conditions = ids.map(id => eq(schema.products.publicId, id))
  const rows = await db.select({
    id: schema.products.id,
    publicId: schema.products.publicId,
    sku: schema.products.sku,
    nameEn: schema.products.nameEn,
    descEn: schema.products.descEn,
    price: schema.products.price,
    stockQty: schema.products.stockQty,
    stockStatus: schema.products.stockStatus,
    brandName: schema.brands.name,
    categoryName: schema.categories.nameEn,
  })
    .from(schema.products)
    .leftJoin(schema.brands, eq(schema.products.brandId, schema.brands.id))
    .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .where(and(eq(schema.products.published, true), eq(schema.products.archived, false), or(...conditions)!))
    .limit(10)

  // Get images for these products
  const internalIds = rows.map(r => r.id)
  const imageMap = new Map<number, string>()
  if (internalIds.length > 0) {
    const images = await db.select({
      productId: schema.productImages.productId,
      url: schema.productImages.url,
    })
      .from(schema.productImages)
      .where(and(
        eq(schema.productImages.isPrimary, true),
        or(...internalIds.map(iid => eq(schema.productImages.productId, iid)))!
      ))
    images.forEach(img => {
      imageMap.set(img.productId, img.url)
    })
  }

  // Preserve caller order
  const map = new Map(rows.map(r => [r.publicId, r]))
  return ids.map(id => {
    const r = map.get(id)
    if (!r) return null
    return {
      id: r.publicId, sku: r.sku, name: r.nameEn || r.sku, description: r.descEn || '',
      price: parseFloat(r.price) || 0, brand: r.brandName || 'N/A', category: r.categoryName || 'Other',
      status: r.stockStatus || 'Price List', qty: r.stockQty || 0, image: imageMap.get(r.id) || '/placeholder.svg',
    } as StorefrontProduct
  }).filter(Boolean) as StorefrontProduct[]
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const db = getDb()
  const rows = await db.select({
    categoryName: schema.categories.nameEn,
    count: count(schema.products.id),
  })
    .from(schema.products)
    .innerJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .where(and(eq(schema.products.published, true), eq(schema.products.archived, false)))
    .groupBy(schema.categories.nameEn)

  const counts: Record<string, number> = {}
  rows.forEach(r => {
    if (r.categoryName) {
      counts[r.categoryName] = Number(r.count)
    }
  })
  return counts
}

export async function getProductCount(): Promise<number> {
  const db = getDb()
  const [{ value }] = await db.select({ value: count() })
    .from(schema.products)
    .where(and(eq(schema.products.published, true), eq(schema.products.archived, false)))
  return Number(value)
}
