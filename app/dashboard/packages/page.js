import { createClient } from '@/lib/supabase/server'
import PackagesList from '@/components/PackagesList'

export default async function PackagesPage() {
  const supabase = await createClient()

  const { data: packages, error } = await supabase
    .from('packages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <p className="font-sans text-red-600">Error loading packages: {error.message}</p>
  }

  return <PackagesList packages={packages} />
}
