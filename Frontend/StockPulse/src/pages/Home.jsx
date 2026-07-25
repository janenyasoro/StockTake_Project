/**
 * Dashboard/Home Page
 * Shows key metrics, charts, and alerts.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { productAPI, salesAPI } from '../services/api'
import StatsCard from '../components/dashboard/StatsCard'
import SalesChart from '../components/dashboard/SalesChart'
import LowStockAlert from '../components/inventory/LowStockAlert'
import {
    PackageIcon,
    AlertTriangleIcon,
    TrendingUpIcon,
    DollarSignIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Home() {
    // Fetch product statistics
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['productStats'],
        queryFn: async () => {
            const response = await productAPI.getStats()
            return response.data
        },
        onError: (error) => {
            toast.error('Failed to load statistics')
            console.error(error)
        }
    })

    // Fetch sales summary
    const { data: sales, isLoading: salesLoading } = useQuery({
        queryKey: ['salesSummary'],
        queryFn: async () => {
            const response = await salesAPI.getSummary()
            return response.data
        },
        onError: (error) => {
            toast.error('Failed to load sales data')
            console.error(error)
        }
    })

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount)
    }

    // Show loading state
    if (statsLoading || salesLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-gray-500">Loading dashboard...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Overview of your inventory and sales</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Products"
                    value={stats?.total_products || 0}
                    icon={<PackageIcon className="h-6 w-6" />}
                    color="blue"
                />
                <StatsCard
                    title="Low Stock Items"
                    value={stats?.low_stock_count || 0}
                    icon={<AlertTriangleIcon className="h-6 w-6" />}
                    color="red"
                    warning={stats?.low_stock_count > 5}
                />
                <StatsCard
                    title="Today's Sales"
                    value={formatCurrency(sales?.today?.total || 0)}
                    subtitle={`${sales?.today?.count || 0} orders`}
                    icon={<TrendingUpIcon className="h-6 w-6" />}
                    color="green"
                />
                <StatsCard
                    title="Inventory Value"
                    value={formatCurrency(stats?.total_inventory_value || 0)}
                    icon={<DollarSignIcon className="h-6 w-6" />}
                    color="purple"
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart - Takes 2/3 of the space */}
                <div className="lg:col-span-2">
                    <SalesChart salesData={sales?.monthly_trend || []} />
                </div>

                {/* Low Stock Alerts - Takes 1/3 of the space */}
                <div className="lg:col-span-1">
                    <LowStockAlert />
                </div>
            </div>
        </div>
    )
}