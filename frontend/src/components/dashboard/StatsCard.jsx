import React from 'react'

const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
}

export default function StatsCard({ title, value, subtitle, icon, color = 'blue', warning = false }) {
    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.blue}`}>
                    {icon}
                </div>
            </div>
            {warning && (
                <div className="mt-3 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full inline-block">
                    ⚠️ Needs attention
                </div>
            )}
        </div>
    )
}