import 'server-only'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!databaseUrl) {
  console.warn('DATABASE_URL not configured - database features unavailable')
}

const sql = databaseUrl ? neon(databaseUrl) : null
export const db = sql ? drizzle(sql, { schema }) : null
