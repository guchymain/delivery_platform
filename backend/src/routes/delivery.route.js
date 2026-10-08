const express = require("express")
const router = express.Router()

const deliveryController = require("../controllers/deliveryController")
const { authenticate, optionalAuthenticate } = require("../middleware/authentication")
const authorize = require("../middleware/authorization")
const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const {
  createDeliverySchema,
  updateDeliverySchema,
  cancelDeliverySchema,
  updateDeliveryStatusSchema
} = require("../validators/delivery")
const { USER_ROLES } = require("../utils/constants")

// Customer creates delivery request
router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.CUSTOMER),
  validate(createDeliverySchema),
  deliveryController.createDelivery
)

// List deliveries (scoped by role inside controller)
router.get("/", authenticate, deliveryController.getDeliveries)

// Public/Authenticated tracking by tracking code
router.get("/track/:trackingCode", optionalAuthenticate, deliveryController.trackDelivery)

// Get single delivery detail
router.get("/:id", authenticate, validate(idParamSchema, "params"), deliveryController.getDeliveryById)

// Customer updates delivery details (allowed only while PENDING)
router.put(
  "/:id",
  authenticate,
  validate(idParamSchema, "params"),
  validate(updateDeliverySchema),
  deliveryController.updateDelivery
)

// Confirm delivery request (Customer or Admin)
router.post(
  "/:id/confirm",
  authenticate,
  validate(idParamSchema, "params"),
  deliveryController.confirmDelivery
)

// Cancel delivery request (Customer if PENDING/CONFIRMED, Admin anytime)
router.post(
  "/:id/cancel",
  authenticate,
  validate(idParamSchema, "params"),
  validate(cancelDeliverySchema),
  deliveryController.cancelDelivery
)

// Rider accepts delivery job
router.post(
  "/:id/accept",
  authenticate,
  authorize(USER_ROLES.RIDER),
  validate(idParamSchema, "params"),
  deliveryController.acceptDelivery
)

// Rider or Admin updates delivery lifecycle status (PICKED_UP, IN_TRANSIT, DELIVERED)
router.put(
  "/:id/status",
  authenticate,
  authorize(USER_ROLES.RIDER, USER_ROLES.ADMIN),
  validate(idParamSchema, "params"),
  validate(updateDeliveryStatusSchema),
  deliveryController.updateDeliveryStatus
)

module.exports = router
