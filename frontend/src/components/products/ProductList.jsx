// src/components/products/ProductList.jsx
import React from 'react'
import ProductCard from './ProductCard'
import { Package } from 'lucide-react'

export default function ProductList({ products, onEdit, onDelete, onUpdateStock, onAdd }) {

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No products found</p>
                {onAdd && <button onClick={onAdd} className="mt-3 font-medium text-blue-700 hover:text-blue-800">Add your first product →</button>}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
                <div key={product.id}>
                    <ProductCard
                        product={product}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onUpdateStock={onUpdateStock}
                    />
                </div>
            ))}
        </div>
    )
}
