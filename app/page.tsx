import { getCategories, getFeaturedProducts, getCategoryCounts, getProductCount } from '@/lib/product-service'
import { HomeClient } from './home-client'

export default async function Home() {
  const [categories, featured, catCounts, totalProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getCategoryCounts(),
    getProductCount(),
  ])

  return <HomeClient categories={categories} featured={featured} catCounts={catCounts} totalProducts={totalProducts} />
}
