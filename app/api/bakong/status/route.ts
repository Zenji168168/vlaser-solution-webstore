import { NextResponse } from 'next/server'
import { checkBakongPayment } from '@/lib/bakong/status'

const VALID_MD5 = /^[a-f0-9]{32}$/i

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid payment status request.' }, { status: 400 })
  }

  const data = body && typeof body === 'object' ? body as Record<string, unknown> : {}
  const md5 = typeof data.md5 === 'string' ? data.md5 : ''

  if (!VALID_MD5.test(md5)) {
    return NextResponse.json({ error: 'Invalid payment status request.' }, { status: 400 })
  }

  try {
    const result = await checkBakongPayment(md5)
    const httpStatus = result.status === 'setup_required' ? 503 : 200
    return NextResponse.json({
      status: result.status,
      paid: result.status === 'paid',
      providerStatus: result.providerStatus,
    }, { status: httpStatus })
  } catch {
    return NextResponse.json({ status: 'unavailable', paid: false }, { status: 200 })
  }
}
