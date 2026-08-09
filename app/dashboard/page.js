import { createClient } from '@/lib/supabase/server'
import DashboardView from '@/components/DashboardView'
import UpcomingEvents from '@/components/UpcomingEvents'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  const today = new Date().toISOString().split('T')[0]
  const { data: upcomingEvents } = await supabase
    .from('inquiries')
    .select('id, first_name, last_name, event_type, event_date, venue')
    .eq('status', 'confirmed')
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .limit(5)

  return (
    <div>
      <h1 className="text-3xl font-serif text-charcoal mb-2">Dashboard</h1>
      <p className="font-sans text-taupe text-sm mb-6">
        Logged in as: {user?.email}
      </p>

      <UpcomingEvents events={upcomingEvents || []} />

      {error && (
        <p className="text-red-600 font-sans">
          Error loading inquiries: {error.message}
        </p>
      )}

      {inquiries && <DashboardView inquiries={inquiries} />}
    </div>
  )
}
