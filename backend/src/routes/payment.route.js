const express = require("express")
const router = express.Router()

const paymentController = require("../controllers/paymentController")
const { authenticate } = require("../middleware/authentication")
const authorize = require("../middleware/authorization")
const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const {
  recordPaymentSchema,
  refundPaymentSchema
} = require("../validators/payment")
const { USER_ROLES } = require("../utils/constants")

router.use(authenticate)

// Process or record payment for a delivery
router.post(
  "/:id/pay",
  validate(idParamSchema, "params"),
  validate(recordPaymentSchema),
  paymentController.processPayment
)

// List payments (scoped inside controller: Customer sees own, Admin sees all)
router.get("/", paymentController.getPayments)

// Get single payment details / receipt
router.get("/:id", validate(idParamSchema, "params"), paymentController.getPaymentById)

// Admin refund endpoint
router.post(
  "/:id/refund",
  authorize(USER_ROLES.ADMIN),
  validate(idParamSchema, "params"),
  validate(refundPaymentSchema),
  paymentController.refundPayment
)

module.exports = router
