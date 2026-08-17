import { readFileSync } from 'fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BakongKHQR } from 'bakong-khqr'
import { buildKhqrPayment, createPaymentReference, normalizeBakongAmount } from '../lib/bakong/khqr'

test('Bakong KHQR builder creates a dynamic payment payload and md5', () => {
  const payment = buildKhqrPayment({
    accountId: 'thareach_meuk@bkrt',
    merchantName: 'THAREACH MEUK',
    merchantCity: 'PHNOM PENH',
    amount: 41000,
    currency: 'KHR',
    billNumber: 'VLS-P0001-TEST',
  })

  assert.equal(BakongKHQR.verify(payment.qr).isValid, true)
  assert.match(payment.qr, /^000201010212/)
  assert.match(payment.qr, /29220018thareach_meuk@bkrt/)
  assert.match(payment.qr, /5303116/)
  assert.match(payment.qr, /540541000/)
  assert.match(payment.qr, /9934/)
  assert.match(payment.qr, /6304[A-F0-9]{4}$/)
  assert.match(payment.md5, /^[a-f0-9]{32}$/)
  assert.equal(payment.billNumber, 'VLS-P0001-TEST')
})

test('Bakong KHQR amount normalization supports KHR and USD safely', () => {
  assert.equal(normalizeBakongAmount(4100.49, 'KHR'), 4100)
  assert.equal(normalizeBakongAmount(12.5, 'USD'), 12.5)
  assert.throws(() => normalizeBakongAmount(0, 'KHR'), /Invalid payment amount/)
  assert.throws(() => normalizeBakongAmount(Number.NaN, 'USD'), /Invalid payment amount/)
})

test('Bakong KHQR references are product scoped and safe', () => {
  const reference = createPaymentReference('p0001/<script>')
  assert.match(reference, /^VLS-P0001SCRIPT-[A-F0-9]{8}$/)
  assert.ok(reference.length <= 25)
})

test('Bakong API token is server-only and not embedded in product checkout client', () => {
  const clientSource = readFileSync('app/products/[id]/product-detail-client.tsx', 'utf8')
  const createRoute = readFileSync('app/api/bakong/khqr/route.ts', 'utf8')
  const statusHelper = readFileSync('lib/bakong/status.ts', 'utf8')

  assert.doesNotMatch(clientSource, /BAKONG_API_TOKEN/)
  assert.doesNotMatch(clientSource, /eyJhbGciOi/)
  assert.match(createRoute, /process\.env\.BAKONG_MERCHANT_ACCOUNT/)
  assert.match(statusHelper, /process\.env\.BAKONG_API_TOKEN/)
  assert.doesNotMatch(statusHelper, /eyJhbGciOi/)
})

test('Bakong checkout does not show scanned without a real provider signal', () => {
  const clientSource = readFileSync('app/products/[id]/product-detail-client.tsx', 'utf8')

  assert.match(clientSource, /Not yet scanned/)
  assert.match(clientSource, /មិនទាន់ស្កេន/)
  assert.match(clientSource, /Waiting for payment/)
  assert.match(clientSource, /បានទូទាត់/)
  assert.doesNotMatch(clientSource, /setKhqrStatus\('scanned'\)/)
  assert.doesNotMatch(clientSource, /QR code is scanned/)
  assert.doesNotMatch(clientSource, /បានស្កេន QR រួច/)
  assert.doesNotMatch(clientSource, /I have scanned/)
  assert.doesNotMatch(clientSource, /បានស្កេនរួច/)
})

test('checkout asks for customer details before KHQR or Telegram payment', () => {
  const clientSource = readFileSync('app/products/[id]/product-detail-client.tsx', 'utf8')

  assert.match(clientSource, /Customer details/)
  assert.match(clientSource, /Phone number/)
  assert.match(clientSource, /Does this phone number have Telegram/)
  assert.match(clientSource, /canChoosePayment/)
  assert.match(clientSource, /disabled=\{!canChoosePayment\}/)
  assert.match(clientSource, /Customer name:/)
  assert.match(clientSource, /Phone has Telegram:/)
})
