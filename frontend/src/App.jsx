/**
 * Main App component.
 * Sets up routing, authentication, and global providers.
 */

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ProductProvider } from './contexts/ProductContext'

// Pages
import Login from './pages/Login'
import Home from './pages/Home'
import Products from './pages/Products'
import Inventory from './pages/Inventory'
import Reports from './pages/Reports'

// Components
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/common/Layout'

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProductProvider>
          <BrowserRouter>
            <Toaster position="top-right" />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="reports" element={<Reports />} />
              </Route>

              {/* Catch-all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ProductProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App