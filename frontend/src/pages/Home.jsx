import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productAPI, salesAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
export default function Home() {
  const [stats, setStats] = useState(null)
  const [sales, setSales] = useState(null)
  const { userRole } = useAuth()
  useEffect(() => { productAPI.getStats().then(r => setStats(r.data)).catch(() => setStats({})); salesAPI.getSummary().then(r => setSales(r.data)).catch(() => setSales(null)) }, [])
  const cards = [
    ['Products', stats?.total_products ?? '–', 'blue'],
    ['Low-stock alerts', stats?.low_stock_count ?? '–', 'amber'],
    ['Today’s sales', sales ? `${Number(sales.today.total).toFixed(2)}` : '–', 'emerald'],
    ['Inventory value', stats ? Number(stats.total_inventory_value).toFixed(2) : '–', 'slate'],
  ]
  return (
    <div className="space-y-7"><div><h2 className="text-2xl font-bold tracking-tight text-slate-900">Good day</h2><p className="mt-1 text-sm text-slate-500">{userRole?.label || 'Team member'} view of stock, sales, and replenishment.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, color]) => <div key={label} className={`rounded-xl border bg-white p-5 shadow-sm ${color === 'blue' ? 'border-blue-100' : color === 'emerald' ? 'border-emerald-100' : 'border-slate-200'}`}><p className="text-sm font-medium text-slate-500">{label}</p><p className={`mt-2 text-3xl font-bold ${color === 'blue' ? 'text-blue-600' : color === 'emerald' ? 'text-emerald-600' : 'text-slate-900'}`}>{value}</p></div>)}</div>
      <div className="grid gap-5 lg:grid-cols-2"><section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="font-bold text-slate-900">Role capabilities</h3><ul className="mt-4 space-y-3 text-sm text-slate-600"><li>• Admin: dashboard, products, analytics and team oversight</li><li>• Inventory Manager: products, stock adjustments and purchase orders</li><li>• Sales Staff: stock availability and sales recording</li></ul></section><section className="rounded-xl bg-slate-900 p-6 text-white"><p className="text-sm text-slate-400">Next action</p><h3 className="mt-2 text-xl font-bold">Keep best-sellers available.</h3><p className="mt-2 text-sm text-slate-300">Review low-stock products and replenish before sales are missed.</p><Link to="/products" className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500">View products</Link></section></div>
      </div>
  )
}
