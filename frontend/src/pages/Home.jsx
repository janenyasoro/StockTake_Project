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

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, salesRes] = await Promise.all([
        productAPI.getStats(),
        productAPI.getSalesSummary()
      ])
      setStats(statsRes.data)
      setSales(salesRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
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

  return (
    <div className="space-y-7">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {user?.displayName || user?.email || 'there'}
          </h1>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {userProfile?.role === 'admin'
              ? 'Your workspace is ready. Review performance and keep your team moving.'
              : userProfile?.role === 'manager'
                ? 'Your workspace is ready. Keep products and stock levels up to date.'
                : 'Your workspace is ready. Find products and record sales here.'}
          </p>
          <div className="mt-3 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
            <span className={`mr-2 h-2 w-2 rounded-full ${userProfile?.role === 'admin' ? 'bg-indigo-500' :
                userProfile?.role === 'manager' ? 'bg-blue-500' : 'bg-emerald-500'
              }`}></span>
            {userProfile?.role_display || 'Sales Staff'}
          </div>
        </div>
      </div>

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

      <section aria-labelledby="next-steps-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 id="next-steps-heading" className="text-lg font-bold text-slate-900">Quick links</h2>
          <p className="mt-1 text-sm text-slate-500">Jump to the work you do most.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Browse products', description: 'Check prices and availability', icon: Package, path: '/products' },
            { name: 'Record a sale', description: 'Create an invoice and update stock', icon: ShoppingBag, path: '/sales' },
            ...(userProfile?.role === 'admin' || userProfile?.role === 'manager' ? [{ name: 'Review stock', description: 'See items that need replenishing', icon: ClipboardList, path: '/inventory' }] : []),
            ...(userProfile?.role === 'admin' ? [
              { name: 'Sales analytics', description: 'Review sales performance', icon: BarChart3, path: '/reports' },
              { name: 'Manage users', description: 'Update team roles and access', icon: Users, path: '/admin/users' },
            ] : []),
          ].map(item => (
            <button key={item.path} onClick={() => navigate(item.path)} className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/50">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-700"><item.icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">{item.name}</span><span className="mt-0.5 block text-xs text-slate-500">{item.description}</span></span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
