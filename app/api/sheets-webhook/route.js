import { google } from 'googleapis'
import { getGoogleAuth } from '@/lib/googleAuth'

function buildRow(record) {
  return [
    record.id,
    `${record.first_name} ${record.last_name}`,
    record.email,
    record.phone,
    record.event_type,
    record.event_date,
    record.venue,
    record.status,
    record.package_type || '',
    record.total_price ?? '',
    record.discount ?? '',
    record.advance_payment_amount ?? '',
    record.advance_payment_date || '',
    record.full_payment_date || '',
    record.quotation_generated ? 'Yes' : 'No',
    record.invoice_generated ? 'Yes' : 'No',
    record.created_at,
  ]
}

export async function POST(request) {
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await request.json()
  const record = payload.record

  if (!record) {
    return Response.json({ error: 'No record in payload' }, { status: 400 })
  }

  const auth = getGoogleAuth(['https://www.googleapis.com/auth/spreadsheets'])
  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:A',
  })

  const ids = existing.data.values || []
  const rowIndex = ids.findIndex((row) => row[0] === record.id)
  const rowValues = buildRow(record)

  if (rowIndex === -1) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:Q',
      valueInputOption: 'RAW',
      requestBody: { values: [rowValues] },
    })
  } else {
    const sheetRowNumber = rowIndex + 1
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A${sheetRowNumber}:Q${sheetRowNumber}`,
      valueInputOption: 'RAW',
      requestBody: { values: [rowValues] },
    })
  }

  return Response.json({ success: true })
}
