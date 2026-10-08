/**
 * Low Stock Alert Component
 * Shows products that need reordering.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { productAPI } from '../../services/api'
import { AlertTriangleIcon, PackageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function LowStockAlert() {
    const { isManager } = useAuth()
    // Fetch low stock products
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['lowStockProducts'],
        queryFn: async () => {
            const response = await productAPI.getLowStock()
            return response.data
        },
    })

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm text-slate-500">Loading stock alerts…</div>
            </div>
        )
    }

    if (isError) {
        return <div role="alert" className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700"><span>Stock alerts could not be loaded.</span><button onClick={() => refetch()} className="shrink-0 font-bold text-rose-800">Try again</button></div>
    }

    const lowStockItems = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center text-lg font-bold text-slate-900">
                    <AlertTriangleIcon className="mr-2 h-5 w-5 text-amber-500" />
                    Low stock
                </h3>
                <span className="text-sm text-slate-500">
                    {lowStockItems.length} items
                </span>
            </div>

            {lowStockItems.length === 0 ? (
                <div className="py-8 text-center">
                    <PackageIcon className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
                    <p className="font-semibold text-slate-700">All stocked up</p>
                    <p className="mt-1 text-sm text-slate-500">No items need replenishing right now.</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {lowStockItems.map((product) => (
                        <Link
                            key={product.id}
                            to={`/products?search=${encodeURIComponent(product.sku)}`}
                            className="block rounded-xl transition-colors hover:bg-slate-50"
                        >
                            <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/70 p-3">
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        SKU: {product.sku} | Reorder at: {product.reorder_level}
                                    </p>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-sm font-semibold text-rose-700">
                                        {product.stock_quantity} left
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {product.reorder_level > 0 ? `${Math.floor(product.stock_quantity / product.reorder_level * 100)}% of reorder level` : 'Reorder level not set'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {isManager && lowStockItems.length > 0 && (
                <div className="mt-4 text-center">
                    <Link
                        to="/inventory"
                        className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                    >
                        View all inventory →
                    </Link>
                </div>
            )}
        </div>
    )
}
