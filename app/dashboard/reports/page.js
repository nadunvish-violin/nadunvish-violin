import { createClient } from '@/lib/supabase/server'

function getMonthKey(dateString) {
  const d = new Date(dateString)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default async function ReportsPage() {
  const supabase = await createClient()

  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select('event_date, total_price, discount, advance_payment_amount, full_payment_date')
    .in('status', ['confirmed', 'completed'])

  if (error) {
    return <p className="font-sans text-red-600">Error loading report: {error.message}</p>
  }

  const byMonth = {}
  let totalRevenue = 0

  for (const inq of inquiries || []) {
    if (!inq.event_date) continue

    const collected = inq.full_payment_date
      ? Number(inq.total_price || 0) - Number(inq.discount || 0)
      : Number(inq.advance_payment_amount || 0)

    totalRevenue += collected

    const key = getMonthKey(inq.event_date)
    byMonth[key] = (byMonth[key] || 0) + collected
  }

  const sortedMonths = Object.keys(byMonth).sort()
  const maxMonthValue = Math.max(...sortedMonths.map((k) => byMonth[k]), 1)

  return (
    <div>
      <h1 className="text-3xl font-serif text-charcoal mb-6">Payment Reports</h1>

      <div className="border border-taupe/50 rounded-lg p-6 bg-white/40 mb-8">
        <p className="font-sans text-sm text-taupe">Total revenue collected</p>
        <p className="font-serif text-4xl text-charcoal">LKR {totalRevenue.toLocaleString()}</p>
      </div>

      {sortedMonths.length === 0 ? (
        <p className="font-sans text-taupe">No confirmed or completed bookings yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedMonths.map((key) => (
            <div key={key}>
              <div className="flex justify-between font-sans text-sm text-charcoal mb-1">
                <span>{getMonthLabel(key)}</span>
                <span>LKR {byMonth[key].toLocaleString()}</span>
              </div>
              <div className="w-full bg-taupe/20 rounded h-3">
                <div
                  className="bg-champagne h-3 rounded"
                  style={{ width: `${(byMonth[key] / maxMonthValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
