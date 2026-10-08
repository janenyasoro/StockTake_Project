import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { productAPI, salesAPI } from '../services/api'

export default function Sales() {
  const [products, setProducts] = useState([])
  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [customer, setCustomer] = useState('')
  const [saving, setSaving] = useState(false)
  const [recent, setRecent] = useState([])
  const load = () => { productAPI.getAll().then(r => setProducts(Array.isArray(r.data) ? r.data : r.data.results || [])); salesAPI.getAll().then(r => setRecent(Array.isArray(r.data) ? r.data : r.data.results || [])) }
  useEffect(load, [])
  const recordSale = async (event) => {
    event.preventDefault()
    if (!product) return toast.error('Select a product to record the sale.')
    setSaving(true)
    try {
      const invoice = `SP-${Date.now().toString().slice(-8)}`
      await salesAPI.create({ invoice_number: invoice, customer_name: customer || null, payment_method: 'cash', line_items: [{ product: Number(product), quantity: Number(quantity) }] })
      toast.success(`Invoice ${invoice} recorded`)
      setProduct(''); setQuantity(1); setCustomer(''); load()
    } catch (error) { toast.error(error.response?.data?.line_items?.[0] || 'Could not record the sale.') } finally { setSaving(false) }
  }
  return <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Sales</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Record a sale</h2><p className="mt-1 text-sm leading-6 text-slate-500">Stock is reduced automatically and an invoice is created.</p><form onSubmit={recordSale} className="mt-6 space-y-4"><label className="block text-sm font-semibold text-slate-700">Product<select value={product} onChange={e => setProduct(e.target.value)} className="mt-1.5 w-full rounded-xl border-slate-300" required><option value="">Choose product</option>{products.map(item => <option value={item.id} key={item.id}>{item.name} — {item.stock_quantity} available</option>)}</select></label><label className="block text-sm font-semibold text-slate-700">Quantity<input min="1" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="mt-1.5 w-full rounded-xl border-slate-300" required /></label><label className="block text-sm font-semibold text-slate-700">Customer (optional)<input value={customer} onChange={e => setCustomer(e.target.value)} className="mt-1.5 w-full rounded-xl border-slate-300" placeholder="Walk-in customer" /></label><button disabled={saving} className="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-50">{saving ? 'Recording…' : 'Record sale & generate invoice'}</button></form></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-bold text-slate-900">Recent invoices</h2><div className="mt-4 divide-y divide-slate-100">{recent.slice(0, 7).map(sale => <div className="flex items-center justify-between py-3 text-sm" key={sale.id}><div><p className="font-semibold text-slate-800">{sale.invoice_number}</p><p className="text-slate-500">{sale.customer_name || 'Walk-in customer'}</p></div><p className="font-bold text-slate-900">{Number(sale.total_amount).toFixed(2)}</p></div>)}{recent.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No invoices recorded yet.</p>}</div></section></div>
}
