'use client'

import { useState } from 'react'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default function Sidebar({ isOpen, onClose }) {
  const [packagesOpen, setPackagesOpen] = useState(false)
  const [banksOpen, setBanksOpen] = useState(false)
  const [reportsOpen, setReportsOpen] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-charcoal/40" onClick={onClose} />

      <div className="relative w-64 max-w-[80vw] bg-ivory h-full flex flex-col p-4 border-r border-taupe/30 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="font-serif text-lg text-charcoal">NadunVish</span>
          <button onClick={onClose} aria-label="Close menu" className="text-charcoal">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1 font-sans text-charcoal flex-1">
          <Link href="/dashboard?view=list" onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-taupe/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Admin Panel
          </Link>

          <div className="border-t border-taupe/30 my-2" />

          <button
            onClick={() => setPackagesOpen(!packagesOpen)}
            className="flex items-center gap-2 text-left px-3 py-2 rounded hover:bg-taupe/20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8l-9-5-9 5 9 5 9-5z" />
              <path d="M3 8v8l9 5 9-5V8" />
              <path d="M12 13v8" />
            </svg>
            Packages
          </button>
          {packagesOpen && (
            <div className="flex flex-col pl-8">
              <Link href="/dashboard/packages" onClick={onClose} className="px-3 py-2 rounded hover:bg-taupe/20 text-sm">
                View Packages
              </Link>
              <Link href="/dashboard/packages/create" onClick={onClose} className="px-3 py-2 rounded hover:bg-taupe/20 text-sm">
                Create Package
              </Link>
            </div>
          )}

          <button
            onClick={() => setBanksOpen(!banksOpen)}
            className="flex items-center gap-2 text-left px-3 py-2 rounded hover:bg-taupe/20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" />
              <path d="M5 21V10" />
              <path d="M19 21V10" />
              <path d="M9 21V10" />
              <path d="M15 21V10" />
              <path d="M2 10l10-6 10 6" />
            </svg>
            Bank Details
          </button>
          {banksOpen && (
            <div className="flex flex-col pl-8">
              <Link href="/dashboard/banks" onClick={onClose} className="px-3 py-2 rounded hover:bg-taupe/20 text-sm">
                View Banks
              </Link>
              <Link href="/dashboard/banks/add" onClick={onClose} className="px-3 py-2 rounded hover:bg-taupe/20 text-sm">
                Add Bank
              </Link>
            </div>
          )}

          <Link href="/dashboard/quotation" onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-taupe/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M9 13h6" />
              <path d="M9 17h6" />
            </svg>
            Generate Quotation
          </Link>

          <div className="border-t border-taupe/30 my-2" />

          <button
            onClick={() => setReportsOpen(!reportsOpen)}
            className="flex items-center gap-2 text-left px-3 py-2 rounded hover:bg-taupe/20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="20" x2="12" y2="10" />
              <line x1="18" y1="20" x2="18" y2="4" />
              <line x1="6" y1="20" x2="6" y2="16" />
            </svg>
            Reports
          </button>
          {reportsOpen && (
            <div className="flex flex-col pl-8">
              <Link href="/dashboard/reports/payments" onClick={onClose} className="px-3 py-2 rounded hover:bg-taupe/20 text-sm">
                Payments
              </Link>
              <Link href="/dashboard/reports/events" onClick={onClose} className="px-3 py-2 rounded hover:bg-taupe/20 text-sm">
                Events
              </Link>
            </div>
          )}

          <Link href="/dashboard/change-password" onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-taupe/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Change Password
          </Link>
        </nav>

        <div className="pt-4 pl-3 border-t border-taupe/30">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
