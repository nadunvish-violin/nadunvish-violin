import { createClient } from '@/lib/supabase/server'
import ChangePasswordForm from '@/components/ChangePasswordForm'

export default async function ChangePasswordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <h1 className="text-3xl font-serif text-charcoal mb-6">Change Password</h1>
      <ChangePasswordForm email={user?.email} />
    </div>
  )
}
