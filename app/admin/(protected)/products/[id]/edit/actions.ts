'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'
import { updateAdminProduct } from '@/lib/admin/repository'
import { validateProductEditForm, type ProductEditFieldErrors } from '@/lib/admin/product-editing'

export type ProductEditActionState = {
  ok: boolean
  message: string
  fieldErrors: ProductEditFieldErrors
  changedFields: string[]
}

export const initialProductEditState: ProductEditActionState = {
  ok: false,
  message: '',
  fieldErrors: {},
  changedFields: [],
}

function revalidateProductEditPaths(productId: string) {
  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath(`/products/${productId}`)
  revalidatePath('/admin')
  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${productId}`)
  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath('/api/products/by-ids')
}

export async function updateProductAction(_previousState: ProductEditActionState, formData: FormData): Promise<ProductEditActionState> {
  const access = await requireAdmin()
  const validation = validateProductEditForm(formData)

  if (!validation.ok) {
    return {
      ok: false,
      message: validation.formError,
      fieldErrors: validation.fieldErrors,
      changedFields: [],
    }
  }

  const result = await updateAdminProduct(validation.values, {
    authUserId: access.admin.authUserId,
    email: access.admin.email,
  })

  if (!result.ok) {
    return {
      ok: false,
      message: result.error,
      fieldErrors: result.fieldErrors || {},
      changedFields: [],
    }
  }

  revalidateProductEditPaths(result.productId)

  return {
    ok: true,
    message: result.changedFields.length ? 'Product saved successfully.' : 'No product fields changed.',
    fieldErrors: {},
    changedFields: result.changedFields,
  }
}
