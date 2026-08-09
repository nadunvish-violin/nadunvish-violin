'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    if (!confirm('Are you sure you want to log out?')) return
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="border border-taupe text-charcoal px-4 py-2 rounded font-sans"
    >
      Log out
    </button>
  )
}
