import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-ivory p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-charcoal">Dashboard</h1>
        <LogoutButton />
      </div>

      <p className="font-sans text-charcoal">
        Logged in as: {user?.email}
      </p>
    </main>
  )
}