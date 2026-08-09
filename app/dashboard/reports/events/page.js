import { createClient } from '@/lib/supabase/server'

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default async function EventsReportPage() {
  const supabase = await createClient()

  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select('status')

  if (error) {
    return <p className="font-sans text-red-600">Error loading report: {error.message}</p>
  }

  const counts = { new: 0, contacted: 0, confirmed: 0, completed: 0, cancelled: 0 }
  for (const inq of inquiries || []) {
    if (counts[inq.status] !== undefined) counts[inq.status]++
  }

  return (
    <div>
      <h1 className="text-3xl font-serif text-charcoal mb-6">Events</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} className="border border-taupe/50 rounded-lg p-4 bg-white/40">
            <p className="font-sans text-sm text-taupe">{STATUS_LABELS[status]}</p>
            <p className="font-serif text-3xl text-charcoal">{count}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
