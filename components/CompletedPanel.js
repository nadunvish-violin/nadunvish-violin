import Link from 'next/link'

export default function CompletedPanel({ inquiry, invoices }) {
  const paidInvoice = invoices.find((inv) => Number(inv.balance) === 0)

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <div className="border border-taupe/50 rounded-lg p-4 bg-white/40">
        <p className="font-sans text-sm text-taupe">Event completed</p>
        <p className="font-serif text-lg text-charcoal">
          Full payment received on {inquiry.full_payment_date}
        </p>
      </div>

      {paidInvoice ? (
        <div className="border border-taupe/50 rounded-lg p-4 bg-white/40">
          <p className="font-sans text-sm text-charcoal">
            Paid invoice generated: NV-INV-{String(paidInvoice.sequence_number).padStart(5, '0')}
          </p>
          <Link href={`/dashboard/${inquiry.id}/invoice`} className="font-sans text-xs text-champagne underline">
            View / download
          </Link>
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
