import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { getAdminProductPreview, getStockLabel } from '@/lib/admin/repository'

interface Props {
  params: Promise<{ id: string }>
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-950">{value || 'N/A'}</dd>
    </div>
  )
}

function TextBlock({ title, value }: { title: string; value: string | null }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-black text-slate-950">{title}</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{value || 'No content provided.'}</p>
    </section>
  )
}

export default async function AdminProductPreviewPage({ params }: Props) {
  const { id } = await params
  const product = await getAdminProductPreview(id)
  if (!product) notFound()

  const publishState = product.archived ? 'Archived' : product.published ? 'Published' : 'Draft'

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <Link href="/admin/products" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Products
          </Link>
          <h1 className="max-w-4xl text-2xl font-black tracking-tight text-slate-950">{product.nameEn}</h1>
          <p className="mt-1 font-mono text-sm text-slate-500">{product.sku}</p>
        </div>
        {product.published && !product.archived ? (
          <Link href={`/products/${product.id}`} className="btn-primary h-10 rounded-lg bg-slate-950 px-4 hover:bg-slate-800">
            <ExternalLink className="size-4" aria-hidden="true" />
            Open Public Product Page
          </Link>
        ) : (
          <span className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">Not public</span>
        )}
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(280px,420px)_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-black text-slate-950">Images</h2>
          {product.images.length === 0 ? (
            <div className="grid aspect-[4/3] place-items-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-500">No images</div>
          ) : (
            <div className="grid gap-3">
              <img src={product.images[0].url} alt={product.images[0].altEn || product.nameEn} className="aspect-[4/3] w-full rounded-lg border border-slate-200 object-contain" />
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map(image => (
                    <img key={image.url} src={image.url} alt={image.altEn || ''} className="aspect-square rounded-lg border border-slate-200 object-contain" />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-black text-slate-950">Product Information</h2>
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field label="Public ID" value={product.id} />
            <Field label="Model" value={product.model} />
            <Field label="Brand" value={product.brand} />
            <Field label="Category" value={product.category} />
            <Field label="Price" value={`$${product.price.toFixed(2)}`} />
            <Field label="Original price" value={product.originalPrice ? `$${product.originalPrice.toFixed(2)}` : 'N/A'} />
            <Field label="Stock" value={`${product.stockQty} - ${getStockLabel(product.stockQty, product.stockStatus)}`} />
            <Field label="Published state" value={publishState} />
            <Field label="Khmer name" value={product.nameKm || 'Missing'} />
            <Field label="Updated" value={product.updatedAt ? product.updatedAt.toLocaleString('en-US') : 'N/A'} />
            <Field label="Created" value={product.createdAt ? product.createdAt.toLocaleString('en-US') : 'N/A'} />
            <Field label="Published at" value={product.publishedAt ? product.publishedAt.toLocaleString('en-US') : 'N/A'} />
          </dl>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <TextBlock title="English Description" value={product.descEn || product.shortDescEn} />
        <TextBlock title="Khmer Description" value={product.descKm || product.shortDescKm} />
        <TextBlock title="Warranty" value={product.warrantyEn} />
        <TextBlock title="Installation" value={product.installationEn} />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-black text-slate-950">Features</h2>
        {product.features.length ? (
          <ul className="mt-3 grid gap-2 text-sm text-slate-700">
            {product.features.map((feature, index) => (
              <li key={`${feature.featureEn}-${index}`} className="rounded-lg bg-slate-50 p-3">
                <p>{feature.featureEn}</p>
                {feature.featureKm && <p className="mt-1 font-khmer text-slate-600">{feature.featureKm}</p>}
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-slate-600">No features provided.</p>}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-black text-slate-950">Specifications</h2>
        {product.specs.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr><th className="px-3 py-2">Group</th><th className="px-3 py-2">Key</th><th className="px-3 py-2">Value</th><th className="px-3 py-2">Khmer key</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {product.specs.map((spec, index) => (
                  <tr key={`${spec.keyEn}-${index}`}>
                    <td className="px-3 py-2">{spec.groupEn || 'General'}</td>
                    <td className="px-3 py-2 font-semibold">{spec.keyEn}</td>
                    <td className="px-3 py-2">{spec.value}</td>
                    <td className="px-3 py-2 font-khmer">{spec.keyKm || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="mt-2 text-sm text-slate-600">No specifications provided.</p>}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-black text-slate-950">SEO Fields</h2>
        <dl className="mt-3 grid gap-4 md:grid-cols-2">
          <Field label="SEO title EN" value={product.seoTitleEn} />
          <Field label="SEO title KM" value={product.seoTitleKm} />
          <Field label="SEO description EN" value={product.seoDescEn} />
          <Field label="SEO description KM" value={product.seoDescKm} />
        </dl>
      </section>
    </div>
  )
}
