'use client'

import Link from 'next/link'
import { generateInvoicePDF } from '@/lib/generateInvoicePDF'
import { downloadPDF } from '@/lib/downloadPDF'
import { formatEventTime } from '@/lib/formatEventTime'

export default function CompletedPanel({ inquiry, invoices }) {
  const paidInvoice = invoices.find((inv) => Number(inv.balance) === 0)

  async function handleDownload() {
    const number = `NV-INV-${String(paidInvoice.sequence_number).padStart(5, '0')}`
    const pdfBytes = await generateInvoicePDF({
      invoiceNumber: number,
      invoiceDate: paidInvoice.invoice_date,
      firstName: paidInvoice.first_name,
      lastName: paidInvoice.last_name,
      eventDate: paidInvoice.event_date,
      venue: paidInvoice.venue,
      eventTime: formatEventTime(paidInvoice.event_time),
      phone: paidInvoice.phone,
      packageDetails: paidInvoice.package_details,
      packagePrice: Number(paidInvoice.package_price),
      discount: Number(paidInvoice.discount),
      advancePayment: Number(paidInvoice.advance_payment_amount),
      balance: Number(paidInvoice.balance),
      banksShown: paidInvoice.banks_shown || [],
    })
    downloadPDF(pdfBytes, `${number}.pdf`)
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <div className="rounded-lg p-3" style={{ background: 'linear-gradient(135deg, rgba(2,48,71,0.15), transparent)' }}>
        <p className="font-sans text-xs text-charcoal uppercase tracking-wide">Currently: Completed</p>
      </div>

      <div className="border border-taupe/50 rounded-lg p-4 bg-white/40">
        <p className="font-sans text-sm text-taupe">Event completed</p>
        <p className="font-serif text-lg text-charcoal">
          Full payment received on {inquiry.full_payment_date}
        </p>
      </div>

      {paidInvoice ? (
        <div className="border border-taupe/50 rounded-lg p-4 bg-white/40">
          <p className="font-sans text-sm text-charcoal mb-2">
            Paid invoice generated: NV-INV-{String(paidInvoice.sequence_number).padStart(5, '0')}
          </p>
          <button onClick={handleDownload} className="border border-champagne text-champagne px-3 py-1 rounded font-sans text-xs">
            Download PDF
          </button>
        </div>
      ) : (
        <Link
          href={`/dashboard/${inquiry.id}/invoice`}
          className="bg-champagne text-ivory px-6 py-2 rounded font-sans text-center"
        >
          Generate Paid Invoice
        </Link>
      )}
    </div>
  )
}
