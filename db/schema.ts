import { pgTable, text, integer, numeric, boolean, timestamp, serial, varchar, index, uniqueIndex } from 'drizzle-orm/pg-core'

// === CATEGORIES ===
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  nameEn: varchar('name_en', { length: 200 }).notNull(),
  nameKm: varchar('name_km', { length: 200 }),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  sortOrder: integer('sort_order').default(0),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// === BRANDS ===
export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  logo: text('logo'),
  description: text('description'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// === PRODUCTS ===
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  publicId: varchar('public_id', { length: 20 }).notNull().unique(),
  sku: varchar('sku', { length: 100 }).notNull(),
  model: varchar('model', { length: 200 }),
  nameEn: varchar('name_en', { length: 300 }).notNull(),
  nameKm: varchar('name_km', { length: 300 }),
  brandId: integer('brand_id').references(() => brands.id),
  categoryId: integer('category_id').references(() => categories.id),
  shortDescEn: text('short_desc_en'),
  shortDescKm: text('short_desc_km'),
  descEn: text('desc_en'),
  descKm: text('desc_km'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull().default('0'),
  originalPrice: numeric('original_price', { precision: 10, scale: 2 }),
  stockQty: integer('stock_qty').default(0),
  stockStatus: varchar('stock_status', { length: 50 }).default('Price List'),
  published: boolean('published').default(false),
  featured: boolean('featured').default(false),
  archived: boolean('archived').default(false),
  warrantyEn: text('warranty_en'),
  warrantyKm: text('warranty_km'),
  installationEn: text('installation_en'),
  installationKm: text('installation_km'),
  packageEn: text('package_en'),
  packageKm: text('package_km'),
  seoTitleEn: varchar('seo_title_en', { length: 200 }),
  seoTitleKm: varchar('seo_title_km', { length: 200 }),
  seoDescEn: text('seo_desc_en'),
  seoDescKm: text('seo_desc_km'),
  createdBy: varchar('created_by', { length: 100 }),
  updatedBy: varchar('updated_by', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  publishedAt: timestamp('published_at'),
}, (table) => [
  index('idx_products_sku').on(table.sku),
  index('idx_products_brand').on(table.brandId),
  index('idx_products_category').on(table.categoryId),
  index('idx_products_published').on(table.published),
  index('idx_products_archived').on(table.archived),
  index('idx_products_name').on(table.nameEn),
])

// === PRODUCT IMAGES ===
export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  url: text('url').notNull(),
  altEn: varchar('alt_en', { length: 300 }),
  altKm: varchar('alt_km', { length: 300 }),
  sortOrder: integer('sort_order').default(0),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

// === PRODUCT SPECIFICATIONS ===
export const productSpecs = pgTable('product_specs', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  groupEn: varchar('group_en', { length: 100 }),
  groupKm: varchar('group_km', { length: 100 }),
  keyEn: varchar('key_en', { length: 200 }).notNull(),
  keyKm: varchar('key_km', { length: 200 }),
  value: text('value').notNull(),
  sortOrder: integer('sort_order').default(0),
})

// === PRODUCT FEATURES ===
export const productFeatures = pgTable('product_features', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  featureEn: text('feature_en').notNull(),
  featureKm: text('feature_km'),
  sortOrder: integer('sort_order').default(0),
})

// === AUDIT LOG ===
export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 100 }),
  action: varchar('action', { length: 50 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: varchar('entity_id', { length: 50 }),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
})
