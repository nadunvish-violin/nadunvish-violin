'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function NotificationBell({ notifications }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const totalCount =
    notifications.newInquiries.length +
    notifications.upcomingEvents.length +
    notifications.stalledQuotations.length

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative ml-auto" ref={containerRef}>
      <button onClick={() => setOpen(!open)} aria-label="Notifications" className="relative text-charcoal">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-ivory text-xs w-4 h-4 rounded-full flex items-center justify-center">
            {totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 max-w-[85vw] bg-ivory border border-taupe/50 rounded-lg shadow-lg p-4 flex flex-col gap-4 z-50">
          {totalCount === 0 && (
            <p className="font-sans text-taupe text-sm">Nothing needs attention right now.</p>
          )}

          {notifications.newInquiries.length > 0 && (
            <div>
              <p className="font-sans text-xs text-taupe uppercase mb-1">New inquiries</p>
              <div className="flex flex-col gap-1">
                {notifications.newInquiries.map((inq) => (
                  <Link key={inq.id} href={`/dashboard/${inq.id}`} onClick={() => setOpen(false)} className="font-sans text-sm text-charcoal hover:text-champagne">
                    {inq.first_name} {inq.last_name}
                    <span className="block text-xs text-taupe">
                      {inq.event_type || 'Event type not set'} · {inq.event_date || 'Date not set'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {notifications.upcomingEvents.length > 0 && (
            <div>
              <p className="font-sans text-xs text-taupe uppercase mb-1">Events this week</p>
              <div className="flex flex-col gap-1">
                {notifications.upcomingEvents.map((inq) => (
                  <Link key={inq.id} href={`/dashboard/${inq.id}`} onClick={() => setOpen(false)} className="font-sans text-sm text-charcoal hover:text-champagne">
                    {inq.first_name} {inq.last_name} · {inq.event_date}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {notifications.stalledQuotations.length > 0 && (
            <div>
              <p className="font-sans text-xs text-taupe uppercase mb-1">Stalled quotations</p>
              <div className="flex flex-col gap-1">
                {notifications.stalledQuotations.map((inq) => (
                  <Link key={inq.id} href={`/dashboard/${inq.id}`} onClick={() => setOpen(false)} className="font-sans text-sm text-charcoal hover:text-champagne">
                    {inq.first_name} {inq.last_name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
