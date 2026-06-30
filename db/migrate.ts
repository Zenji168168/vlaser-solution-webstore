import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) {
    console.log('No DATABASE_URL - skipping migration')
    return
  }
  const sql = neon(url)
  const db = drizzle(sql)
  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './db/migrations' })
  console.log('Migrations complete!')
}

main().catch(console.error)
