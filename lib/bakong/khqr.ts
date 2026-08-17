import { createHash } from 'crypto'

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

const CURRENCY_CODES: Record<BakongCurrency, string> = {
  KHR: '116',
  USD: '840',
}

function asciiOnly(value: string, maxLength: number) {
  return value.replace(/[^\x20-\x7E]/g, '').trim().slice(0, maxLength)
}

function field(id: string, value: string) {
  return `${id}${value.length.toString().padStart(2, '0')}${value}`
}

function crc16CcittFalse(input: string) {
  let crc = 0xffff
  for (let index = 0; index < input.length; index += 1) {
    crc ^= input.charCodeAt(index) << 8
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

export function normalizeBakongAmount(amount: number, currency: BakongCurrency) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid payment amount')
  if (amount > 999999999) throw new Error('Payment amount is too large')
  if (currency === 'KHR') return Math.round(amount).toString()
  return amount.toFixed(2)
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

  const merchantAccount = field('29', field('00', accountId))
  const additionalData = field('62', [
    field('01', billNumber),
    field('03', storeLabel),
    field('07', terminalLabel),
  ].join(''))

  const withoutCrc = [
    field('00', '01'),
    field('01', '12'),
    merchantAccount,
    field('52', '5999'),
    field('53', CURRENCY_CODES[input.currency]),
    field('54', amount),
    field('58', 'KH'),
    field('59', merchantName),
    field('60', merchantCity),
    additionalData,
  ].join('')

  const qrWithoutChecksum = `${withoutCrc}6304`
  const qr = `${qrWithoutChecksum}${crc16CcittFalse(qrWithoutChecksum)}`

  return {
    qr,
    md5: createHash('md5').update(qr).digest('hex'),
    billNumber,
    amount,
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
