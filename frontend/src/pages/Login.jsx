// src/pages/Login.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import logo from '../assets/stocktake-logo.svg'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, register, loginWithGoogle, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/')
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isRegistering && !displayName.trim()) {
      toast.error('Please enter your name.')
      return
    }
    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }
    setLoading(true)
    try {
      if (isRegistering) {
        if (password.length < 6) {
          toast.error('Choose a password with at least 6 characters.')
          return
        }
        await register(displayName, email, password)
      } else {
        await login(email, password)
      }
      navigate('/')

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:p-0">
      {/* Background Effects */}
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-blue-600/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Left Panel - Branding */}
      <section className="relative hidden flex-col justify-between p-12 lg:flex xl:p-16 2xl:p-20">
        <div className="flex items-center gap-3">
          <img src={logo} alt="StockTake" width="28" height="28" className="h-7 w-7" />
          <div>
            <p className="text-lg font-bold text-white">StockTake</p>
            <p className="text-sm text-slate-400">Inventory, in sync</p>
          </div>
        </div>

        <div className="max-w-lg">
          <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
            Real-time operations
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white xl:text-[2.75rem]">
            Know what is in stock. <span className="text-blue-400">Stay ready for what is next.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
            Keep products, sales, and low-stock alerts together in one clear workspace for your team.
          </p>
        </div>

        <div className="grid max-w-lg grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
            <p className="text-xl font-bold text-white">Live</p>
            <p className="mt-1 text-slate-400">Stock view</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
            <p className="text-xl font-bold text-white">Smart</p>
            <p className="mt-1 text-slate-400">Reordering</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
            <p className="text-xl font-bold text-white">Clear</p>
            <p className="mt-1 text-slate-400">Sales data</p>
          </div>
        </div>
      </section>

      {/* Right Panel - Login Form */}
      <section className="relative flex items-center justify-center lg:bg-slate-50 lg:px-8 lg:py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-950/10 sm:p-8 lg:rounded-3xl lg:p-9">
          <div className="mb-7">
            <div className="flex items-center gap-2.5 lg:hidden">
              <img src={logo} width="24" height="24" className="h-6 w-6" alt="StockTake" />
              <span className="font-bold text-slate-900">StockTake</span>
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">{isRegistering ? 'Get started' : 'Welcome back'}</p>
            <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-[1.7rem]">{isRegistering ? 'Create your account' : 'Sign in to your workspace'}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{isRegistering ? 'Create a staff account to get started. An admin can update your role later.' : 'Use your team account to manage inventory and sales.'}</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {isRegistering && <label className="block text-sm font-semibold text-slate-700">
                Your name
                <input
                  type="text"
                  autoComplete="name"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border-slate-300 px-3.5 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Your name"
                  disabled={loading}
                />
              </label>}
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
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  minLength={isRegistering ? 6 : undefined}
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
              className="flex w-full justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-900/15 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (isRegistering ? 'Creating account…' : 'Signing in…') : (isRegistering ? 'Create account' : 'Sign in')}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            {isRegistering ? 'Already have an account?' : 'New to StockTake?'}{' '}
            <button type="button" disabled={loading} onClick={() => setIsRegistering(value => !value)} className="font-bold text-blue-700 transition hover:text-blue-800 disabled:opacity-50">
              {isRegistering ? 'Sign in' : 'Create an account'}
            </button>
          </p>

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

          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Your flow after sign-in</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600">
              <span>Sign in</span><span className="text-blue-500">›</span><span>Dashboard</span><span className="text-blue-500">›</span><span>Products</span><span className="text-blue-500">›</span><span>Sales</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
