'use client'

export default function AdminProductsError() {
  return (
    <div className="rounded-lg border border-red-100 bg-red-50 p-5 text-red-800">
      <h1 className="text-lg font-black">Unable to load products</h1>
      <p className="mt-2 text-sm">The admin product list could not be loaded. Try again later.</p>
    </div>
  )
}
