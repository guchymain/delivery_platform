const crypto = require("crypto")
const { VALID_DELIVERY_TRANSITIONS } = require("./constants")

const generateTrackingCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = crypto.randomBytes(3).toString("hex").toUpperCase()
  return `DEL-${timestamp}-${random}`
}

const generateTransactionReference = () => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = crypto.randomBytes(3).toString("hex").toUpperCase()
  return `TXN-${timestamp}-${random}`
}

/**
 * Calculates delivery fee based on package weight.
 * Base fee: $5.00 (covers up to 1 kg)
 * Additional fee: $1.50 per kg above 1 kg
 */
const calculateDeliveryFee = (weightKg = 1) => {
  const baseFee = 5.0
  const weight = Math.max(0, Number(weightKg) || 0)

  if (weight <= 1) {
    return Number(baseFee.toFixed(2))
  }

  const additionalWeight = weight - 1
  const extraFee = additionalWeight * 1.5
  return Number((baseFee + extraFee).toFixed(2))
}

const isValidTransition = (currentStatus, newStatus) => {
  const allowed = VALID_DELIVERY_TRANSITIONS[currentStatus] || []
  return allowed.includes(newStatus)
}

/**
 * Masks phone number for public display (e.g. "+234 80****1234" or "080****5678")
 */
const maskPhoneNumber = (phone) => {
  if (!phone || typeof phone !== "string") return "N/A"
  const clean = phone.trim()
  if (clean.length <= 4) return "****"
  const start = clean.slice(0, clean.length >= 8 ? 4 : 2)
  const end = clean.slice(-4)
  return `${start}****${end}`
}

module.exports = {
  generateTrackingCode,
  generateTransactionReference,
  calculateDeliveryFee,
  isValidTransition,
  maskPhoneNumber
}

