export const BASE_DELIVERY_FEE = 5.0
export const ADDITIONAL_FEE_PER_KG = 1.5

/**
 * Calculates delivery fee based on package weight.
 * Base fee: $5.00 (up to 1 kg)
 * Additional fee: $1.50 per kg above 1 kg
 */
export const calculateDeliveryFee = (weightKg = 1) => {
  const baseFee = BASE_DELIVERY_FEE
  const weight = Math.max(0, Number(weightKg) || 0)
  if (weight <= 1) return Number(baseFee.toFixed(2))
  const additionalWeight = weight - 1
  const extraFee = additionalWeight * ADDITIONAL_FEE_PER_KG
  return Number((baseFee + extraFee).toFixed(2))
}

export const calculateEstimatedFee = calculateDeliveryFee

export const formatCurrency = (amount) => {
  const num = Number(amount) || 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

export const formatNaira = (amountInUSD) => {
  const numUSD = Number(amountInUSD) || 0
  // Standard conversion rate of ₦1,500 / USD for Nigerian customer clarity
  const naira = numUSD * 1500
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(naira)
}

export const getPaymentStatus = (delivery) => {
  if (!delivery) return 'PENDING'
  if (delivery.status === 'DELIVERED') return 'SUCCESSFUL'
  return (
    delivery.payment?.paymentStatus ||
    delivery.payment?.status ||
    delivery.paymentStatus ||
    delivery.payment_status ||
    delivery.payments?.[0]?.paymentStatus ||
    delivery.payments?.[0]?.status ||
    'PENDING'
  )
}

export const getPaymentMethod = (delivery) => {
  if (!delivery) return 'CASH'
  return (
    delivery.payment?.paymentMethod ||
    delivery.payment?.method ||
    delivery.paymentMethod ||
    delivery.payment_method ||
    delivery.payments?.[0]?.paymentMethod ||
    delivery.payments?.[0]?.method ||
    'CASH'
  )
}

export const STATUS_STEPS = [
  'PENDING',
  'CONFIRMED',
  'ASSIGNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED'
]

export const VALID_DELIVERY_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['PICKED_UP', 'CONFIRMED', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: []
}

export const isValidTransition = (currentStatus, newStatus) => {
  const allowed = VALID_DELIVERY_TRANSITIONS[currentStatus] || []
  return allowed.includes(newStatus)
}

export const formatDate = (dateString) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

export const formatRelativeTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMinutes = Math.floor((now - date) / 60000)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return formatDate(dateString)
}

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}
