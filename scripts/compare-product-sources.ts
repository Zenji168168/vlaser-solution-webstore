import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../db/schema'
import { eq, or, and } from 'drizzle-orm'
import { products as staticProducts } from '../lib/products-data'

const TEST_IDS = [
  'p0001', 'p0002', 'p0003', 'p0004', 'p0005', // Early
  'p0050', 'p0200', 'p0500', // Middle
  'p0600', 'p0601', 'p0602', 'p0603', 'p0604', 'p0605', // Middle
  'p1000', 'p1300', // Late
  'p1378', 'p1379', 'p1380', 'p1381', 'p1382' // Late
]

function cleanText(text: string): string {
  if (!text) return ''
  return text.replace(/â€¢/g, '•').replace(/â€™/g, "'").replace(/â€"/g, '—').replace(/â€œ/g, '"').replace(/Ã©/g, 'é').replace(/Â°/g, '°').replace(/ï¿½/g, '').replace(/\uFFFD/g, '').replace(/\s{2,}/g, ' ').trim()
}

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) {
    console.warn('WARNING: DATABASE_URL or POSTGRES_URL is empty. Cannot perform database-mode comparison. Exiting early to prevent execution with empty connection strings.')
    process.exit(0) // Exit 0 to not fail build if DB connection is intentionally empty in this environment
  }

  console.log(`Connecting to database to check ${TEST_IDS.length} products...`)
  const sql = neon(url)
  const db = drizzle(sql, { schema })

  // 1. Database integrity checks
  const [prodCount] = await db.select({ value: schema.products.id }).from(schema.products).limit(1)
  if (!prodCount) {
    console.error('ERROR: No products found in the database. Has the database been seeded?')
    process.exit(1)
  }

  // 2. Fetch test products from database
  const conditions = TEST_IDS.map(id => eq(schema.products.publicId, id))
  const dbProducts = await db.select({
    id: schema.products.id,
    publicId: schema.products.publicId,
    sku: schema.products.sku,
    model: schema.products.model,
    nameEn: schema.products.nameEn,
    nameKm: schema.products.nameKm,
    descEn: schema.products.descEn,
    descKm: schema.products.descKm,
    price: schema.products.price,
    stockQty: schema.products.stockQty,
    stockStatus: schema.products.stockStatus,
    published: schema.products.published,
    archived: schema.products.archived,
    brandName: schema.brands.name,
    categoryName: schema.categories.nameEn,
    warrantyEn: schema.products.warrantyEn,
    warrantyKm: schema.products.warrantyKm,
    installationEn: schema.products.installationEn,
    installationKm: schema.products.installationKm,
  })
    .from(schema.products)
    .leftJoin(schema.brands, eq(schema.products.brandId, schema.brands.id))
    .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .where(or(...conditions)!)

  // Fetch images for these products
  const internalIds = dbProducts.map(p => p.id)
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

  // Map database products by public_id
  const dbMap = new Map(dbProducts.map(p => [p.publicId, p]))

  let criticalMismatches = 0
  let warnings = 0

  console.log('\n--- Comparing Product Fields ---')
  for (const id of TEST_IDS) {
    const sProd = staticProducts.find(p => p.id === id)
    const dProd = dbMap.get(id)

    if (!sProd) {
      console.error(`ERROR: Static product ${id} not found in static catalog`)
      criticalMismatches++
      continue
    }

    if (!dProd) {
      console.error(`ERROR: Database product ${id} not found in database`)
      criticalMismatches++
      continue
    }

    const cleanedStaticName = cleanText(sProd.name).substring(0, 300)
    const cleanedStaticDesc = cleanText(sProd.description).substring(0, 5000)
    const dbImage = imageMap.get(dProd.id) || ''

    // Compare fields
    const checks = [
      { name: 'SKU', staticVal: sProd.sku, dbVal: dProd.sku, critical: true },
      { name: 'Name', staticVal: cleanedStaticName, dbVal: dProd.nameEn || '', critical: true },
      { name: 'Description', staticVal: cleanedStaticDesc, dbVal: dProd.descEn || '', critical: false },
      { name: 'Price', staticVal: sProd.price, dbVal: parseFloat(dProd.price) || 0, critical: true },
      { name: 'Stock Quantity', staticVal: sProd.qty, dbVal: dProd.stockQty || 0, critical: true },
      { name: 'Stock Status', staticVal: sProd.status, dbVal: dProd.stockStatus || 'Price List', critical: true },
      { name: 'Brand', staticVal: sProd.brand, dbVal: dProd.brandName || 'N/A', critical: true },
      { name: 'Category', staticVal: sProd.category, dbVal: dProd.categoryName || 'Other', critical: true },
      { name: 'Image', staticVal: sProd.image, dbVal: dbImage, critical: true },
      // Check database-only fields (should be empty/null for newly seeded products from static)
      { name: 'Model', staticVal: null, dbVal: dProd.model, critical: false },
      { name: 'Khmer Name', staticVal: null, dbVal: dProd.nameKm, critical: false },
      { name: 'Khmer Description', staticVal: null, dbVal: dProd.descKm, critical: false },
      { name: 'Warranty', staticVal: null, dbVal: dProd.warrantyEn, critical: false },
      { name: 'Installation', staticVal: null, dbVal: dProd.installationEn, critical: false },
    ]

    let hasMismatch = false
    for (const check of checks) {
      const match = check.staticVal === null
        ? (!check.dbVal || check.dbVal === '') // Harmless null/empty difference
        : check.staticVal === check.dbVal

      if (!match) {
        hasMismatch = true
        if (check.critical) {
          criticalMismatches++
          console.error(`[CRITICAL] Mismatch on ${id} (${check.name}): Static='${check.staticVal}' DB='${check.dbVal}'`)
        } else {
          warnings++
          console.warn(`[WARNING] Difference on ${id} (${check.name}): Static='${check.staticVal}' DB='${check.dbVal}'`)
        }
      }
    }

    if (!hasMismatch) {
      console.log(`[OK] Product ${id} matches perfectly.`)
    }
  }

  console.log('\n--- Verification Summary ---')
  console.log(`Products compared: ${TEST_IDS.length}`)
  console.log(`Warnings / Non-critical differences: ${warnings}`)
  console.log(`Critical Mismatches: ${criticalMismatches}`)

  if (criticalMismatches > 0) {
    console.error('\nFAIL: Critical mismatches detected between static and database catalogs!')
    process.exit(1)
  }

  console.log('\nSUCCESS: Database parity verified successfully!')
  process.exit(0)
}

main().catch(err => {
  console.error('Fatal error during validation:', err)
  process.exit(1)
})
