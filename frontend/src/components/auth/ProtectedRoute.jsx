// src/components/auth/ProtectedRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check role-based access
  if (requiredRole) {
    const roleHierarchy = {
      'admin': ['admin'],
      'manager': ['admin', 'manager'],
      'staff': ['admin', 'manager', 'staff']
    }

    const allowedRoles = roleHierarchy[requiredRole] || []
    const userRole = userProfile?.role || 'staff'

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />
    }
  }

  return children
}