import { createClient } from '@/lib/supabase/server'
import QuotationForm from '@/components/QuotationForm'
import Link from 'next/link'

export default async function QuotationPage({ params }) {
  const { id } = await params
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
        <Link href="/dashboard?view=list" className="font-sans text-champagne underline">
          Back
        </Link>
      </div>
    )
  }

  const [{ data: packages }, { data: banks }, { data: pastQuotations }] = await Promise.all([
    supabase.from('packages').select('*').order('created_at', { ascending: false }),
    supabase.from('bank_details').select('*').order('created_at', { ascending: false }),
    supabase.from('quotations').select('*').eq('inquiry_id', id).order('created_at', { ascending: false }),
  ])

  return (
    <div>
      <Link href={`/dashboard/${id}`} className="font-sans text-taupe text-sm">
        ← Back
      </Link>

      <h1 className="text-3xl font-serif text-charcoal mt-4 mb-8">Generate Quotation</h1>

      <QuotationForm
        inquiry={inquiry}
        packages={packages || []}
        banks={banks || []}
        pastQuotations={pastQuotations || []}
      />
    </div>
  )
}
