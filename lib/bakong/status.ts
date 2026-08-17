import 'server-only'

export type BakongPaymentStatus = 'setup_required' | 'unpaid' | 'paid' | 'unavailable'

interface ProviderResult {
  status: BakongPaymentStatus
  providerStatus?: number
}

const BAKONG_STATUS_URL = 'https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5'

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

async function checkWithAuthorization(md5: string, authorization: string): Promise<ProviderResult> {
  const response = await fetch(BAKONG_STATUS_URL, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ md5 }),
    cache: 'no-store',
  })

  if (response.status === 404) return { status: 'unpaid', providerStatus: response.status }
  if (response.status === 401 || response.status === 403) return { status: 'unavailable', providerStatus: response.status }
  if (!response.ok) return { status: 'unavailable', providerStatus: response.status }

  const payload = await response.json().catch(() => null)
  return {
    status: isPaidPayload(payload, md5) ? 'paid' : 'unpaid',
    providerStatus: response.status,
  }
}

export async function checkBakongPayment(md5: string): Promise<ProviderResult> {
  const token = process.env.BAKONG_API_TOKEN
  if (!token) return { status: 'setup_required' }

  const bearerResult = await checkWithAuthorization(md5, `Bearer ${token}`)
  if (bearerResult.providerStatus !== 401 && bearerResult.providerStatus !== 403) return bearerResult

  return checkWithAuthorization(md5, token)
}
