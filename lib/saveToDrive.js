function uint8ArrayToBase64(bytes) {
  let binary = ''
  const chunkSize = 8192
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

export async function saveToDrive(pdfBytes, filename) {
  try {
    const pdfBase64 = uint8ArrayToBase64(pdfBytes)
    await fetch('/api/save-to-drive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, pdfBase64 }),
    })
  } catch (err) {
    console.error('Failed to save PDF to Drive:', err)
  }
}
