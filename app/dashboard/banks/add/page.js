'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AddBankPage() {
  const router = useRouter()
  const supabase = createClient()

  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('bank_details')
      .insert({ details })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard/banks')
  }

  return (
    <div>
      <Link href="/dashboard/banks" className="font-sans text-taupe text-sm">
        ← Back
      </Link>

      <h1 className="text-3xl font-serif text-charcoal mt-4 mb-8">Add Bank</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <label className="font-sans text-sm text-charcoal">
          Bank details
          <textarea
            required
            rows={5}
            placeholder={'Bank : Commercial Bank\nBranch : Dambulla\nAccount Number : 8024873006\nAccount Name : G.N.V.Gamage'}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        {error && <p className="text-red-600 font-sans text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-champagne text-ivory px-6 py-2 rounded font-sans disabled:opacity-50 mt-2"
        >
          {loading ? 'Adding...' : 'Add Bank'}
        </button>
      </form>
    </div>
  )
}
