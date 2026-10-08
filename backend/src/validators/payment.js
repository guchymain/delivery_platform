const { z } = require("zod")
const { PAYMENT_METHODS } = require("../utils/constants")

const recordPaymentSchema = z.object({
  paymentMethod: z.enum([
    PAYMENT_METHODS.CASH,
    PAYMENT_METHODS.CARD,
    PAYMENT_METHODS.TRANSFER
  ]),
  notes: z.string().trim().max(500).optional()
}).strict()

const refundPaymentSchema = z.object({
  reason: z.string().trim().min(3, "Refund reason is required").max(500)
}).strict()

module.exports = {
  recordPaymentSchema,
  refundPaymentSchema
}
