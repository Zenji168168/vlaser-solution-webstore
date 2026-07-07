'use client'

export default function AdminProductEditError() {
  return (
    <div className="rounded-lg border border-red-100 bg-red-50 p-5 text-red-800">
      <h1 className="text-lg font-black">Unable to load product editor</h1>
      <p className="mt-2 text-sm">The product editor could not be loaded. Please try again.</p>
    </div>
  )
}
