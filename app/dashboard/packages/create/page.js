'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function CreatePackagePage() {
  const router = useRouter()
  const supabase = createClient()

  const [details, setDetails] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('packages')
      .insert({ details, price: Number(price) })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard/packages')
  }

  return (
    <div>
      <Link href="/dashboard/packages" className="font-sans text-taupe text-sm">
        ← Back
      </Link>

      <h1 className="text-3xl font-serif text-charcoal mt-4 mb-8">Create Package</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <label className="font-sans text-sm text-charcoal">
          Package details
          <textarea
            required
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Package price (LKR)
          <input
            type="number"
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        {error && <p className="text-red-600 font-sans text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-champagne text-ivory px-6 py-2 rounded font-sans disabled:opacity-50 mt-2"
        >
          {loading ? 'Creating...' : 'Create Package'}
        </button>
      </form>
    </div>
  )
}
