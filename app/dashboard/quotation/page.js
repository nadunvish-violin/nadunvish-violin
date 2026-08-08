import { createClient } from '@/lib/supabase/server'
import StandaloneQuotationForm from '@/components/StandaloneQuotationForm'

export default async function StandaloneQuotationPage() {
  const supabase = await createClient()

  const [{ data: packages }, { data: banks }] = await Promise.all([
    supabase.from('packages').select('*').order('created_at', { ascending: false }),
    supabase.from('bank_details').select('*').order('created_at', { ascending: false }),
  ])

  return (
    <div>
      <h1 className="text-3xl font-serif text-charcoal mb-6">Generate Quotation</h1>
      <StandaloneQuotationForm packages={packages || []} banks={banks || []} />
    </div>
  )
}
