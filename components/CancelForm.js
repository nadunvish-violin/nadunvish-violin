'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CancelForm({ inquiry, onBack }) {
  const router = useRouter()
  const supabase = createClient()

  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('inquiries')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
      })
      .eq('id', inquiry.id)

    setLoading(false)

    if (error) {
      alert('Something went wrong: ' + error.message)
      return
    }

    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
      <label className="font-sans text-sm text-charcoal">
        Reason for cancellation
        <textarea
          required
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
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
          onClick={onBack}
          className="border border-taupe text-charcoal px-6 py-2 rounded font-sans"
        >
          Back
        </button>
      </div>
    </form>
  )
}
