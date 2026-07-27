// src/pages/Reports.jsx
import React, { useEffect, useState } from 'react'
import { productAPI } from '../services/api'
import { BarChart3, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react'

export default function Reports() {
  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, salesRes] = await Promise.all([
        productAPI.getStats(),
        productAPI.getSalesSummary()
      ])
      setStats(statsRes.data)
      setSalesData(salesRes.data)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading reports...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500">View sales and inventory insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                ${salesData?.today?.total || 0}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {salesData?.today?.count || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.total_products || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats?.total_inventory_value || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Sales */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Sales</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>This week</span>
            <span>${salesData?.this_week?.total || 0}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${Math.min((salesData?.this_week?.total || 0) / 1000 * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400">{salesData?.this_week?.count || 0} orders</p>
        </div>
      </div>

      {/* Monthly Trend */}
      {salesData?.monthly_trend && salesData.monthly_trend.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h2>
          <div className="space-y-2">
            {salesData.monthly_trend.slice(-7).map((day, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{day.sale_date__date}</span>
                <div className="flex items-center space-x-2 flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min((day.daily_total || 0) / 100 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <span className="font-medium text-gray-900">${day.daily_total || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}y
