import React, { useEffect, useState } from 'react'
import { salesAPI } from '../services/api'

export default function Reports() {
  const [summary, setSummary] = useState(null)
  useEffect(() => { salesAPI.getSummary().then(r => setSummary(r.data)).catch(() => setSummary(null)) }, [])
  const cards = [['Today’s revenue', summary?.today.total], ['Sales today', summary?.today.count], ['This week', summary?.this_week.total], ['Weekly orders', summary?.this_week.count]]
  return <section><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Admin / owner</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Sales analytics</h2><p className="mt-1 text-sm text-slate-500">A quick view of what is selling and recent revenue performance.</p><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value === undefined ? '–' : typeof value === 'number' ? value.toFixed(2) : value}</p></div>)}</div><section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="font-bold text-slate-900">30-day sales trend</h3><div className="mt-5 flex h-32 items-end gap-1">{(summary?.monthly_trend || []).map((day, index) => <div key={index} title={`${day.sale_date__date}: ${day.daily_total}`} className="min-w-2 flex-1 rounded-t bg-blue-500" style={{ height: `${Math.max(8, Math.min(100, Number(day.daily_total) || 0))}%` }} />)}{!summary?.monthly_trend?.length && <p className="m-auto text-sm text-slate-500">Sales data will appear here as invoices are recorded.</p>}</div></section></section>
}
