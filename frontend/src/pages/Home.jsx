import React from 'react'
export default function Home() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1><p className="text-gray-500">Welcome to StockPulse!</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6"><div className="text-sm text-gray-500">Total Products</div><div className="text-2xl font-semibold">0</div></div>
        <div className="bg-white rounded-lg shadow p-6"><div className="text-sm text-gray-500">Low Stock</div><div className="text-2xl font-semibold text-red-600">0</div></div>
        <div className="bg-white rounded-lg shadow p-6"><div className="text-sm text-gray-500">Today's Sales</div><div className="text-2xl font-semibold text-green-600">$0</div></div>
        <div className="bg-white rounded-lg shadow p-6"><div className="text-sm text-gray-500">Inventory Value</div><div className="text-2xl font-semibold text-purple-600">$0</div></div>
      </div>
    </div>
  )
}
