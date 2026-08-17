import QRCode from 'qrcode'
import { NextResponse } from 'next/server'
import { buildKhqrPayment, createPaymentReference, type BakongCurrency } from '@/lib/bakong/khqr'
import { calculateCheckoutAmount, createPendingCheckoutOrder, getCheckoutProductSnapshot, normalizeCheckoutCustomer, normalizeCheckoutQuantity } from '@/lib/checkout-orders'

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
  const currency = typeof data.currency === 'string' && VALID_CURRENCY.has(data.currency as BakongCurrency)
    ? data.currency as BakongCurrency
    : null
  const quantity = normalizeCheckoutQuantity(data.quantity)
  const customer = {
    name: typeof data.customerName === 'string' ? data.customerName : '',
    phone: typeof data.customerPhone === 'string' ? data.customerPhone : '',
    phoneHasTelegram: Boolean(data.phoneHasTelegram),
  }

  const customerResult = normalizeCheckoutCustomer(customer)
  if (!VALID_PRODUCT_ID.test(productId) || !currency || !customerResult.ok) {
    return NextResponse.json({ error: 'Invalid checkout request.' }, { status: 400 })
  }

  const accountId = process.env.BAKONG_MERCHANT_ACCOUNT || 'thareach_meuk@bkrt'

  try {
    const product = await getCheckoutProductSnapshot(productId)
    if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 })

    const amount = calculateCheckoutAmount(product.unitPriceUsd, quantity, currency)
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
    await createPendingCheckoutOrder({
      productPublicId: product.publicId,
      quantity,
      currency,
      customer: customerResult.customer,
      paymentMd5: payment.md5,
      orderNumber: payment.billNumber,
      amount: Number(payment.amount),
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
