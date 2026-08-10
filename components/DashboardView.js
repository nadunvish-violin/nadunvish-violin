'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import StatusPill from '@/components/StatusPill'
import Calendar from '@/components/Calendar'

const STATUS_FILTERS = ['all', 'new', 'contacted', 'confirmed', 'completed', 'cancelled']

const STATUS_COLORS = {
  new: '#fcc055',
  contacted: '#9683ec',
  confirmed: '#23aa8f',
  completed: '#023047',
  cancelled: '#dc2626',
}

export default function DashboardView({ inquiries }) {
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [view, setView] = useState(searchParams.get('view') || 'list')

  const filtered = inquiries.filter((inquiry) => {
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter

    const query = search.toLowerCase()
    const matchesSearch =
      query === '' ||
      `${inquiry.first_name} ${inquiry.last_name}`.toLowerCase().includes(query) ||
      inquiry.email?.toLowerCase().includes(query) ||
      inquiry.phone?.toLowerCase().includes(query) ||
      inquiry.venue?.toLowerCase().includes(query)

    return matchesStatus && matchesSearch
  })

  return (
    <div>
      <h2 className="font-serif text-xl text-charcoal mb-3">Inquiries</h2>

      <div className="sticky top-24 z-30 bg-ivory pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setView('list')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded font-sans text-sm ${
                view === 'list' ? 'bg-champagne text-ivory' : 'border border-taupe text-charcoal'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded font-sans text-sm ${
                view === 'calendar' ? 'bg-champagne text-ivory' : 'border border-taupe text-charcoal'
              }`}
            >
              Calendar View
            </button>
          </div>

          <Link
            href="/dashboard/new"
            className="bg-inquiry-cta text-ivory px-4 py-2 rounded font-sans text-sm text-center"
          >
            + Add Inquiry
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-6 mt-3">
        <input
          type="text"
          placeholder="Search by name, email, phone, or venue..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-taupe rounded px-4 py-2 font-sans text-charcoal"
        />

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-sans capitalize ${
                statusFilter === status
                  ? 'bg-charcoal text-ivory'
                  : 'bg-taupe/20 text-charcoal'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {view === 'list' && (
        <div className="flex flex-col gap-3">
          {filtered.map((inquiry) => (
            <Link
              key={inquiry.id}
              href={`/dashboard/${inquiry.id}?returnView=list`}
              className="flex items-stretch gap-3 border border-taupe/50 rounded-lg bg-white/40 hover:bg-white/70 transition shadow-sm"
            >
              <div className="w-1.5 rounded-l-lg" style={{ backgroundColor: STATUS_COLORS[inquiry.status] }} />
              <div className="flex-1 flex items-center justify-between p-4">
                <div>
                  <p className="font-serif text-lg text-charcoal">
                    {inquiry.first_name} {inquiry.last_name}
                  </p>
                  <p className="font-sans text-sm text-taupe">
                    {inquiry.event_type} · {inquiry.event_date}
                  </p>
                </div>
                <StatusPill status={inquiry.status} />
              </div>
            </Link>
          ))}

          {filtered.length === 0 && (
            <p className="font-sans text-taupe">No inquiries match your search/filter.</p>
          )}
        </div>
      )}

      {view === 'calendar' && <Calendar inquiries={filtered} />}
    </div>
  )
}
