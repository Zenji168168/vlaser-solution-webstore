'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { ImageUp, Save, Star, Trash2 } from 'lucide-react'
import {
  removeProductImageAction,
  setPrimaryProductImageAction,
  updateProductImageAltTextAction,
  uploadProductImageAction,
} from './image-actions'
import {
  initialProductImageActionState,
  PRODUCT_IMAGE_ALLOWED_TYPES,
  PRODUCT_IMAGE_MAX_BYTES,
  type ProductImageActionState,
} from '@/lib/admin/product-image-management'

type ProductImage = {
  id: number
  url: string
  altEn: string | null
  altKm: string | null
  isPrimary: boolean
  sortOrder: number
}

function SubmitButton({ children, variant = 'secondary' }: { children: React.ReactNode; variant?: 'primary' | 'secondary' | 'danger' }) {
  const { pending } = useFormStatus()
  const className = variant === 'primary'
    ? 'btn-primary min-h-10 rounded-lg bg-slate-950 px-3 hover:bg-slate-800'
    : variant === 'danger'
      ? 'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-bold text-red-700 hover:bg-red-50 focus-ring'
      : 'btn-secondary min-h-10 rounded-lg px-3'

  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? 'Working...' : children}
    </button>
  )
}

function StatusMessage({ state }: { state: ProductImageActionState }) {
  if (!state.message) return null
  return (
    <p className={`rounded-lg border px-3 py-2 text-sm font-semibold ${state.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
      {state.message}
    </p>
  )
}

function UploadImageForm({ productId }: { productId: string }) {
  const [state, formAction] = useActionState(uploadProductImageAction, initialProductImageActionState)
  const setupRequired = typeof state.message === 'string' && state.message.includes('not configured')

  return (
    <form action={formAction} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <input type="hidden" name="productId" value={productId} />
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <label className="block">
          <span className="text-sm font-bold text-slate-800">Upload image</span>
          <input
            name="image"
            type="file"
            accept={PRODUCT_IMAGE_ALLOWED_TYPES.join(',')}
            className="mt-1 block w-full text-sm file:mr-3 file:min-h-10 file:rounded-lg file:border-0 file:bg-slate-950 file:px-4 file:text-sm file:font-bold file:text-white hover:file:bg-slate-800"
          />
          <span className="mt-1 block text-xs text-slate-500">JPEG, PNG, or WebP. Max {(PRODUCT_IMAGE_MAX_BYTES / 1024 / 1024).toFixed(0)} MB.</span>
          {state.fieldErrors?.image && <span className="mt-1 block text-sm font-semibold text-red-700">{state.fieldErrors.image}</span>}
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-slate-800">English alt text</span>
            <input name="altEn" className="input-field mt-1 min-h-10 rounded-lg" />
            {state.fieldErrors?.altEn && <span className="mt-1 block text-sm font-semibold text-red-700">{state.fieldErrors.altEn}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-800">Khmer alt text</span>
            <input name="altKm" className="input-field mt-1 min-h-10 rounded-lg font-khmer" />
            {state.fieldErrors?.altKm && <span className="mt-1 block text-sm font-semibold text-red-700">{state.fieldErrors.altKm}</span>}
          </label>
        </div>
        <SubmitButton variant="primary">
          <ImageUp className="size-4" aria-hidden="true" />
          Upload
        </SubmitButton>
      </div>
      <div className="mt-3">
        <StatusMessage state={state} />
        {setupRequired && <p className="mt-2 text-xs text-slate-600">Configure Blob storage for this Preview environment to enable uploads.</p>}
      </div>
    </form>
  )
}

function ImageAltForm({ productId, image }: { productId: string; image: ProductImage }) {
  const [state, formAction] = useActionState(updateProductImageAltTextAction, initialProductImageActionState)

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="imageId" value={image.id} />
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">English alt text</span>
        <input name="altEn" defaultValue={image.altEn || ''} className="input-field mt-1 min-h-10 rounded-lg" />
        {state.fieldErrors?.altEn && <span className="mt-1 block text-sm font-semibold text-red-700">{state.fieldErrors.altEn}</span>}
      </label>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Khmer alt text</span>
        <input name="altKm" defaultValue={image.altKm || ''} className="input-field mt-1 min-h-10 rounded-lg font-khmer" />
        {state.fieldErrors?.altKm && <span className="mt-1 block text-sm font-semibold text-red-700">{state.fieldErrors.altKm}</span>}
      </label>
      <SubmitButton>
        <Save className="size-4" aria-hidden="true" />
        Save alt text
      </SubmitButton>
      <StatusMessage state={state} />
    </form>
  )
}

function PrimaryImageForm({ productId, image }: { productId: string; image: ProductImage }) {
  const [state, formAction] = useActionState(setPrimaryProductImageAction, initialProductImageActionState)

  return (
    <form action={formAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="imageId" value={image.id} />
      <SubmitButton variant={image.isPrimary ? 'primary' : 'secondary'}>
        <Star className="size-4" aria-hidden="true" />
        {image.isPrimary ? 'Primary image' : 'Set primary'}
      </SubmitButton>
      <div className="mt-2"><StatusMessage state={state} /></div>
    </form>
  )
}

function RemoveImageForm({ productId, image }: { productId: string; image: ProductImage }) {
  const [state, formAction] = useActionState(removeProductImageAction, initialProductImageActionState)

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="imageId" value={image.id} />
      <label className="block">
        <span className="text-xs font-semibold text-slate-600">Type remove to confirm</span>
        <input name="confirmRemove" className="input-field mt-1 min-h-10 rounded-lg" placeholder="remove" />
      </label>
      <SubmitButton variant="danger">
        <Trash2 className="size-4" aria-hidden="true" />
        Remove image
      </SubmitButton>
      <StatusMessage state={state} />
    </form>
  )
}

export function ProductImagesManager({ productId, productName, images }: { productId: string; productName: string; images: ProductImage[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-base font-black text-slate-950">Product Images</h2>
          <p className="mt-1 text-sm text-slate-600">Manage existing product images, primary selection, and accessible alt text.</p>
        </div>
        <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{images.length} image{images.length === 1 ? '' : 's'}</span>
      </div>

      <div className="mt-4">
        <UploadImageForm productId={productId} />
      </div>

      {images.length === 0 ? (
        <div className="mt-4 grid aspect-[4/3] place-items-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-500">No product images yet</div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {images.map(image => (
            <article key={image.id} className="grid gap-4 rounded-lg border border-slate-200 p-3 sm:grid-cols-[180px_1fr]">
              <div>
                <div className="relative aspect-square rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <img src={image.url} alt={image.altEn || productName} className="h-full w-full object-contain" />
                  {image.isPrimary && <span className="absolute left-2 top-2 rounded bg-emerald-600 px-2 py-1 text-xs font-bold text-white">Primary</span>}
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500">Order {image.sortOrder}</p>
              </div>
              <div className="min-w-0 space-y-4">
                <p className="break-all text-xs text-slate-500">{image.url}</p>
                <PrimaryImageForm productId={productId} image={image} />
                <ImageAltForm productId={productId} image={image} />
                <RemoveImageForm productId={productId} image={image} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
