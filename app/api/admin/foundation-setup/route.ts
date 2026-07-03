import { Pool, neon } from '@neondatabase/serverless'
import {
  ADMIN_FOUNDATION_CONSTRAINT_SQL,
  ADMIN_FOUNDATION_INDEX_SQL,
  ADMIN_FOUNDATION_TABLE_SQL,
  isValidAdminEmail,
  normalizeAdminEmail,
} from '@/lib/admin/foundation-setup'

function notFound() {
  return new Response('Not Found', { status: 404 })
}

function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('Database unavailable')
  return neon(url)
}

function getPool() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('Database unavailable')
  return new Pool({ connectionString: url })
}

function isAuthorized(request: Request) {
  const expected = process.env.ADMIN_FOUNDATION_BOOTSTRAP_SECRET
  if (!expected || process.env.VERCEL_ENV !== 'preview') return false
  const header = request.headers.get('authorization') || ''
  return header === `Bearer ${expected}`
}

async function runMigration() {
  const pool = getPool()
  try {
    await pool.query(ADMIN_FOUNDATION_TABLE_SQL)
    await pool.query(ADMIN_FOUNDATION_CONSTRAINT_SQL)
    for (const statement of ADMIN_FOUNDATION_INDEX_SQL) {
      await pool.query(statement)
    }
  } finally {
    await pool.end()
  }
}

async function verifyMigration() {
  const sql = getSql()
  const [table] = await sql`
    select exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'admin_users'
    ) as exists
  `
  const columns = await sql`
    select column_name
    from information_schema.columns
    where table_schema = 'public' and table_name = 'admin_users'
    order by ordinal_position
  `
  const constraints = await sql`
    select conname
    from pg_constraint
    where conrelid = 'public.admin_users'::regclass
    order by conname
  `
  const indexes = await sql`
    select indexname
    from pg_indexes
    where schemaname = 'public' and tablename = 'admin_users'
    order by indexname
  `
  const [adminCount] = await sql`select count(*)::int as count from public.admin_users`

  return {
    tableExists: Boolean(table?.exists),
    columns: columns.map(column => column.column_name),
    constraints: constraints.map(constraint => constraint.conname),
    indexes: indexes.map(index => index.indexname),
    adminCount: Number(adminCount?.count || 0),
  }
}

async function verifyAuthSync() {
  const sql = getSql()
  const [table] = await sql`
    select exists (
      select 1 from information_schema.tables
      where table_schema = 'neon_auth' and table_name = 'users_sync'
    ) as exists
  `
  if (!table?.exists) return { exists: false, columns: [] as string[] }

  const columns = await sql`
    select column_name
    from information_schema.columns
    where table_schema = 'neon_auth' and table_name = 'users_sync'
    order by ordinal_position
  `
  return { exists: true, columns: columns.map(column => column.column_name) }
}

async function inspectAuthStorage() {
  const sql = getSql()
  const schemas = await sql`
    select schema_name
    from information_schema.schemata
    where schema_name in ('neon_auth', 'auth', 'better_auth')
       or schema_name like '%auth%'
    order by schema_name
  `
  const tables = await sql`
    select table_schema, table_name
    from information_schema.tables
    where table_schema in ('neon_auth', 'auth', 'better_auth')
       or table_name in ('user', 'users', 'account', 'session')
       or table_name like '%user%'
       or table_name like '%session%'
    order by table_schema, table_name
    limit 40
  `
  return {
    schemas: schemas.map(schema => schema.schema_name),
    tables: tables.map(table => `${table.table_schema}.${table.table_name}`),
  }
}

async function approveAdmin(email: string) {
  const normalized = normalizeAdminEmail(email)
  if (!isValidAdminEmail(normalized)) {
    return { status: 400, body: { error: 'Invalid email.' } }
  }

  const sql = getSql()
  const authSync = await verifyAuthSync()
  if (!authSync.exists) {
    return { status: 409, body: { error: 'Neon Auth user sync table is not available.' } }
  }

  const users = await sql`
    select id, email, name
    from neon_auth.users_sync
    where lower(email) = ${normalized} and deleted_at is null
    limit 1
  `
  const user = users[0]
  if (!user) {
    return { status: 404, body: { error: 'Auth user not found for approved email.' } }
  }

  const [row] = await sql`
    insert into public.admin_users (auth_user_id, email, display_name, role, active, created_at, updated_at)
    values (${user.id}, ${normalized}, ${user.name || null}, 'admin', true, now(), now())
    on conflict (email) do update set
      auth_user_id = excluded.auth_user_id,
      display_name = coalesce(excluded.display_name, public.admin_users.display_name),
      role = 'admin',
      active = true,
      updated_at = now()
    returning email, display_name, role, active
  `

  return {
    status: 200,
    body: {
      approved: true,
      email: row.email,
      displayName: row.display_name,
      role: row.role,
      active: row.active,
    },
  }
}

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV === 'production') return notFound()
  if (!isAuthorized(request)) return new Response('Unauthorized', { status: 401 })

  try {
    const body = await request.json().catch(() => ({}))
    const action = body?.action

    if (action === 'migrate') {
      await runMigration()
      return Response.json({ ok: true, verification: await verifyMigration() })
    }

    if (action === 'verify') {
      return Response.json({
        ok: true,
        verification: await verifyMigration(),
        authSync: await verifyAuthSync(),
        authStorage: await inspectAuthStorage(),
      })
    }

    if (action === 'approve-admin') {
      const result = await approveAdmin(String(body?.email || ''))
      return Response.json(result.body, { status: result.status })
    }

    return Response.json({ error: 'Unsupported action.' }, { status: 400 })
  } catch {
    return Response.json({ error: 'Admin foundation setup failed.', code: 'setup_failed' }, { status: 500 })
  }
}
