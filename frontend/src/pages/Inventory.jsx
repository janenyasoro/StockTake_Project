import React, { useEffect, useState } from 'react'
import { productAPI } from '../services/api'

export default function Inventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    productAPI.getLowStock().then(r => setItems(Array.isArray(r.data) ? r.data : r.data.results || []))
      .catch(() => setError('Low-stock items could not be loaded. Please try again.'))
      .finally(() => setLoading(false))
  }, [])
  return <section>
    <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Inventory</p>
    <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Low-stock alerts</h2>
    <p className="mt-1 text-sm text-slate-500">Replenish these products before they affect sales.</p>
    {error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto"><table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4 font-semibold">Product</th><th className="px-5 py-4 font-semibold">Available</th><th className="px-5 py-4 font-semibold">Reorder at</th><th className="px-5 py-4 font-semibold">Suggested order</th></tr></thead>
        <tbody className="divide-y divide-slate-100">{items.map(item => <tr className="transition hover:bg-slate-50" key={item.id}><td className="px-5 py-4 font-semibold text-slate-800">{item.name}<span className="ml-2 font-mono text-xs font-normal text-slate-500">{item.sku}</span></td><td className="px-5 py-4"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">{item.stock_quantity}</span></td><td className="px-5 py-4 text-slate-600">{item.reorder_level}</td><td className="px-5 py-4 font-semibold text-blue-700">{item.reorder_quantity} units</td></tr>)}
          {!loading && !error && items.length === 0 && <tr><td colSpan="4" className="px-5 py-12 text-center text-slate-500">All products are above their reorder levels.</td></tr>}
          {loading && <tr><td colSpan="4" className="px-5 py-12 text-center text-slate-500">Loading stock alerts…</td></tr>}
        </tbody>
      </table></div>
    </div>
  </section>
}
