/**
 * Protected Route Component
 * Wraps routes that require authentication.
 * Redirects to login if user is not authenticated.
 */

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Render children if authenticated
    return children
}