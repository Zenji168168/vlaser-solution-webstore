import 'server-only'
import { revalidateTag } from 'next/cache'

// Cache tag constants
export const CACHE_TAGS = {
  products: 'products',
  categories: 'categories',
  brands: 'brands',
  homepageProducts: 'homepage-products',
  product: (publicId: string) => `product:${publicId}`,
  related: (publicId: string) => `related:${publicId}`,
  productsByIds: 'products-by-ids',
}

// Revalidation helpers - call these from future admin mutations
export function revalidateProduct(publicId: string) {
  revalidateTag(CACHE_TAGS.product(publicId), 'max')
  revalidateTag(CACHE_TAGS.related(publicId), 'max')
  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateTag(CACHE_TAGS.productsByIds, 'max')
}

export function revalidateProductLists() {
  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateTag(CACHE_TAGS.homepageProducts, 'max')
  revalidateTag(CACHE_TAGS.productsByIds, 'max')
}

export function revalidateCategories() {
  revalidateTag(CACHE_TAGS.categories, 'max')
  revalidateTag(CACHE_TAGS.products, 'max')
}

export function revalidateBrands() {
  revalidateTag(CACHE_TAGS.brands, 'max')
  revalidateTag(CACHE_TAGS.products, 'max')
}

export function revalidateHomepageProducts() {
  revalidateTag(CACHE_TAGS.homepageProducts, 'max')
}

export function revalidateRelatedProducts(publicId: string) {
  revalidateTag(CACHE_TAGS.related(publicId), 'max')
}

export function revalidateAllProductData() {
  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateTag(CACHE_TAGS.categories, 'max')
  revalidateTag(CACHE_TAGS.brands, 'max')
  revalidateTag(CACHE_TAGS.homepageProducts, 'max')
  revalidateTag(CACHE_TAGS.productsByIds, 'max')
}

// Usage notes for future admin CRUD:
// After createProduct(data):    revalidateProductLists(), revalidateCategories()
// After updateProduct(id, data): revalidateProduct(id), revalidateProductLists()
// After publishProduct(id):     revalidateProduct(id), revalidateProductLists(), revalidateHomepageProducts()
// After archiveProduct(id):     revalidateProduct(id), revalidateProductLists()
// After updateCategory(slug):   revalidateCategories()
// After updateBrand(slug):      revalidateBrands()
