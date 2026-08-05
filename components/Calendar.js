'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const STATUS_DOT_COLORS = {
  new: 'bg-yellow-500',
  contacted: 'bg-blue-500',
  confirmed: 'bg-champagne',
  completed: 'bg-green-600',
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function Calendar({ inquiries }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const today = new Date()

  const initialMonth = searchParams.get('month') !== null ? parseInt(searchParams.get('month'), 10) : today.getMonth()
  const initialYear = searchParams.get('year') !== null ? parseInt(searchParams.get('year'), 10) : today.getFullYear()

  const [currentMonth, setCurrentMonth] = useState(initialMonth)
  const [currentYear, setCurrentYear] = useState(initialYear)
  const [selectedDate, setSelectedDate] = useState(null)

  const activeInquiries = inquiries.filter((inq) => inq.status !== 'cancelled')

  const inquiriesByDate = {}
  activeInquiries.forEach((inq) => {
    if (!inq.event_date) return
    if (!inquiriesByDate[inq.event_date]) inquiriesByDate[inq.event_date] = []
    inquiriesByDate[inq.event_date].push(inq)
  })

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const startWeekday = firstDayOfMonth.getDay()

  const dayCells = []
  for (let i = 0; i < startWeekday; i++) {
    dayCells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    dayCells.push(day)
  }

  function formatDateKey(day) {
    const month = String(currentMonth + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${currentYear}-${month}-${dayStr}`
  }

  function goToPreviousMonth() {
    setSelectedDate(null)
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  function goToNextMonth() {
    setSelectedDate(null)
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  function goToInquiry(id) {
    router.push(`/dashboard/${id}?returnView=calendar&returnMonth=${currentMonth}&returnYear=${currentYear}`)
  }

  const selectedInquiries = selectedDate ? (inquiriesByDate[selectedDate] || []) : []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={goToPreviousMonth} className="px-3 py-1 border border-taupe rounded font-sans text-charcoal">
          ← Prev
        </button>
        <h2 className="font-serif text-xl text-charcoal">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h2>
        <button onClick={goToNextMonth} className="px-3 py-1 border border-taupe rounded font-sans text-charcoal">
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-sans text-xs text-taupe py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayCells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />
          }

          const dateKey = formatDateKey(day)
          const dayInquiries = inquiriesByDate[dateKey] || []
          const isSelected = selectedDate === dateKey

          return (
            <div
              key={dateKey}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedDate(isSelected ? null : dateKey)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedDate(isSelected ? null : dateKey)
                }
              }}
              className={`aspect-square flex flex-col items-center justify-start pt-1 rounded font-sans text-sm cursor-pointer ${
                isSelected ? 'bg-charcoal text-ivory' : 'text-charcoal hover:bg-taupe/20'
              }`}
            >
              <span>{day}</span>
              {dayInquiries.length > 0 && (
                <div className="flex gap-0.5 flex-wrap justify-center mt-1">
                  {dayInquiries.map((inq) => (
                    <span key={inq.id} className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[inq.status]}`} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedDate && (
        <div className="mt-6 border-t border-taupe/50 pt-4">
          <p className="font-serif text-lg text-charcoal mb-3">
            {selectedDate} — {selectedInquiries.length} {selectedInquiries.length === 1 ? 'inquiry' : 'inquiries'}
          </p>

          {selectedInquiries.length === 0 && (
            <p className="font-sans text-taupe text-sm">No inquiries on this date.</p>
          )}

          <div className="flex flex-col gap-2">
            {selectedInquiries.map((inq) => (
              <button
                key={inq.id}
                onClick={() => goToInquiry(inq.id)}
                className="text-left border border-taupe/50 rounded-lg p-3 flex items-center justify-between bg-white/40 hover:bg-white/70 transition"
              >
                <span className="font-sans text-charcoal">{inq.first_name} {inq.last_name}</span>
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[inq.status]}`} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
