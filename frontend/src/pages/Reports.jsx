// src/pages/Reports.jsx
import React, { useEffect, useState } from 'react'
import { productAPI } from '../services/api'
import StatsCard from '../components/dashboard/StatsCard'
import SalesChart from '../components/dashboard/SalesChart'
import { BarChart3, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Reports() {
  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState(null)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [statsRes, salesRes] = await Promise.all([
        productAPI.getStats(),
        productAPI.getSalesSummary()
      ])
      setStats(statsRes.data)
      setSalesData(salesRes.data)
    } catch (error) {
      console.error('Error fetching report data:', error)
      setError('Reports could not be loaded. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Loading reports...
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Step 4 · Insights</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Reports & analytics</h1>
        <p className="mt-1 text-sm text-slate-500">A clear view of sales performance and inventory value.</p>
      </div>

      {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><span>{error}</span><button onClick={fetchData} className="font-bold text-rose-800">Try again</button></div>}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Sales today" value={`$${salesData?.today?.total || 0}`} icon={<DollarSign className="h-5 w-5" />} color="green" />
        <StatsCard title="Orders today" value={salesData?.today?.count || 0} icon={<ShoppingBag className="h-5 w-5" />} color="blue" />
        <StatsCard title="Total products" value={stats?.total_products || 0} icon={<BarChart3 className="h-5 w-5" />} color="purple" />
        <StatsCard title="Inventory value" value={`$${stats?.total_inventory_value || 0}`} icon={<TrendingUp className="h-5 w-5" />} color="yellow" />
      </div>

      {/* Weekly Sales */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Sales this week</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-500">
            <span>This week</span>
            <span>${salesData?.this_week?.total || 0}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: `${Math.min((salesData?.this_week?.total || 0) / 1000 * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400">{salesData?.this_week?.count || 0} orders</p>
        </div>
      </div>

      {/* Monthly Trend */}
      {salesData?.monthly_trend?.length > 0 && <SalesChart salesData={salesData.monthly_trend} />}
      <Link to="/admin/users" className="group flex items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 transition hover:bg-blue-50 sm:p-5"><span><span className="block text-xs font-bold uppercase tracking-wider text-blue-700">Final step · Team</span><span className="mt-1 block text-sm font-semibold text-slate-900">Review who has access</span></span><span aria-hidden="true" className="text-lg text-blue-700 transition group-hover:translate-x-1">→</span></Link>
    </div>
  )
}
