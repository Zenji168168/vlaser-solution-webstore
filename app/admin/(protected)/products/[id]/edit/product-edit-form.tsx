'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { AlertTriangle, CheckCircle2, ExternalLink, Save } from 'lucide-react'
import { initialProductEditState, updateProductAction } from './actions'
import { STOCK_STATUS_OPTIONS, type ProductEditFieldErrors } from '@/lib/admin/product-editing'

type SelectOption = { id: number; name: string; slug: string }

export type ProductEditFormValues = {
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

function FieldError({ name, errors }: { name: keyof ProductEditFieldErrors; errors: ProductEditFieldErrors }) {
  const error = errors[name]
  if (!error) return null
  return <p className="mt-1 text-sm font-semibold text-red-700">{error}</p>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-black text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  )
}

function TextField({
  label,
  name,
  defaultValue,
  errors,
  type = 'text',
  inputMode,
  required,
}: {
  label: string
  name: keyof ProductEditFormValues
  defaultValue: string | number
  errors: ProductEditFieldErrors
  type?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        defaultValue={defaultValue}
        required={required}
        className="input-field mt-1 min-h-11 rounded-lg"
      />
      <FieldError name={name} errors={errors} />
    </label>
  )
}

function TextArea({
  label,
  name,
  defaultValue,
  errors,
  khmer,
  rows = 4,
}: {
  label: string
  name: keyof ProductEditFormValues
  defaultValue: string
  errors: ProductEditFieldErrors
  khmer?: boolean
  rows?: number
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className={`input-field mt-1 min-h-28 rounded-lg leading-7 ${khmer ? 'font-khmer' : ''}`}
      />
      <FieldError name={name} errors={errors} />
    </label>
  )
}

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="btn-primary min-h-11 rounded-lg bg-slate-950 px-5 hover:bg-slate-800" disabled={pending}>
      <Save className="size-4" aria-hidden="true" />
      {pending ? 'Saving...' : 'Save Product'}
    </button>
  )
}

export function ProductEditForm({
  product,
  categories,
  brands,
}: {
  product: ProductEditFormValues
  categories: SelectOption[]
  brands: SelectOption[]
}) {
  const [state, formAction] = useActionState(updateProductAction, initialProductEditState)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  useEffect(() => {
    if (state.ok) setDirty(false)
  }, [state.ok])

  return (
    <form action={formAction} onChange={() => setDirty(true)} className="space-y-5">
      <input type="hidden" name="publicId" value={product.publicId} />

      {state.message && (
        <div className={`flex items-start gap-3 rounded-lg border p-4 text-sm font-semibold ${state.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
          {state.ok ? <CheckCircle2 className="mt-0.5 size-4" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 size-4" aria-hidden="true" />}
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Section title="Basic Information">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="English product name" name="nameEn" defaultValue={product.nameEn} errors={state.fieldErrors} required />
              <TextField label="SKU" name="sku" defaultValue={product.sku} errors={state.fieldErrors} required />
              <TextField label="Model" name="model" defaultValue={product.model} errors={state.fieldErrors} />
              <label className="block">
                <span className="text-sm font-bold text-slate-800">Brand</span>
                <select name="brandId" defaultValue={product.brandId} className="input-field mt-1 min-h-11 rounded-lg">
                  {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
                <FieldError name="brandId" errors={state.fieldErrors} />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-800">Category</span>
                <select name="categoryId" defaultValue={product.categoryId} className="input-field mt-1 min-h-11 rounded-lg">
                  {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                <FieldError name="categoryId" errors={state.fieldErrors} />
              </label>
            </div>
          </Section>

          <Section title="Product Content">
            <TextArea label="English short description" name="shortDescEn" defaultValue={product.shortDescEn} errors={state.fieldErrors} rows={3} />
            <TextArea label="English full description" name="descEn" defaultValue={product.descEn} errors={state.fieldErrors} rows={7} />
            <div className="grid gap-4 md:grid-cols-2">
              <TextArea label="English warranty text" name="warrantyEn" defaultValue={product.warrantyEn} errors={state.fieldErrors} rows={4} />
              <TextArea label="English installation text" name="installationEn" defaultValue={product.installationEn} errors={state.fieldErrors} rows={4} />
            </div>
          </Section>

          <Section title="Khmer Content">
            <TextField label="Khmer product name" name="nameKm" defaultValue={product.nameKm} errors={state.fieldErrors} />
            <TextArea label="Khmer short description" name="shortDescKm" defaultValue={product.shortDescKm} errors={state.fieldErrors} khmer rows={3} />
            <TextArea label="Khmer full description" name="descKm" defaultValue={product.descKm} errors={state.fieldErrors} khmer rows={7} />
            <div className="grid gap-4 md:grid-cols-2">
              <TextArea label="Khmer warranty text" name="warrantyKm" defaultValue={product.warrantyKm} errors={state.fieldErrors} khmer rows={4} />
              <TextArea label="Khmer installation text" name="installationKm" defaultValue={product.installationKm} errors={state.fieldErrors} khmer rows={4} />
            </div>
          </Section>
        </div>

        <aside className="space-y-5">
          <Section title="Pricing and Stock">
            <TextField label="USD price" name="price" defaultValue={product.price} errors={state.fieldErrors} type="number" inputMode="decimal" required />
            <TextField label="Stock quantity" name="stockQty" defaultValue={product.stockQty} errors={state.fieldErrors} type="number" inputMode="numeric" required />
            <label className="block">
              <span className="text-sm font-bold text-slate-800">Stock status / availability</span>
              <select name="stockStatus" defaultValue={product.stockStatus} className="input-field mt-1 min-h-11 rounded-lg">
                {STOCK_STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
              <FieldError name="stockStatus" errors={state.fieldErrors} />
            </label>
          </Section>

          <Section title="SEO">
            <TextField label="SEO title" name="seoTitleEn" defaultValue={product.seoTitleEn} errors={state.fieldErrors} />
            <TextArea label="SEO description" name="seoDescEn" defaultValue={product.seoDescEn} errors={state.fieldErrors} rows={4} />
          </Section>

          <Section title="Publishing">
            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
              <input type="checkbox" name="published" defaultChecked={product.published} className="mt-1 size-4" />
              <span>
                <span className="block text-sm font-bold text-slate-900">Published</span>
                <span className="block text-xs leading-5 text-slate-600">Visible on the public storefront when not archived.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <input type="checkbox" name="archived" defaultChecked={product.archived} className="mt-1 size-4" />
              <span>
                <span className="block text-sm font-bold text-amber-950">Archived</span>
                <span className="block text-xs leading-5 text-amber-800">Confirm intentionally before hiding this product from public views.</span>
              </span>
            </label>
          </Section>

          <div className="sticky bottom-4 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
            <div className="flex flex-col gap-2">
              <SaveButton />
              <Link href={`/admin/products/${product.publicId}`} className="btn-secondary min-h-11 rounded-lg px-4">Back to product preview</Link>
              <Link href="/admin/products" className="btn-secondary min-h-11 rounded-lg px-4">Cancel</Link>
              <Link href={`/products/${product.publicId}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-ring">
                <ExternalLink className="size-4" aria-hidden="true" />
                View public product
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </form>
  )
}
