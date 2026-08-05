'use client'

import { useState } from 'react'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default function Sidebar({ isOpen, onClose }) {
  const [packagesOpen, setPackagesOpen] = useState(false)
  const [banksOpen, setBanksOpen] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-charcoal/40" onClick={onClose} />

      <div className="relative w-64 max-w-[80vw] bg-ivory h-full flex flex-col p-4 border-r border-taupe/30 overflow-y-auto">
        <button onClick={onClose} aria-label="Close menu" className="self-end text-charcoal mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>

        <nav className="flex flex-col gap-1 font-sans text-charcoal flex-1">
          <button
            onClick={() => setPackagesOpen(!packagesOpen)}
            className="text-left px-3 py-2 rounded hover:bg-taupe/20"
          >
            Packages
          </button>
          {packagesOpen && (
            <div className="flex flex-col pl-4">
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
            className="text-left px-3 py-2 rounded hover:bg-taupe/20"
          >
            Bank Details
          </button>
          {banksOpen && (
            <div className="flex flex-col pl-4">
              <Link href="/dashboard/banks" onClick={onClose} className="px-3 py-2 rounded hover:bg-taupe/20 text-sm">
                View Banks
              </Link>
              <Link href="/dashboard/banks/add" onClick={onClose} className="px-3 py-2 rounded hover:bg-taupe/20 text-sm">
                Add Bank
              </Link>
            </div>
          )}

          <Link href="/dashboard/quotation" onClick={onClose} className="px-3 py-2 rounded hover:bg-taupe/20">
            Generate Quotation
          </Link>
          <Link href="/dashboard/reports" onClick={onClose} className="px-3 py-2 rounded hover:bg-taupe/20">
            Payment Reports
          </Link>
          <Link href="/dashboard/change-password" onClick={onClose} className="px-3 py-2 rounded hover:bg-taupe/20">
            Change Password
          </Link>
        </nav>

        <div className="pt-4 border-t border-taupe/30">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
