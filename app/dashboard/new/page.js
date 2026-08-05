'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const EVENT_TIME_OPTIONS = ['morning', 'noon', 'afternoon', 'evening']

export default function NewInquiryPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [eventType, setEventType] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [venue, setVenue] = useState('')
  const [message, setMessage] = useState('')
  const [startingStatus, setStartingStatus] = useState('new')
  const [eventTime, setEventTime] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const insertData = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      event_type: eventType,
      event_date: eventDate,
      venue,
      message,
      status: startingStatus,
      consent_given: true,
    }

    if (startingStatus === 'contacted') {
      insertData.event_time = eventTime
    }

    const { data, error } = await supabase
      .from('inquiries')
      .insert(insertData)
      .select()
      .single()

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push(`/dashboard/${data.id}?returnView=list`)
  }

  return (
    <div>
      <Link href="/dashboard?view=list" className="font-sans text-taupe text-sm">
        ← Back
      </Link>

      <h1 className="text-3xl font-serif text-charcoal mt-4 mb-8">Add Inquiry</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <label className="font-sans text-sm text-charcoal">
          First name
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Last name
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Phone
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Event type
          <input
            type="text"
            required
            placeholder="e.g. Wedding, Corporate Event, Birthday Party"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Event date
          <input
            type="date"
            required
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Venue
          <input
            type="text"
            required
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Message
          <textarea
            required
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Starting status
          <select
            value={startingStatus}
            onChange={(e) => setStartingStatus(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
          </select>
        </label>

        {startingStatus === 'contacted' && (
          <label className="font-sans text-sm text-charcoal">
            Event time
            <select
              required
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
            >
              <option value="" disabled>Select a time</option>
              {EVENT_TIME_OPTIONS.map((option) => (
                <option key={option} value={option} className="capitalize">{option}</option>
              ))}
            </select>
          </label>
        )}

        {error && <p className="text-red-600 font-sans text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-champagne text-ivory px-6 py-2 rounded font-sans disabled:opacity-50 mt-2"
        >
          {loading ? 'Adding...' : 'Add Inquiry'}
        </button>
      </form>
    </div>
  )
}
