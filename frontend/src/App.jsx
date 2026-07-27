import React from 'react'
import { BrowserRouter, Navigate, Route, Routes, NavLink } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './pages/Login'
import Products from './pages/Products'

function Dashboard() {
  const { displayName, userRole, logout } = useAuth()
  const role = userRole?.label || 'Loading role…'
  const initials = displayName.slice(0, 2).toUpperCase()
  return <div className="min-h-screen bg-slate-50 lg:flex">
    <aside className="bg-slate-950 text-slate-300 lg:flex lg:w-64 lg:flex-col">
      <div className="flex items-center gap-3 px-6 py-5 text-white"><span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 font-bold">SP</span><span className="text-lg font-semibold">StockPulse</span></div>
      <nav className="flex gap-2 overflow-x-auto border-t border-slate-800 px-3 py-3 lg:block lg:border-0 lg:px-4">
        <NavLink to="/products" className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}><span aria-hidden="true">▦</span>Products</NavLink>
      </nav>
      <div className="hidden border-t border-slate-800 p-4 lg:mt-auto lg:block"><p className="text-xs uppercase tracking-wider text-slate-500">Signed in as</p><p className="mt-1 truncate text-sm text-white">{displayName}</p></div>
    </aside>
    <main className="min-w-0 flex-1">
      <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
        <div><p className="text-xs font-medium uppercase tracking-wider text-slate-500">Inventory management</p><h1 className="text-lg font-semibold text-slate-900">Products overview</h1></div>
        <div className="flex items-center gap-3"><span className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 sm:block">{role}</span><span title={displayName} className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">{initials}</span><button onClick={logout} className="text-sm font-medium text-slate-600 transition hover:text-red-600">Sign out</button></div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8"><Products /></div>
    </main>
  </div>
}

export default function App() {
  return <BrowserRouter><AuthProvider><Toaster position="top-right" /><Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/products" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AuthProvider></BrowserRouter>
}
