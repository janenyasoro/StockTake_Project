import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import logo from '../../assets/stocktake-logo.svg'

const links = [
  { to: '/', label: 'Dashboard', roles: ['admin', 'manager', 'staff'] },
  { to: '/products', label: 'Products', roles: ['admin', 'manager', 'staff'] },
  { to: '/sales', label: 'Record sale', roles: ['admin', 'manager', 'staff'] },
  { to: '/inventory', label: 'Stock control', roles: ['admin', 'manager'] },
  { to: '/reports', label: 'Sales analytics', roles: ['admin'] },
  { to: '/admin/users', label: 'Manage users', roles: ['admin'] },
]

export default function Sidebar() {
  const { userProfile } = useAuth()
  const role = userProfile?.role?.toLowerCase() || 'staff'

  return (
    <aside className="bg-slate-900 text-slate-300 lg:flex lg:w-64 lg:shrink-0 lg:flex-col">
      <div className="flex items-center gap-3 px-5 py-4">
        <img src={logo} className="h-8 w-8 shrink-0 rounded-lg" alt="StockTake" />
        <div><p className="font-bold text-white">StockTake</p><p className="text-xs text-slate-400">Inventory, in sync</p></div>
      </div>
      <nav aria-label="Main navigation" className="flex gap-2 overflow-x-auto border-t border-slate-800 px-3 py-3 lg:block lg:border-0 lg:px-4">
        {links.filter(link => link.roles.includes(role)).map(link => (
          <NavLink key={link.to} end={link.to === '/'} to={link.to} className={({ isActive }) => `block shrink-0 rounded-lg px-3 py-2.5 text-sm font-medium transition lg:mb-1 ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <p className="mt-auto hidden px-5 py-5 text-xs text-slate-500 lg:block">Real-time inventory visibility</p>
    </aside>
  )
}
