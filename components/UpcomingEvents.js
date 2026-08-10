'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { EVENT_TYPE_COLORS } from '@/lib/eventTypeColors'

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

const CARD_WIDTH_WITH_GAP = 272

export default function UpcomingEvents({ events }) {
  const scrollRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  function handleScroll() {
    const container = scrollRef.current
    if (!container) return
    const index = Math.round(container.scrollLeft / CARD_WIDTH_WITH_GAP)
    setActiveIndex(Math.min(Math.max(index, 0), events.length - 1))
  }

  return (
    <div className="mb-8">
      <h2 className="font-serif text-xl text-charcoal mb-3">Upcoming Events</h2>

      {events.length === 0 ? (
        <div className="border border-champagne/40 rounded-lg p-4 bg-white/40">
          <p className="font-sans text-taupe text-sm">Nothing confirmed yet.</p>
        </div>
      ) : (
        <>
          <div ref={scrollRef} onScroll={handleScroll} className="flex gap-3 overflow-x-auto pb-2">
            {events.map((event) => {
              const color = EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.Other
              return (
                <Link
                  key={event.id}
                  href={`/dashboard/${event.id}`}
                  className="flex items-stretch gap-3 border border-champagne/40 rounded-lg p-4 bg-white/40 hover:bg-white/70 transition min-w-[260px] w-[260px] shrink-0"
                >
                  <div className="w-1.5 rounded-full" style={{ backgroundColor: color }} />
                  <div className="flex-1 flex flex-col gap-1">
                    <p className="font-serif text-lg text-charcoal">{event.first_name} {event.last_name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full text-ivory self-start" style={{ backgroundColor: color }}>
                      {event.event_type}
                    </span>
                    <p className="font-sans text-sm font-semibold text-champagne">
                      {daysUntil(event.event_date)}
                    </p>
                    <p className="font-sans text-xs text-taupe">
                      {event.venue}
                    </p>
                    <p className="font-sans text-xs text-taupe">
                      {event.event_date}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>

          {events.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {events.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === activeIndex ? 'w-6 bg-champagne' : 'w-1.5 bg-taupe/50'
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
