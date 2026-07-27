import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Navbar />
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8"><Outlet /></div>
      </main>
    </div>
  )
}
