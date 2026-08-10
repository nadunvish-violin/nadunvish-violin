'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function StatusActions({ inquiry }) {
  const [loading, setLoading] = useState(false)
  const [activeForm, setActiveForm] = useState(null)
  const [eventTime, setEventTime] = useState('')

  const router = useRouter()
  const supabase = createClient()

  async function markContacted(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('inquiries')
      .update({ status: 'contacted', event_time: eventTime })
      .eq('id', inquiry.id)
    setLoading(false)
    if (error) {
      alert('Something went wrong: ' + error.message)
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
    router.refresh()
  }

  if (inquiry.status === 'new') {
    return (
      <div>
        <div className="rounded-lg p-3 mb-4" style={{ background: 'linear-gradient(135deg, rgba(252,192,85,0.25), transparent)' }}>
          <p className="font-sans text-xs text-charcoal uppercase tracking-wide">Currently: New</p>
        </div>

        {activeForm === 'contact' ? (
          <form onSubmit={markContacted} className="flex flex-col gap-3 max-w-sm">
            <label className="font-sans text-sm text-charcoal">
              Event time
              <input
                type="time"
                required
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
              />
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="bg-champagne text-ivory px-6 py-2 rounded font-sans disabled:opacity-50">
                {loading ? 'Saving...' : 'Confirm'}
              </button>
              <button type="button" onClick={() => setActiveForm(null)} className="border border-taupe text-charcoal px-6 py-2 rounded font-sans">
                Back
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setActiveForm('contact')} className="bg-champagne text-ivory px-6 py-2 rounded font-sans">
            Mark as Contacted
          </button>
        )}
      </div>
    )
  }

  return (
    <p className="font-sans text-taupe text-sm">
      This inquiry is {inquiry.status} — no further actions available.
    </p>
  )
}
