import './mock-server-only'
import test from 'node:test'
import assert from 'node:assert/strict'
import { POST as validateDatabaseRoute } from '../app/api/admin/validate/route'
import { POST as compareDatabaseRoute } from '../app/api/admin/compare/route'
import { GET as setupDatabaseRoute, POST as setupDatabasePostRoute } from '../app/api/admin/setup/route'
import { GET as seedDatabaseRoute, POST as seedDatabasePostRoute } from '../app/api/admin/seed/route'

test('Admin utility routes are hidden in production', async (t) => {
  const originalVercelEnv = process.env.VERCEL_ENV
  process.env.VERCEL_ENV = 'production'

  t.after(() => {
    if (originalVercelEnv === undefined) {
      delete process.env.VERCEL_ENV
    } else {
      process.env.VERCEL_ENV = originalVercelEnv
    }
  })

  const routes = [
    {
      name: 'validate',
      request: new Request('https://store.vlasersolution.com/api/admin/validate', { method: 'POST' }),
      handler: validateDatabaseRoute,
    },
    {
      name: 'compare',
      request: new Request('https://store.vlasersolution.com/api/admin/compare', { method: 'POST' }),
      handler: compareDatabaseRoute,
    },
    {
      name: 'setup',
      request: new Request('https://store.vlasersolution.com/api/admin/setup?secret=anything'),
      handler: setupDatabaseRoute,
    },
    {
      name: 'setup post',
      request: new Request('https://store.vlasersolution.com/api/admin/setup', { method: 'POST' }),
      handler: setupDatabasePostRoute,
    },
    {
      name: 'seed',
      request: new Request('https://store.vlasersolution.com/api/admin/seed?secret=anything'),
      handler: seedDatabaseRoute,
    },
    {
      name: 'seed post',
      request: new Request('https://store.vlasersolution.com/api/admin/seed', { method: 'POST' }),
      handler: seedDatabasePostRoute,
    },
  ]

  for (const route of routes) {
    await t.test(route.name, async () => {
      const response = await route.handler(route.request)
      assert.strictEqual(response.status, 404)
      assert.strictEqual(await response.text(), 'Not Found')
    })
  }
})
