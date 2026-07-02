import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

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

  try {
    const sql = neon(url)

    await sql`CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY, slug VARCHAR(100) UNIQUE NOT NULL, name_en VARCHAR(200) NOT NULL, name_km VARCHAR(200),
      description TEXT, icon VARCHAR(50), sort_order INTEGER DEFAULT 0, active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
    )`
    await sql`CREATE TABLE IF NOT EXISTS brands (
      id SERIAL PRIMARY KEY, slug VARCHAR(100) UNIQUE NOT NULL, name VARCHAR(200) NOT NULL, logo TEXT,
      description TEXT, active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
    )`
    await sql`CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY, public_id VARCHAR(20) UNIQUE NOT NULL, sku VARCHAR(100) NOT NULL, model VARCHAR(200),
      name_en VARCHAR(300) NOT NULL, name_km VARCHAR(300), brand_id INTEGER REFERENCES brands(id), category_id INTEGER REFERENCES categories(id),
      short_desc_en TEXT, short_desc_km TEXT, desc_en TEXT, desc_km TEXT,
      price NUMERIC(10,2) NOT NULL DEFAULT 0, original_price NUMERIC(10,2), stock_qty INTEGER DEFAULT 0, stock_status VARCHAR(50) DEFAULT 'Price List',
      published BOOLEAN DEFAULT false, featured BOOLEAN DEFAULT false, archived BOOLEAN DEFAULT false,
      warranty_en TEXT, warranty_km TEXT, installation_en TEXT, installation_km TEXT, package_en TEXT, package_km TEXT,
      seo_title_en VARCHAR(200), seo_title_km VARCHAR(200), seo_desc_en TEXT, seo_desc_km TEXT,
      created_by VARCHAR(100), updated_by VARCHAR(100), created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW(), published_at TIMESTAMP
    )`
    await sql`CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY, product_id INTEGER REFERENCES products(id) NOT NULL, url TEXT NOT NULL,
      alt_en VARCHAR(300), alt_km VARCHAR(300), sort_order INTEGER DEFAULT 0, is_primary BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT NOW()
    )`
    await sql`CREATE TABLE IF NOT EXISTS product_specs (
      id SERIAL PRIMARY KEY, product_id INTEGER REFERENCES products(id) NOT NULL,
      group_en VARCHAR(100), group_km VARCHAR(100), key_en VARCHAR(200) NOT NULL, key_km VARCHAR(200), value TEXT NOT NULL, sort_order INTEGER DEFAULT 0
    )`
    await sql`CREATE TABLE IF NOT EXISTS product_features (
      id SERIAL PRIMARY KEY, product_id INTEGER REFERENCES products(id) NOT NULL, feature_en TEXT NOT NULL, feature_km TEXT, sort_order INTEGER DEFAULT 0
    )`
    await sql`CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY, user_id VARCHAR(100), action VARCHAR(50) NOT NULL, entity_type VARCHAR(50) NOT NULL,
      entity_id VARCHAR(50), details TEXT, created_at TIMESTAMP DEFAULT NOW()
    )`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_published ON products(published)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id)`

    return NextResponse.json({ success: true, message: 'All tables created' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST() {
  if (process.env.VERCEL_ENV === "production") {
    return new Response("Not Found", { status: 404 });
  }

  return new Response("Method Not Allowed", { status: 405 });
}
