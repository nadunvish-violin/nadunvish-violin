import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function generateQuotationPDF(data) {
  const {
    quotationNumber,
    quotationDate,
    firstName,
    lastName,
    eventDate,
    venue,
    eventTime,
    phone,
    packageDetails,
    packagePrice,
    discount,
    totalPrice,
    banksShown,
  } = data

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842])
  const { width, height } = page.getSize()

  const serif = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const serifBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  const sans = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const sansBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const charcoal = rgb(0.169, 0.164, 0.157)
  const champagne = rgb(0.722, 0.576, 0.373)
  const taupe = rgb(0.788, 0.761, 0.706)
  const white = rgb(1, 1, 1)

  const formatMoney = (n) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2 })

  let y = height - 60

  page.drawText('Nadun Vish', { x: 50, y, size: 24, font: serif, color: charcoal })
  page.drawText('QUOTATION', { x: width - 210, y, size: 26, font: serifBold, color: charcoal })
  y -= 18
  page.drawText('Let a violin speak for your celebration', { x: 50, y, size: 9, font: sans, color: taupe })

  y -= 50
  page.drawText('Quotation to:', { x: 50, y, size: 11, font: sansBold, color: charcoal })
  page.drawText(`${firstName} ${lastName}`, { x: 145, y, size: 11, font: sans, color: charcoal })
  page.drawText('Quotation#', { x: 350, y, size: 11, font: sans, color: charcoal })
  page.drawText(quotationNumber, { x: width - 130, y, size: 11, font: sans, color: charcoal })

  y -= 20
  page.drawText('Date', { x: 350, y, size: 11, font: sans, color: charcoal })
  page.drawText(quotationDate, { x: width - 130, y, size: 11, font: sans, color: charcoal })

  y -= 25
  page.drawText('Event Date:', { x: 50, y, size: 11, font: sansBold, color: charcoal })
  page.drawText(eventDate || '-', { x: 145, y, size: 11, font: sans, color: charcoal })

  y -= 20
  page.drawText('Event Location:', { x: 50, y, size: 11, font: sansBold, color: charcoal })
  page.drawText(venue || '-', { x: 165, y, size: 11, font: sans, color: charcoal })

  y -= 20
  page.drawText('Event Time:', { x: 50, y, size: 11, font: sansBold, color: charcoal })
  page.drawText(eventTime || '-', { x: 145, y, size: 11, font: sans, color: charcoal })

  y -= 20
  page.drawText('Contact Number:', { x: 50, y, size: 11, font: sansBold, color: charcoal })
  page.drawText(phone || '-', { x: 170, y, size: 11, font: sans, color: charcoal })

  y -= 35
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: taupe })
  y -= 18
  page.drawText('Item', { x: 50, y, size: 11, font: sansBold, color: charcoal })
  page.drawText('Total (LKR)', { x: width - 150, y, size: 11, font: sansBold, color: charcoal })
  y -= 10
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: taupe })

  y -= 22
  page.drawText(packageDetails, { x: 50, y, size: 10, font: sans, color: charcoal, maxWidth: 370 })
  page.drawText(formatMoney(packagePrice), { x: width - 150, y, size: 10, font: sans, color: charcoal })

  if (discount > 0) {
    y -= 22
    page.drawText('-Discount', { x: 50, y, size: 10, font: sans, color: charcoal })
    page.drawText(formatMoney(discount), { x: width - 150, y, size: 10, font: sans, color: charcoal })
  }

  y -= 15
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: taupe })

  y -= 40
  page.drawText('TOTAL', { x: width - 230, y, size: 14, font: sansBold, color: charcoal })
  page.drawText(formatMoney(totalPrice), { x: width - 150, y, size: 14, font: sansBold, color: charcoal })
  y -= 5
  page.drawLine({ start: { x: width - 230, y }, end: { x: width - 50, y }, thickness: 1, color: charcoal })

  y -= 50
  page.drawText('PAYMENT METHOD', { x: 50, y, size: 11, font: sansBold, color: charcoal })
  y -= 20
  for (const bank of banksShown) {
    const lines = bank.split('\n')
    for (const line of lines) {
      page.drawText(line, { x: 50, y, size: 10, font: sans, color: charcoal })
      y -= 16
    }
    y -= 8
  }

  y -= 15
  page.drawText('Thank you for considering us!', { x: 50, y, size: 12, font: serif, color: charcoal })

  page.drawRectangle({ x: 0, y: 0, width, height: 40, color: champagne })
  page.drawText('+94704203682 / +94726970582', { x: 50, y: 15, size: 11, font: sans, color: white })

  return pdfDoc.save()
}
