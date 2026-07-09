import './mock-server-only'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  buildProductImageAuditDetails,
  buildProductImageBlobPath,
  isAllowedProductImageType,
  PRODUCT_IMAGE_MAX_BYTES,
  sanitizeProductImageFilename,
  validateProductImageAltText,
  validateProductImageFile,
} from '../lib/admin/product-image-management'

test('product image upload validation accepts supported image files', () => {
  const file = new File(['hello'], 'camera.webp', { type: 'image/webp' })

  assert.equal(validateProductImageFile(file), null)
  assert.equal(isAllowedProductImageType('image/jpeg'), true)
  assert.equal(isAllowedProductImageType('image/png'), true)
  assert.equal(isAllowedProductImageType('image/webp'), true)
})

test('product image upload validation rejects unsafe file types and oversized files', () => {
  const svg = new File(['<svg />'], 'bad.svg', { type: 'image/svg+xml' })
  const pdf = new File(['pdf'], 'bad.pdf', { type: 'application/pdf' })
  const huge = new File([new Uint8Array(PRODUCT_IMAGE_MAX_BYTES + 1)], 'huge.jpg', { type: 'image/jpeg' })

  assert.equal(validateProductImageFile(svg), 'Upload a JPEG, PNG, or WebP image.')
  assert.equal(validateProductImageFile(pdf), 'Upload a JPEG, PNG, or WebP image.')
  assert.equal(validateProductImageFile(huge), 'Image must be 5 MB or smaller.')
})

test('product image blob paths include public product id and sanitize filenames', () => {
  assert.equal(sanitizeProductImageFilename('../Bad File!!.PNG'), 'bad-file')
  assert.equal(
    buildProductImageBlobPath('p0001', '../Bad File!!.PNG', 'image/png', 12345),
    'products/p0001/12345-bad-file.png',
  )
  assert.equal(
    buildProductImageBlobPath('not-safe', 'camera.webp', 'image/webp', 12345),
    'products/unknown-product/12345-camera.webp',
  )
})

test('product image alt text validation limits both languages', () => {
  assert.equal(validateProductImageAltText('a'.repeat(300), 'English alt text'), null)
  assert.match(validateProductImageAltText('a'.repeat(301), 'English alt text') || '', /300/)
})

test('product image audit details are safe and scoped', () => {
  const details = JSON.parse(buildProductImageAuditDetails({
    productId: 'p0001',
    imageId: 42,
    imageUrl: 'https://example.com/image.webp',
    adminEmail: 'meukthareach053@gmail.com',
    changedFields: ['altEn'],
  }))

  assert.equal(details.productId, 'p0001')
  assert.equal(details.imageId, 42)
  assert.deepEqual(details.changedFields, ['altEn'])
  assert.doesNotMatch(JSON.stringify(details), /token|cookie|secret|password/i)
})

test('product image server actions require admin and protect Blob token', () => {
  const source = readFileSync('app/admin/(protected)/products/[id]/image-actions.ts', 'utf8')

  assert.match(source, /'use server'/)
  assert.match(source, /requireAdmin\(\)/)
  assert.match(source, /BLOB_READ_WRITE_TOKEN/)
  assert.match(source, /Image upload is not configured/)
  assert.match(source, /validateProductImageFile/)
  assert.match(source, /setAdminProductPrimaryImage/)
  assert.match(source, /updateAdminProductImageAltText/)
  assert.match(source, /removeAdminProductImage/)
  assert.match(source, /revalidatePath\('\/'\)/)
  assert.match(source, /revalidatePath\('\/products'\)/)
  assert.match(source, /revalidatePath\('\/api\/products\/by-ids'\)/)
  assert.doesNotMatch(source, /searchParams|get\('secret'\)|nextUrl\.search/)
})

test('product image repository verifies product and image ownership before mutation', () => {
  const source = readFileSync('lib/admin/repository.ts', 'utf8')

  assert.match(source, /getProductImageById\(publicId: string, imageId: number\)/)
  assert.match(source, /innerJoin\(schema\.products/)
  assert.match(source, /eq\(schema\.products\.publicId, publicId\)/)
  assert.match(source, /eq\(schema\.productImages\.id, imageId\)/)
  assert.match(source, /action: 'product\.image\.upload'/)
  assert.match(source, /action: 'product\.image\.primary'/)
  assert.match(source, /action: 'product\.image\.alt\.update'/)
  assert.match(source, /action: 'product\.image\.remove'/)
})

test('product images manager exposes upload, primary, alt text, and remove controls without secrets', () => {
  const source = readFileSync('app/admin/(protected)/products/[id]/product-images-manager.tsx', 'utf8')
  const preview = readFileSync('app/admin/(protected)/products/[id]/page.tsx', 'utf8')

  assert.match(preview, /ProductImagesManager/)
  assert.match(source, /type="file"/)
  assert.match(source, /Set primary/)
  assert.match(source, /English alt text/)
  assert.match(source, /Khmer alt text/)
  assert.match(source, /Type remove to confirm/)
  assert.match(source, /object-contain/)
  assert.doesNotMatch(source, /BLOB_READ_WRITE_TOKEN|DATABASE_URL|POSTGRES_URL|SECRET/)
})

test('product image actions keep existing storefront image mapping behavior intact', () => {
  const repository = readFileSync('lib/repositories/product-repository.ts', 'utf8')

  assert.match(repository, /selectPreferredProductImages/)
  assert.match(repository, /desc\(schema\.productImages\.isPrimary\)/)
  assert.match(repository, /asc\(schema\.productImages\.sortOrder\)/)
  assert.match(repository, /asc\(schema\.productImages\.id\)/)
})
