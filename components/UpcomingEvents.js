import Link from 'next/link'

const EVENT_TYPE_COLORS = {
  Wedding: '#B8935F',
  Concert: '#4C5FD5',
  'Corporate Event': '#5B8DBF',
  'Private Party': '#E8748A',
  Other: '#C9C2B4',
}

function daysUntil(dateString) {
  const eventDate = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  eventDate.setHours(0, 0, 0, 0)
  const diffDays = Math.round((eventDate - today) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 0) return 'Past due'
  return `In ${diffDays} days`
}

export default function UpcomingEvents({ events }) {
  return (
    <div className="mb-8">
      <h2 className="font-serif text-xl text-charcoal mb-3">Upcoming Events</h2>

      {events.length === 0 ? (
        <div className="border border-champagne/40 rounded-lg p-4 bg-white/40">
          <p className="font-sans text-taupe text-sm">Nothing confirmed yet.</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {events.map((event) => {
            const color = EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.Other
            return (
              <Link
                key={event.id}
                href={`/dashboard/${event.id}`}
                className="flex items-stretch gap-3 border border-champagne/40 rounded-lg p-4 bg-white/40 hover:bg-white/70 transition min-w-[260px] w-[260px] shrink-0"
              >
                <div className="w-1.5 rounded-full" style={{ backgroundColor: color }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-serif text-lg text-charcoal">{event.first_name} {event.last_name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full text-ivory shrink-0" style={{ backgroundColor: color }}>
                      {event.event_type}
                    </span>
                  </div>
                  <p className="font-sans text-sm font-semibold text-champagne">
                    {daysUntil(event.event_date)}
                  </p>
                  <p className="font-sans text-xs text-taupe">
                    {event.venue} · {event.event_date}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
