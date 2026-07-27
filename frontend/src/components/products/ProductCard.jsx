// src/components/products/ProductCard.jsx
import React, { useState } from 'react'
import { Edit2, Trash2, Package, AlertCircle } from 'lucide-react'

export default function ProductCard({ product, onEdit, onDelete, onUpdateStock }) {
    const [isHovered, setIsHovered] = useState(false)

    const handleEditClick = (e) => {
        e.stopPropagation() // Prevent card click
        if (onEdit) onEdit(product)
    }

    const handleDeleteClick = (e) => {
        e.stopPropagation() // Prevent card click
        if (onDelete) onDelete(product.id)
    }

    const handleStockClick = (e) => {
        e.stopPropagation() // Prevent card click
        if (onUpdateStock) onUpdateStock(product)
    }

    return (
        <div
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                            {product.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">SKU: {product.sku}</p>
                    </div>
                    <div className={`flex items-center space-x-1 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <button
                            onClick={handleEditClick}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit product"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete product"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Stock Status */}
                <div className="mt-3 flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock_quantity <= product.reorder_level
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                        {product.stock_quantity} units
                    </div>
                    {product.stock_quantity <= product.reorder_level && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                </div>

                {/* Price and Action Button */}
                <div className="mt-3 flex items-center justify-between">
                    <div>
                        <p className="text-lg font-bold text-gray-900">
                            ${product.price}
                        </p>
                        <p className="text-xs text-gray-400">Cost: ${product.cost}</p>
                    </div>
                    <button
                        onClick={handleStockClick}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        Update Stock
                    </button>
                </div>
            </div>
        </div>
    )
}