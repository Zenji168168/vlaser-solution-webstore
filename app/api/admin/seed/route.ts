import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { products as staticProducts } from '@/lib/products-data'

function cleanText(text: string): string {
  if (!text) return ''
  return text.replace(/â€¢/g, '•').replace(/â€™/g, "'").replace(/â€"/g, '—').replace(/â€œ/g, '"').replace(/Ã©/g, 'é').replace(/Â°/g, '°').replace(/ï¿½/g, '').replace(/\uFFFD/g, '').replace(/\s{2,}/g, ' ').trim()
}
function slugify(text: string): string { return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

export const maxDuration = 60

export async function GET(request: Request) {
  if (process.env.VERCEL_ENV === "production") {
    return new Response("Not Found", { status: 404 });
  }

  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) return NextResponse.json({ error: 'No DATABASE_URL' }, { status: 500 })

  const sql = neon(url)
  let imported = 0, updated = 0, errors = 0

  // Get batch range from query
  const batchStart = parseInt(searchParams.get('start') || '0')
  const batchSize = parseInt(searchParams.get('size') || '200')
  const batch = staticProducts.slice(batchStart, batchStart + batchSize)

  try {
    // Insert categories & brands (only on first batch)
    if (batchStart === 0) {
      const uniqueCats = [...new Set(staticProducts.map(p => p.category))].filter(Boolean)
      for (const cat of uniqueCats) {
        const slug = slugify(cat)
        await sql`INSERT INTO categories (slug, name_en) VALUES (${slug}, ${cat}) ON CONFLICT (slug) DO NOTHING`
      }
      const uniqueBrands = [...new Set(staticProducts.map(p => p.brand))].filter(Boolean)
      for (const brand of uniqueBrands) {
        const slug = slugify(brand)
        await sql`INSERT INTO brands (slug, name) VALUES (${slug}, ${brand}) ON CONFLICT (slug) DO NOTHING`
      }
    }

    // Get ID maps
    const catRows = await sql`SELECT id, name_en FROM categories`
    const brandRows = await sql`SELECT id, name FROM brands`
    const catMap: Record<string, number> = {}
    const brandMap: Record<string, number> = {}
    catRows.forEach((r: any) => { catMap[r.name_en] = r.id })
    brandRows.forEach((r: any) => { brandMap[r.name] = r.id })

    // Import batch
    for (const p of batch) {
      try {
        const catId = catMap[p.category] || null
        const brandId = brandMap[p.brand] || null
        const name = cleanText(p.name).substring(0, 300)
        const desc = cleanText(p.description).substring(0, 5000)
        const existing = await sql`SELECT id FROM products WHERE public_id = ${p.id}`

        if (existing.length > 0) {
          await sql`UPDATE products SET name_en=${name}, sku=${p.sku}, brand_id=${brandId}, category_id=${catId}, desc_en=${desc}, price=${p.price}, stock_qty=${p.qty}, stock_status=${p.status}, updated_at=NOW() WHERE public_id=${p.id}`
          updated++
        } else {
          const result = await sql`INSERT INTO products (public_id, sku, name_en, brand_id, category_id, desc_en, price, stock_qty, stock_status, published) VALUES (${p.id}, ${p.sku}, ${name}, ${brandId}, ${catId}, ${desc}, ${p.price}, ${p.qty}, ${p.status}, true) RETURNING id`
          if (p.image && p.image.startsWith('http') && !p.image.startsWith('data:')) {
            await sql`INSERT INTO product_images (product_id, url, is_primary, alt_en) VALUES (${result[0].id}, ${p.image}, true, ${name})`
          }
          imported++
        }
      } catch (e: any) { errors++ }
    }

    const total = await sql`SELECT COUNT(*) as count FROM products`

    return NextResponse.json({
      success: true,
      batch: { start: batchStart, size: batchSize, processed: batch.length },
      results: { imported, updated, errors },
      total: { source: staticProducts.length, inDatabase: total[0].count },
      nextBatch: batchStart + batchSize < staticProducts.length ? `?secret=vlaser-setup-2026&start=${batchStart + batchSize}&size=${batchSize}` : null
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, imported, updated, errors }, { status: 500 })
  }
}

export async function POST() {
  if (process.env.VERCEL_ENV === "production") {
    return new Response("Not Found", { status: 404 });
  }

  return new Response("Method Not Allowed", { status: 405 });
}
