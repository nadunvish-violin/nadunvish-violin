'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function BanksList({ banks }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete(id) {
    if (!confirm('Delete this bank detail? This cannot be undone.')) return

    const { error } = await supabase.from('bank_details').delete().eq('id', id)

    if (error) {
      alert('Something went wrong: ' + error.message)
      return
    }

    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-serif text-charcoal">Bank Details</h1>
        <Link href="/dashboard/banks/add" className="bg-champagne text-ivory px-4 py-2 rounded font-sans text-sm">
          + Add Bank
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {banks.map((bank) => (
          <div key={bank.id} className="border border-taupe/50 rounded-lg p-4 flex items-start justify-between bg-white/40">
            <p className="font-sans text-charcoal whitespace-pre-line">{bank.details}</p>
            <button
              onClick={() => handleDelete(bank.id)}
              className="text-red-600 font-sans text-sm border border-red-600 px-3 py-1 rounded shrink-0 ml-4"
            >
              Delete
            </button>
          </div>
        ))}

        {banks.length === 0 && (
          <p className="font-sans text-taupe">No bank details added yet.</p>
        )}
      </div>
    </div>
  )
}
