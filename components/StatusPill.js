const STATUS_STYLES = {
  new: 'bg-status-new text-charcoal',
  contacted: 'bg-status-contacted text-ivory',
  confirmed: 'bg-status-confirmed text-ivory',
  completed: 'bg-status-completed text-ivory',
  cancelled: 'bg-red-600 text-ivory',
}

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function StatusPill({ status }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-sans font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
