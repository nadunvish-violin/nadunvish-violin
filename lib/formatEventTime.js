export function formatEventTime(timeString) {
  if (!timeString) return ''
  const [hours, minutes] = timeString.split(':')
  const h = parseInt(hours, 10)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHour = h % 12 === 0 ? 12 : h % 12
  return `${displayHour}:${minutes} ${period}`
}
