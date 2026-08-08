import { google } from 'googleapis'
import { Readable } from 'stream'
import { createClient } from '@/lib/supabase/server'
import { getGoogleAuth } from '@/lib/googleAuth'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { filename, pdfBase64 } = await request.json()

  if (!filename || !pdfBase64) {
    return Response.json({ error: 'Missing filename or pdfBase64' }, { status: 400 })
  }

  const auth = getGoogleAuth(['https://www.googleapis.com/auth/drive'])
  const drive = google.drive({ version: 'v3', auth })

  const buffer = Buffer.from(pdfBase64, 'base64')
  const stream = Readable.from(buffer)

  await drive.files.create({
    requestBody: {
      name: filename,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    },
    media: {
      mimeType: 'application/pdf',
      body: stream,
    },
  })

  return Response.json({ success: true })
}
