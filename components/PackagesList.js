'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function PackagesList({ packages }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete(id) {
    if (!confirm('Delete this package? This cannot be undone.')) return

    const { error } = await supabase.from('packages').delete().eq('id', id)

    if (error) {
      alert('Something went wrong: ' + error.message)
      return
    }

    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-serif text-charcoal">Packages</h1>
        <Link href="/dashboard/packages/create" className="bg-champagne text-ivory px-4 py-2 rounded font-sans text-sm">
          + Create Package
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="border border-taupe/50 rounded-lg p-4 flex items-center justify-between bg-white/40">
            <div>
              <p className="font-sans text-charcoal">{pkg.details}</p>
              <p className="font-sans text-sm text-taupe">LKR {Number(pkg.price).toLocaleString()}</p>
            </div>
            <button
              onClick={() => handleDelete(pkg.id)}
              className="text-red-600 font-sans text-sm border border-red-600 px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}

        {packages.length === 0 && (
          <p className="font-sans text-taupe">No packages created yet.</p>
        )}
      </div>
    </div>
  )
}
