import './mock-server-only'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { evaluateAdminAccess, type AdminSession } from '../lib/admin/auth'
import { getStockLabel, normalizeAdminProductFilters } from '../lib/admin/repository'

const session: AdminSession = {
  user: {
    id: 'user_123',
    email: 'admin@example.com',
    name: 'Admin User',
  },
}

test('unauthenticated admin requests are marked for redirect', () => {
  const access = evaluateAdminAccess(null, null)
  assert.equal(access.status, 'unauthenticated')
})

test('authenticated non-admin users are rejected safely', () => {
  const access = evaluateAdminAccess(session, null)
  assert.equal(access.status, 'denied')
})

test('approved active admin user receives access', () => {
  const access = evaluateAdminAccess(session, {
    authUserId: 'user_123',
    email: 'admin@example.com',
    displayName: 'Admin User',
    role: 'admin',
    active: true,
  })
  assert.equal(access.status, 'granted')
})

test('inactive or non-admin role does not receive access', () => {
  assert.equal(evaluateAdminAccess(session, {
    authUserId: 'user_123',
    email: 'admin@example.com',
    displayName: null,
    role: 'viewer',
    active: true,
  }).status, 'denied')

  assert.equal(evaluateAdminAccess(session, {
    authUserId: 'user_123',
    email: 'admin@example.com',
    displayName: null,
    role: 'admin',
    active: false,
  }).status, 'denied')
})

test('product admin query pagination is normalized and bounded', () => {
  const filters = normalizeAdminProductFilters({ page: -10, pageSize: 500 })
  assert.equal(filters.page, 1)
  assert.equal(filters.pageSize, 50)
})

test('product search and filters are trimmed with safe defaults', () => {
  const filters = normalizeAdminProductFilters({
    search: '  hikvision  ',
    category: ' cctv ',
    brand: ' hikvision ',
    stock: 'low',
    publication: 'published',
    khmer: 'missing-any',
    sort: 'price-desc',
    page: 2,
  })
  assert.equal(filters.search, 'hikvision')
  assert.equal(filters.category, 'cctv')
  assert.equal(filters.brand, 'hikvision')
  assert.equal(filters.stock, 'low')
  assert.equal(filters.publication, 'published')
  assert.equal(filters.khmer, 'missing-any')
  assert.equal(filters.sort, 'price-desc')
  assert.equal(filters.page, 2)
})

test('stock status labels match admin filter semantics', () => {
  assert.equal(getStockLabel(8, 'Price List'), 'In stock')
  assert.equal(getStockLabel(3, 'Price List'), 'Low stock')
  assert.equal(getStockLabel(0, 'Price List'), 'Out of stock')
  assert.equal(getStockLabel(9, 'Out of Stock'), 'Out of stock')
})

test('hidden draft behavior keeps public link conditional in admin preview', () => {
  const source = readFileSync('app/admin/(protected)/products/[id]/page.tsx', 'utf8')
  assert.match(source, /product\.published && !product\.archived/)
  assert.match(source, /Not public/)
})

test('logout action signs out through server auth and redirects to login', () => {
  const source = readFileSync('app/admin/actions.ts', 'utf8')
  assert.match(source, /auth\.signOut\(\)/)
  assert.match(source, /redirect\('\/admin\/login'\)/)
})

test('client bundle files do not expose auth secrets or database URLs', () => {
  const clientFiles = [
    'app/admin/login/login-form.tsx',
    'components/admin-shell.tsx',
    'lib/auth/client.ts',
  ]
  for (const file of clientFiles) {
    const source = readFileSync(file, 'utf8')
    assert.doesNotMatch(source, /DATABASE_URL|POSTGRES_URL|NEON_AUTH_COOKIE_SECRET|ADMIN_SETUP_SECRET/)
  }
})
