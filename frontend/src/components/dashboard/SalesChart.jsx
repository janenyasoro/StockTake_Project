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
        sales: Number(item.daily_total) || 0,
        count: Number(item.daily_count) || 0,
    })) || []

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                    <p className="font-semibold text-slate-900">{label}</p>
                    <p className="text-sm text-slate-600">
                        Sales: ${Number(payload[0].value).toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-600">
                        Orders: {payload[0].payload.count}
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Sales trend</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="sales"
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
