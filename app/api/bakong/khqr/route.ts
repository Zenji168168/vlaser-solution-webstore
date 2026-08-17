import QRCode from 'qrcode'
import { NextResponse } from 'next/server'
import { buildKhqrPayment, createPaymentReference, type BakongCurrency } from '@/lib/bakong/khqr'

const VALID_PRODUCT_ID = /^p\d{4,}$/
const VALID_CURRENCY = new Set<BakongCurrency>(['KHR', 'USD'])

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid checkout request.' }, { status: 400 })
  }

  const data = body && typeof body === 'object' ? body as Record<string, unknown> : {}
  const productId = typeof data.productId === 'string' ? data.productId : ''
  const amount = typeof data.amount === 'number' ? data.amount : Number(data.amount)
  const currency = typeof data.currency === 'string' && VALID_CURRENCY.has(data.currency as BakongCurrency)
    ? data.currency as BakongCurrency
    : null

  if (!VALID_PRODUCT_ID.test(productId) || !currency || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Invalid checkout request.' }, { status: 400 })
  }

  const accountId = process.env.BAKONG_MERCHANT_ACCOUNT || 'thareach_meuk@bkrt'

  try {
    const payment = buildKhqrPayment({
      accountId,
      merchantName: process.env.BAKONG_MERCHANT_NAME || 'THAREACH MEUK',
      merchantCity: process.env.BAKONG_MERCHANT_CITY || 'PHNOM PENH',
      amount,
      currency,
      billNumber: createPaymentReference(productId),
      storeLabel: 'Vlaser Store',
      terminalLabel: 'WEB',
    })
    const qrImage = await QRCode.toDataURL(payment.qr, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    })

    return NextResponse.json({
      qrImage,
      md5: payment.md5,
      billNumber: payment.billNumber,
      amount: payment.amount,
      currency: payment.currency,
      expiresAt: payment.expiresAt,
      syncAvailable: Boolean(process.env.BAKONG_API_TOKEN),
    })
  } catch {
    return NextResponse.json({ error: 'Unable to prepare KHQR payment.' }, { status: 500 })
  }
}
