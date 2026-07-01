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

export async function runParityComparison(url?: string) {
  const dbUrl = url || process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!dbUrl) {
    throw new Error('DATABASE_URL or POSTGRES_URL is empty')
  }

  const sql = neon(dbUrl)
  const db = drizzle(sql, { schema })

  const [prodCount] = await db.select({ value: schema.products.id }).from(schema.products).limit(1)
  if (!prodCount) {
    throw new Error('No products found in the database')
  }

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

  const dbMap = new Map(dbProducts.map(p => [p.publicId, p]))
  const mismatches: string[] = []
  const warnings: string[] = []

  for (const id of TEST_IDS) {
    const sProd = staticProducts.find(p => p.id === id)
    const dProd = dbMap.get(id)

    if (!sProd) {
      mismatches.push(`Product ${id} missing in static catalog`)
      continue
    }
    if (!dProd) {
      mismatches.push(`Product ${id} missing in database`)
      continue
    }

    const cleanedStaticName = cleanText(sProd.name).substring(0, 300)
    const cleanedStaticDesc = cleanText(sProd.description).substring(0, 5000)
    const dbImage = imageMap.get(dProd.id) || ''

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
      { name: 'Model', staticVal: null, dbVal: dProd.model, critical: false },
      { name: 'Khmer Name', staticVal: null, dbVal: dProd.nameKm, critical: false },
      { name: 'Khmer Description', staticVal: null, dbVal: dProd.descKm, critical: false },
      { name: 'Warranty', staticVal: null, dbVal: dProd.warrantyEn, critical: false },
      { name: 'Installation', staticVal: null, dbVal: dProd.installationEn, critical: false },
    ]

    for (const check of checks) {
      const match = check.staticVal === null
        ? (!check.dbVal || check.dbVal === '')
        : check.staticVal === check.dbVal

      if (!match) {
        const msg = `${id} (${check.name}): Static='${check.staticVal}' DB='${check.dbVal}'`
        if (check.critical) {
          mismatches.push(msg)
        } else {
          warnings.push(msg)
        }
      }
    }
  }

  return {
    success: mismatches.length === 0,
    comparedCount: TEST_IDS.length,
    ids: TEST_IDS,
    mismatches,
    warnings
  }
}

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) {
    console.warn('WARNING: DATABASE_URL or POSTGRES_URL is empty. Cannot perform database-mode comparison. Exiting early to prevent execution with empty connection strings.')
    process.exit(0)
  }

  console.log(`Connecting to database to check ${TEST_IDS.length} products...`)
  try {
    const result = await runParityComparison(url)
    console.log('\n--- Comparing Product Fields ---')
    result.ids.forEach(id => {
      const hasCrit = result.mismatches.some(m => m.startsWith(id))
      const hasWarn = result.warnings.some(w => w.startsWith(id))
      if (!hasCrit && !hasWarn) {
        console.log(`[OK] Product ${id} matches perfectly.`)
      } else {
        result.mismatches.filter(m => m.startsWith(id)).forEach(m => console.error(`[CRITICAL] Mismatch on ${m}`))
        result.warnings.filter(w => w.startsWith(id)).forEach(w => console.warn(`[WARNING] Difference on ${w}`))
      }
    })

    console.log('\n--- Verification Summary ---')
    console.log(`Products compared: ${result.comparedCount}`)
    console.log(`Warnings / Non-critical differences: ${result.warnings.length}`)
    console.log(`Critical Mismatches: ${result.mismatches.length}`)

    if (!result.success) {
      console.error('\nFAIL: Critical mismatches detected between static and database catalogs!')
      process.exit(1)
    }

    console.log('\nSUCCESS: Database parity verified successfully!')
    process.exit(0)
  } catch (err: any) {
    console.error('Fatal error during validation:', err.message)
    process.exit(1)
  }
}

// Run CLI if main file
if (require.main === module || (process.argv[1] && process.argv[1].includes('compare-product-sources'))) {
  main()
}
