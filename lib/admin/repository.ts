import 'server-only'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm'
import * as schema from '@/db/schema'
import { buildProductUpdateAuditDetails, getChangedProductEditFields, type ProductEditValues } from '@/lib/admin/product-editing'
import { selectPreferredProductImages } from '@/lib/repositories/product-repository'

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('Database is not configured.')
  return drizzle(neon(url), { schema })
}

export interface AdminUser {
  authUserId: string
  email: string
  displayName: string | null
  role: string
  active: boolean
}

export interface AdminProductFilters {
  search?: string
  category?: string
  brand?: string
  stock?: string
  publication?: string
  khmer?: string
  sort?: string
  page?: number
  pageSize?: number
}

export interface AdminProductListItem {
  id: string
  image: string
  nameEn: string
  nameKm: string | null
  sku: string
  brand: string
  category: string
  price: number
  stockQty: number
  stockStatus: string
  published: boolean
  archived: boolean
  missingKhmerName: boolean
  missingKhmerDescription: boolean
  updatedAt: Date | null
}

export interface AdminProductPreview {
  databaseId: number
  id: string
  sku: string
  model: string | null
  nameEn: string
  nameKm: string | null
  brand: string
  category: string
  shortDescEn: string | null
  shortDescKm: string | null
  descEn: string | null
  descKm: string | null
  price: number
  originalPrice: number | null
  stockQty: number
  stockStatus: string
  published: boolean
  archived: boolean
  warrantyEn: string | null
  warrantyKm: string | null
  installationEn: string | null
  installationKm: string | null
  packageEn: string | null
  packageKm: string | null
  seoTitleEn: string | null
  seoTitleKm: string | null
  seoDescEn: string | null
  seoDescKm: string | null
  createdAt: Date | null
  updatedAt: Date | null
  publishedAt: Date | null
  images: Array<{ url: string; altEn: string | null; altKm: string | null; isPrimary: boolean; sortOrder: number }>
  features: Array<{ featureEn: string; featureKm: string | null }>
  specs: Array<{ groupEn: string | null; groupKm: string | null; keyEn: string; keyKm: string | null; value: string }>
}

export interface AdminProductEditOptions {
  categories: Array<{ id: number; name: string; slug: string }>
  brands: Array<{ id: number; name: string; slug: string }>
}

export interface AdminProductAuditSummary {
  action: string
  userId: string | null
  details: string | null
  createdAt: Date | null
}

export interface DashboardStats {
  totalProducts: number
  publishedProducts: number
  draftProducts: number
  archivedProducts: number
  inStockProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  productsMissingImages: number
  productsMissingKhmerNames: number
  productsMissingKhmerDescriptions: number
  totalCategories: number
  totalBrands: number
}

export function normalizeAdminProductFilters(input: AdminProductFilters): Required<AdminProductFilters> {
  const page = Number.isFinite(input.page) && Number(input.page) > 0 ? Math.floor(Number(input.page)) : 1
  const pageSize = Number.isFinite(input.pageSize) && Number(input.pageSize) > 0 ? Math.min(Math.floor(Number(input.pageSize)), 50) : 20
  return {
    search: input.search?.trim() || '',
    category: input.category?.trim() || 'all',
    brand: input.brand?.trim() || 'all',
    stock: input.stock?.trim() || 'all',
    publication: input.publication?.trim() || 'all',
    khmer: input.khmer?.trim() || 'all',
    sort: input.sort?.trim() || 'updated-desc',
    page,
    pageSize,
  }
}

export function getStockLabel(stockQty: number, stockStatus: string) {
  if (stockQty <= 0 || stockStatus === 'Out of Stock') return 'Out of stock'
  if (stockQty <= 5) return 'Low stock'
  return 'In stock'
}

export async function getAdminUserByAuthIdentity(authUserId: string, email: string): Promise<AdminUser | null> {
  const db = getDb()
  const rows = await db.select({
    authUserId: schema.adminUsers.authUserId,
    email: schema.adminUsers.email,
    displayName: schema.adminUsers.displayName,
    role: schema.adminUsers.role,
    active: schema.adminUsers.active,
  })
    .from(schema.adminUsers)
    .where(or(eq(schema.adminUsers.authUserId, authUserId), eq(schema.adminUsers.email, email.toLowerCase()))!)
    .limit(1)

  return rows[0] || null
}

export async function syncAdminUserAuthIdentity(authUserId: string, email: string, displayName?: string | null): Promise<AdminUser | null> {
  const db = getDb()
  const normalizedEmail = email.toLowerCase()
  const rows = await db.update(schema.adminUsers)
    .set({
      authUserId,
      displayName: displayName || undefined,
      updatedAt: new Date(),
    })
    .where(and(
      eq(schema.adminUsers.email, normalizedEmail),
      eq(schema.adminUsers.role, 'admin'),
      eq(schema.adminUsers.active, true),
    ))
    .returning({
      authUserId: schema.adminUsers.authUserId,
      email: schema.adminUsers.email,
      displayName: schema.adminUsers.displayName,
      role: schema.adminUsers.role,
      active: schema.adminUsers.active,
    })

  return rows[0] || null
}

function buildProductConditions(filters: Required<AdminProductFilters>): SQL[] {
  const conditions: SQL[] = []

  if (filters.search) {
    const term = `%${filters.search}%`
    conditions.push(or(
      ilike(schema.products.nameEn, term),
      ilike(schema.products.nameKm, term),
      ilike(schema.products.sku, term),
      ilike(schema.products.model, term),
    )!)
  }
  if (filters.category !== 'all') conditions.push(eq(schema.categories.slug, filters.category))
  if (filters.brand !== 'all') conditions.push(eq(schema.brands.slug, filters.brand))
  if (filters.stock === 'in') conditions.push(sql`coalesce(${schema.products.stockQty}, 0) > 5`)
  if (filters.stock === 'low') conditions.push(sql`coalesce(${schema.products.stockQty}, 0) between 1 and 5`)
  if (filters.stock === 'out') conditions.push(sql`coalesce(${schema.products.stockQty}, 0) <= 0`)
  if (filters.publication === 'published') conditions.push(and(eq(schema.products.published, true), eq(schema.products.archived, false))!)
  if (filters.publication === 'draft') conditions.push(and(eq(schema.products.published, false), eq(schema.products.archived, false))!)
  if (filters.publication === 'archived') conditions.push(eq(schema.products.archived, true))
  if (filters.khmer === 'complete') conditions.push(sql`${schema.products.nameKm} is not null and ${schema.products.nameKm} <> '' and ${schema.products.descKm} is not null and ${schema.products.descKm} <> ''`)
  if (filters.khmer === 'missing-name') conditions.push(sql`${schema.products.nameKm} is null or ${schema.products.nameKm} = ''`)
  if (filters.khmer === 'missing-description') conditions.push(sql`${schema.products.descKm} is null or ${schema.products.descKm} = ''`)
  if (filters.khmer === 'missing-any') conditions.push(sql`${schema.products.nameKm} is null or ${schema.products.nameKm} = '' or ${schema.products.descKm} is null or ${schema.products.descKm} = ''`)

  return conditions
}

function getOrderBy(sort: string) {
  if (sort === 'name-asc') return asc(schema.products.nameEn)
  if (sort === 'price-asc') return asc(schema.products.price)
  if (sort === 'price-desc') return desc(schema.products.price)
  if (sort === 'stock-asc') return asc(schema.products.stockQty)
  if (sort === 'stock-desc') return desc(schema.products.stockQty)
  return desc(schema.products.updatedAt)
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = getDb()
  const [
    totalProducts,
    publishedProducts,
    draftProducts,
    archivedProducts,
    inStockProducts,
    lowStockProducts,
    outOfStockProducts,
    productsMissingImages,
    productsMissingKhmerNames,
    productsMissingKhmerDescriptions,
    totalCategories,
    totalBrands,
  ] = await Promise.all([
    db.select({ value: count() }).from(schema.products),
    db.select({ value: count() }).from(schema.products).where(and(eq(schema.products.published, true), eq(schema.products.archived, false))),
    db.select({ value: count() }).from(schema.products).where(and(eq(schema.products.published, false), eq(schema.products.archived, false))),
    db.select({ value: count() }).from(schema.products).where(eq(schema.products.archived, true)),
    db.select({ value: count() }).from(schema.products).where(sql`coalesce(${schema.products.stockQty}, 0) > 5`),
    db.select({ value: count() }).from(schema.products).where(sql`coalesce(${schema.products.stockQty}, 0) between 1 and 5`),
    db.select({ value: count() }).from(schema.products).where(sql`coalesce(${schema.products.stockQty}, 0) <= 0`),
    db.select({ value: count() })
      .from(schema.products)
      .leftJoin(schema.productImages, eq(schema.productImages.productId, schema.products.id))
      .where(sql`${schema.productImages.id} is null`),
    db.select({ value: count() }).from(schema.products).where(sql`${schema.products.nameKm} is null or ${schema.products.nameKm} = ''`),
    db.select({ value: count() }).from(schema.products).where(sql`${schema.products.descKm} is null or ${schema.products.descKm} = ''`),
    db.select({ value: count() }).from(schema.categories),
    db.select({ value: count() }).from(schema.brands),
  ])

  return {
    totalProducts: Number(totalProducts[0]?.value || 0),
    publishedProducts: Number(publishedProducts[0]?.value || 0),
    draftProducts: Number(draftProducts[0]?.value || 0),
    archivedProducts: Number(archivedProducts[0]?.value || 0),
    inStockProducts: Number(inStockProducts[0]?.value || 0),
    lowStockProducts: Number(lowStockProducts[0]?.value || 0),
    outOfStockProducts: Number(outOfStockProducts[0]?.value || 0),
    productsMissingImages: Number(productsMissingImages[0]?.value || 0),
    productsMissingKhmerNames: Number(productsMissingKhmerNames[0]?.value || 0),
    productsMissingKhmerDescriptions: Number(productsMissingKhmerDescriptions[0]?.value || 0),
    totalCategories: Number(totalCategories[0]?.value || 0),
    totalBrands: Number(totalBrands[0]?.value || 0),
  }
}

export async function getAdminProductOptions() {
  const db = getDb()
  const [categories, brands] = await Promise.all([
    db.select({ slug: schema.categories.slug, name: schema.categories.nameEn }).from(schema.categories).orderBy(asc(schema.categories.nameEn)),
    db.select({ slug: schema.brands.slug, name: schema.brands.name }).from(schema.brands).orderBy(asc(schema.brands.name)),
  ])
  return { categories, brands }
}

export async function getAdminProductEditOptions(): Promise<AdminProductEditOptions> {
  const db = getDb()
  const [categories, brands] = await Promise.all([
    db.select({ id: schema.categories.id, slug: schema.categories.slug, name: schema.categories.nameEn })
      .from(schema.categories)
      .where(eq(schema.categories.active, true))
      .orderBy(asc(schema.categories.nameEn)),
    db.select({ id: schema.brands.id, slug: schema.brands.slug, name: schema.brands.name })
      .from(schema.brands)
      .where(eq(schema.brands.active, true))
      .orderBy(asc(schema.brands.name)),
  ])
  return { categories, brands }
}

export async function getAdminProducts(input: AdminProductFilters) {
  const db = getDb()
  const filters = normalizeAdminProductFilters(input)
  const conditions = buildProductConditions(filters)
  const where = conditions.length ? and(...conditions) : undefined
  const offset = (filters.page - 1) * filters.pageSize

  const [totalRows, rows] = await Promise.all([
    db.select({ value: count() })
      .from(schema.products)
      .leftJoin(schema.brands, eq(schema.products.brandId, schema.brands.id))
      .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
      .where(where),
    db.select({
      id: schema.products.id,
      publicId: schema.products.publicId,
      sku: schema.products.sku,
      nameEn: schema.products.nameEn,
      nameKm: schema.products.nameKm,
      descKm: schema.products.descKm,
      price: schema.products.price,
      stockQty: schema.products.stockQty,
      stockStatus: schema.products.stockStatus,
      published: schema.products.published,
      archived: schema.products.archived,
      updatedAt: schema.products.updatedAt,
      brand: schema.brands.name,
      category: schema.categories.nameEn,
    })
      .from(schema.products)
      .leftJoin(schema.brands, eq(schema.products.brandId, schema.brands.id))
      .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
      .where(where)
      .orderBy(getOrderBy(filters.sort))
      .limit(filters.pageSize)
      .offset(offset),
  ])

  const images = rows.length ? await db.select({
    id: schema.productImages.id,
    productId: schema.productImages.productId,
    url: schema.productImages.url,
    isPrimary: schema.productImages.isPrimary,
    sortOrder: schema.productImages.sortOrder,
  })
    .from(schema.productImages)
    .where(or(...rows.map(row => eq(schema.productImages.productId, row.id)))!)
    .orderBy(desc(schema.productImages.isPrimary), asc(schema.productImages.sortOrder), asc(schema.productImages.id)) : []
  const imageMap = selectPreferredProductImages(images)

  const total = Number(totalRows[0]?.value || 0)
  return {
    products: rows.map((row): AdminProductListItem => ({
      id: row.publicId,
      image: imageMap.get(row.id) || '/placeholder.svg',
      nameEn: row.nameEn,
      nameKm: row.nameKm,
      sku: row.sku,
      brand: row.brand || 'Unassigned',
      category: row.category || 'Unassigned',
      price: parseFloat(row.price || '0'),
      stockQty: row.stockQty || 0,
      stockStatus: row.stockStatus || 'Price List',
      published: Boolean(row.published),
      archived: Boolean(row.archived),
      missingKhmerName: !row.nameKm,
      missingKhmerDescription: !row.descKm,
      updatedAt: row.updatedAt,
    })),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  }
}

export async function getAdminProductPreview(publicId: string): Promise<AdminProductPreview | null> {
  const db = getDb()
  const rows = await db.select({
    id: schema.products.id,
    publicId: schema.products.publicId,
    sku: schema.products.sku,
    model: schema.products.model,
    nameEn: schema.products.nameEn,
    nameKm: schema.products.nameKm,
    brand: schema.brands.name,
    brandId: schema.products.brandId,
    category: schema.categories.nameEn,
    categoryId: schema.products.categoryId,
    shortDescEn: schema.products.shortDescEn,
    shortDescKm: schema.products.shortDescKm,
    descEn: schema.products.descEn,
    descKm: schema.products.descKm,
    price: schema.products.price,
    originalPrice: schema.products.originalPrice,
    stockQty: schema.products.stockQty,
    stockStatus: schema.products.stockStatus,
    published: schema.products.published,
    archived: schema.products.archived,
    warrantyEn: schema.products.warrantyEn,
    warrantyKm: schema.products.warrantyKm,
    installationEn: schema.products.installationEn,
    installationKm: schema.products.installationKm,
    packageEn: schema.products.packageEn,
    packageKm: schema.products.packageKm,
    seoTitleEn: schema.products.seoTitleEn,
    seoTitleKm: schema.products.seoTitleKm,
    seoDescEn: schema.products.seoDescEn,
    seoDescKm: schema.products.seoDescKm,
    createdAt: schema.products.createdAt,
    updatedAt: schema.products.updatedAt,
    publishedAt: schema.products.publishedAt,
  })
    .from(schema.products)
    .leftJoin(schema.brands, eq(schema.products.brandId, schema.brands.id))
    .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .where(eq(schema.products.publicId, publicId))
    .limit(1)

  const row = rows[0]
  if (!row) return null

  const [images, features, specs] = await Promise.all([
    db.select({
      url: schema.productImages.url,
      altEn: schema.productImages.altEn,
      altKm: schema.productImages.altKm,
      isPrimary: schema.productImages.isPrimary,
      sortOrder: schema.productImages.sortOrder,
    }).from(schema.productImages).where(eq(schema.productImages.productId, row.id)).orderBy(desc(schema.productImages.isPrimary), asc(schema.productImages.sortOrder)),
    db.select({
      featureEn: schema.productFeatures.featureEn,
      featureKm: schema.productFeatures.featureKm,
    }).from(schema.productFeatures).where(eq(schema.productFeatures.productId, row.id)).orderBy(asc(schema.productFeatures.sortOrder)),
    db.select({
      groupEn: schema.productSpecs.groupEn,
      groupKm: schema.productSpecs.groupKm,
      keyEn: schema.productSpecs.keyEn,
      keyKm: schema.productSpecs.keyKm,
      value: schema.productSpecs.value,
    }).from(schema.productSpecs).where(eq(schema.productSpecs.productId, row.id)).orderBy(asc(schema.productSpecs.sortOrder)),
  ])

  return {
    databaseId: row.id,
    id: row.publicId,
    sku: row.sku,
    model: row.model,
    nameEn: row.nameEn,
    nameKm: row.nameKm,
    brand: row.brand || 'Unassigned',
    category: row.category || 'Unassigned',
    shortDescEn: row.shortDescEn,
    shortDescKm: row.shortDescKm,
    descEn: row.descEn,
    descKm: row.descKm,
    price: parseFloat(row.price || '0'),
    originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
    stockQty: row.stockQty || 0,
    stockStatus: row.stockStatus || 'Price List',
    published: Boolean(row.published),
    archived: Boolean(row.archived),
    warrantyEn: row.warrantyEn,
    warrantyKm: row.warrantyKm,
    installationEn: row.installationEn,
    installationKm: row.installationKm,
    packageEn: row.packageEn,
    packageKm: row.packageKm,
    seoTitleEn: row.seoTitleEn,
    seoTitleKm: row.seoTitleKm,
    seoDescEn: row.seoDescEn,
    seoDescKm: row.seoDescKm,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    publishedAt: row.publishedAt,
    images: images.map(image => ({
      url: image.url,
      altEn: image.altEn,
      altKm: image.altKm,
      isPrimary: Boolean(image.isPrimary),
      sortOrder: image.sortOrder || 0,
    })),
    features,
    specs,
  }
}

export async function getAdminProductAuditSummary(publicId: string, limit = 5): Promise<AdminProductAuditSummary[]> {
  const db = getDb()
  return db.select({
    action: schema.auditLog.action,
    userId: schema.auditLog.userId,
    details: schema.auditLog.details,
    createdAt: schema.auditLog.createdAt,
  })
    .from(schema.auditLog)
    .where(and(
      eq(schema.auditLog.entityType, 'product'),
      eq(schema.auditLog.entityId, publicId),
    ))
    .orderBy(desc(schema.auditLog.createdAt))
    .limit(limit)
}

export async function getAdminProductEdit(publicId: string): Promise<(AdminProductPreview & {
  brandId: number | null
  categoryId: number | null
}) | null> {
  const product = await getAdminProductPreview(publicId)
  if (!product) return null

  const db = getDb()
  const [row] = await db.select({
    brandId: schema.products.brandId,
    categoryId: schema.products.categoryId,
  })
    .from(schema.products)
    .where(eq(schema.products.publicId, publicId))
    .limit(1)

  return row ? { ...product, brandId: row.brandId, categoryId: row.categoryId } : null
}

function toProductEditValues(product: AdminProductPreview & { brandId: number | null; categoryId: number | null }): ProductEditValues {
  return {
    publicId: product.id,
    nameEn: product.nameEn,
    nameKm: product.nameKm || '',
    sku: product.sku,
    model: product.model || '',
    brandId: product.brandId || 0,
    categoryId: product.categoryId || 0,
    price: product.price.toFixed(2),
    stockQty: product.stockQty,
    stockStatus: product.stockStatus,
    published: product.published,
    archived: product.archived,
    shortDescEn: product.shortDescEn || '',
    shortDescKm: product.shortDescKm || '',
    descEn: product.descEn || '',
    descKm: product.descKm || '',
    warrantyEn: product.warrantyEn || '',
    warrantyKm: product.warrantyKm || '',
    installationEn: product.installationEn || '',
    installationKm: product.installationKm || '',
    seoTitleEn: product.seoTitleEn || '',
    seoDescEn: product.seoDescEn || '',
  }
}

export async function updateAdminProduct(input: ProductEditValues, admin: { authUserId: string; email: string }) {
  const db = getDb()
  const [product, brand, category] = await Promise.all([
    getAdminProductEdit(input.publicId),
    db.select({ id: schema.brands.id }).from(schema.brands).where(eq(schema.brands.id, input.brandId)).limit(1),
    db.select({ id: schema.categories.id }).from(schema.categories).where(eq(schema.categories.id, input.categoryId)).limit(1),
  ])

  if (!product) return { ok: false as const, error: 'Product not found.' }
  if (!brand.length) return { ok: false as const, fieldErrors: { brandId: 'Choose an existing brand.' }, error: 'Check the highlighted fields and try again.' }
  if (!category.length) return { ok: false as const, fieldErrors: { categoryId: 'Choose an existing category.' }, error: 'Check the highlighted fields and try again.' }

  const before = toProductEditValues(product)
  const changedFields = getChangedProductEditFields(before, input)

  const [updated] = await db.update(schema.products)
    .set({
      sku: input.sku,
      model: input.model || null,
      nameEn: input.nameEn,
      nameKm: input.nameKm || null,
      brandId: input.brandId,
      categoryId: input.categoryId,
      shortDescEn: input.shortDescEn || null,
      shortDescKm: input.shortDescKm || null,
      descEn: input.descEn || null,
      descKm: input.descKm || null,
      price: input.price,
      stockQty: input.stockQty,
      stockStatus: input.stockStatus,
      published: input.published,
      archived: input.archived,
      warrantyEn: input.warrantyEn || null,
      warrantyKm: input.warrantyKm || null,
      installationEn: input.installationEn || null,
      installationKm: input.installationKm || null,
      seoTitleEn: input.seoTitleEn || null,
      seoDescEn: input.seoDescEn || null,
      updatedBy: admin.email,
      updatedAt: new Date(),
      publishedAt: input.published && !product.published ? new Date() : product.publishedAt,
    })
    .where(eq(schema.products.publicId, input.publicId))
    .returning({
      publicId: schema.products.publicId,
      sku: schema.products.sku,
      updatedAt: schema.products.updatedAt,
    })

  if (!updated) return { ok: false as const, error: 'Product could not be updated.' }

  await db.insert(schema.auditLog).values({
    userId: admin.authUserId || admin.email,
    action: 'product.update',
    entityType: 'product',
    entityId: updated.publicId,
    details: buildProductUpdateAuditDetails({
      productId: updated.publicId,
      sku: updated.sku,
      adminEmail: admin.email,
      changedFields,
      before,
      after: input,
    }),
  })

  return { ok: true as const, productId: updated.publicId, sku: updated.sku, changedFields }
}
