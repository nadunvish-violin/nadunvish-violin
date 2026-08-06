import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/DashboardShell'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [{ data: newInquiries }, { data: upcomingEvents }, { data: stalledCandidates }] = await Promise.all([
    supabase.from('inquiries').select('id, first_name, last_name').eq('status', 'new').order('created_at', { ascending: false }),
    supabase.from('inquiries').select('id, first_name, last_name, event_date').eq('status', 'confirmed').gte('event_date', today).lte('event_date', sevenDaysFromNow).order('event_date', { ascending: true }),
    supabase.from('inquiries').select('id, first_name, last_name').eq('status', 'contacted').eq('quotation_generated', true).is('advance_payment_amount', null),
  ])

  let stalledQuotations = []
  if (stalledCandidates && stalledCandidates.length > 0) {
    const ids = stalledCandidates.map((i) => i.id)
    const { data: quotations } = await supabase
      .from('quotations')
      .select('inquiry_id, created_at')
      .in('inquiry_id', ids)
      .order('created_at', { ascending: false })

    const latestByInquiry = {}
    for (const q of quotations || []) {
      if (!latestByInquiry[q.inquiry_id]) {
        latestByInquiry[q.inquiry_id] = q.created_at
      }
    }

    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000
    stalledQuotations = stalledCandidates.filter((inq) => {
      const quotedAt = latestByInquiry[inq.id]
      return quotedAt && new Date(quotedAt).getTime() <= threeDaysAgo
    })
  }

  const notifications = {
    newInquiries: newInquiries || [],
    upcomingEvents: upcomingEvents || [],
    stalledQuotations,
  }

  return <DashboardShell notifications={notifications}>{children}</DashboardShell>
}
