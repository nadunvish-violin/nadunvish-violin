import { createClient } from '@/lib/supabase/server'
import StatusPill from '@/components/StatusPill'
import Link from 'next/link'
import StatusActions from '@/components/StatusActions'

export default async function InquiryDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !inquiry) {
    return (
      <main className="min-h-screen bg-ivory p-8">
        <p className="font-sans text-red-600">Inquiry not found.</p>
        <Link href="/dashboard" className="font-sans text-champagne underline">
          Back to dashboard
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-ivory p-8">
      <Link href="/dashboard" className="font-sans text-taupe text-sm">
        ← Back to dashboard
      </Link>

      <div className="flex items-center justify-between mt-4 mb-8">
        <h1 className="text-3xl font-serif text-charcoal">
          {inquiry.first_name} {inquiry.last_name}
        </h1>
        <StatusPill status={inquiry.status} />
      </div>

      <div className="flex flex-col gap-3 font-sans text-charcoal">
        <p><span className="text-taupe">Email:</span> {inquiry.email}</p>
        <p><span className="text-taupe">Phone:</span> {inquiry.phone}</p>
        <p><span className="text-taupe">Event type:</span> {inquiry.event_type}</p>
        <p><span className="text-taupe">Event date:</span> {inquiry.event_date}</p>
        <p><span className="text-taupe">Event time:</span> {inquiry.event_time || 'Not set yet'}</p>
        <p><span className="text-taupe">Venue:</span> {inquiry.venue}</p>
        <p><span className="text-taupe">Message:</span> {inquiry.message}</p>

        {inquiry.private_notes && (
          <p><span className="text-taupe">Private notes:</span> {inquiry.private_notes}</p>
        )}
        <div className="mt-8">
        <StatusActions inquiry={inquiry} />
      </div>
      </div>
    </main>
  )
}