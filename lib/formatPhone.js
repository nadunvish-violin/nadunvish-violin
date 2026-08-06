export function normalizePhone(input) {
  if (!input) return input
  let cleaned = input.replace(/[\s-]/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '+94' + cleaned.slice(1)
  }
  return cleaned
}

export function getWhatsAppNumber(phone) {
  if (!phone) return ''
  let cleaned = phone.replace(/[\s-]/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '94' + cleaned.slice(1)
  }
  return cleaned.replace(/^\+/, '')
}
