import React from 'react'

const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    red: 'bg-rose-50 text-rose-700 border-rose-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    yellow: 'bg-amber-50 text-amber-700 border-amber-100',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-100'
}

export default function StatsCard({ title, value, subtitle, icon, color = 'blue', warning = false }) {
    return (
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="truncate text-sm font-medium text-slate-500">{title}</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-3xl">{value}</p>
                    {subtitle && (
                        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.blue}`}>
                    {icon}
                </div>
            </div>
            {warning && (
                <div className="mt-3 inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                    Needs attention
                </div>
            )}
        </div>
    )
}
