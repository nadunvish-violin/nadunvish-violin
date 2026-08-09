'use client'

import { useState, useMemo } from 'react'

function getMonthKey(dateString) {
  return dateString.slice(0, 7)
}

export default function PaymentsReport({ inquiries }) {
  const [filterMode, setFilterMode] = useState('all')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const allEvents = useMemo(() => {
    const events = []
    for (const inq of inquiries) {
      const total = Number(inq.total_price || 0) - Number(inq.discount || 0)
      const advance = Number(inq.advance_payment_amount || 0)

      if (inq.advance_payment_amount && inq.advance_payment_date) {
        events.push({
          id: `${inq.id}-advance`,
          name: `${inq.first_name} ${inq.last_name}`,
          date: inq.advance_payment_date,
          amount: advance,
          label: 'Advance',
        })
      }

      if (inq.full_payment_date) {
        const remainder = total - advance
        if (remainder > 0) {
          events.push({
            id: `${inq.id}-final`,
            name: `${inq.first_name} ${inq.last_name}`,
            date: inq.full_payment_date,
            amount: remainder,
            label: 'Final',
          })
        }
      }
    }
    return events.sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [inquiries])

  const totalDue = useMemo(() => {
    return inquiries
      .filter((inq) => inq.status === 'confirmed' && !inq.full_payment_date)
      .reduce((sum, inq) => {
        const total = Number(inq.total_price || 0) - Number(inq.discount || 0)
        const advance = Number(inq.advance_payment_amount || 0)
        return sum + (total - advance)
      }, 0)
  }, [inquiries])

  const now = new Date()
  const thisMonthKey = now.toISOString().slice(0, 7)
  const thisYear = String(now.getFullYear())

  const filteredEvents = useMemo(() => {
    if (filterMode === 'month') return allEvents.filter((e) => getMonthKey(e.date) === thisMonthKey)
    if (filterMode === 'year') return allEvents.filter((e) => e.date.slice(0, 4) === thisYear)
    if (filterMode === 'custom' && customStart && customEnd) {
      return allEvents.filter((e) => {
        const key = getMonthKey(e.date)
        return key >= customStart && key <= customEnd
      })
    }
    return allEvents
  }, [allEvents, filterMode, customStart, customEnd, thisMonthKey, thisYear])

  const totalRevenue = filteredEvents.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterMode('all')} className={`px-3 py-1 rounded-full text-sm font-sans ${filterMode === 'all' ? 'bg-charcoal text-ivory' : 'bg-taupe/20 text-charcoal'}`}>All</button>
        <button onClick={() => setFilterMode('month')} className={`px-3 py-1 rounded-full text-sm font-sans ${filterMode === 'month' ? 'bg-charcoal text-ivory' : 'bg-taupe/20 text-charcoal'}`}>This Month</button>
        <button onClick={() => setFilterMode('year')} className={`px-3 py-1 rounded-full text-sm font-sans ${filterMode === 'year' ? 'bg-charcoal text-ivory' : 'bg-taupe/20 text-charcoal'}`}>This Year</button>
        <button onClick={() => setFilterMode('custom')} className={`px-3 py-1 rounded-full text-sm font-sans ${filterMode === 'custom' ? 'bg-charcoal text-ivory' : 'bg-taupe/20 text-charcoal'}`}>Custom Range</button>
      </div>

      {filterMode === 'custom' && (
        <div className="flex gap-3 items-end">
          <label className="font-sans text-sm text-charcoal">
            From
            <input type="month" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="border border-taupe rounded px-3 py-2 font-sans text-charcoal w-full mt-1" />
          </label>
          <label className="font-sans text-sm text-charcoal">
            To
            <input type="month" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="border border-taupe rounded px-3 py-2 font-sans text-charcoal w-full mt-1" />
          </label>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="border border-taupe/50 rounded-lg p-6 bg-white/40 flex-1">
          <p className="font-sans text-sm text-taupe">Total revenue (selected period)</p>
          <p className="font-serif text-3xl text-charcoal">LKR {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="border border-taupe/50 rounded-lg p-6 bg-white/40 flex-1">
          <p className="font-sans text-sm text-taupe">Total due (current, all time)</p>
          <p className="font-serif text-3xl text-charcoal">LKR {totalDue.toLocaleString()}</p>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl text-charcoal mb-3">Payments</h2>
        <div className="flex flex-col gap-2">
          {filteredEvents.map((e) => (
            <div key={e.id} className="border border-taupe/50 rounded-lg p-3 flex items-center justify-between bg-white/40">
              <div>
                <p className="font-sans text-charcoal">{e.name}</p>
                <p className="font-sans text-xs text-taupe">{e.date} · {e.label}</p>
              </div>
              <p className="font-sans text-charcoal">LKR {e.amount.toLocaleString()}</p>
            </div>
          ))}
          {filteredEvents.length === 0 && (
            <p className="font-sans text-taupe">No payments in this period.</p>
          )}
        </div>
      </div>
    </div>
  )
}
