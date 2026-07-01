import { NextResponse } from 'next/server'
import { validateDatabase } from '@/lib/repositories/product-repository'

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV === "production") {
    return new Response("Not Found", { status: 404 });
  }

  const authHeader = request.headers.get('authorization') || ''
  const secretHeader = request.headers.get('x-admin-secret') || ''

  let secret = secretHeader
  if (authHeader.startsWith('Bearer ')) {
    secret = authHeader.substring(7)
  }

  const expectedSecret = process.env.ADMIN_SETUP_SECRET
  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await validateDatabase()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
