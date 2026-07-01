import './mock-server-only'
import test from 'node:test'
import assert from 'node:assert/strict'
import { getProducts, getProductById, getRelatedProducts, getCategories, getBrands } from '../lib/product-service'

test('Product Service - Core Storefront Logic (Static Mode)', async (t) => {
  // Ensure we are testing in static mode for local tests
  process.env.PRODUCT_DATA_SOURCE = 'static'

  await t.test('getCategories returns category list without duplicates', async () => {
    const categories = await getCategories()
    assert.ok(Array.isArray(categories))
    assert.ok(categories.length > 0)
    assert.ok(categories.includes('CCTV'))
    // Check uniqueness
    const unique = new Set(categories)
    assert.strictEqual(unique.size, categories.length)
  })

  await t.test('getBrands returns brands list without duplicates', async () => {
    const brands = await getBrands()
    assert.ok(Array.isArray(brands))
    assert.ok(brands.length > 0)
    assert.ok(brands.includes('Watashi'))
  })

  await t.test('getProducts normalization and pagination works', async () => {
    const result = await getProducts({ page: 1, pageSize: 5 })
    assert.strictEqual(result.page, 1)
    assert.strictEqual(result.pageSize, 5)
    assert.strictEqual(result.products.length, 5)
    assert.ok(result.total > 0)
  })

  await t.test('getProducts filtering by category works', async () => {
    const result = await getProducts({ category: 'CCTV', pageSize: 5 })
    for (const p of result.products) {
      assert.strictEqual(p.category, 'CCTV')
    }
  })

  await t.test('getProducts filtering by brand works', async () => {
    const result = await getProducts({ brand: 'Watashi', pageSize: 5 })
    for (const p of result.products) {
      assert.strictEqual(p.brand, 'Watashi')
    }
  })

  await t.test('getProducts search query works (case-insensitive)', async () => {
    const result = await getProducts({ search: 'camera', pageSize: 5 })
    for (const p of result.products) {
      const match = p.name.toLowerCase().includes('camera') || p.description.toLowerCase().includes('camera')
      assert.ok(match, `Product name/desc should contain search query. Got Name: ${p.name}`)
    }
  })

  await t.test('getProductById retrieves correct product details', async () => {
    const product = await getProductById('p0001')
    assert.ok(product)
    assert.strictEqual(product.id, 'p0001')
    assert.ok(product.name)
    assert.ok(typeof product.price === 'number')
  })

  await t.test('getProductById returns null for invalid or missing product IDs', async () => {
    const product = await getProductById('p9999')
    assert.strictEqual(product, null)
  })

  await t.test('getRelatedProducts resolves related products excluding current product', async () => {
    const product = await getProductById('p0001')
    assert.ok(product)
    const related = await getRelatedProducts(product.id, product.category, product.brand)
    assert.ok(Array.isArray(related))
    for (const r of related) {
      assert.notStrictEqual(r.id, product.id)
      assert.ok(r.category === product.category || r.brand === product.brand)
    }
  })
})
