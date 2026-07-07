// Set environment to test to bypass next/cache functions during unit tests
;(process.env as any).NODE_ENV = 'test'
process.env.NEON_AUTH_BASE_URL ||= 'https://unit-test.neonauth.local/neondb/auth'
process.env.NEON_AUTH_COOKIE_SECRET ||= 'unit-test-cookie-secret-32-characters'

// Mock server-only module for Node.js test runner
try {
  const path = require.resolve('server-only')
  require.cache[path] = {
    id: path,
    filename: path,
    loaded: true,
    exports: {},
    parent: null,
    children: [],
    paths: []
  } as any
} catch {
  // If server-only is not installed yet or cannot be resolved, ignore
}
