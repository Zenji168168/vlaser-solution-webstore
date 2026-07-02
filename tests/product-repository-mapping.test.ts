import './mock-server-only'
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  mapProductRowToStorefront,
  prepareRelatedProductRows,
  selectPreferredProductImages,
} from '../lib/repositories/product-repository'

const baseRow = {
  id: 101,
  publicId: 'p0002',
  sku: 'ATE-AT5B-5406',
  nameEn: 'ATE-AT5B-5406 AT5B-5406 ATECH RACK 6U',
  descEn: 'ATECH rack product',
  price: '48.00',
  stockQty: 0,
  stockStatus: 'Price List',
  brandName: 'ATECH',
  categoryName: 'Cabinet',
}

test('repository image selection prefers primary image', () => {
  const images = selectPreferredProductImages([
    { id: 2, productId: 101, url: 'https://example.com/sorted.jpg', isPrimary: false, sortOrder: 0 },
    { id: 3, productId: 101, url: 'https://example.com/primary.jpg', isPrimary: true, sortOrder: 5 },
  ])

  assert.equal(images.get(101), 'https://example.com/primary.jpg')
})

test('repository image selection falls back to first sorted image when no primary exists', () => {
  const images = selectPreferredProductImages([
    { id: 4, productId: 102, url: 'https://example.com/second.jpg', isPrimary: false, sortOrder: 2 },
    { id: 5, productId: 102, url: 'https://example.com/first.jpg', isPrimary: false, sortOrder: 0 },
  ])

  assert.equal(images.get(102), 'https://example.com/first.jpg')
})

test('storefront mapper uses valid related product image and only falls back when missing', () => {
  const withImage = mapProductRowToStorefront(baseRow, 'https://example.com/atech.jpg')
  const withoutImage = mapProductRowToStorefront(baseRow)

  assert.equal(withImage.image, 'https://example.com/atech.jpg')
  assert.equal(withoutImage.image, '/placeholder.svg')
})

test('related product rows exclude current product and preserve deterministic limited order', () => {
  const rows = [
    { ...baseRow, id: 100, publicId: 'p0001', sku: 'CURRENT' },
    { ...baseRow, id: 101, publicId: 'p0002', sku: 'ATE-AT5B-5406' },
    { ...baseRow, id: 102, publicId: 'p0003', sku: 'ATE-AT5B-5409' },
    { ...baseRow, id: 103, publicId: 'p0004', sku: 'ATE-AT5B-5412' },
    { ...baseRow, id: 104, publicId: 'p0006', sku: 'ATE-AT6B-6612' },
    { ...baseRow, id: 105, publicId: 'p0007', sku: 'EXTRA' },
  ]

  const related = prepareRelatedProductRows(rows, 'p0001', 4)

  assert.deepEqual(related.map(row => row.publicId), ['p0002', 'p0003', 'p0004', 'p0006'])
})
