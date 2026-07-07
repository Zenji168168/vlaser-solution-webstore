import './mock-server-only'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  buildProductUpdateAuditDetails,
  getChangedProductEditFields,
  validateProductEditForm,
  type ProductEditValues,
} from '../lib/admin/product-editing'

function validValues(overrides: Record<string, string | number | boolean> = {}) {
  return {
    publicId: 'p0001',
    nameEn: 'Hikvision Camera',
    nameKm: '',
    sku: 'HIK-001',
    model: 'DS-2CD',
    brandId: 1,
    categoryId: 1,
    price: '99.99',
    stockQty: 4,
    stockStatus: 'Price List',
    published: true,
    archived: false,
    shortDescEn: 'Short description',
    shortDescKm: '',
    descEn: 'Full description',
    descKm: '',
    warrantyEn: 'One year',
    warrantyKm: '',
    installationEn: 'Standard installation',
    installationKm: '',
    seoTitleEn: 'SEO title',
    seoDescEn: 'SEO description',
    ...overrides,
  }
}

function formData(overrides: Record<string, string | number | boolean> = {}) {
  const data = new FormData()
  const values = validValues(overrides)
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === 'boolean') {
      if (value) data.set(key, 'on')
    } else {
      data.set(key, String(value))
    }
  }
  return data
}

test('product edit validation accepts safe admin update input', () => {
  const result = validateProductEditForm(formData({ nameKm: 'កាមេរ៉ាសុវត្ថិភាព' }))
  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.values.nameKm, 'កាមេរ៉ាសុវត្ថិភាព')
    assert.equal(result.values.price, '99.99')
  }
})

test('product edit validation rejects empty required fields and invalid product id', () => {
  const result = validateProductEditForm(formData({ publicId: 'bad-id', nameEn: ' ', sku: ' ' }))
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.fieldErrors.publicId, 'Invalid product ID.')
    assert.equal(result.fieldErrors.nameEn, 'English product name is required.')
    assert.equal(result.fieldErrors.sku, 'SKU is required.')
  }
})

test('product edit validation rejects invalid price and stock values', () => {
  const badPrice = validateProductEditForm(formData({ price: '-1' }))
  const nanPrice = validateProductEditForm(formData({ price: 'abc' }))
  const badStock = validateProductEditForm(formData({ stockQty: -2 }))

  assert.equal(badPrice.ok, false)
  assert.equal(nanPrice.ok, false)
  assert.equal(badStock.ok, false)
  if (!badPrice.ok) assert.equal(badPrice.fieldErrors.price, 'Price cannot be negative.')
  if (!nanPrice.ok) assert.equal(nanPrice.fieldErrors.price, 'Enter a valid USD price.')
  if (!badStock.ok) assert.equal(badStock.fieldErrors.stockQty, 'Stock cannot be negative.')
})

test('product edit validation rejects invalid category, brand, stock status, and oversized content', () => {
  const result = validateProductEditForm(formData({
    brandId: 0,
    categoryId: 0,
    stockStatus: 'Unknown',
    descEn: 'x'.repeat(10001),
  }))

  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.fieldErrors.brandId, 'Choose an existing brand.')
    assert.equal(result.fieldErrors.categoryId, 'Choose an existing category.')
    assert.equal(result.fieldErrors.stockStatus, 'Choose a valid stock status.')
    assert.match(result.fieldErrors.descEn || '', /10,000/)
  }
})

test('product edit changed-field summary tracks persisted updates', () => {
  const before = validValues({ price: '25.00', stockQty: 1, nameKm: '' }) as ProductEditValues
  const after = validValues({ price: '30.00', stockQty: 2, nameKm: 'ផលិតផល' }) as ProductEditValues
  const changed = getChangedProductEditFields(before, after)

  assert.deepEqual(changed.sort(), ['nameKm', 'price', 'stockQty'])
})

test('product update audit details contain safe product and field summary', () => {
  const before = validValues({ price: '25.00' }) as ProductEditValues
  const after = validValues({ price: '30.00' }) as ProductEditValues
  const details = JSON.parse(buildProductUpdateAuditDetails({
    productId: 'p0001',
    sku: 'HIK-001',
    adminEmail: 'meukthareach053@gmail.com',
    changedFields: ['price'],
    before,
    after,
  }))

  assert.equal(details.productId, 'p0001')
  assert.equal(details.action, undefined)
  assert.deepEqual(details.changedFields, ['price'])
  assert.equal(details.summary.price.before, '25.00')
  assert.equal(details.summary.price.after, '30.00')
  assert.doesNotMatch(JSON.stringify(details), /cookie|token|secret|password/i)
})

test('product edit server action requires admin and revalidates storefront paths', () => {
  const source = readFileSync('app/admin/(protected)/products/[id]/edit/actions.ts', 'utf8')

  assert.match(source, /'use server'/)
  assert.match(source, /requireAdmin\(\)/)
  assert.match(source, /validateProductEditForm/)
  assert.match(source, /updateAdminProduct/)
  assert.match(source, /revalidatePath\('\/'\)/)
  assert.match(source, /revalidatePath\('\/products'\)/)
  assert.match(source, /revalidatePath\(`\/products\/\$\{productId\}`\)/)
  assert.match(source, /revalidatePath\('\/api\/products\/by-ids'\)/)
})

test('product edit repository validates relationships and writes audit log', () => {
  const source = readFileSync('lib/admin/repository.ts', 'utf8')

  assert.match(source, /from\(schema\.brands\)\.where\(eq\(schema\.brands\.id, input\.brandId\)\)/)
  assert.match(source, /from\(schema\.categories\)\.where\(eq\(schema\.categories\.id, input\.categoryId\)\)/)
  assert.match(source, /db\.update\(schema\.products\)/)
  assert.match(source, /db\.insert\(schema\.auditLog\)/)
  assert.match(source, /action: 'product\.update'/)
  assert.match(source, /updatedBy: admin\.email/)
})

test('admin product edit UI is server protected and not client-state authorized', () => {
  const pageSource = readFileSync('app/admin/(protected)/products/[id]/edit/page.tsx', 'utf8')
  const formSource = readFileSync('app/admin/(protected)/products/[id]/edit/product-edit-form.tsx', 'utf8')
  const layoutSource = readFileSync('app/admin/(protected)/layout.tsx', 'utf8')

  assert.match(layoutSource, /requireAdmin\(\)/)
  assert.match(pageSource, /getAdminProductEdit/)
  assert.match(pageSource, /getAdminProductEditOptions/)
  assert.match(formSource, /useActionState\(updateProductAction/)
  assert.doesNotMatch(formSource, /localStorage|sessionStorage/)
})

test('admin product list and preview expose edit actions without delete or upload controls', () => {
  const listSource = readFileSync('app/admin/(protected)/products/page.tsx', 'utf8')
  const previewSource = readFileSync('app/admin/(protected)/products/[id]/page.tsx', 'utf8')

  assert.match(listSource, /\/admin\/products\/\$\{product\.id\}\/edit/)
  assert.match(previewSource, /\/admin\/products\/\$\{product\.id\}\/edit/)
  assert.match(previewSource, /getAdminProductAuditSummary/)
  assert.doesNotMatch(listSource + previewSource, /Delete Product|Upload Image|Create Product|Add New Product/)
})
