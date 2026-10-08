import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowRight, Boxes, Plus } from 'lucide-react'
import { productAPI } from '../services/api'

function getList(data) {
  if (Array.isArray(data)) return data
  return Array.isArray(data?.results) ? data.results : []
}

export default function Inventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [receivingId, setReceivingId] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [saving, setSaving] = useState(false)

  const loadItems = useCallback(async () => {
    setError('')
    try {
      const response = await productAPI.getLowStock()
      setItems(getList(response.data))
    } catch (requestError) {
      console.error('Could not load stock alerts:', requestError)
      setError('Stock alerts could not be loaded. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadItems() }, [loadItems])

  const receiveStock = async (event, item) => {
    event.preventDefault()
    const amount = Number(quantity)
    if (!Number.isInteger(amount) || amount < 1) return toast.error('Enter a whole number greater than zero.')
    setSaving(true)
    try {
      await productAPI.updateStock(item.id, {
        quantity: amount,
        transaction_type: 'purchase',
        notes: 'Stock received from inventory screen',
      })
      toast.success(`${amount} units added to ${item.name}`)
      setReceivingId(null)
      setQuantity('')
      await loadItems()
    } catch (requestError) {
      toast.error(requestError.response?.data?.error || 'Stock could not be updated.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Step 2 · Inventory</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Stock control</h1>
        <p className="mt-1 text-sm leading-6 text-slate-500">Review low stock, receive replenishments, then continue to sales.</p>
      </header>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div><h2 className="font-bold text-slate-900">Items to replenish</h2><p className="mt-0.5 text-xs text-slate-500">{items.length} item{items.length === 1 ? '' : 's'} below reorder level</p></div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Boxes className="h-5 w-5" /></span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3.5 font-semibold">Product</th><th className="px-5 py-3.5 font-semibold">Available</th><th className="px-5 py-3.5 font-semibold">Reorder at</th><th className="px-5 py-3.5 font-semibold">Suggested order</th><th className="px-5 py-3.5"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => <React.Fragment key={item.id}>
                <tr className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4"><p className="font-semibold text-slate-800">{item.name}</p><p className="mt-0.5 font-mono text-xs text-slate-500">{item.sku}</p></td>
                  <td className="px-5 py-4"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">{item.stock_quantity}</span></td>
                  <td className="px-5 py-4 text-slate-600">{item.reorder_level}</td>
                  <td className="px-5 py-4 font-semibold text-blue-700">{item.reorder_quantity} units</td>
                  <td className="px-5 py-4 text-right"><button type="button" onClick={() => { setReceivingId(receivingId === item.id ? null : item.id); setQuantity(String(item.reorder_quantity || 1)) }} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50"><Plus className="h-3.5 w-3.5" />Receive</button></td>
                </tr>
                {receivingId === item.id && <tr><td colSpan="5" className="bg-blue-50/60 px-5 py-4">
                  <form onSubmit={event => receiveStock(event, item)} className="flex flex-wrap items-end gap-3">
                    <label className="min-w-40 flex-1 text-xs font-semibold text-slate-700">Units received<input autoFocus type="number" min="1" step="1" required value={quantity} onChange={event => setQuantity(event.target.value)} className="mt-1 block w-full rounded-lg border-slate-300 bg-white px-3 py-2 text-sm" /></label>
                    <button type="submit" disabled={saving} className="rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-800 disabled:opacity-50">{saving ? 'Saving…' : 'Update stock'}</button>
                    <button type="button" onClick={() => setReceivingId(null)} className="rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-white">Cancel</button>
                  </form>
                </td></tr>}
              </React.Fragment>)}
              {!loading && !error && items.length === 0 && <tr><td colSpan="5" className="px-5 py-12 text-center"><p className="font-semibold text-slate-800">Stock is in good shape</p><p className="mt-1 text-sm text-slate-500">No products are currently below their reorder level.</p></td></tr>}
              {loading && <tr><td colSpan="5" className="px-5 py-12 text-center text-slate-500">Loading stock alerts…</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <Link to="/sales" className="group flex items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 transition hover:border-blue-200 hover:bg-blue-50 sm:p-5">
        <span><span className="block text-xs font-bold uppercase tracking-wider text-blue-700">Next step · Sales</span><span className="mt-1 block text-sm font-semibold text-slate-900">Stock is ready? Record a sale</span></span>
        <ArrowRight className="h-5 w-5 text-blue-700 transition group-hover:translate-x-1" />
      </Link>
    </div>
  )
}
