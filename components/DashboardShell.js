'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import NotificationBell from '@/components/NotificationBell'
import { createClient } from '@/lib/supabase/client'

const IDLE_TIMEOUT_MS = 15 * 60 * 1000

export default function DashboardShell({ children, notifications }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY

      if (currentScrollY <= 0) {
        setHeaderVisible(true)
      } else if (currentScrollY > lastScrollY.current) {
        setHeaderVisible(false)
      } else {
        setHeaderVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let idleTimer

    function resetIdleTimer() {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
      }, IDLE_TIMEOUT_MS)
    }

    const activityEvents = ['mousedown', 'touchstart', 'keydown', 'scroll']
    activityEvents.forEach((event) => window.addEventListener(event, resetIdleTimer))
    resetIdleTimer()

    return () => {
      clearTimeout(idleTimer)
      activityEvents.forEach((event) => window.removeEventListener(event, resetIdleTimer))
    }
  }, [])

  return (
    <div className="min-h-screen bg-ivory">
      <header
        className={`fixed top-0 left-0 right-0 z-40 flex items-center gap-4 px-6 py-4 border-b border-taupe/30 bg-ivory transition-transform duration-300 ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
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
        <NotificationBell notifications={notifications} />
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="p-8 pt-24">
        {children}
      </main>
    </div>
  )
}
