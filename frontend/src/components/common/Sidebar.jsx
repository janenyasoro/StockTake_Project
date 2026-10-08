import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { BarChart3, ClipboardList, LayoutDashboard, Package, ShoppingBag, UsersRound } from 'lucide-react'
import logo from '../../assets/stocktake-logo.svg'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview', roles: ['admin', 'manager', 'staff'] },
  { to: '/products', label: 'Products', icon: Package, section: 'Workspace', roles: ['admin', 'manager', 'staff'] },
  { to: '/inventory', label: 'Stock control', icon: ClipboardList, section: 'Workspace', roles: ['admin', 'manager'] },
  { to: '/sales', label: 'Record a sale', icon: ShoppingBag, section: 'Workspace', roles: ['admin', 'manager', 'staff'] },
  { to: '/reports', label: 'Sales analytics', icon: BarChart3, section: 'Management', roles: ['admin'] },
  { to: '/admin/users', label: 'Manage users', icon: UsersRound, section: 'Management', roles: ['admin'] },
]

export default function Sidebar() {
  const { userProfile } = useAuth()
  const role = userProfile?.role?.toLowerCase() || 'staff'

  return (
    <aside className="bg-slate-900 text-slate-300 lg:flex lg:w-64 lg:shrink-0 lg:flex-col">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <img src={logo} width="24" height="24" className="h-6 w-6 shrink-0 rounded-md" alt="" />
        <div><p className="font-bold text-white">StockTake</p><p className="text-xs text-slate-400">Inventory, in sync</p></div>
      </div>
      <nav aria-label="Main navigation" className="flex gap-2 overflow-x-auto border-t border-slate-800 px-3 py-3 lg:block lg:border-0 lg:px-4">
        {['Overview', 'Workspace', 'Management'].map(section => {
          const sectionLinks = links.filter(link => link.section === section && link.roles.includes(role))
          if (!sectionLinks.length) return null
          return <div key={section} className="flex shrink-0 gap-2 lg:mb-5 lg:block">
            <p className="mb-2 hidden px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 lg:block">{section}</p>
            {sectionLinks.map(link => (
              <NavLink key={link.to} end={link.to === '/'} to={link.to} className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition lg:mb-1 ${isActive ? 'bg-blue-600 text-white shadow-sm shadow-blue-950/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <link.icon className="h-4 w-4" aria-hidden="true" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        })}
      </nav>
      <p className="mt-auto hidden px-5 py-5 text-xs text-slate-500 lg:block">Real-time inventory visibility</p>
    </aside>
  )
}
