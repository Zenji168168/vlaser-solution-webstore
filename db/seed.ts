import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { categories, brands, products, productImages } from './schema'
import { eq } from 'drizzle-orm'
import * as fs from 'fs'
import * as path from 'path'

function cleanText(text: string): string {
  if (!text) return ''
  return text
    .replace(/â€¢/g, '•').replace(/â€™/g, "'").replace(/â€"/g, '—')
    .replace(/â€œ/g, '"').replace(/â€\x9D/g, '"').replace(/â€˜/g, "'")
    .replace(/Ã©/g, 'é').replace(/Ã¨/g, 'è').replace(/Â°/g, '°')
    .replace(/Â®/g, '®').replace(/ï¿½/g, '').replace(/\uFFFD/g, '')
    .replace(/\s{2,}/g, ' ').trim()
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) { console.error('No DATABASE_URL'); process.exit(1) }

  const sql = neon(url)
  const db = drizzle(sql)

  // Load static product data
  const rawProducts = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'products-export.json'), 'utf8'))
  console.log(`Loaded ${rawProducts.length} products from export`)

  // Extract unique categories and brands
  const uniqueCats = [...new Set(rawProducts.map((p: any) => p.category))].filter(Boolean).sort()
  const uniqueBrands = [...new Set(rawProducts.map((p: any) => p.brand))].filter(Boolean).sort()

  console.log(`Categories: ${uniqueCats.length}, Brands: ${uniqueBrands.length}`)

  // Upsert categories
  const catMap: Record<string, number> = {}
  for (const catName of uniqueCats) {
    const slug = slugify(catName)
    const existing = await db.select().from(categories).where(eq(categories.slug, slug))
    if (existing.length > 0) {
      catMap[catName] = existing[0].id
    } else {
      const [inserted] = await db.insert(categories).values({ slug, nameEn: catName }).returning()
      catMap[catName] = inserted.id
    }
  }
  console.log('Categories imported')

  // Upsert brands
  const brandMap: Record<string, number> = {}
  for (const brandName of uniqueBrands) {
    const slug = slugify(brandName)
    const existing = await db.select().from(brands).where(eq(brands.slug, slug))
    if (existing.length > 0) {
      brandMap[brandName] = existing[0].id
    } else {
      const [inserted] = await db.insert(brands).values({ slug, name: brandName }).returning()
      brandMap[brandName] = inserted.id
    }
  }
  console.log('Brands imported')

  // Import products
  let imported = 0, skipped = 0, errors = 0
  for (let i = 0; i < rawProducts.length; i++) {
    const p = rawProducts[i]
    const publicId = `p${String(i + 1).padStart(4, '0')}`
    try {
      const existing = await db.select().from(products).where(eq(products.publicId, publicId))
      const productData = {
        publicId,
        sku: (p.sku || '').substring(0, 100),
        nameEn: cleanText(p.name || p.sku || ''),
        brandId: brandMap[p.brand] || null,
        categoryId: catMap[p.category] || null,
        descEn: cleanText(p.description || ''),
        price: String(p.price || 0),
        stockQty: p.qty || 0,
        stockStatus: p.status || 'Price List',
        published: true,
      }

      if (existing.length > 0) {
        await db.update(products).set({ ...productData, updatedAt: new Date() }).where(eq(products.publicId, publicId))
        skipped++
      } else {
        const [prod] = await db.insert(products).values(productData).returning()
        // Add image
        if (p.image && p.image.startsWith('http') && !p.image.startsWith('data:')) {
          await db.insert(productImages).values({
            productId: prod.id,
            url: p.image,
            isPrimary: true,
            altEn: cleanText(p.name || ''),
          })
        }
        imported++
      }
    } catch (err: any) {
      errors++
      if (errors < 5) console.error(`Error on ${publicId}: ${err.message}`)
    }

    if ((i + 1) % 100 === 0) console.log(`Progress: ${i + 1}/${rawProducts.length}`)
  }

  console.log('\n=== IMPORT SUMMARY ===')
  console.log(`Source products: ${rawProducts.length}`)
  console.log(`New inserts: ${imported}`)
  console.log(`Updated (existing): ${skipped}`)
  console.log(`Errors: ${errors}`)
  console.log(`Categories: ${Object.keys(catMap).length}`)
  console.log(`Brands: ${Object.keys(brandMap).length}`)
}

main().catch(console.error)
