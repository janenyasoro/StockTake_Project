import React, { useEffect, useState } from 'react'
import { productAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', sku: '', price: '' })
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const { isAdmin, isManager } = useAuth()

  const loadProducts = () => productAPI.getAll().then(({ data }) => {
    setProducts(Array.isArray(data) ? data : data.results || [])
  }).catch((requestError) => {
    setError(requestError.response?.data?.detail || 'Products could not be loaded. Please try again.')
  }).finally(() => setLoading(false))

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    setSearch(searchParams.get('search') || '')
  }, [searchParams])

  const createProduct = async (event) => {
    event.preventDefault()
    try { await productAPI.create({ ...form, price: Number(form.price) }); toast.success('Product added'); setForm({ name: '', sku: '', price: '' }); setShowForm(false); setLoading(true); loadProducts() } catch (requestError) { toast.error(requestError.response?.data?.sku?.[0] || 'Could not add product.') }
  }
  const canManage = isAdmin || isManager
  const filteredProducts = products.filter(product => `${product.name} ${product.sku} ${product.category_name || ''}`.toLowerCase().includes(search.trim().toLowerCase()))

  return <section>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold tracking-tight text-slate-900">Products</h2><p className="mt-1 text-sm text-slate-500">View current stock levels and product pricing.</p></div><div className="flex flex-wrap items-center gap-3">{!loading && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">{filteredProducts.length} of {products.length} products</span>}{canManage && <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">Add product</button>}</div></div>
    {!loading && products.length > 0 && <label className="mb-4 block max-w-md"><span className="sr-only">Search products</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by product, SKU, or category" className="w-full rounded-xl border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-100" /></label>}
    {showForm && <form onSubmit={createProduct} className="mb-6 grid gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 md:grid-cols-4"><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="rounded-lg border-slate-300"/><input required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SKU" className="rounded-lg border-slate-300"/><input required type="number" min="0.01" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Price" className="rounded-lg border-slate-300"/><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white">Save product</button></form>}
    {loading && <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">Loading products…</div>}
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!loading && !error && products.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm"><p className="font-semibold text-slate-800">No products yet</p><p className="mt-1 text-sm text-slate-500">Products added to your inventory will appear here.</p></div>}
    {!loading && !error && products.length > 0 && filteredProducts.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No products match “{search}”.</div>}
    {!loading && !error && filteredProducts.length > 0 && <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-4 font-semibold">Product</th><th className="px-6 py-4 font-semibold">SKU</th><th className="px-6 py-4 font-semibold">Stock</th><th className="px-6 py-4 text-right font-semibold">Price</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredProducts.map(product => <tr className="transition hover:bg-slate-50" key={product.id}><td className="px-6 py-4"><p className="font-semibold text-slate-800">{product.name}</p><p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">{product.category_name || 'Uncategorised'}</p></td><td className="px-6 py-4 font-mono text-xs text-slate-500">{product.sku}</td><td className="px-6 py-4"><span className={product.is_low_stock ? 'inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800' : 'inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800'}>{product.stock_quantity} {product.is_low_stock ? 'Low stock' : 'In stock'}</span></td><td className="px-6 py-4 text-right font-semibold tabular-nums text-slate-800">{Number(product.price).toFixed(2)}</td></tr>)}</tbody></table></div></div>}
  </section>
}
