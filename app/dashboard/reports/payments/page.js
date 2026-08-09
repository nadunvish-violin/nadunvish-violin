import { createClient } from '@/lib/supabase/server'
import PaymentsReport from '@/components/PaymentsReport'

export default async function PaymentsReportPage() {
  const supabase = await createClient()

  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select('id, first_name, last_name, status, total_price, discount, advance_payment_amount, advance_payment_date, full_payment_date')
    .in('status', ['confirmed', 'completed'])

  if (error) {
    return <p className="font-sans text-red-600">Error loading report: {error.message}</p>
  }

  return (
    <div>
      <h1 className="text-3xl font-serif text-charcoal mb-6">Payments</h1>
      <PaymentsReport inquiries={inquiries || []} />
    </div>
  )
}
