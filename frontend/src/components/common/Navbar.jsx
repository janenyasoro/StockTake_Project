import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar() {
  const { displayName, userRole, logout } = useAuth()
  const initials = displayName.slice(0, 2).toUpperCase()
  return <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
    <div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">StockPulse workspace</p><h1 className="text-lg font-bold text-slate-900">Real-time inventory</h1></div>
    <div className="flex items-center gap-3"><span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:block">{userRole?.label || 'Loading role…'}</span><span className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">{initials}</span><button onClick={logout} className="text-sm font-semibold text-slate-600 hover:text-blue-600">Sign out</button></div>
  </header>
}
