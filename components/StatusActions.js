'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CancelForm from '@/components/CancelForm'

export default function StatusActions({ inquiry }) {
  const [loading, setLoading] = useState(false)
  const [activeForm, setActiveForm] = useState(null) // null | 'contact' | 'cancel'
  const [eventTime, setEventTime] = useState('')

  const router = useRouter()
  const supabase = createClient()

  async function updateInquiry(fields) {
    setLoading(true)
    const { error } = await supabase
      .from('inquiries')
      .update(fields)
      .eq('id', inquiry.id)
    setLoading(false)
    if (error) {
      alert('Something went wrong: ' + error.message)
      return
    }
    setActiveForm(null)
    router.refresh()
  }

  async function markContacted(e) {
    e.preventDefault()
    await updateInquiry({ status: 'contacted', event_time: eventTime })
  }

  async function markCompleted() {
    if (!confirm('Mark as completed? This confirms full payment has been received.')) return
    await updateInquiry({
      status: 'completed',
      full_payment_received: true,
      completed_at: new Date().toISOString(),
    })
  }

  if (inquiry.status === 'new') {
    if (activeForm === 'contact') {
      return (
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
            <button
              type="submit"
              disabled={loading}
              className="bg-champagne text-ivory px-6 py-2 rounded font-sans disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={() => setActiveForm(null)}
              className="border border-taupe text-charcoal px-6 py-2 rounded font-sans"
            >
              Back
            </button>
          </div>
        </form>
      )
    }

    return (
      <button
        onClick={() => setActiveForm('contact')}
        className="bg-champagne text-ivory px-6 py-2 rounded font-sans"
      >
        Mark as Contacted
      </button>
    )
  }

  if (inquiry.status === 'confirmed') {
    if (activeForm === 'cancel') {
      return <CancelForm inquiry={inquiry} onBack={() => setActiveForm(null)} />
    }

    return (
      <div className="flex gap-3">
        <button
          onClick={markCompleted}
          disabled={loading}
          className="bg-green-700 text-ivory px-6 py-2 rounded font-sans disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Mark as Completed'}
        </button>
        <button
          onClick={() => setActiveForm('cancel')}
          className="border border-red-600 text-red-600 px-6 py-2 rounded font-sans"
        >
          Cancel Inquiry
        </button>
      </div>
    )
  }

  return (
    <p className="font-sans text-taupe text-sm">
      This inquiry is {inquiry.status} — no further actions available.
    </p>
  )
}
