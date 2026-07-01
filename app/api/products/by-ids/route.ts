import { NextResponse } from 'next/server'
import { getProductsByIds } from '@/lib/product-service'

const VALID_ID = /^p\d{4}$/

export function validateProductIdsRequest(body: any): { valid: boolean; ids: string[]; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, ids: [], error: 'JSON object body required' }
  }
  if (!('ids' in body)) {
    return { valid: false, ids: [], error: 'ids array required' }
  }
  const ids = body.ids
  if (!Array.isArray(ids)) {
    return { valid: false, ids: [], error: 'ids must be an array' }
  }
  if (ids.length > 10) {
    return { valid: false, ids: [], error: 'maximum of 10 ids allowed' }
  }
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    if (typeof id !== 'string') {
      return { valid: false, ids: [], error: `id at index ${i} must be a string` }
    }
    if (!VALID_ID.test(id)) {
      return { valid: false, ids: [], error: `id at index ${i} has invalid format` }
    }
  }
  return { valid: true, ids }
}

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validation = validateProductIdsRequest(body)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  try {
    const products = await getProductsByIds(validation.ids)
    return NextResponse.json({ products })
  } catch {
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 })
  }
}
