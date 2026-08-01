'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-ivory">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 w-full max-w-sm p-8"
      >
        <h1 className="text-3xl font-serif text-charcoal text-center mb-4">
          NadunVish
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-taupe rounded px-4 py-2 font-sans text-charcoal"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border border-taupe rounded px-4 py-2 font-sans text-charcoal"
        />

        {error && (
          <p className="text-red-600 text-sm font-sans">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-champagne text-ivory px-6 py-2 rounded font-sans mt-2 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </main>
  )
}