// Text normalization utility
export function cleanText(text: string): string {
  if (!text) return ''
  return text
    .replace(/â€¢/g, '•').replace(/â€™/g, "'").replace(/â€"/g, '—')
    .replace(/â€œ/g, '"').replace(/â€\x9D/g, '"').replace(/â€˜/g, "'")
    .replace(/Ã©/g, 'é').replace(/Ã¨/g, 'è').replace(/Â°/g, '°')
    .replace(/Â®/g, '®').replace(/Â·/g, '·').replace(/Ã¢/g, 'â')
    .replace(/ï¿½/g, '').replace(/\uFFFD/g, '')
    .replace(/\s{2,}/g, ' ').trim()
}

// Check if description is generic/useless
const GENERIC_PHRASES = [
  'Professional grade technical specifications',
  'High reliability and performance standard',
  'Fully certified Vlaser Solution product',
  'Manufacturer warranty included',
  'Vlaser Solution Equipment',
]

export function isGenericDescription(text: string): boolean {
  if (!text || text.length < 20) return true
  const cleaned = cleanText(text)
  return GENERIC_PHRASES.some(phrase => cleaned.includes(phrase)) && cleaned.length < 200
}

// Parse description into structured content
export function parseDescription(text: string): { type: 'paragraph' | 'list'; content: string[] } {
  const cleaned = cleanText(text)
  if (!cleaned) return { type: 'paragraph', content: [] }

  // Detect bullet-separated content
  const bulletPatterns = [/[•·]/g, /\n/g]
  let items: string[] = []

  if (cleaned.includes('•') || cleaned.includes('·')) {
    items = cleaned.split(/[•·]/).map(s => s.trim()).filter(s => s.length > 2)
  } else if (cleaned.includes('\n')) {
    items = cleaned.split('\n').map(s => s.trim()).filter(s => s.length > 2)
  }

  if (items.length >= 3) {
    return { type: 'list', content: items }
  }

  return { type: 'paragraph', content: [cleaned] }
}

// Recently viewed products (localStorage)
const RECENT_KEY = 'vlaser-recent-viewed'
const MAX_RECENT = 10

export function getRecentlyViewed(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_KEY)
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

export function addToRecentlyViewed(productId: string): void {
  try {
    let ids = getRecentlyViewed()
    ids = [productId, ...ids.filter(id => id !== productId)].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_KEY, JSON.stringify(ids))
  } catch {}
}

// Related products algorithm
import type { Product } from './products-data'

export function getRelatedProducts(current: Product, allProducts: Product[], limit = 4): Product[] {
  const candidates = allProducts.filter(p => p.id !== current.id)

  // Score each candidate
  const scored = candidates.map(p => {
    let score = 0
    if (p.category === current.category) score += 10
    if (p.brand === current.brand) score += 5
    // Similar price range (within 50%)
    const priceRatio = Math.min(p.price, current.price) / Math.max(p.price, current.price)
    if (priceRatio > 0.5) score += 2
    // Shared keywords in name
    const currentWords = current.name.toLowerCase().split(/[\s\-_]+/)
    const pWords = p.name.toLowerCase().split(/[\s\-_]+/)
    const shared = currentWords.filter(w => w.length > 3 && pWords.includes(w)).length
    score += shared * 3
    return { product: p, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map(s => s.product)
}
