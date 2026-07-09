export const PRODUCT_IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024

export type ProductImageActionState = {
  ok: boolean
  message: string
  fieldErrors?: Record<string, string>
}

export const initialProductImageActionState: ProductImageActionState = {
  ok: false,
  message: '',
  fieldErrors: {},
}

export function isAllowedProductImageType(type: string) {
  return PRODUCT_IMAGE_ALLOWED_TYPES.includes(type as (typeof PRODUCT_IMAGE_ALLOWED_TYPES)[number])
}

export function validateProductImageFile(file: File | null | undefined) {
  if (!file || file.size === 0) return 'Choose an image to upload.'
  if (!isAllowedProductImageType(file.type)) return 'Upload a JPEG, PNG, or WebP image.'
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) return 'Image must be 5 MB or smaller.'
  return null
}

export function sanitizeProductImageFilename(name: string) {
  const fallback = 'product-image'
  const clean = name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return clean || fallback
}

export function extensionForProductImageType(type: string) {
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  return 'jpg'
}

export function buildProductImageBlobPath(productId: string, filename: string, type: string, timestamp = Date.now()) {
  const safeProductId = /^p\d{4,}$/.test(productId) ? productId : 'unknown-product'
  return `products/${safeProductId}/${timestamp}-${sanitizeProductImageFilename(filename)}.${extensionForProductImageType(type)}`
}

export function validateProductImageAltText(value: string, label: string) {
  if (value.trim().length > 300) return `${label} must be 300 characters or fewer.`
  return null
}

export function buildProductImageAuditDetails(input: {
  productId: string
  imageId?: number
  imageUrl?: string
  adminEmail: string
  changedFields?: string[]
}) {
  return JSON.stringify({
    productId: input.productId,
    imageId: input.imageId,
    imageUrl: input.imageUrl,
    adminEmail: input.adminEmail,
    changedFields: input.changedFields || [],
  })
}
