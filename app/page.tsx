import { getCategories, getFeaturedProducts } from '@/lib/product-service'
import { HomeClient } from './home-client'

export default async function Home() {
  const categories = await getCategories()
  const featured = await getFeaturedProducts(8)
  const catCounts: Record<string, number> = {}
  // Get counts from static data for now (efficient)
  const { products } = await import('@/lib/products-data')
  categories.filter(c => c !== 'All').forEach(c => {
    catCounts[c] = products.filter(p => p.category === c).length
  })

  return <HomeClient categories={categories} featured={featured} catCounts={catCounts} totalProducts={products.length} />
}
