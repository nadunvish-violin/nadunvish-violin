import { createClient } from '@/lib/supabase/server'
import InvoiceForm from '@/components/InvoiceForm'
import Link from 'next/link'

export default async function InvoicePage({ params }) {
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

  const [{ data: latestQuotationRows }, { data: banks }, { data: pastInvoices }] = await Promise.all([
    supabase.from('quotations').select('*').eq('inquiry_id', id).order('created_at', { ascending: false }).limit(1),
    supabase.from('bank_details').select('*').order('created_at', { ascending: false }),
    supabase.from('invoices').select('*').eq('inquiry_id', id).order('created_at', { ascending: false }),
  ])

  const latestQuotation = latestQuotationRows?.[0] || null

  return (
    <div>
      <Link href={`/dashboard/${id}`} className="font-sans text-taupe text-sm">
        ← Back
      </Link>

      <h1 className="text-3xl font-serif text-charcoal mt-4 mb-8">
        {inquiry.status === 'completed' ? 'Generate Paid Invoice' : 'Generate Invoice'}
      </h1>

      {!latestQuotation && (
        <p className="font-sans text-red-600 mb-4">
          No quotation found for this inquiry — a quotation must exist before an invoice can be generated.
        </p>
      )}

      <InvoiceForm
        inquiry={inquiry}
        latestQuotation={latestQuotation}
        banks={banks || []}
        pastInvoices={pastInvoices || []}
      />
    </div>
  )
}
