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

interface ProductStorefrontRow {
  id?: number
  publicId: string
  sku: string
  nameEn: string | null
  descEn: string | null
  price: string
  stockQty: number | null
  stockStatus: string | null
  brandName: string | null
  categoryName: string | null
}

interface ProductImageRow {
  productId: number
  url: string
  isPrimary: boolean | null
  sortOrder: number | null
  id?: number
}

export function selectPreferredProductImages(images: ProductImageRow[]): Map<number, string> {
  const imageMap = new Map<number, string>()
  const sorted = [...images].sort((a, b) => {
    if (Boolean(a.isPrimary) !== Boolean(b.isPrimary)) return Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary))
    if ((a.sortOrder || 0) !== (b.sortOrder || 0)) return (a.sortOrder || 0) - (b.sortOrder || 0)
    return (a.id || 0) - (b.id || 0)
  })

  sorted.forEach(image => {
    if (image.url && !imageMap.has(image.productId)) imageMap.set(image.productId, image.url)
  })

  return imageMap
}

export function mapProductRowToStorefront(row: ProductStorefrontRow, imageUrl?: string): StorefrontProduct {
  return {
    id: row.publicId,
    sku: row.sku,
    name: row.nameEn || row.sku,
    description: row.descEn || '',
    price: parseFloat(row.price) || 0,
    brand: row.brandName || 'N/A',
    category: row.categoryName || 'Other',
    status: row.stockStatus || 'Price List',
    qty: row.stockQty || 0,
    image: imageUrl || '/placeholder.svg',
  }
}

export function prepareRelatedProductRows<T extends ProductStorefrontRow & { id: number }>(
  rows: T[],
  currentPublicId: string,
  limit: number
): T[] {
  return rows.filter(row => row.publicId !== currentPublicId).slice(0, limit)
}

async function getImageMapForProductIds(db: ReturnType<typeof getDb>, productIds: number[]): Promise<Map<number, string>> {
  if (productIds.length === 0) return new Map()

  const images = await db.select({
    id: schema.productImages.id,
    productId: schema.productImages.productId,
    url: schema.productImages.url,
    isPrimary: schema.productImages.isPrimary,
    sortOrder: schema.productImages.sortOrder,
  })
    .from(schema.productImages)
    .where(or(...productIds.map(id => eq(schema.productImages.productId, id)))!)
    .orderBy(desc(schema.productImages.isPrimary), asc(schema.productImages.sortOrder), asc(schema.productImages.id))

  return selectPreferredProductImages(images)
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
    .where(where)
    .orderBy(orderBy)
    .limit(perPage)
    .offset(offset)

  const imageMap = await getImageMapForProductIds(db, rows.map(r => r.id))
  const products = rows.map(r => mapProductRowToStorefront(r, imageMap.get(r.id)))

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

  const prod = await db.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.publicId, publicId)).limit(1)
  const imageMap = await getImageMapForProductIds(db, prod.map(p => p.id))

  return mapProductRowToStorefront(r, prod[0] ? imageMap.get(prod[0].id) : undefined)
}

export async function getRelatedProducts(publicId: string, category: string, brand: string, limit = 4): Promise<StorefrontProduct[]> {
  const db = getDb()
  const cat = await db.select().from(schema.categories).where(eq(schema.categories.nameEn, category)).limit(1)
  if (cat.length === 0) return []

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
    .where(and(
      eq(schema.products.published, true),
      eq(schema.products.archived, false),
      ne(schema.products.publicId, publicId),
      eq(schema.products.categoryId, cat[0].id),
    ))
    .orderBy(
      sql`CASE WHEN ${schema.brands.name} = ${brand} THEN 0 ELSE 1 END`,
      asc(schema.products.nameEn)
    )
    .limit(limit)

  const relatedRows = prepareRelatedProductRows(rows, publicId, limit)
  const imageMap = await getImageMapForProductIds(db, relatedRows.map(r => r.id))

  return relatedRows.map(r => mapProductRowToStorefront(r, imageMap.get(r.id)))
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

export async function validateDatabase(): Promise<{
  valid: boolean
  counts: Record<string, number>
  integrity: Record<string, number>
  issues: string[]
}> {
  const db = getDb()
  const issues: string[] = []
  const [prodCount] = await db.select({ value: count() }).from(schema.products)
  const [catCount] = await db.select({ value: count() }).from(schema.categories)
  const [brandCount] = await db.select({ value: count() }).from(schema.brands)
  const [imgCount] = await db.select({ value: count() }).from(schema.productImages)

  // Duplicate public IDs
  const dupPublicIds = await db.select({
    publicId: schema.products.publicId,
    count: count(),
  })
    .from(schema.products)
    .groupBy(schema.products.publicId)
    .having(sql`count(*) > 1`)

  // Duplicate SKUs
  const dupSkus = await db.select({
    sku: schema.products.sku,
    count: count(),
  })
    .from(schema.products)
    .groupBy(schema.products.sku)
    .having(sql`count(*) > 1`)

  // Invalid prices
  const [invalidPrices] = await db.select({ value: count() })
    .from(schema.products)
    .where(or(sql`${schema.products.price} IS NULL`, sql`CAST(${schema.products.price} AS numeric) < 0`))

  // Negative stock
  const [negativeStock] = await db.select({ value: count() })
    .from(schema.products)
    .where(sql`${schema.products.stockQty} < 0`)

  // Missing categories
  const [missingCats] = await db.select({ value: count() })
    .from(schema.products)
    .where(sql`${schema.products.categoryId} IS NULL`)

  // Missing brands
  const [missingBrands] = await db.select({ value: count() })
    .from(schema.products)
    .where(sql`${schema.products.brandId} IS NULL`)

  // Orphaned images
  const [orphanedImages] = await db.select({ value: count() })
    .from(schema.productImages)
    .leftJoin(schema.products, eq(schema.productImages.productId, schema.products.id))
    .where(sql`${schema.products.id} IS NULL`)

  // Products without primary image
  const [noPrimaryImg] = await db.select({ value: count() })
    .from(schema.products)
    .leftJoin(schema.productImages, and(
      eq(schema.products.id, schema.productImages.productId),
      eq(schema.productImages.isPrimary, true)
    ))
    .where(sql`${schema.productImages.id} IS NULL`)

  // Draft / Unpublished / Archived
  const [unpublishedCount] = await db.select({ value: count() })
    .from(schema.products)
    .where(eq(schema.products.published, false))

  const [archivedCount] = await db.select({ value: count() })
    .from(schema.products)
    .where(eq(schema.products.archived, true))

  const counts = {
    products: Number(prodCount.value),
    categories: Number(catCount.value),
    brands: Number(brandCount.value),
    images: Number(imgCount.value),
  }

  const integrity = {
    duplicatePublicIds: dupPublicIds.length,
    duplicateSkus: dupSkus.length,
    invalidPrices: Number(invalidPrices.value),
    negativeStock: Number(negativeStock.value),
    missingCategories: Number(missingCats.value),
    missingBrands: Number(missingBrands.value),
    orphanedImages: Number(orphanedImages.value),
    noPrimaryImage: Number(noPrimaryImg.value),
    unpublished: Number(unpublishedCount.value),
    archived: Number(archivedCount.value),
  }

  if (counts.products < 1380) issues.push(`Expected ~1382 products, found ${counts.products}`)
  if (counts.categories < 9) issues.push(`Expected ~10 categories, found ${counts.categories}`)
  if (counts.brands < 14) issues.push(`Expected ~15 brands, found ${counts.brands}`)
  if (integrity.duplicatePublicIds > 0) issues.push(`Found ${integrity.duplicatePublicIds} duplicate public IDs`)
  if (integrity.duplicateSkus > 0) issues.push(`Found ${integrity.duplicateSkus} duplicate SKUs`)
  if (integrity.invalidPrices > 0) issues.push(`Found ${integrity.invalidPrices} invalid prices`)
  if (integrity.negativeStock > 0) issues.push(`Found ${integrity.negativeStock} products with negative stock`)
  if (integrity.orphanedImages > 0) issues.push(`Found ${integrity.orphanedImages} orphaned images`)
  if (integrity.noPrimaryImage > 0) issues.push(`Found ${integrity.noPrimaryImage} products without a primary image`)

  return { valid: issues.length === 0, counts, integrity, issues }
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

  const imageMap = await getImageMapForProductIds(db, rows.map(r => r.id))

  // Preserve caller order
  const map = new Map(rows.map(r => [r.publicId, r]))
  return ids.map(id => {
    const r = map.get(id)
    if (!r) return null
    return mapProductRowToStorefront(r, imageMap.get(r.id))
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
