import React, { useEffect, useState } from 'react'
import { productAPI } from '../services/api'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    productAPI.getAll().then(({ data }) => {
      setProducts(Array.isArray(data) ? data : data.results || [])
    }).catch((requestError) => {
      setError(requestError.response?.data?.detail || 'Products could not be loaded. Please try again.')
    }).finally(() => setLoading(false))
  }, [])

  return <section>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold tracking-tight text-slate-900">Products</h2><p className="mt-1 text-sm text-slate-500">View current stock levels and product pricing.</p></div>{!loading && <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">{products.length} product{products.length === 1 ? '' : 's'}</span>}</div>
    {loading && <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">Loading products…</div>}
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!loading && !error && products.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm"><p className="font-semibold text-slate-800">No products yet</p><p className="mt-1 text-sm text-slate-500">Products added to your inventory will appear here.</p></div>}
    {!loading && !error && products.length > 0 && <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-4 font-semibold">Product</th><th className="px-6 py-4 font-semibold">SKU</th><th className="px-6 py-4 font-semibold">Stock</th><th className="px-6 py-4 text-right font-semibold">Price</th></tr></thead><tbody className="divide-y divide-slate-100">{products.map(product => <tr className="transition hover:bg-slate-50" key={product.id}><td className="px-6 py-4"><p className="font-semibold text-slate-800">{product.name}</p><p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">{product.category_name || 'Uncategorised'}</p></td><td className="px-6 py-4 font-mono text-xs text-slate-500">{product.sku}</td><td className="px-6 py-4"><span className={product.is_low_stock ? 'inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800' : 'inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800'}>{product.stock_quantity} {product.is_low_stock ? 'Low stock' : 'In stock'}</span></td><td className="px-6 py-4 text-right font-semibold tabular-nums text-slate-800">{Number(product.price).toFixed(2)}</td></tr>)}</tbody></table></div></div>}
  </section>
}
