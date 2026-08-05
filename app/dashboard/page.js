import { createClient } from '@/lib/supabase/server'
import DashboardView from '@/components/DashboardView'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-3xl font-serif text-charcoal mb-2">Dashboard</h1>
      <p className="font-sans text-taupe text-sm mb-6">
        Logged in as: {user?.email}
      </p>

      {error && (
        <p className="text-red-600 font-sans">
          Error loading inquiries: {error.message}
        </p>
      )}

      {inquiries && <DashboardView inquiries={inquiries} />}
    </div>
  )
}
