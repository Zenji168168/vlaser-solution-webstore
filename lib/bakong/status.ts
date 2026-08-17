import 'server-only'

export type BakongPaymentStatus = 'setup_required' | 'unpaid' | 'paid' | 'unavailable'

interface ProviderResult {
  status: BakongPaymentStatus
  providerStatus?: number
  providerCode?: unknown
  providerMessage?: string
}

const BAKONG_STATUS_URL = 'https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5'
const BAKONG_SHORT_HASH_STATUS_URL = 'https://api-bakong.nbc.gov.kh/v1/check_transaction_by_short_hash'

function isPaidPayload(payload: unknown, md5: string) {
  if (Array.isArray(payload)) return payload.some(item => String(item).toLowerCase() === md5.toLowerCase())
  if (!payload || typeof payload !== 'object') return false
  const record = payload as Record<string, unknown>
  const text = JSON.stringify(record).toLowerCase()
  if (text.includes('"paid"') || text.includes('"success"')) return true
  if (record.responseCode === 0 && record.data) return true
  if (typeof record.data === 'string' && record.data.toLowerCase() === md5.toLowerCase()) return true
  if (Array.isArray(record.data)) return record.data.some(item => String(item).toLowerCase() === md5.toLowerCase())
  return false
}

async function checkWithAuthorization(url: string, body: Record<string, unknown>, authorization: string): Promise<ProviderResult> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  if (response.status === 404) return { status: 'unpaid', providerStatus: response.status }
  if (response.status === 401 || response.status === 403) return { status: 'unavailable', providerStatus: response.status }
  if (!response.ok) return { status: 'unavailable', providerStatus: response.status }

  const payload = await response.json().catch(() => null)
  const record = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
  const providerMessage = typeof record.responseMessage === 'string' ? record.responseMessage.slice(0, 120) : undefined
  if (providerMessage?.toLowerCase().includes('limit')) {
    return {
      status: 'unavailable',
      providerStatus: response.status,
      providerCode: record.responseCode,
      providerMessage,
    }
  }
  return {
    status: isPaidPayload(payload, String(body.md5 || body.hash || '')) ? 'paid' : 'unpaid',
    providerStatus: response.status,
    providerCode: record.responseCode,
    providerMessage,
  }
}

export async function checkBakongPayment(md5: string): Promise<ProviderResult> {
  const token = process.env.BAKONG_API_TOKEN
  if (!token) return { status: 'setup_required' }

  const rawResult = await checkWithAuthorization(BAKONG_STATUS_URL, { md5 }, token)
  if (rawResult.status === 'paid') return rawResult

  const bearerResult = await checkWithAuthorization(BAKONG_STATUS_URL, { md5 }, `Bearer ${token}`)
  if (bearerResult.status === 'paid') return bearerResult
  if (rawResult.providerStatus !== 401 && rawResult.providerStatus !== 403) return rawResult
  return bearerResult
}

export async function checkBakongPaymentByShortHash(shortHash: string, amount: number, currency: 'USD' | 'KHR'): Promise<ProviderResult> {
  const token = process.env.BAKONG_API_TOKEN
  if (!token) return { status: 'setup_required' }

  const safeHash = shortHash.trim().toLowerCase()
  if (!/^[a-f0-9]{8}$/.test(safeHash) || !Number.isFinite(amount) || amount <= 0) return { status: 'unpaid' }

  const merchantAccount = process.env.BAKONG_MERCHANT_ACCOUNT || 'thareach_meuk@bkrt'
  const baseBody = {
    hash: safeHash,
    amount: currency === 'KHR' ? String(Math.round(amount)) : amount.toFixed(2),
    currency,
  }
  const bodies = [
    { ...baseBody, receiver: merchantAccount },
    { ...baseBody, receiverAccount: merchantAccount },
    { ...baseBody, receiverAccountId: merchantAccount },
    baseBody,
  ]

  let fallback: ProviderResult = { status: 'unpaid' }
  for (const body of bodies) {
    const rawResult = await checkWithAuthorization(BAKONG_SHORT_HASH_STATUS_URL, body, token)
    if (rawResult.status === 'paid') return rawResult
    if (rawResult.providerStatus !== 401 && rawResult.providerStatus !== 403) fallback = rawResult

    const bearerResult = await checkWithAuthorization(BAKONG_SHORT_HASH_STATUS_URL, body, `Bearer ${token}`)
    if (bearerResult.status === 'paid') return bearerResult
    if (fallback.status === 'unpaid' && bearerResult.providerStatus) fallback = bearerResult
  }

  return fallback
}
