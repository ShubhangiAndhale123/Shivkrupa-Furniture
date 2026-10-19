export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusColor(status) {
  const colors = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    'in progress': 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    'revision requested': 'bg-orange-100 text-orange-800 border-orange-200',
    sent: 'bg-blue-100 text-blue-800 border-blue-200',
    'under review': 'bg-purple-100 text-purple-800 border-purple-200',
    'production': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'quality check': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    ready: 'bg-teal-100 text-teal-800 border-teal-200',
    active: 'bg-green-100 text-green-800 border-green-200',
  }
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export function getInitials(name) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function generateId(prefix) {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}-${year}-${random}`
}
