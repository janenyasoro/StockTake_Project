/**
 * Low Stock Alert Component
 * Shows products that need reordering.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { productAPI } from '../../services/api'
import { AlertTriangleIcon, PackageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function LowStockAlert() {
    // Fetch low stock products
    const { data: products, isLoading } = useQuery({
        queryKey: ['lowStockProducts'],
        queryFn: async () => {
            const response = await productAPI.getLowStock()
            return response.data
        },
        onError: (error) => {
            toast.error('Failed to load low stock alerts')
            console.error(error)
        }
    })

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-500">Loading alerts...</div>
            </div>
        )
    }

    const lowStockItems = products || []

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <AlertTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    Low Stock Alerts
                </h3>
                <span className="text-sm text-gray-500">
                    {lowStockItems.length} items
                </span>
            </div>

            {lowStockItems.length === 0 ? (
                <div className="text-center py-8">
                    <PackageIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-500">All stocked up!</p>
                    <p className="text-sm text-gray-400">No low stock items to report</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {lowStockItems.map((product) => (
                        <Link
                            key={product.id}
                            to={`/products?search=${product.sku}`}
                            className="block hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        SKU: {product.sku} | Reorder at: {product.reorder_level}
                                    </p>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-sm font-semibold text-red-600">
                                        {product.stock_quantity} left
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {Math.floor(product.stock_quantity / product.reorder_level * 100)}% stock
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {lowStockItems.length > 0 && (
                <div className="mt-4 text-center">
                    <Link
                        to="/inventory"
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        View all inventory →
                    </Link>
                </div>
            )}
        </div>
    )
}