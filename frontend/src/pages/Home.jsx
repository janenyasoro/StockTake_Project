import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import StatsCard from '../components/dashboard/StatsCard'
import SalesChart from '../components/dashboard/SalesChart'
import LowStockAlert from '../components/inventory/LowStockAlert'
import { Package, AlertTriangle, TrendingUp, DollarSign, Users, ShoppingBag, ClipboardList, ArrowRight, BarChart3 } from 'lucide-react'
import { productAPI } from '../services/api'

export default function Home() {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [sales, setSales] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError('')
    try {
      const [statsRes, salesRes] = await Promise.all([
        productAPI.getStats(),
        productAPI.getSalesSummary()
      ])
      setStats(statsRes.data)
      setSales(salesRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Dashboard data could not be loaded. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Loading dashboard...
      </div>
    )
  }

  const workflowSteps = [
    { name: 'Products', description: 'Find items or add your catalogue', icon: Package, path: '/products' },
    ...(userProfile?.role === 'admin' || userProfile?.role === 'manager'
      ? [{ name: 'Stock control', description: 'Review items to replenish', icon: ClipboardList, path: '/inventory' }]
      : []),
    { name: 'Record a sale', description: 'Create an invoice and update stock', icon: ShoppingBag, path: '/sales' },
    ...(userProfile?.role === 'admin'
      ? [
          { name: 'Sales analytics', description: 'Review your sales performance', icon: BarChart3, path: '/reports' },
          { name: 'Manage users', description: 'Keep team access up to date', icon: Users, path: '/admin/users' },
        ]
      : []),
  ]

  return (
    <div className="space-y-7">
      {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><span>{error}</span><button onClick={fetchDashboardData} className="rounded-lg px-3 py-1.5 font-bold text-rose-800 transition hover:bg-rose-100">Try again</button></div>}
      <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-7 shadow-lg shadow-slate-900/10 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[32px] border-white/[0.035]" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Your workspace</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Welcome back, {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there'}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            {userProfile?.role === 'admin'
              ? 'Keep your stock, sales, and team moving from one clear workspace.'
              : userProfile?.role === 'manager'
                ? 'Stay ahead of low stock and keep daily sales moving.'
                : 'Find the right product and record your next sale.'}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button onClick={() => navigate(workflowSteps[0].path)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-500">
              Start with {workflowSteps[0].name}<ArrowRight className="h-4 w-4" />
            </button>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200">
              <span className={`h-2 w-2 rounded-full ${userProfile?.role === 'admin' ? 'bg-indigo-400' : userProfile?.role === 'manager' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
              {userProfile?.role_display || 'Sales Staff'}
            </span>
          </div>
        </div>
      </section>

      <section aria-labelledby="workflow-heading" className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">A simple path through your day</p>
          <h2 id="workflow-heading" className="mt-1 text-lg font-bold text-slate-900">Your workflow</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <button key={step.path} onClick={() => navigate(step.path)} className="group flex min-h-28 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                <step.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Step {index + 1}</span>
                <span className="block text-sm font-bold text-slate-900">{step.name}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{step.description}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Products"
          value={stats?.total_products || 0}
          icon={<Package className="h-6 w-6" />}
          color="blue"
        />
        <StatsCard
          title="Low Stock Items"
          value={stats?.low_stock_count || 0}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
          warning={stats?.low_stock_count > 0}
        />
        <StatsCard
          title="Today's Sales"
          value={`$${sales?.today?.total || 0}`}
          subtitle={`${sales?.today?.count || 0} orders`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />
        <StatsCard
          title="Inventory Value"
          value={`$${stats?.total_inventory_value || 0}`}
          icon={<DollarSign className="h-6 w-6" />}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart salesData={sales?.monthly_trend || []} />
        </div>
        <div className="lg:col-span-1">
          <LowStockAlert />
        </div>
      </div>

    </div>
  )
}
