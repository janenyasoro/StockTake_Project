import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogOut, UserRound } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const pageNames = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/inventory': 'Stock control',
  '/sales': 'Record sale',
  '/reports': 'Sales analytics',
  '/admin/users': 'Manage users',
}

export default function Navbar() {
  const { user, userProfile, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const title = pageNames[pathname] || 'StockTake'
  const role = userProfile?.role_display || userProfile?.role || 'Team member'

  const handleLogout = async () => {
    if (await logout()) navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-5 sm:px-8">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
          <p className="hidden text-xs text-slate-500 sm:block">StockTake workspace</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2.5 sm:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700"><UserRound className="h-4 w-4" /></span>
            <div className="max-w-48">
              <p className="truncate text-sm font-semibold text-slate-800">{user?.displayName || user?.email || 'Team member'}</p>
              <p className="truncate text-xs capitalize text-slate-500">{role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700" aria-label="Sign out">
            <LogOut className="h-4 w-4" /><span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
