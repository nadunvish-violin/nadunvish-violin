import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STATUS_COLORS = {
  new: '#fcc055',
  contacted: '#9683ec',
  confirmed: '#23aa8f',
  completed: '#023047',
  cancelled: '#dc2626',
}

const STATUS_TEXT_COLORS = {
  new: '#2B2A28',
  contacted: '#F7F3EC',
  confirmed: '#F7F3EC',
  completed: '#F7F3EC',
  cancelled: '#F7F3EC',
}

export default async function EventsReportPage() {
  const supabase = await createClient()

  const [{ data: inquiries, error }, { data: confirmedEvents }] = await Promise.all([
    supabase.from('inquiries').select('status'),
    supabase
      .from('inquiries')
      .select('id, first_name, last_name, event_date, venue')
      .eq('status', 'confirmed')
      .order('event_date', { ascending: true }),
  ])

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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} className="rounded-lg p-4" style={{ backgroundColor: STATUS_COLORS[status] }}>
            <p className="font-sans text-sm" style={{ color: STATUS_TEXT_COLORS[status], opacity: 0.8 }}>{STATUS_LABELS[status]}</p>
            <p className="font-serif text-3xl" style={{ color: STATUS_TEXT_COLORS[status] }}>{count}</p>
          </div>
        ))}
      </div>

      <h2 className="font-serif text-xl text-charcoal mb-3">Confirmed Events</h2>
      <div className="flex flex-col gap-2">
        {(confirmedEvents || []).map((event) => (
          <Link
            key={event.id}
            href={`/dashboard/${event.id}`}
            className="border border-taupe/50 rounded-lg p-4 bg-white/40 hover:bg-white/70 transition"
          >
            <p className="font-serif text-lg text-charcoal">{event.first_name} {event.last_name}</p>
            <p className="font-sans text-sm text-taupe">{event.venue} · {event.event_date}</p>
          </Link>
        ))}
        {(!confirmedEvents || confirmedEvents.length === 0) && (
          <p className="font-sans text-taupe">No confirmed events yet.</p>
        )}
      </div>
    </div>
  )
}
