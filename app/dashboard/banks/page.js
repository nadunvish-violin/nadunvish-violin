import { createClient } from '@/lib/supabase/server'
import BanksList from '@/components/BanksList'

export default async function BanksPage() {
  const supabase = await createClient()

  const { data: banks, error } = await supabase
    .from('bank_details')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <p className="font-sans text-red-600">Error loading bank details: {error.message}</p>
  }

  return <BanksList banks={banks} />
}
