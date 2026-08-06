'use client'

import { useState } from 'react'
import { normalizePhone, getWhatsAppNumber } from '@/lib/formatPhone'

export default function PhoneActions({ phone }) {
  const [open, setOpen] = useState(false)

  if (!phone) return <span className="text-charcoal">-</span>

  const cleanPhone = normalizePhone(phone)
  const whatsappNumber = getWhatsAppNumber(phone)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="text-charcoal underline decoration-taupe"
      >
        {phone}
      </button>

      {open && (
        <div className="flex gap-3 mt-2">
          <a
            href={`tel:${cleanPhone}`}
            className="bg-champagne text-ivory px-4 py-2 rounded font-sans text-sm"
          >
            Call Now
          </a>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-champagne text-champagne px-4 py-2 rounded font-sans text-sm"
          >
            Send WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}
