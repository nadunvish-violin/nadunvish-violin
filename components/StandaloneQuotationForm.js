'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateQuotationPDF } from '@/lib/generateQuotationPDF'

function formatTime(timeString) {
  if (!timeString) return ''
  const [hours, minutes] = timeString.split(':')
  const h = parseInt(hours, 10)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHour = h % 12 === 0 ? 12 : h % 12
  return `${displayHour}:${minutes} ${period}`
}

function downloadPDF(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function StandaloneQuotationForm({ packages, banks }) {
  const supabase = createClient()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [venue, setVenue] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [phone, setPhone] = useState('')

  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0])
  const [packageType, setPackageType] = useState('')
  const [packagePrice, setPackagePrice] = useState('')
  const [discount, setDiscount] = useState(0)
  const [selectedBankIds, setSelectedBankIds] = useState([])

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [lastGeneratedNumber, setLastGeneratedNumber] = useState(null)

  function handlePackageSelect(e) {
    const selected = packages.find((p) => p.id === e.target.value)
    if (selected) {
      setPackageType(selected.details)
      setPackagePrice(selected.price)
    }
  }

  function toggleBank(id) {
    setSelectedBankIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    )
  }

  async function handleGenerate(e) {
    e.preventDefault()
    setGenerating(true)
    setError(null)

    const { data: nextNumber, error: rpcError } = await supabase.rpc('next_quotation_number')

    if (rpcError) {
      setGenerating(false)
      setError(rpcError.message)
      return
    }

    const quotationNumber = `NV-QTN-${String(nextNumber).padStart(5, '0')}`
    const finalTotal = Number(packagePrice) - Number(discount)
    const banksShown = banks.filter((b) => selectedBankIds.includes(b.id)).map((b) => b.details)

    const pdfBytes = await generateQuotationPDF({
      quotationNumber,
      quotationDate,
      firstName,
      lastName,
      eventDate,
      venue,
      eventTime: formatTime(eventTime),
      phone,
      packageDetails: packageType,
      packagePrice: Number(packagePrice),
      discount: Number(discount),
      totalPrice: finalTotal,
      banksShown,
    })

    setGenerating(false)
    setLastGeneratedNumber(quotationNumber)
    downloadPDF(pdfBytes, `${quotationNumber}.pdf`)
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="font-sans text-taupe text-sm">
        For a client not yet in the system — nothing here gets saved, this only produces a PDF.
      </p>

      {lastGeneratedNumber && (
        <p className="font-sans text-champagne text-sm">
          Generated {lastGeneratedNumber} — check your downloads.
        </p>
      )}

      <form onSubmit={handleGenerate} className="flex flex-col gap-4 max-w-md">
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
          Event date
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Location
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Event time
          <input
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Contact number
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Quotation date
          <input
            type="date"
            required
            value={quotationDate}
            onChange={(e) => setQuotationDate(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Package
          <select
            value={packages.find((p) => p.details === packageType)?.id || ''}
            onChange={handlePackageSelect}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          >
            <option value="">Select a package</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>{pkg.details}</option>
            ))}
          </select>
        </label>

        <label className="font-sans text-sm text-charcoal">
          Package price (LKR)
          <input
            type="number"
            step="0.01"
            required
            value={packagePrice}
            onChange={(e) => setPackagePrice(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Discount (LKR)
          <input
            type="number"
            step="0.01"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
          />
        </label>

        <div className="font-sans text-sm text-charcoal">
          Bank details to show
          <div className="flex flex-col gap-2 mt-1">
            {banks.map((bank) => (
              <label key={bank.id} className="flex items-start gap-2 border border-taupe/50 rounded px-3 py-2">
                <input
                  type="checkbox"
                  checked={selectedBankIds.includes(bank.id)}
                  onChange={() => toggleBank(bank.id)}
                  className="mt-1"
                />
                <span className="whitespace-pre-line text-xs">{bank.details}</span>
              </label>
            ))}
            {banks.length === 0 && (
              <p className="font-sans text-taupe text-xs">No bank details added yet.</p>
            )}
          </div>
        </div>

        {error && <p className="text-red-600 font-sans text-sm">{error}</p>}

        <button
          type="submit"
          disabled={generating}
          className="bg-champagne text-ivory px-6 py-2 rounded font-sans disabled:opacity-50 mt-2"
        >
          {generating ? 'Generating...' : 'Generate Quotation'}
        </button>
      </form>
    </div>
  )
}
