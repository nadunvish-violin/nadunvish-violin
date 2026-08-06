'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function QuotationForm({ inquiry, packages, banks, pastQuotations }) {
  const router = useRouter()
  const supabase = createClient()

  const [firstName, setFirstName] = useState(inquiry.first_name)
  const [lastName, setLastName] = useState(inquiry.last_name)
  const [eventDate, setEventDate] = useState(inquiry.event_date || '')
  const [venue, setVenue] = useState(inquiry.venue || '')
  const [eventTime, setEventTime] = useState(inquiry.event_time || '')
  const [phone, setPhone] = useState(inquiry.phone || '')

  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0])
  const [packageType, setPackageType] = useState(inquiry.package_type || '')
  const [packagePrice, setPackagePrice] = useState(inquiry.total_price ?? '')
  const [discount, setDiscount] = useState(inquiry.discount ?? 0)
  const [selectedBankIds, setSelectedBankIds] = useState([])

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  const nameDiffers = firstName !== inquiry.first_name || lastName !== inquiry.last_name

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

    const { error: insertError } = await supabase.from('quotations').insert({
      inquiry_id: inquiry.id,
      sequence_number: nextNumber,
      quotation_date: quotationDate,
      first_name: firstName,
      last_name: lastName,
      event_date: eventDate || null,
      venue,
      event_time: eventTime || null,
      phone,
      package_details: packageType,
      package_price: Number(packagePrice),
      discount: Number(discount),
      total_price: finalTotal,
      banks_shown: banksShown,
    })

    if (insertError) {
      setGenerating(false)
      setError(insertError.message)
      return
    }

    const { error: updateError } = await supabase
      .from('inquiries')
      .update({
        package_type: packageType,
        total_price: Number(packagePrice),
        discount: Number(discount),
        quotation_generated: true,
      })
      .eq('id', inquiry.id)

    setGenerating(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    downloadPDF(pdfBytes, `${quotationNumber}.pdf`)
    router.refresh()
  }

  async function handleRedownload(q) {
    const number = `NV-QTN-${String(q.sequence_number).padStart(5, '0')}`
    const pdfBytes = await generateQuotationPDF({
      quotationNumber: number,
      quotationDate: q.quotation_date,
      firstName: q.first_name,
      lastName: q.last_name,
      eventDate: q.event_date,
      venue: q.venue,
      eventTime: formatTime(q.event_time),
      phone: q.phone,
      packageDetails: q.package_details,
      packagePrice: Number(q.package_price),
      discount: Number(q.discount),
      totalPrice: Number(q.total_price),
      banksShown: q.banks_shown || [],
    })
    downloadPDF(pdfBytes, `${number}.pdf`)
  }

  return (
    <div className="flex flex-col gap-8">
      {pastQuotations.length > 0 && (
        <div>
          <h2 className="font-serif text-xl text-charcoal mb-3">Previous Quotations</h2>
          <div className="flex flex-col gap-2">
            {pastQuotations.map((q) => {
              const diverges = q.first_name !== inquiry.first_name || q.last_name !== inquiry.last_name
              return (
                <div key={q.id} className="border border-taupe/50 rounded-lg p-4 bg-white/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-sans text-charcoal">
                        NV-QTN-{String(q.sequence_number).padStart(5, '0')} · {q.quotation_date}
                      </p>
                      <p className="font-sans text-sm text-taupe">
                        LKR {Number(q.total_price).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRedownload(q)}
                      className="border border-champagne text-champagne px-3 py-1 rounded font-sans text-sm"
                    >
                      Download PDF
                    </button>
                  </div>
                  {diverges && (
                    <p className="font-sans text-xs text-taupe mt-2">
                      Addressed to a different name than currently on file ({q.first_name} {q.last_name}).
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <form onSubmit={handleGenerate} className="flex flex-col gap-4 max-w-md">
        <h2 className="font-serif text-xl text-charcoal">New Quotation</h2>

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

        {nameDiffers && (
          <p className="font-sans text-xs text-champagne -mt-2">
            This differs from the name on file for this inquiry ({inquiry.first_name} {inquiry.last_name}).
          </p>
        )}

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
