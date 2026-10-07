// src/pages/Login.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import logo from '../assets/stocktake-logo.svg'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [loginData, setLoginData] = useState(null)
  const { login, loginWithGoogle, user, userProfile, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/')
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }
    setLoading(true)
    try {
      await login(email, password)

      // Show role information after login
      setLoginData({
        email: email,
        role: userProfile?.role || 'staff',
        roleDisplay: userProfile?.role_display || 'Sales Staff',
        isAdmin: userProfile?.role === 'admin',
        isManager: userProfile?.role === 'manager'
      })
      setShowSuccess(true)

      setTimeout(() => {
        navigate('/')
      }, 2000)

    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate('/')
    } catch (error) {
      console.error('Google login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Success screen with role info
  if (showSuccess && loginData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back!</h2>
          <p className="text-slate-600 mb-2">Signed in as <strong>{loginData.email}</strong></p>

          {/* Role Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full border mb-4">
            <span className={`w-2 h-2 rounded-full mr-2 ${loginData.isAdmin ? 'bg-purple-500' :
                loginData.isManager ? 'bg-blue-500' : 'bg-gray-500'
              }`}></span>
            <span className="font-medium text-slate-900">
              {loginData.roleDisplay}
            </span>
          </div>

          <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Your Permissions:</p>
            <ul className="mt-2 space-y-1 text-left">
              {loginData.isAdmin && (
                <>
                  <li>✅ Full access to all features</li>
                  <li>✅ Manage users and roles</li>
                  <li>✅ View all analytics</li>
                </>
              )}
              {loginData.isManager && (
                <>
                  <li>✅ Manage products and inventory</li>
                  <li>✅ Create purchase orders</li>
                  <li>✅ View sales reports</li>
                </>
              )}
              {!loginData.isAdmin && !loginData.isManager && (
                <>
                  <li>✅ View products and stock</li>
                  <li>✅ Record sales</li>
                  <li>✅ Check inventory</li>
                </>
              )}
            </ul>
          </div>

          <p className="text-sm text-slate-400 mt-4">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 lg:grid lg:grid-cols-2 lg:p-0">
      {/* Background Effects */}
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />

      {/* Left Panel - Branding */}
      <section className="relative hidden flex-col justify-between p-12 lg:flex xl:p-16">
        <div className="flex items-center gap-3">
          <img src={logo} alt="StockTake" className="h-11 w-11" />
          <div>
            <p className="text-lg font-bold text-white">StockTake</p>
            <p className="text-sm text-slate-400">Inventory, in sync</p>
          </div>
        </div>

        <div className="max-w-xl">
          <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
            Real-time operations
          </span>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-white">
            See every stock movement. <span className="text-blue-400">Act before it costs you.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Bring products, sales, suppliers, and low-stock alerts into one calm workspace built for growing teams.
          </p>
        </div>

        <div className="grid max-w-xl grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-2xl font-bold text-white">Live</p>
            <p className="mt-1 text-slate-400">Stock view</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-2xl font-bold text-white">Smart</p>
            <p className="mt-1 text-slate-400">Reordering</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-2xl font-bold text-white">Clear</p>
            <p className="mt-1 text-slate-400">Sales data</p>
          </div>
        </div>
      </section>

      {/* Right Panel - Login Form */}
      <section className="relative flex items-center justify-center lg:bg-white lg:px-8">
        <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl shadow-black/30 sm:p-9 lg:shadow-none">
          <div className="mb-8">
            <div className="flex items-center gap-3 lg:hidden">
              <img src={logo} className="h-10 w-10" alt="StockTake" />
              <span className="font-bold text-slate-900">StockTake</span>
            </div>
            <p className="mt-6 text-sm font-bold uppercase tracking-wider text-blue-600">Welcome back</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Sign in to your workspace</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Use your team account to manage inventory and sales.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Email address
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border-slate-300 px-3.5 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Password
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border-slate-300 px-3.5 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-slate-400">or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <p className="mt-4 text-xs text-center text-slate-400">
            By signing in, you agree to our Terms of Service
          </p>
        </div>
      </section>
    </div>
  )
}