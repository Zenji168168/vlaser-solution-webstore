import './mock-server-only'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { evaluateAdminAccess, type AdminSession } from '../lib/admin/auth'
import { ADMIN_FOUNDATION_CONSTRAINT_SQL, ADMIN_FOUNDATION_INDEX_SQL, ADMIN_FOUNDATION_TABLE_SQL, getPendingAdminAuthUserId, isValidAdminEmail, normalizeAdminEmail } from '../lib/admin/foundation-setup'
import { getStockLabel, normalizeAdminProductFilters } from '../lib/admin/repository'

const session: AdminSession = {
  user: {
    id: 'user_123',
    email: 'admin@example.com',
    name: 'Admin User',
  },
}
const approvedAdminEmails = ['meukthareach053@gmail.com', 'zenjialwayskind@gmail.com'] as const

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

test('approved Google admin emails receive access from active admin rows', () => {
  for (const email of approvedAdminEmails) {
    const googleSession: AdminSession = {
      user: {
        id: `google:${email}`,
        email: email.toUpperCase(),
        name: 'Google Admin',
      },
    }
    const access = evaluateAdminAccess(googleSession, {
      authUserId: googleSession.user.id,
      email,
      displayName: 'Google Admin',
      role: 'admin',
      active: true,
    })

    assert.equal(access.status, 'granted')
  }
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

test('unapproved Google account is denied', () => {
  const googleSession: AdminSession = {
    user: {
      id: 'google:intruder@example.com',
      email: 'intruder@example.com',
      name: 'Not Admin',
    },
  }
  const access = evaluateAdminAccess(googleSession, null)

  assert.equal(access.status, 'denied')
})

test('inactive approved admin is denied', () => {
  const googleSession: AdminSession = {
    user: {
      id: 'google:zenjialwayskind@gmail.com',
      email: 'zenjialwayskind@gmail.com',
      name: 'Inactive Admin',
    },
  }
  const access = evaluateAdminAccess(googleSession, {
    authUserId: googleSession.user.id,
    email: 'zenjialwayskind@gmail.com',
    displayName: 'Inactive Admin',
    role: 'admin',
    active: false,
  })

  assert.equal(access.status, 'denied')
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

test('admin foundation migration SQL is idempotent and role constrained', () => {
  assert.match(ADMIN_FOUNDATION_TABLE_SQL, /CREATE TABLE IF NOT EXISTS "admin_users"/)
  assert.match(ADMIN_FOUNDATION_CONSTRAINT_SQL, /chk_admin_users_role/)
  assert.match(ADMIN_FOUNDATION_CONSTRAINT_SQL, /"role" IN \('admin'\)/)
  assert.ok(ADMIN_FOUNDATION_INDEX_SQL.every(statement => statement.includes('IF NOT EXISTS')))
})

test('admin bootstrap email normalization is strict and does not hardcode a user', () => {
  assert.equal(normalizeAdminEmail(' Admin@Example.COM '), 'admin@example.com')
  assert.equal(normalizeAdminEmail(' ZenjiAlwaysKind@GMAIL.COM '), 'zenjialwayskind@gmail.com')
  assert.equal(getPendingAdminAuthUserId(' ZenjiAlwaysKind@GMAIL.COM '), 'pending:zenjialwayskind@gmail.com')
  assert.equal(isValidAdminEmail('admin@example.com'), true)
  assert.equal(isValidAdminEmail('not-an-email'), false)
  assert.doesNotMatch(readFileSync('lib/admin/foundation-setup.ts', 'utf8'), /meukthareach053@gmail\.com/)
  assert.doesNotMatch(readFileSync('lib/admin/foundation-setup.ts', 'utf8'), /zenjialwayskind@gmail\.com/)
})

test('temporary foundation setup route blocks production and requires authorization header', () => {
  const source = readFileSync('app/api/admin/foundation-setup/route.ts', 'utf8')
  assert.match(source, /process\.env\.VERCEL_ENV === 'production'/)
  assert.match(source, /return notFound\(\)/)
  assert.match(source, /ADMIN_FOUNDATION_BOOTSTRAP_SECRET/)
  assert.match(source, /ADMIN_FOUNDATION_APPROVAL_SECRET/)
  assert.match(source, /headers\.get\('authorization'\)/)
  assert.doesNotMatch(source, /searchParams|get\('secret'\)|nextUrl\.search/)
})

test('admin login offers Google OAuth without public sign-up', () => {
  const loginPage = readFileSync('app/admin/login/page.tsx', 'utf8')
  const googleButton = readFileSync('app/admin/login/google-sign-in-button.tsx', 'utf8')

  assert.match(googleButton, /signIn\.social/)
  assert.match(googleButton, /provider: 'google'/)
  assert.match(googleButton, /window\.location\.origin/)
  assert.match(googleButton, /callbackURL: `\$\{window\.location\.origin\}\/admin\/auth\/callback`/)
  assert.match(googleButton, /errorCallbackURL: `\$\{window\.location\.origin\}\/admin\/login\?error=oauth`/)
  assert.match(googleButton, /window\.location\.assign\(oauthUrl\)/)
  assert.match(googleButton, /GOOGLE_SIGN_IN_TIMEOUT_MS = 15_000/)
  assert.doesNotMatch(googleButton, /disableRedirect/)
  assert.match(loginPage, /access\.status === 'denied'\) redirect\('\/admin\/denied'\)/)
  assert.match(loginPage, /Google sign-in did not complete/)
  assert.match(loginPage, /or sign in with email/)
  assert.doesNotMatch(loginPage + googleButton, /signUp|Create account/)
})

test('admin OAuth callback exchanges browser session before protected redirect', () => {
  const callbackPage = readFileSync('app/admin/auth/callback/page.tsx', 'utf8')

  assert.match(callbackPage, /authClient\.getSession\(\)/)
  assert.match(callbackPage, /window\.location\.replace\('\/admin'\)/)
  assert.match(callbackPage, /window\.location\.replace\('\/admin\/login\?error=oauth'\)/)
})

test('approved admin session can relink auth user id server-side', () => {
  const authSource = readFileSync('lib/admin/auth.ts', 'utf8')
  const repoSource = readFileSync('lib/admin/repository.ts', 'utf8')
  const setupSource = readFileSync('app/api/admin/foundation-setup/route.ts', 'utf8')

  assert.match(authSource, /syncAdminUserAuthIdentity/)
  assert.match(repoSource, /eq\(schema\.adminUsers\.email, normalizedEmail\)/)
  assert.match(repoSource, /eq\(schema\.adminUsers\.role, 'admin'\)/)
  assert.match(repoSource, /eq\(schema\.adminUsers\.active, true\)/)
  assert.match(setupSource, /getPendingAdminAuthUserId\(normalized\)/)
  assert.match(setupSource, /public\.admin_users\.auth_user_id not like 'pending:%'/)
  assert.match(setupSource, /pendingFirstLoginLink: String\(row\.auth_user_id\)\.startsWith\('pending:'\)/)
})
