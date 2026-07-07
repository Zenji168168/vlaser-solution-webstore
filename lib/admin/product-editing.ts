export const STOCK_STATUS_OPTIONS = ['Price List', 'In Stock', 'Low Stock', 'Out of Stock'] as const

export type ProductEditValues = {
  publicId: string
  nameEn: string
  nameKm: string
  sku: string
  model: string
  brandId: number
  categoryId: number
  price: string
  stockQty: number
  stockStatus: string
  published: boolean
  archived: boolean
  shortDescEn: string
  shortDescKm: string
  descEn: string
  descKm: string
  warrantyEn: string
  warrantyKm: string
  installationEn: string
  installationKm: string
  seoTitleEn: string
  seoDescEn: string
}

export type ProductEditField = keyof ProductEditValues
export type ProductEditFieldErrors = Partial<Record<ProductEditField, string>>

export type ProductEditValidation =
  | { ok: true; values: ProductEditValues }
  | { ok: false; fieldErrors: ProductEditFieldErrors; formError: string }

const TEXT_LIMITS: Partial<Record<ProductEditField, number>> = {
  publicId: 20,
  nameEn: 300,
  nameKm: 300,
  sku: 100,
  model: 200,
  stockStatus: 50,
  shortDescEn: 1200,
  shortDescKm: 1200,
  descEn: 10000,
  descKm: 10000,
  warrantyEn: 2500,
  warrantyKm: 2500,
  installationEn: 2500,
  installationKm: 2500,
  seoTitleEn: 200,
  seoDescEn: 500,
}

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function numberValue(formData: FormData, key: string) {
  const value = stringValue(formData, key)
  return Number(value)
}

function addLengthErrors(values: Record<string, string>, errors: ProductEditFieldErrors) {
  for (const [field, limit] of Object.entries(TEXT_LIMITS) as Array<[ProductEditField, number]>) {
    const value = values[field]
    if (typeof value === 'string' && value.length > limit) {
      errors[field] = `Must be ${limit.toLocaleString()} characters or fewer.`
    }
  }
}

export function validateProductEditForm(formData: FormData): ProductEditValidation {
  const publicId = stringValue(formData, 'publicId')
  const nameEn = stringValue(formData, 'nameEn')
  const nameKm = stringValue(formData, 'nameKm')
  const sku = stringValue(formData, 'sku')
  const model = stringValue(formData, 'model')
  const price = stringValue(formData, 'price')
  const stockStatus = stringValue(formData, 'stockStatus')
  const shortDescEn = stringValue(formData, 'shortDescEn')
  const shortDescKm = stringValue(formData, 'shortDescKm')
  const descEn = stringValue(formData, 'descEn')
  const descKm = stringValue(formData, 'descKm')
  const warrantyEn = stringValue(formData, 'warrantyEn')
  const warrantyKm = stringValue(formData, 'warrantyKm')
  const installationEn = stringValue(formData, 'installationEn')
  const installationKm = stringValue(formData, 'installationKm')
  const seoTitleEn = stringValue(formData, 'seoTitleEn')
  const seoDescEn = stringValue(formData, 'seoDescEn')
  const brandId = numberValue(formData, 'brandId')
  const categoryId = numberValue(formData, 'categoryId')
  const stockQty = numberValue(formData, 'stockQty')
  const published = formData.get('published') === 'on'
  const archived = formData.get('archived') === 'on'
  const errors: ProductEditFieldErrors = {}

  if (!/^p\d{4,}$/.test(publicId)) errors.publicId = 'Invalid product ID.'
  if (!nameEn) errors.nameEn = 'English product name is required.'
  if (!sku) errors.sku = 'SKU is required.'
  if (!Number.isFinite(Number(price)) || price === '') errors.price = 'Enter a valid USD price.'
  else if (Number(price) < 0) errors.price = 'Price cannot be negative.'
  if (!Number.isInteger(stockQty)) errors.stockQty = 'Stock must be a whole number.'
  else if (stockQty < 0) errors.stockQty = 'Stock cannot be negative.'
  if (!Number.isInteger(brandId) || brandId <= 0) errors.brandId = 'Choose an existing brand.'
  if (!Number.isInteger(categoryId) || categoryId <= 0) errors.categoryId = 'Choose an existing category.'
  if (!STOCK_STATUS_OPTIONS.includes(stockStatus as (typeof STOCK_STATUS_OPTIONS)[number])) {
    errors.stockStatus = 'Choose a valid stock status.'
  }

  addLengthErrors({
    publicId,
    nameEn,
    nameKm,
    sku,
    model,
    stockStatus,
    shortDescEn,
    shortDescKm,
    descEn,
    descKm,
    warrantyEn,
    warrantyKm,
    installationEn,
    installationKm,
    seoTitleEn,
    seoDescEn,
  }, errors)

  if (Object.keys(errors).length) {
    return { ok: false, fieldErrors: errors, formError: 'Check the highlighted fields and try again.' }
  }

  return {
    ok: true,
    values: {
      publicId,
      nameEn,
      nameKm,
      sku,
      model,
      brandId,
      categoryId,
      price: Number(price).toFixed(2),
      stockQty,
      stockStatus,
      published,
      archived,
      shortDescEn,
      shortDescKm,
      descEn,
      descKm,
      warrantyEn,
      warrantyKm,
      installationEn,
      installationKm,
      seoTitleEn,
      seoDescEn,
    },
  }
}

function comparable(value: unknown) {
  if (value === undefined || value === '') return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  return value
}

export function getChangedProductEditFields(before: Partial<ProductEditValues>, after: ProductEditValues) {
  const fields = Object.keys(after) as ProductEditField[]
  return fields.filter(field => comparable(before[field]) !== comparable(after[field]))
}

export function buildProductUpdateAuditDetails(input: {
  productId: string
  sku: string
  adminEmail: string
  changedFields: string[]
  before: Partial<ProductEditValues>
  after: ProductEditValues
}) {
  const summary = input.changedFields.reduce<Record<string, { before: unknown; after: unknown }>>((acc, field) => {
    const key = field as ProductEditField
    acc[field] = {
      before: comparable(input.before[key]),
      after: comparable(input.after[key]),
    }
    return acc
  }, {})

  return JSON.stringify({
    productId: input.productId,
    sku: input.sku,
    adminEmail: input.adminEmail,
    changedFields: input.changedFields,
    summary,
  })
}
