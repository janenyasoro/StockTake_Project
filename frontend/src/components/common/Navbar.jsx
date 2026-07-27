// src/components/common/Navbar.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  Package,
  LogOut,
  User,
  Menu,
  X,
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  BarChart3,
  Settings
} from 'lucide-react'

export default function Navbar() {
  const { user, userProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getRoleBadge = () => {
    if (!userProfile) return null
    const roleMap = {
      'admin': { label: 'Admin', color: 'bg-purple-100 text-purple-800 border-purple-300' },
      'manager': { label: 'Manager', color: 'bg-blue-100 text-blue-800 border-blue-300' },
      'staff': { label: 'Staff', color: 'bg-gray-100 text-gray-800 border-gray-300' }
    }
    const role = roleMap[userProfile.role] || roleMap.staff
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${role.color}`}>
        {role.label}
      </span>
    )
  }

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/products', label: 'Products', icon: ShoppingBag },
    { path: '/inventory', label: 'Inventory', icon: ClipboardList },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
  ]

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Section - Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition">
              <Package className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">StockPulse</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Section - User Info */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.displayName || user?.email || 'User'}
                  </p>
                  {getRoleBadge()}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
              <div className="px-3 py-2 flex items-center space-x-2 border-t border-gray-200 pt-4">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {user?.displayName || user?.email}
                </span>
                {getRoleBadge()}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}