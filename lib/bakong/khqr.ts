import { createHash } from 'crypto'
import { BakongKHQR, IndividualInfo, khqrData } from 'bakong-khqr'

export type BakongCurrency = 'KHR' | 'USD'

export interface KhqrPaymentInput {
  accountId: string
  merchantName: string
  merchantCity: string
  amount: number
  currency: BakongCurrency
  billNumber: string
  storeLabel?: string
  terminalLabel?: string
}

export interface KhqrPayment {
  qr: string
  md5: string
  billNumber: string
  amount: string
  currency: BakongCurrency
  expiresAt: string
}

function asciiOnly(value: string, maxLength: number) {
  return value.replace(/[^\x20-\x7E]/g, '').trim().slice(0, maxLength)
}

export function normalizeBakongAmount(amount: number, currency: BakongCurrency) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid payment amount')
  if (amount > 999999999) throw new Error('Payment amount is too large')
  if (currency === 'KHR') return Math.round(amount)
  return Number(amount.toFixed(2))
}

export function buildKhqrPayment(input: KhqrPaymentInput): KhqrPayment {
  const accountId = asciiOnly(input.accountId, 32)
  const merchantName = asciiOnly(input.merchantName, 25)
  const merchantCity = asciiOnly(input.merchantCity, 15)
  const billNumber = asciiOnly(input.billNumber, 25)
  const storeLabel = asciiOnly(input.storeLabel || 'Vlaser Store', 25)
  const terminalLabel = asciiOnly(input.terminalLabel || 'WEB', 25)
  const amount = normalizeBakongAmount(input.amount, input.currency)

  if (!accountId.includes('@')) throw new Error('Invalid Bakong merchant account')
  if (!merchantName || !merchantCity || !billNumber) throw new Error('Missing KHQR merchant details')

  const khqr = new BakongKHQR()
  const response = khqr.generateIndividual(new IndividualInfo(accountId, merchantName, merchantCity, {
    currency: input.currency === 'KHR' ? khqrData.currency.khr : khqrData.currency.usd,
    amount,
    billNumber,
    storeLabel,
    terminalLabel,
    expirationTimestamp: Date.now() + 10 * 60 * 1000,
    merchantCategoryCode: '5999',
  }))

  if (response.status.code !== 0 || !response.data?.qr || !response.data.md5) {
    throw new Error('Unable to generate valid KHQR')
  }

  const qr = response.data.qr
  if (!BakongKHQR.verify(qr).isValid) throw new Error('Generated KHQR failed validation')

  return {
    qr,
    md5: response.data.md5,
    billNumber,
    amount: amount.toString(),
    currency: input.currency,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  }
}

export function createPaymentReference(productId: string) {
  const safeProductId = productId.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 12) || 'order'
  const nonce = createHash('sha256')
    .update(`${safeProductId}:${Date.now()}:${Math.random()}`)
    .digest('hex')
    .slice(0, 8)
    .toUpperCase()
  return `VLS-${safeProductId.toUpperCase()}-${nonce}`
}
