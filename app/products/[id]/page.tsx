import { notFound } from 'next/navigation'
import { getProductById, getRelatedProducts } from '@/lib/product-service'
import { ProductDetailClient } from './product-detail-client'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: `${product.name} | Vlaser Store`,
    description: product.description?.substring(0, 160) || `${product.brand} ${product.name} - ${product.category}`,
    openGraph: {
      title: product.name,
      description: product.description?.substring(0, 160) || `${product.brand} ${product.name}`,
      images: product.image && product.image !== '/placeholder.svg' ? [product.image] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  const related = await getRelatedProducts(product.id, product.category, product.brand)

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image !== '/placeholder.svg' ? product.image : undefined,
    description: product.description || undefined,
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brand },
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: 'USD',
      availability: product.status === 'Out of Stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: `https://store.vlasersolution.com/products/${product.id}`,
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://store.vlasersolution.com' },
      { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://store.vlasersolution.com/products' },
      { '@type': 'ListItem', position: 3, name: product.category, item: `https://store.vlasersolution.com/products?category=${encodeURIComponent(product.category)}` },
      { '@type': 'ListItem', position: 4, name: product.name },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ProductDetailClient product={product} related={related} />
    </>
  )
}
