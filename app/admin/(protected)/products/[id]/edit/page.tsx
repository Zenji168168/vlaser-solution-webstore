import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getAdminProductEdit, getAdminProductEditOptions } from '@/lib/admin/repository'
import { ProductEditForm, type ProductEditFormValues } from './product-edit-form'

interface Props {
  params: Promise<{ id: string }>
}

function toFormValues(product: NonNullable<Awaited<ReturnType<typeof getAdminProductEdit>>>): ProductEditFormValues {
  return {
    publicId: product.id,
    nameEn: product.nameEn,
    nameKm: product.nameKm || '',
    sku: product.sku,
    model: product.model || '',
    brandId: product.brandId || 0,
    categoryId: product.categoryId || 0,
    price: product.price.toFixed(2),
    stockQty: product.stockQty,
    stockStatus: product.stockStatus,
    published: product.published,
    archived: product.archived,
    shortDescEn: product.shortDescEn || '',
    shortDescKm: product.shortDescKm || '',
    descEn: product.descEn || '',
    descKm: product.descKm || '',
    warrantyEn: product.warrantyEn || '',
    warrantyKm: product.warrantyKm || '',
    installationEn: product.installationEn || '',
    installationKm: product.installationKm || '',
    seoTitleEn: product.seoTitleEn || '',
    seoDescEn: product.seoDescEn || '',
  }
}

export default async function AdminProductEditPage({ params }: Props) {
  const { id } = await params
  const [product, options] = await Promise.all([
    getAdminProductEdit(id),
    getAdminProductEditOptions(),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/admin/products/${product.id}`} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Product Preview
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-slate-950">Edit Product</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Update existing catalog fields for {product.sku}. Changes are audited and refreshed across the storefront.
        </p>
      </div>

      <ProductEditForm product={toFormValues(product)} categories={options.categories} brands={options.brands} />
    </div>
  )
}
