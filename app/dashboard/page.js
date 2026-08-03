import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'
import DashboardView from '@/components/DashboardView'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-ivory p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-charcoal">Dashboard</h1>
        <LogoutButton />
      </div>

      <p className="font-sans text-taupe text-sm mb-6">
        Logged in as: {user?.email}
      </p>

      {error && (
        <p className="text-red-600 font-sans">
          Error loading inquiries: {error.message}
        </p>
      )}

      {inquiries && <DashboardView inquiries={inquiries} />}
    </main>
  )
}
