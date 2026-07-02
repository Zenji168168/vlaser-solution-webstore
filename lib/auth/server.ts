import 'server-only'
import { createNeonAuth } from '@neondatabase/auth/next/server'

const isVercelRuntime = Boolean(process.env.VERCEL_ENV)
const baseUrl = process.env.NEON_AUTH_BASE_URL || ''
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET || ''

if (isVercelRuntime && (!baseUrl || !cookieSecret)) {
  console.warn('Neon Auth is missing required Vercel environment variables.')
}

export const auth = createNeonAuth({
  baseUrl: baseUrl || 'https://missing-neon-auth.local/auth',
  cookies: {
    secret: cookieSecret || 'development-build-only-cookie-secret-32-characters',
  },
})
