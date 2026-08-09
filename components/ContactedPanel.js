'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import CancelForm from '@/components/CancelForm'

export default function ContactedPanel({ inquiry, packages, quotations }) {
  const router = useRouter()
  const supabase = createClient()

  const [packageType, setPackageType] = useState(inquiry.package_type || '')
  const [totalPrice, setTotalPrice] = useState(inquiry.total_price ?? '')
  const [discount, setDiscount] = useState(inquiry.discount ?? 0)
  const [advanceAmount, setAdvanceAmount] = useState(inquiry.advance_payment_amount ?? '')
  const [advanceDate, setAdvanceDate] = useState(inquiry.advance_payment_date || '')

  const [saving, setSaving] = useState(false)
  const [showCancel, setShowCancel] = useState(false)

  function handlePackageSelect(e) {
    const selected = packages.find((p) => p.id === e.target.value)
    if (selected) {
      setPackageType(selected.details)
      setTotalPrice(selected.price)
    }
  }

  async function saveChanges() {
    if (advanceAmount !== '' && Number(advanceAmount) > 0 && !advanceDate) {
      alert('Please set the advance payment date before saving.')
      return
    }

    setSaving(true)

    const fields = {
      package_type: packageType || null,
      total_price: totalPrice === '' ? null : Number(totalPrice),
      discount: discount === '' ? 0 : Number(discount),
      advance_payment_amount: advanceAmount === '' ? null : Number(advanceAmount),
      advance_payment_date: advanceDate || null,
    }

    if (
      fields.total_price !== null &&
      fields.advance_payment_amount !== null &&
      fields.advance_payment_amount >= fields.total_price - fields.discount
    ) {
      fields.full_payment_date = advanceDate || null
    }

    const { error } = await supabase
      .from('inquiries')
      .update(fields)
      .eq('id', inquiry.id)

    setSaving(false)

    if (error) {
      alert('Something went wrong: ' + error.message)
      return
    }

    router.refresh()
  }

  async function handleGenerateQuotation() {
    await saveChanges()
    router.push(`/dashboard/${inquiry.id}/quotation`)
  }

  async function handleMoveToConfirmed() {
    const { error } = await supabase
      .from('inquiries')
      .update({ status: 'confirmed' })
      .eq('id', inquiry.id)

    if (error) {
      alert('Something went wrong: ' + error.message)
      return
    }

    router.refresh()
  }

  if (showCancel) {
    return <CancelForm inquiry={inquiry} onBack={() => setShowCancel(false)} />
  }

  const canGenerateQuotation = packageType !== '' && totalPrice !== ''
  const canMoveToConfirmed = inquiry.quotation_generated && advanceAmount !== '' && Number(advanceAmount) > 0
  const latestQuotation = quotations[0]

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <div className="rounded-lg p-3" style={{ background: 'linear-gradient(135deg, rgba(150,131,236,0.2), transparent)' }}>
        <p className="font-sans text-xs text-charcoal uppercase tracking-wide">Currently: Contacted</p>
      </div>

      {quotations.length > 0 && (
        <div className="border border-taupe/50 rounded-lg p-4 bg-white/40">
          <p className="font-sans text-sm text-charcoal">
            {quotations.length} {quotations.length === 1 ? 'quotation' : 'quotations'} generated
          </p>
          <p className="font-sans text-xs text-taupe">
            Latest: NV-QTN-{String(latestQuotation.sequence_number).padStart(5, '0')} · LKR {Number(latestQuotation.total_price).toLocaleString()}
          </p>
          <Link href={`/dashboard/${inquiry.id}/quotation`} className="font-sans text-xs text-champagne underline">
            View full history
          </Link>
        </div>
      )}

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
        Total price (LKR)
        <input
          type="number"
          step="0.01"
          value={totalPrice}
          disabled={!packageType}
          onChange={(e) => setTotalPrice(e.target.value)}
          className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1 disabled:opacity-50 disabled:bg-taupe/10"
        />
        {!packageType && (
          <span className="text-xs text-taupe">Select a package first</span>
        )}
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

      <label className="font-sans text-sm text-charcoal">
        Advance payment (LKR)
        <input
          type="number"
          step="0.01"
          value={advanceAmount}
          onChange={(e) => setAdvanceAmount(e.target.value)}
          className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
        />
      </label>

      <label className="font-sans text-sm text-charcoal">
        Advance payment date
        <input
          type="date"
          max={new Date().toISOString().split('T')[0]}
          value={advanceDate}
          onChange={(e) => setAdvanceDate(e.target.value)}
          className="border border-taupe rounded px-4 py-2 font-sans text-charcoal w-full mt-1"
        />
      </label>

      <button
        onClick={saveChanges}
        disabled={saving}
        className="border border-champagne text-champagne px-6 py-2 rounded font-sans disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      <div className="border-t border-taupe/50 pt-4 flex flex-col gap-3">
        <button
          onClick={handleGenerateQuotation}
          disabled={!canGenerateQuotation || saving}
          className="bg-champagne text-ivory px-6 py-2 rounded font-sans disabled:opacity-50"
        >
          Generate Quotation
        </button>
        {!canGenerateQuotation && (
          <p className="font-sans text-taupe text-xs">Select a package and set a price first.</p>
        )}

        <button
          onClick={handleMoveToConfirmed}
          disabled={!canMoveToConfirmed}
          className="bg-green-700 text-ivory px-6 py-2 rounded font-sans disabled:opacity-50"
        >
          Move to Confirmed
        </button>
        {!canMoveToConfirmed && (
          <p className="font-sans text-taupe text-xs">Generate a quotation and set an advance payment first.</p>
        )}

        <button
          onClick={() => setShowCancel(true)}
          className="border border-red-600 text-red-600 px-6 py-2 rounded font-sans"
        >
          Cancel Inquiry
        </button>
      </div>
    </div>
  )
}
