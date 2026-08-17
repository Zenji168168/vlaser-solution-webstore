import { NextResponse } from 'next/server'
import { checkBakongPayment, checkBakongPaymentByShortHash } from '@/lib/bakong/status'
import { markCheckoutOrderPaid } from '@/lib/checkout-orders'

const VALID_MD5 = /^[a-f0-9]{32}$/i
const VALID_SHORT_HASH = /^[a-f0-9]{8}$/i
const VALID_CURRENCY = new Set(['USD', 'KHR'])

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid payment status request.' }, { status: 400 })
  }

  const data = body && typeof body === 'object' ? body as Record<string, unknown> : {}
  const md5 = typeof data.md5 === 'string' ? data.md5 : ''
  const shortHash = typeof data.shortHash === 'string' ? data.shortHash.trim() : ''
  const amount = typeof data.amount === 'number' ? data.amount : Number(data.amount)
  const currency = typeof data.currency === 'string' && VALID_CURRENCY.has(data.currency) ? data.currency as 'USD' | 'KHR' : null

  if (!VALID_MD5.test(md5)) {
    return NextResponse.json({ error: 'Invalid payment status request.' }, { status: 400 })
  }

  try {
    const result = VALID_SHORT_HASH.test(shortHash) && currency && Number.isFinite(amount) && amount > 0
      ? await checkBakongPaymentByShortHash(shortHash, amount, currency)
      : await checkBakongPayment(md5)
    const order = result.status === 'paid' ? await markCheckoutOrderPaid(md5, result.providerStatus) : null
    const httpStatus = result.status === 'setup_required' ? 503 : 200
    return NextResponse.json({
      status: result.status,
      paid: result.status === 'paid',
      providerStatus: result.providerStatus,
      orderStored: Boolean(order),
    }, { status: httpStatus })
  } catch {
    return NextResponse.json({ status: 'unavailable', paid: false }, { status: 200 })
  }
}
