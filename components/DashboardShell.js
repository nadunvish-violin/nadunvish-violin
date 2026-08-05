'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'

export default function DashboardShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-ivory">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-taupe/30">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="text-charcoal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="font-serif text-xl text-charcoal">NadunVish</span>
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="p-8">
        {children}
      </main>
    </div>
  )
}
