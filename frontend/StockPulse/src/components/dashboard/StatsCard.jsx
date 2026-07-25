/**
 * Stat Card Component
 * Displays a single metric with icon and optional subtitle.
 */

import React from 'react'

export default function StatsCard({ title, value, subtitle, icon, color, warning }) {
    // Color mapping for different card styles
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        red: 'bg-red-100 text-red-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${colors[color] || colors.blue}`}>
                    {icon}
                </div>
                <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500 truncate">
                        {title}
                    </p>
                    <div className="flex items-baseline">
                        <p className="text-2xl font-semibold text-gray-900">
                            {value}
                        </p>
                        {warning && (
                            <span className="ml-2 text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                Needs Attention
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    )}
                </div>
            </div>
        </div>
    )
}