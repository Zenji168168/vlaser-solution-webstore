import 'server-only'
import { createNeonAuth } from '@neondatabase/auth/next/server'

const baseUrl = process.env.NEON_AUTH_BASE_URL || 'https://placeholder.neonauth.local'
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET || 'build-placeholder-secret-32chars!!'

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
  },
})
