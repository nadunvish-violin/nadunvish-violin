import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'
import StatusPill from '@/components/StatusPill'
import Link from 'next/link'

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

      <div className="flex flex-col gap-3">
{inquiries?.map((inquiry) => (
  <Link
    key={inquiry.id}
    href={`/dashboard/${inquiry.id}`}
    className="border border-taupe/50 rounded-lg p-4 flex items-center justify-between bg-white/40 hover:bg-white/70 transition"
  >
    <div>
      <p className="font-serif text-lg text-charcoal">
        {inquiry.first_name} {inquiry.last_name}
      </p>
      <p className="font-sans text-sm text-taupe">
        {inquiry.event_type} · {inquiry.event_date}
      </p>
    </div>

    <StatusPill status={inquiry.status} />
  </Link>
))}
      </div>

      {inquiries?.length === 0 && (
        <p className="font-sans text-taupe">No inquiries yet.</p>
      )}
    </main>
  )
}