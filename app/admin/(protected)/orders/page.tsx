import Link from 'next/link'
import { CheckCircle2, Clock3, ExternalLink } from 'lucide-react'
import { getAdminCheckoutOrders } from '@/lib/checkout-orders'

function formatDate(value: Date | null) {
  if (!value) return 'N/A'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

function statusBadge(status: string) {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
        <CheckCircle2 className="size-3" aria-hidden="true" />
        Paid
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700">
      <Clock3 className="size-3" aria-hidden="true" />
      {status === 'pending' ? 'Pending' : status}
    </span>
  )
}

export default async function AdminOrdersPage() {
  const orders = await getAdminCheckoutOrders()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950">Orders</h1>
        <p className="mt-1 text-sm text-slate-600">KHQR checkout requests stored from the public storefront.</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-slate-700">{orders.length.toLocaleString()} recent orders</p>
          <p className="text-xs text-slate-500">Newest first</p>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-base font-bold text-slate-950">No KHQR orders yet</p>
            <p className="mt-1 text-sm text-slate-600">Paid checkout orders will appear here after customers use KHQR.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Paid at</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map(order => (
                    <tr key={order.orderNumber} className="align-top">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-bold text-slate-800">{order.orderNumber}</p>
                        <p className="mt-1 text-xs text-slate-500">Bakong KHQR</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-950">{order.customerName}</p>
                        <p className="mt-1 font-mono text-xs text-slate-600">{order.customerPhone}</p>
                        <p className="mt-1 text-xs text-slate-500">Telegram: {order.phoneHasTelegram ? 'Yes' : 'No'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-sm line-clamp-2 font-semibold text-slate-950">{order.productName}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono">{order.productSku}</span>
                          <Link href={`/admin/products/${order.productPublicId}`} className="inline-flex items-center gap-1 font-semibold text-cyan-700 hover:text-cyan-900">
                            {order.productPublicId}
                            <ExternalLink className="size-3" aria-hidden="true" />
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold">{order.quantity}</td>
                      <td className="px-4 py-3 font-black">{order.totalAmount.toFixed(2)} {order.currency}</td>
                      <td className="px-4 py-3">{statusBadge(order.paymentStatus)}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{formatDate(order.paidAt)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-3 lg:hidden">
              {orders.map(order => (
                <article key={order.orderNumber} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold text-slate-800">{order.orderNumber}</p>
                      <p className="mt-1 text-sm font-black text-slate-950">{order.customerName}</p>
                      <p className="mt-1 font-mono text-xs text-slate-600">{order.customerPhone}</p>
                    </div>
                    {statusBadge(order.paymentStatus)}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-semibold text-slate-950">{order.productName}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div><dt className="text-slate-500">SKU</dt><dd className="font-semibold">{order.productSku}</dd></div>
                    <div><dt className="text-slate-500">Telegram</dt><dd className="font-semibold">{order.phoneHasTelegram ? 'Yes' : 'No'}</dd></div>
                    <div><dt className="text-slate-500">Quantity</dt><dd className="font-semibold">{order.quantity}</dd></div>
                    <div><dt className="text-slate-500">Total</dt><dd className="font-black">{order.totalAmount.toFixed(2)} {order.currency}</dd></div>
                    <div><dt className="text-slate-500">Paid at</dt><dd className="font-semibold">{formatDate(order.paidAt)}</dd></div>
                    <div><dt className="text-slate-500">Created</dt><dd className="font-semibold">{formatDate(order.createdAt)}</dd></div>
                  </dl>
                  <Link href={`/admin/products/${order.productPublicId}`} className="btn-secondary mt-3 h-10 rounded-lg">
                    View product
                  </Link>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
