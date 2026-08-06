'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateInvoicePDF } from '@/lib/generateInvoicePDF'

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

export default function InvoiceForm({ inquiry, latestQuotation, banks, pastInvoices }) {
  const router = useRouter()
  const supabase = createClient()

  const [firstName, setFirstName] = useState(inquiry.first_name)
  const [lastName, setLastName] = useState(inquiry.last_name)
  const [eventDate, setEventDate] = useState(inquiry.event_date || '')
  const [venue, setVenue] = useState(inquiry.venue || '')
  const [eventTime, setEventTime] = useState(inquiry.event_time || '')
  const [phone, setPhone] = useState(inquiry.phone || '')

  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [packageDetails, setPackageDetails] = useState(inquiry.package_type || '')
  const [packagePrice, setPackagePrice] = useState(inquiry.total_price ?? '')
  const [discount, setDiscount] = useState(inquiry.discount ?? 0)
  const [advancePayment, setAdvancePayment] = useState(inquiry.advance_payment_amount ?? 0)

  const initialBankIds = banks
    .filter((b) => latestQuotation?.banks_shown?.includes(b.details))
    .map((b) => b.id)
  const [selectedBankIds, setSelectedBankIds] = useState(initialBankIds)

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  const balance = Number(packagePrice || 0) - Number(discount || 0) - Number(advancePayment || 0)

  function toggleBank(id) {
    setSelectedBankIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    )
  }

  async function handleGenerate(e) {
    e.preventDefault()

    if (!latestQuotation) {
      setError('No quotation found for this inquiry — generate a quotation first.')
      return
    }

    setGenerating(true)
    setError(null)

    const invoiceNumber = `NV-INV-${String(latestQuotation.sequence_number).padStart(5, '0')}`
    const banksShown = banks.filter((b) => selectedBankIds.includes(b.id)).map((b) => b.details)

    const pdfBytes = await generateInvoicePDF({
      invoiceNumber,
      invoiceDate,
      firstName,
      lastName,
      eventDate,
      venue,
      eventTime: formatTime(eventTime),
      phone,
      packageDetails,
      packagePrice: Number(packagePrice),
      discount: Number(discount),
      advancePayment: Number(advancePayment),
      balance,
      banksShown,
    })

    const { error: insertError } = await supabase.from('invoices').insert({
      inquiry_id: inquiry.id,
      sequence_number: latestQuotation.sequence_number,
      invoice_date: invoiceDate,
      first_name: firstName,
      last_name: lastName,
      event_date: eventDate || null,
      venue,
      event_time: eventTime || null,
      phone,
      package_details: packageDetails,
      package_price: Number(packagePrice),
      discount: Number(discount),
      total_price: Number(packagePrice) - Number(discount),
      banks_shown: banksShown,
      advance_payment_amount: Number(advancePayment),
      balance,
    })

    if (insertError) {
      setGenerating(false)
      setError(insertError.message)
      return
    }

    const { error: updateError } = await supabase
      .from('inquiries')
      .update({ invoice_generated: true })
      .eq('id', inquiry.id)

    setGenerating(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    downloadPDF(pdfBytes, `${invoiceNumber}.pdf`)
    router.refresh()
  }

  async function handleRedownload(inv) {
    const number = `NV-INV-${String(inv.sequence_number).padStart(5, '0')}`
    const pdfBytes = await generateInvoicePDF({
      invoiceNumber: number,
      invoiceDate: inv.invoice_date,
      firstName: inv.first_name,
      lastName: inv.last_name,
      eventDate: inv.event_date,
      venue: inv.venue,
      eventTime: formatTime(inv.event_time),
      phone: inv.phone,
      packageDetails: inv.package_details,
      packagePrice: Number(inv.package_price),
      discount: Number(inv.discount),
      advancePayment: Number(inv.advance_payment_amount),
      balance: Number(inv.balance),
      banksShown: inv.banks_shown || [],
    })
    downloadPDF(pdfBytes, `${number}.pdf`)
  }

  return (
    <div className="flex flex-col gap-8">
      {pastInvoices.length > 0 && (
        <div>
          <h2 className="font-serif text-xl text-charcoal mb-3">Previous Invoices</h2>
          <div className="flex flex-col gap-2">
            {pastInvoices.map((inv) => (
              <div key={inv.id} className="border border-taupe/50 rounded-lg p-4 bg-white/40 flex items-center justify-between">
                <div>
                  <p className="font-sans text-charcoal">
                    NV-INV-{String(inv.sequence_number).padStart(5, '0')} · {inv.invoice_date}
                  </p>
                  <p className="font-sans text-sm text-taupe">
                    Balance: LKR {Number(inv.balance).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleRedownload(inv)}
                  className="border border-champagne text-champagne px-3 py-1 rounded font-sans text-sm"
                >
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleGenerate} className="flex flex-col gap-4 max-w-md">
        <h2 className="font-serif text-xl text-charcoal">New Invoice</h2>

        <label className="font-sans text-sm text-charcoal">
          First name
          <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1" />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Last name
          <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1" />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Event date
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1" />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Location
          <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1" />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Event time
          <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1" />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Contact number
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1" />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Invoice date
          <input type="date" required value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1" />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Package details
          <textarea rows={2} value={packageDetails} onChange={(e) => setPackageDetails(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1" />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Package price (LKR)
          <input type="number" step="0.01" required value={packagePrice} onChange={(e) => setPackagePrice(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1" />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Discount (LKR)
          <input type="number" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1" />
        </label>

        <label className="font-sans text-sm text-charcoal">
          Advance payment received (LKR)
          <input type="number" step="0.01" value={advancePayment} onChange={(e) => setAdvancePayment(e.target.value)}
            className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1" />
        </label>

        <div className="border border-taupe/50 rounded-lg p-4 bg-white/40">
          <p className="font-sans text-sm text-taupe">Balance</p>
          <p className="font-serif text-2xl text-charcoal">LKR {balance.toLocaleString()}</p>
        </div>

        <div className="font-sans text-sm text-charcoal">
          Bank details to show
          <div className="flex flex-col gap-2 mt-1">
            {banks.map((bank) => (
              <label key={bank.id} className="flex items-start gap-2 border border-taupe/50 rounded px-3 py-2">
                <input type="checkbox" checked={selectedBankIds.includes(bank.id)} onChange={() => toggleBank(bank.id)} className="mt-1" />
                <span className="whitespace-pre-line text-xs">{bank.details}</span>
              </label>
            ))}
            {banks.length === 0 && <p className="font-sans text-taupe text-xs">No bank details added yet.</p>}
          </div>
        </div>

        {error && <p className="text-red-600 font-sans text-sm">{error}</p>}

        <button type="submit" disabled={generating}
          className="bg-champagne text-ivory px-6 py-2 rounded font-sans disabled:opacity-50 mt-2">
          {generating ? 'Generating...' : 'Generate Invoice'}
        </button>
      </form>
    </div>
  )
}
