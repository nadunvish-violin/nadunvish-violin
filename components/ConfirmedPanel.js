'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import CancelForm from '@/components/CancelForm'

export default function ConfirmedPanel({ inquiry }) {
  const router = useRouter()
  const supabase = createClient()

  const [fullPaymentDate, setFullPaymentDate] = useState(inquiry.full_payment_date || '')
  const [saving, setSaving] = useState(false)
  const [showCancel, setShowCancel] = useState(false)

  const duePayment = Number(inquiry.total_price || 0) - Number(inquiry.discount || 0) - Number(inquiry.advance_payment_amount || 0)
  const paidInFull = Number(inquiry.advance_payment_amount || 0) >= (Number(inquiry.total_price || 0) - Number(inquiry.discount || 0))

  const today = new Date().toISOString().split('T')[0]
  const canComplete = !!inquiry.full_payment_date && inquiry.event_date <= today

  async function saveFullPaymentDate() {
    setSaving(true)
    const { error } = await supabase
      .from('inquiries')
      .update({ full_payment_date: fullPaymentDate || null })
      .eq('id', inquiry.id)
    setSaving(false)
    if (error) {
      alert('Something went wrong: ' + error.message)
      return
    }
    router.refresh()
  }

  async function markCompleted() {
    if (!confirm('Mark as completed? This confirms the event has taken place and full payment has been received.')) return
    const { error } = await supabase
      .from('inquiries')
      .update({
        status: 'completed',
        full_payment_received: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', inquiry.id)
    if (error) {
      alert('Something went wrong: ' + error.message)
      return
    }
    router.refresh()
  }

  if (showCancel) {
    return <CancelForm inquiry={inquiry} onBack={() => setShowCancel(false)} />
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <div className="border border-taupe/50 rounded-lg p-4 bg-white/40">
        <p className="font-sans text-sm text-taupe">Due payment</p>
        <p className="font-serif text-2xl text-charcoal">LKR {duePayment.toLocaleString()}</p>
      </div>

      {paidInFull && (
        <p className="font-sans text-sm text-champagne">Paid in full at booking.</p>
      )}

      <p className="font-sans text-sm text-charcoal">
        Invoice generated: {inquiry.invoice_generated ? 'Yes' : 'Not yet'}
      </p>

      <label className="font-sans text-sm text-charcoal">
        Full payment date
        <input
          type="date"
          max={today}
          value={fullPaymentDate}
          onChange={(e) => setFullPaymentDate(e.target.value)}
          className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
        />
      </label>
      <button
        onClick={saveFullPaymentDate}
        disabled={saving}
        className="border border-champagne text-champagne px-6 py-2 rounded font-sans disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>

      <div className="border-t border-taupe/50 pt-4 flex flex-col gap-3">
        <Link
          href={`/dashboard/${inquiry.id}/invoice`}
          className="bg-champagne text-ivory px-6 py-2 rounded font-sans text-center"
        >
          Generate Invoice
        </Link>

        <button
          onClick={markCompleted}
          disabled={!canComplete}
          className="bg-green-700 text-ivory px-6 py-2 rounded font-sans disabled:opacity-50"
        >
          Mark as Completed
        </button>
        {!canComplete && (
          <p className="font-sans text-taupe text-xs">
            Requires a full payment date to be saved, and the event date to have passed.
          </p>
        )}

        <button
          onClick={() => setShowCancel(true)}
          className="border border-red-600 text-red-600 px-6 py-2 rounded font-sans"
        >
          Cancel Inquiry
        </button>
      </div>
    </div>
  )
}
