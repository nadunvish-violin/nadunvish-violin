import { createClient } from '@/lib/supabase/server'
import StatusPill from '@/components/StatusPill'
import StatusActions from '@/components/StatusActions'
import ContactedPanel from '@/components/ContactedPanel'
import ConfirmedPanel from '@/components/ConfirmedPanel'
import Link from 'next/link'

function formatTime(timeString) {
  if (!timeString) return null
  const [hours, minutes] = timeString.split(':')
  const h = parseInt(hours, 10)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHour = h % 12 === 0 ? 12 : h % 12
  return `${displayHour}:${minutes} ${period}`
}

export default async function InquiryDetailPage({ params, searchParams }) {
  const { id } = await params
  const sp = await searchParams
  const returnView = sp?.returnView === 'calendar' ? 'calendar' : 'list'
  const returnMonth = sp?.returnMonth
  const returnYear = sp?.returnYear

  let backHref = '/dashboard?view=list'
  if (returnView === 'calendar' && returnMonth !== undefined && returnYear !== undefined) {
    backHref = `/dashboard?view=calendar&month=${returnMonth}&year=${returnYear}`
  }

  const supabase = await createClient()

  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !inquiry) {
    return (
      <div>
        <p className="font-sans text-red-600">Inquiry not found.</p>
        <Link href={backHref} className="font-sans text-champagne underline">
          Back
        </Link>
      </div>
    )
  }

  let packages = []
  if (inquiry.status === 'contacted') {
    const { data } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false })
    packages = data || []
  }

  return (
    <div>
      <Link href={backHref} className="font-sans text-taupe text-sm">
        ← Back
      </Link>

      <div className="flex items-center justify-between mt-4 mb-8">
        <h1 className="text-3xl font-serif text-charcoal">
          {inquiry.first_name} {inquiry.last_name}
        </h1>
        <StatusPill status={inquiry.status} />
      </div>

      <div className="flex flex-col gap-3 font-sans text-charcoal mb-8">
        <p><span className="text-taupe">Email:</span> {inquiry.email}</p>
        <p><span className="text-taupe">Phone:</span> {inquiry.phone}</p>
        <p><span className="text-taupe">Event type:</span> {inquiry.event_type}</p>
        <p><span className="text-taupe">Event date:</span> {inquiry.event_date}</p>
        <p><span className="text-taupe">Event time:</span> {formatTime(inquiry.event_time) || 'Not set yet'}</p>
        <p><span className="text-taupe">Venue:</span> {inquiry.venue}</p>
        <p><span className="text-taupe">Message:</span> {inquiry.message}</p>

        {inquiry.private_notes && (
          <p><span className="text-taupe">Private notes:</span> {inquiry.private_notes}</p>
        )}
      </div>

      {inquiry.status === 'contacted' && <ContactedPanel inquiry={inquiry} packages={packages} />}
      {inquiry.status === 'confirmed' && <ConfirmedPanel inquiry={inquiry} />}
      {inquiry.status !== 'contacted' && inquiry.status !== 'confirmed' && <StatusActions inquiry={inquiry} />}
    </div>
  )
}
