import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowRight, ReceiptText } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { productAPI, salesAPI } from '../services/api'

function getList(data) {
  if (Array.isArray(data)) return data
  return Array.isArray(data?.results) ? data.results : []
}

export default function Sales() {
  const { isAdmin, userProfile } = useAuth()
  const [products, setProducts] = useState([])
  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [customer, setCustomer] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [recent, setRecent] = useState([])
  const availableProducts = products.filter(item => Number(item.stock_quantity) > 0)
  const selectedProduct = availableProducts.find(item => String(item.id) === product)

  const load = async () => {
    setLoadError('')
    try {
      const [productResponse, salesResponse] = await Promise.all([
        productAPI.getAll(),
        salesAPI.getAll(),
      ])
      setProducts(getList(productResponse.data))
      setRecent(getList(salesResponse.data))
    } catch (error) {
      console.error('Could not load the sales workspace:', error)
      setLoadError('Products and invoices could not be loaded. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const recordSale = async (event) => {
    event.preventDefault()
    if (!selectedProduct) return toast.error('Choose a product that is in stock.')
    if (Number(quantity) > Number(selectedProduct.stock_quantity)) {
      return toast.error(`Only ${selectedProduct.stock_quantity} units are available.`)
    }

    setSaving(true)
    try {
      const invoice = `SP-${Date.now().toString().slice(-8)}`
      await salesAPI.create({
        invoice_number: invoice,
        customer_name: customer.trim() || null,
        payment_method: 'cash',
        line_items: [{ product: Number(product), quantity: Number(quantity) }],
      })
      toast.success(`Invoice ${invoice} recorded`)
      setProduct('')
      setQuantity(1)
      setCustomer('')
      await load()
    } catch (error) {
      const detail = error.response?.data?.line_items
      toast.error(Array.isArray(detail) ? detail[0] : detail || 'Could not record the sale.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Step {userProfile?.role === 'staff' ? '2' : '3'} · Sales</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Record a sale</h1>
        <p className="mt-1 text-sm leading-6 text-slate-500">Choose an in-stock product, create an invoice, and stock updates automatically.</p>
      </header>

      {loadError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{loadError}</div>}

      <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">Sale details</h2>
          <form onSubmit={recordSale} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Product
              <select value={product} onChange={event => setProduct(event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-300" required disabled={loading || availableProducts.length === 0}>
                <option value="">{loading ? 'Loading products…' : availableProducts.length ? 'Choose a product' : 'No products in stock'}</option>
                {availableProducts.map(item => <option value={item.id} key={item.id}>{item.name} · {item.stock_quantity} available</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Quantity
              <input min="1" max={selectedProduct?.stock_quantity} type="number" value={quantity} onChange={event => setQuantity(event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-300" required disabled={!selectedProduct} />
              {selectedProduct && <span className="mt-1 block text-xs font-normal text-slate-500">{selectedProduct.stock_quantity} units available</span>}
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Customer <span className="font-normal text-slate-400">(optional)</span>
              <input value={customer} onChange={event => setCustomer(event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-300" placeholder="Walk-in customer" />
            </label>
            <button type="submit" disabled={saving || loading || !selectedProduct} className="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? 'Recording sale…' : 'Record sale and create invoice'}
            </button>
            {!loading && availableProducts.length === 0 && <p className="text-center text-sm text-slate-500">Add products or replenish stock before recording a sale. <Link to="/products" className="font-semibold text-blue-700 hover:text-blue-800">Go to products</Link></p>}
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Completed</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">Recent invoices</h2>
            </div>
            <ReceiptText className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {recent.slice(0, 7).map(sale => (
              <div className="flex items-center justify-between gap-4 py-3 text-sm" key={sale.id}>
                <div className="min-w-0"><p className="truncate font-semibold text-slate-800">{sale.invoice_number}</p><p className="truncate text-slate-500">{sale.customer_name || 'Walk-in customer'}</p></div>
                <p className="shrink-0 font-bold tabular-nums text-slate-900">${Number(sale.total_amount || 0).toFixed(2)}</p>
              </div>
            ))}
            {!loading && !loadError && recent.length === 0 && <div className="py-10 text-center"><ReceiptText className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-2 text-sm font-semibold text-slate-700">No sales yet</p><p className="mt-1 text-xs text-slate-500">Your invoices will appear here after the first sale.</p></div>}
            {loading && <p className="py-8 text-center text-sm text-slate-500">Loading invoices…</p>}
          </div>
          {isAdmin && recent.length > 0 && <Link to="/reports" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800">Next: review sales insights<ArrowRight className="h-4 w-4" /></Link>}
        </section>
      </div>
    </div>
  )
}
