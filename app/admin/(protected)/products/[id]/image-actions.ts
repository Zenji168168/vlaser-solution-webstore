'use server'

import { del, put } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'
import {
  addAdminProductImage,
  removeAdminProductImage,
  setAdminProductPrimaryImage,
  updateAdminProductImageAltText,
} from '@/lib/admin/repository'
import {
  buildProductImageBlobPath,
  initialProductImageActionState,
  validateProductImageAltText,
  validateProductImageFile,
  type ProductImageActionState,
} from '@/lib/admin/product-image-management'

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function numberValue(formData: FormData, key: string) {
  return Number(stringValue(formData, key))
}

function revalidateProductImagePaths(productId: string) {
  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath(`/products/${productId}`)
  revalidatePath('/admin')
  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${productId}`)
  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath('/api/products/by-ids')
}

function safeError(message = 'Image action could not be completed. Please try again.'): ProductImageActionState {
  return { ...initialProductImageActionState, ok: false, message }
}

function isBlobUrl(url: string) {
  return /^https:\/\/.+\.public\.blob\.vercel-storage\.com\//.test(url)
}

export async function uploadProductImageAction(_previousState: ProductImageActionState, formData: FormData): Promise<ProductImageActionState> {
  const access = await requireAdmin()
  const productId = stringValue(formData, 'productId')
  const altEn = stringValue(formData, 'altEn')
  const altKm = stringValue(formData, 'altKm')
  const file = formData.get('image')

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return safeError('Image upload is not configured for this environment.')
  }
  if (!(file instanceof File)) {
    return { ok: false, message: 'Check the highlighted fields and try again.', fieldErrors: { image: 'Choose an image to upload.' } }
  }

  const fileError = validateProductImageFile(file)
  const altEnError = validateProductImageAltText(altEn, 'English alt text')
  const altKmError = validateProductImageAltText(altKm, 'Khmer alt text')
  if (fileError || altEnError || altKmError) {
    return {
      ok: false,
      message: 'Check the highlighted fields and try again.',
      fieldErrors: {
        ...(fileError ? { image: fileError } : {}),
        ...(altEnError ? { altEn: altEnError } : {}),
        ...(altKmError ? { altKm: altKmError } : {}),
      },
    }
  }

  try {
    const blob = await put(buildProductImageBlobPath(productId, file.name, file.type), file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
    })
    const result = await addAdminProductImage({
      publicId: productId,
      url: blob.url,
      altEn,
      altKm,
      admin: {
        authUserId: access.admin.authUserId,
        email: access.admin.email,
      },
    })
    if (!result.ok) {
      await del(blob.url).catch(() => undefined)
      return safeError(result.error)
    }
    revalidateProductImagePaths(result.productId)
    return { ok: true, message: 'Image uploaded successfully.' }
  } catch {
    return safeError('Image upload failed. Please try again.')
  }
}

export async function setPrimaryProductImageAction(_previousState: ProductImageActionState, formData: FormData): Promise<ProductImageActionState> {
  const access = await requireAdmin()
  const productId = stringValue(formData, 'productId')
  const imageId = numberValue(formData, 'imageId')
  if (!Number.isInteger(imageId) || imageId <= 0) return safeError('Image not found for this product.')

  const result = await setAdminProductPrimaryImage({
    publicId: productId,
    imageId,
    admin: {
      authUserId: access.admin.authUserId,
      email: access.admin.email,
    },
  })
  if (!result.ok) return safeError(result.error)
  revalidateProductImagePaths(result.productId)
  return { ok: true, message: 'Primary image updated.' }
}

export async function updateProductImageAltTextAction(_previousState: ProductImageActionState, formData: FormData): Promise<ProductImageActionState> {
  const access = await requireAdmin()
  const productId = stringValue(formData, 'productId')
  const imageId = numberValue(formData, 'imageId')
  const altEn = stringValue(formData, 'altEn')
  const altKm = stringValue(formData, 'altKm')
  const altEnError = validateProductImageAltText(altEn, 'English alt text')
  const altKmError = validateProductImageAltText(altKm, 'Khmer alt text')
  if (!Number.isInteger(imageId) || imageId <= 0) return safeError('Image not found for this product.')
  if (altEnError || altKmError) {
    return {
      ok: false,
      message: 'Check the highlighted fields and try again.',
      fieldErrors: {
        ...(altEnError ? { altEn: altEnError } : {}),
        ...(altKmError ? { altKm: altKmError } : {}),
      },
    }
  }

  const result = await updateAdminProductImageAltText({
    publicId: productId,
    imageId,
    altEn,
    altKm,
    admin: {
      authUserId: access.admin.authUserId,
      email: access.admin.email,
    },
  })
  if (!result.ok) return safeError(result.error)
  revalidateProductImagePaths(result.productId)
  return { ok: true, message: 'Alt text saved.' }
}

export async function removeProductImageAction(_previousState: ProductImageActionState, formData: FormData): Promise<ProductImageActionState> {
  const access = await requireAdmin()
  const productId = stringValue(formData, 'productId')
  const imageId = numberValue(formData, 'imageId')
  const confirmed = stringValue(formData, 'confirmRemove') === 'remove'
  if (!Number.isInteger(imageId) || imageId <= 0) return safeError('Image not found for this product.')
  if (!confirmed) return safeError('Confirm removal before deleting this image.')

  const result = await removeAdminProductImage({
    publicId: productId,
    imageId,
    admin: {
      authUserId: access.admin.authUserId,
      email: access.admin.email,
    },
  })
  if (!result.ok) return safeError(result.error)

  if (isBlobUrl(result.url)) {
    await del(result.url).catch(() => undefined)
  }
  revalidateProductImagePaths(result.productId)
  return { ok: true, message: 'Image removed.' }
}
