import { getProducts, getCategories, getBrands } from '@/lib/product-service'
import { ProductsClient } from './products-client'

interface Props { searchParams: Promise<Record<string, string | undefined>> }

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const options = {
    search: params.search || undefined,
    category: params.category || undefined,
    brand: params.brand || undefined,
    availability: params.availability || undefined,
    sort: params.sort || undefined,
    page: params.page ? parseInt(params.page) : 1,
    pageSize: 24,
  }

  const [result, categories, brands] = await Promise.all([
    getProducts(options),
    getCategories(),
    getBrands(),
  ])

  return (
    <ProductsClient
      initialProducts={result.products}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      totalPages={result.totalPages}
      categories={categories}
      brands={brands}
      initialSearch={params.search || ''}
      initialCategory={params.category || 'All'}
      initialBrand={params.brand || 'All'}
      initialSort={params.sort || 'name'}
    />
  )
}
