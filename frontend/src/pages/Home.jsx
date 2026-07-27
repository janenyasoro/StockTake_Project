// src/pages/Home.jsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import StatsCard from '../components/dashboard/StatsCard'
import SalesChart from '../components/dashboard/SalesChart'
import LowStockAlert from '../components/inventory/LowStockAlert'
import { Package, AlertTriangle, TrendingUp, DollarSign, PlusCircle } from 'lucide-react'
import { productAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'

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
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user?.displayName || user?.email || 'User'}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {userProfile?.role === 'admin'
              ? 'You have full access to manage everything.'
              : userProfile?.role === 'manager'
                ? 'You can manage inventory and products.'
                : 'You can view and process sales.'}
          </p>
        </div>
        {userProfile?.role !== 'staff' && (
          <button
            onClick={() => navigate('/products')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        )}
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
    </div>
  )
}