'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function StatusActions({ inquiry }) {
  const [loading, setLoading] = useState(false)
  const [activeForm, setActiveForm] = useState(null) // null | 'confirm' | 'cancel'
  const [advanceAmount, setAdvanceAmount] = useState('')
  const [advanceDate, setAdvanceDate] = useState('')
  const [cancellationReason, setCancellationReason] = useState('')

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

  async function markContacted() {
    await updateInquiry({ status: 'contacted' })
  }

  async function markConfirmed(e) {
    e.preventDefault()
    await updateInquiry({
      status: 'confirmed',
      advance_payment_amount: Number(advanceAmount),
      advance_payment_date: advanceDate,
    })
  }

  async function markCompleted() {
    if (!confirm('Mark as completed? This confirms full payment has been received.')) return
    await updateInquiry({
      status: 'completed',
      full_payment_received: true,
      completed_at: new Date().toISOString(),
    })
  }

  async function markCancelled(e) {
    e.preventDefault()
    await updateInquiry({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: cancellationReason,
    })
  }

  const cancelForm = (
    <form onSubmit={markCancelled} className="flex flex-col gap-3 max-w-sm">
      <label className="font-sans text-sm text-charcoal">
        Reason for cancellation
        <textarea
          required
          rows={3}
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
        />
      </label>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 text-ivory px-6 py-2 rounded font-sans disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Confirm Cancellation'}
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

  if (inquiry.status === 'new') {
    return (
      <button
        onClick={markContacted}
        disabled={loading}
        className="bg-champagne text-ivory px-6 py-2 rounded font-sans disabled:opacity-50"
      >
        {loading ? 'Updating...' : 'Mark as Contacted'}
      </button>
    )
  }

  if (inquiry.status === 'contacted') {
    if (activeForm === 'cancel') return cancelForm

    if (activeForm === 'confirm') {
      return (
        <form onSubmit={markConfirmed} className="flex flex-col gap-3 max-w-sm">
          <label className="font-sans text-sm text-charcoal">
            Advance payment amount (LKR)
            <input
              type="number"
              step="0.01"
              required
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(e.target.value)}
              className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
            />
          </label>
          <label className="font-sans text-sm text-charcoal">
            Advance payment date
            <input
              type="date"
              required
              value={advanceDate}
              onChange={(e) => setAdvanceDate(e.target.value)}
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
      <div className="flex gap-3">
        <button
          onClick={() => setActiveForm('confirm')}
          className="bg-champagne text-ivory px-6 py-2 rounded font-sans"
        >
          Confirm Booking
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

  if (inquiry.status === 'confirmed') {
    if (activeForm === 'cancel') return cancelForm

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