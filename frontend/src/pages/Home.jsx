import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import StatsCard from '../components/dashboard/StatsCard'
import SalesChart from '../components/dashboard/SalesChart'
import LowStockAlert from '../components/inventory/LowStockAlert'
import { Package, AlertTriangle, TrendingUp, DollarSign, PlusCircle, Users, ShoppingBag, ClipboardList } from 'lucide-react'
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

  // Role-based quick actions
  const getQuickActions = () => {
    const actions = []

    if (userProfile?.role === 'admin') {
      actions.push(
        { label: 'Manage Users', icon: Users, path: '/admin/users', color: 'purple' },
        { label: 'View Analytics', icon: TrendingUp, path: '/reports', color: 'blue' }
      )
    }

    if (userProfile?.role === 'admin' || userProfile?.role === 'manager') {
      actions.push(
        { label: 'Add Product', icon: PlusCircle, path: '/products', color: 'green' },
        { label: 'Purchase Orders', icon: ClipboardList, path: '/purchase-orders', color: 'orange' }
      )
    }

    if (userProfile?.role === 'staff' || userProfile?.role === 'manager') {
      actions.push(
        { label: 'Record Sale', icon: ShoppingBag, path: '/sales', color: 'blue' }
      )
    }

    return actions
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome, {user?.displayName || user?.email || 'User'}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {userProfile?.role === 'admin'
              ? '🔐 You have full access to manage everything.'
              : userProfile?.role === 'manager'
                ? '📋 You can manage inventory and products.'
                : '💼 You can view products and record sales.'}
          </p>
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border">
            <span className={`w-2 h-2 rounded-full mr-2 ${userProfile?.role === 'admin' ? 'bg-purple-500' :
                userProfile?.role === 'manager' ? 'bg-blue-500' : 'bg-gray-500'
              }`}></span>
            {userProfile?.role_display || 'Sales Staff'}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {getQuickActions().map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-all duration-200 shadow-md hover:shadow-lg ${action.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                  action.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                    action.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                      action.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
                        'bg-gray-600 hover:bg-gray-700'
                }`}
            >
              <action.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
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

      {/* Data Models Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {[
          { name: 'Products', icon: Package, count: stats?.total_products || 0 },
          { name: 'Categories', icon: Package, count: stats?.categories || 0 },
          { name: 'Suppliers', icon: Package, count: stats?.suppliers || 0 },
          { name: 'Sales', icon: ShoppingBag, count: sales?.today?.count || 0 },
          { name: 'Transactions', icon: ClipboardList, count: 0 },
          { name: 'Orders', icon: ClipboardList, count: 0 },
          { name: 'Warehouses', icon: Package, count: 0 },
        ].map((item) => (
          <div key={item.name} className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 text-center">
            <item.icon className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{item.count}</p>
            <p className="text-xs text-gray-500">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}