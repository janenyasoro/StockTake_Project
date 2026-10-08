/**
 * Main App component.
 * Sets up routing, authentication, and global providers.
 */

import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ProductProvider } from './contexts/ProductContext'
import { firebaseSetupIssue } from './services/firebase'

// Load screens on demand so the initial app bundle stays small.
const Login = lazy(() => import('./pages/Login'))
const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const Inventory = lazy(() => import('./pages/Inventory'))
const Reports = lazy(() => import('./pages/Reports'))
const Sales = lazy(() => import('./pages/Sales'))
const Users = lazy(() => import('./pages/Admin/Users'))

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
  if (firebaseSetupIssue) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">ST</div>
          <p className="text-sm font-bold uppercase tracking-wider text-blue-700">StockTake setup</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Sign-in is not configured yet</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{firebaseSetupIssue}</p>
          <p className="mt-4 text-sm leading-6 text-slate-600">In Vercel, add the Firebase Web App environment values under Project Settings → Environment Variables, then redeploy. The values must be available to the deployment environment you are viewing.</p>
        </section>
      </main>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProductProvider>
          <BrowserRouter>
            <Toaster position="top-right" />
            <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Loading page…</div>}>
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
                  <Route path="sales" element={<Sales />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="admin/users" element={<ProtectedRoute requiredRole="admin"><Users /></ProtectedRoute>} />
                </Route>

                {/* Catch-all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ProductProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
