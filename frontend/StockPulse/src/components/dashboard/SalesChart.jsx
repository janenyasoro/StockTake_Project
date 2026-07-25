/**
 * Sales Chart Component
 * Displays sales data in a line chart.
 */

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

export default function SalesChart({ salesData }) {
    // Format data for the chart
    const data = salesData?.map(item => ({
        date: format(new Date(item.sale_date__date), 'MMM dd'),
        sales: item.daily_total,
        count: item.daily_count,
    })) || []

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-600">
                        Sales: ${payload[0].value.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                        Orders: {payload[0].payload.count}
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="sales"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}