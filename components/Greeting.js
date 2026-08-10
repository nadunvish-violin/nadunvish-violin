'use client'

import { useState, useEffect } from 'react'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Greeting() {
  const [greeting, setGreeting] = useState('Hello')

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  return <h1 className="text-3xl font-serif text-charcoal mb-2">{greeting}, Nadun!</h1>
}
