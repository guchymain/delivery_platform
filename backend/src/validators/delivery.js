const { z } = require("zod")
const { phone } = require("./common")
const { PACKAGE_TYPES, PAYMENT_METHODS, DELIVERY_STATUS } = require("../utils/constants")

const createDeliverySchema = z.object({
  pickupAddress: z.string().trim().min(3, "Pickup address is required"),
  pickupContactName: z.string().trim().min(2, "Pickup contact name is required"),
  pickupContactPhone: phone,
  pickupNotes: z.string().trim().max(500).optional(),
  deliveryAddress: z.string().trim().min(3, "Delivery address is required"),
  recipientName: z.string().trim().min(2, "Recipient name is required"),
  recipientPhone: phone,
  deliveryNotes: z.string().trim().max(500).optional(),
  packageType: z
    .enum([
      PACKAGE_TYPES.DOCUMENTS,
      PACKAGE_TYPES.PARCEL,
      PACKAGE_TYPES.FOOD,
      PACKAGE_TYPES.FRAGILE,
      PACKAGE_TYPES.ELECTRONICS,
      PACKAGE_TYPES.BOX,
      PACKAGE_TYPES.OTHER
    ])
    .default(PACKAGE_TYPES.PARCEL),
  packageWeight: z.number().positive("Package weight must be positive").default(1.0),
  packageDescription: z.string().trim().max(500).optional(),
  paymentMethod: z
    .enum([PAYMENT_METHODS.CASH, PAYMENT_METHODS.CARD, PAYMENT_METHODS.TRANSFER])
    .default(PAYMENT_METHODS.CASH)
}).strict()

const updateDeliverySchema = z.object({
  pickupAddress: z.string().trim().min(3).optional(),
  pickupContactName: z.string().trim().min(2).optional(),
  pickupContactPhone: phone.optional(),
  pickupNotes: z.string().trim().max(500).optional(),
  deliveryAddress: z.string().trim().min(3).optional(),
  recipientName: z.string().trim().min(2).optional(),
  recipientPhone: phone.optional(),
  deliveryNotes: z.string().trim().max(500).optional(),
  packageType: z
    .enum([
      PACKAGE_TYPES.DOCUMENTS,
      PACKAGE_TYPES.PARCEL,
      PACKAGE_TYPES.FOOD,
      PACKAGE_TYPES.FRAGILE,
      PACKAGE_TYPES.ELECTRONICS,
      PACKAGE_TYPES.BOX,
      PACKAGE_TYPES.OTHER
    ])
    .optional(),
  packageWeight: z.number().positive().optional(),
  packageDescription: z.string().trim().max(500).optional(),
  paymentMethod: z
    .enum([PAYMENT_METHODS.CASH, PAYMENT_METHODS.CARD, PAYMENT_METHODS.TRANSFER])
    .optional()
}).strict().refine((data) => Object.keys(data).length > 0, "Provide at least one field to update")

const cancelDeliverySchema = z.object({
  reason: z.string().trim().min(3, "Cancellation reason is required").max(500)
}).strict()

const updateDeliveryStatusSchema = z.object({
  status: z.enum([
    DELIVERY_STATUS.PENDING,
    DELIVERY_STATUS.CONFIRMED,
    DELIVERY_STATUS.ASSIGNED,
    DELIVERY_STATUS.PICKED_UP,
    DELIVERY_STATUS.IN_TRANSIT,
    DELIVERY_STATUS.DELIVERED,
    DELIVERY_STATUS.CANCELLED
  ]),
  notes: z.string().trim().max(500).optional()
}).strict()

const assignRiderSchema = z.object({
  riderId: z.number().int().positive("Valid riderId is required")
}).strict()

const releaseDeliverySchema = z.object({
  reason: z.string().trim().min(3, "Release reason is required (e.g. vehicle breakdown)").max(500)
}).strict()

module.exports = {
  createDeliverySchema,
  updateDeliverySchema,
  cancelDeliverySchema,
  updateDeliveryStatusSchema,
  assignRiderSchema,
  releaseDeliverySchema
}
