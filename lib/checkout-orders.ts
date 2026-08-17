import 'server-only'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { desc, eq, sql } from 'drizzle-orm'
import * as schema from '@/db/schema'
import type { BakongCurrency } from '@/lib/bakong/khqr'

const PHONE_PATTERN = /^[0-9+()\-\s]{7,20}$/

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('Database is not configured.')
  return drizzle(neon(url), { schema })
}

function getSqlClient() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('Database is not configured.')
  return neon(url)
}

let ensureOrdersTablePromise: Promise<void> | null = null

export async function ensureCheckoutOrdersTable() {
  if (ensureOrdersTablePromise) return ensureOrdersTablePromise

  ensureOrdersTablePromise = (async () => {
    const client = getSqlClient()
    await client`
      CREATE TABLE IF NOT EXISTS checkout_orders (
        id serial PRIMARY KEY,
        order_number varchar(80) NOT NULL,
        product_id integer REFERENCES products(id),
        product_public_id varchar(20) NOT NULL,
        product_sku varchar(100) NOT NULL,
        product_name text NOT NULL,
        customer_name varchar(160) NOT NULL,
        customer_phone varchar(40) NOT NULL,
        phone_has_telegram boolean DEFAULT false NOT NULL,
        quantity integer DEFAULT 1 NOT NULL,
        unit_price numeric(10, 2) NOT NULL,
        total_amount numeric(12, 2) NOT NULL,
        currency varchar(3) NOT NULL,
        payment_method varchar(40) DEFAULT 'khqr' NOT NULL,
        payment_provider varchar(40) DEFAULT 'bakong' NOT NULL,
        payment_md5 varchar(32) NOT NULL,
        payment_status varchar(30) DEFAULT 'pending' NOT NULL,
        provider_status integer,
        paid_at timestamp,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `
    await client`CREATE UNIQUE INDEX IF NOT EXISTS idx_checkout_orders_order_number ON checkout_orders USING btree (order_number)`
    await client`CREATE UNIQUE INDEX IF NOT EXISTS idx_checkout_orders_payment_md5 ON checkout_orders USING btree (payment_md5)`
    await client`CREATE INDEX IF NOT EXISTS idx_checkout_orders_status_created ON checkout_orders USING btree (payment_status, created_at)`
    await client`CREATE INDEX IF NOT EXISTS idx_checkout_orders_product_public_id ON checkout_orders USING btree (product_public_id)`
    await client`
      DO $$ BEGIN
        ALTER TABLE checkout_orders ADD CONSTRAINT chk_checkout_orders_currency CHECK (currency IN ('USD', 'KHR'));
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `
    await client`
      DO $$ BEGIN
        ALTER TABLE checkout_orders ADD CONSTRAINT chk_checkout_orders_payment_status CHECK (payment_status IN ('pending', 'paid', 'expired', 'unavailable'));
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `
    await client`
      DO $$ BEGIN
        ALTER TABLE checkout_orders ADD CONSTRAINT chk_checkout_orders_quantity CHECK (quantity > 0);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `
  })()

  return ensureOrdersTablePromise
}

export interface CheckoutCustomerInput {
  name: string
  phone: string
  phoneHasTelegram: boolean
}

export interface CheckoutOrderInput {
  productPublicId: string
  quantity: number
  currency: BakongCurrency
  customer: CheckoutCustomerInput
}

export interface CheckoutProductSnapshot {
  databaseId: number
  publicId: string
  sku: string
  name: string
  unitPriceUsd: number
}

export interface PendingCheckoutOrderInput extends CheckoutOrderInput {
  paymentMd5: string
  orderNumber: string
  amount: number
}

export interface AdminCheckoutOrder {
  orderNumber: string
  productPublicId: string
  productSku: string
  productName: string
  customerName: string
  customerPhone: string
  phoneHasTelegram: boolean
  quantity: number
  unitPrice: number
  totalAmount: number
  currency: string
  paymentStatus: string
  providerStatus: number | null
  paidAt: Date | null
  createdAt: Date | null
  updatedAt: Date | null
}

export function normalizeCheckoutCustomer(input: CheckoutCustomerInput) {
  const name = input.name.trim().replace(/\s+/g, ' ')
  const phone = input.phone.trim().replace(/\s+/g, ' ')
  if (name.length < 2 || name.length > 160) return { ok: false as const, error: 'Enter a valid customer name.' }
  if (!PHONE_PATTERN.test(phone)) return { ok: false as const, error: 'Enter a valid phone number.' }
  return {
    ok: true as const,
    customer: {
      name,
      phone,
      phoneHasTelegram: Boolean(input.phoneHasTelegram),
    },
  }
}

export function normalizeCheckoutQuantity(quantity: unknown) {
  const value = typeof quantity === 'number' ? quantity : Number(quantity)
  if (!Number.isFinite(value)) return 1
  return Math.max(1, Math.min(99, Math.floor(value)))
}

export async function getCheckoutProductSnapshot(publicId: string): Promise<CheckoutProductSnapshot | null> {
  const db = getDb()
  const [product] = await db.select({
    databaseId: schema.products.id,
    publicId: schema.products.publicId,
    sku: schema.products.sku,
    name: schema.products.nameEn,
    price: schema.products.price,
  })
    .from(schema.products)
    .where(eq(schema.products.publicId, publicId))
    .limit(1)

  if (!product) return null
  return {
    databaseId: product.databaseId,
    publicId: product.publicId,
    sku: product.sku,
    name: product.name,
    unitPriceUsd: Number(product.price || 0),
  }
}

export function calculateCheckoutAmount(unitPriceUsd: number, quantity: number, currency: BakongCurrency) {
  const totalUsd = unitPriceUsd * quantity
  if (currency === 'KHR') return Math.round(totalUsd * 4100)
  return Number(totalUsd.toFixed(2))
}

export async function createPendingCheckoutOrder(input: PendingCheckoutOrderInput) {
  const customerResult = normalizeCheckoutCustomer(input.customer)
  if (!customerResult.ok) throw new Error(customerResult.error)

  const product = await getCheckoutProductSnapshot(input.productPublicId)
  if (!product) throw new Error('Product not found.')

  await ensureCheckoutOrdersTable()
  const db = getDb()
  const [order] = await db.insert(schema.checkoutOrders)
    .values({
      orderNumber: input.orderNumber,
      productId: product.databaseId,
      productPublicId: product.publicId,
      productSku: product.sku,
      productName: product.name,
      customerName: customerResult.customer.name,
      customerPhone: customerResult.customer.phone,
      phoneHasTelegram: customerResult.customer.phoneHasTelegram,
      quantity: input.quantity,
      unitPrice: product.unitPriceUsd.toFixed(2),
      totalAmount: input.amount.toFixed(2),
      currency: input.currency,
      paymentMethod: 'khqr',
      paymentProvider: 'bakong',
      paymentMd5: input.paymentMd5,
      paymentStatus: 'pending',
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.checkoutOrders.paymentMd5,
      set: {
        customerName: customerResult.customer.name,
        customerPhone: customerResult.customer.phone,
        phoneHasTelegram: customerResult.customer.phoneHasTelegram,
        quantity: input.quantity,
        totalAmount: input.amount.toFixed(2),
        updatedAt: new Date(),
      },
    })
    .returning({ orderNumber: schema.checkoutOrders.orderNumber })

  return order
}

export async function markCheckoutOrderPaid(paymentMd5: string, providerStatus?: number) {
  await ensureCheckoutOrdersTable()
  const db = getDb()
  const [order] = await db.update(schema.checkoutOrders)
    .set({
      paymentStatus: 'paid',
      providerStatus,
      paidAt: sql`coalesce(${schema.checkoutOrders.paidAt}, now())`,
      updatedAt: new Date(),
    })
    .where(eq(schema.checkoutOrders.paymentMd5, paymentMd5))
    .returning({ orderNumber: schema.checkoutOrders.orderNumber })
  return order || null
}

export async function getAdminCheckoutOrders(limit = 100): Promise<AdminCheckoutOrder[]> {
  await ensureCheckoutOrdersTable()
  const db = getDb()
  const rows = await db.select({
    orderNumber: schema.checkoutOrders.orderNumber,
    productPublicId: schema.checkoutOrders.productPublicId,
    productSku: schema.checkoutOrders.productSku,
    productName: schema.checkoutOrders.productName,
    customerName: schema.checkoutOrders.customerName,
    customerPhone: schema.checkoutOrders.customerPhone,
    phoneHasTelegram: schema.checkoutOrders.phoneHasTelegram,
    quantity: schema.checkoutOrders.quantity,
    unitPrice: schema.checkoutOrders.unitPrice,
    totalAmount: schema.checkoutOrders.totalAmount,
    currency: schema.checkoutOrders.currency,
    paymentStatus: schema.checkoutOrders.paymentStatus,
    providerStatus: schema.checkoutOrders.providerStatus,
    paidAt: schema.checkoutOrders.paidAt,
    createdAt: schema.checkoutOrders.createdAt,
    updatedAt: schema.checkoutOrders.updatedAt,
  })
    .from(schema.checkoutOrders)
    .where(eq(schema.checkoutOrders.paymentStatus, 'paid'))
    .orderBy(desc(schema.checkoutOrders.createdAt))
    .limit(limit)

  return rows.map(row => ({
    ...row,
    phoneHasTelegram: Boolean(row.phoneHasTelegram),
    quantity: row.quantity || 1,
    unitPrice: Number(row.unitPrice || 0),
    totalAmount: Number(row.totalAmount || 0),
  }))
}
