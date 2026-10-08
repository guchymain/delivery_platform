const express = require("express")
const router = express.Router()

const adminController = require("../controllers/adminController")
const { authenticate } = require("../middleware/authentication")
const authorize = require("../middleware/authorization")
const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const {
  updateUserStatusSchema,
  updateUserSchema
} = require("../validators/admin")
const { assignRiderSchema } = require("../validators/delivery")
const { USER_ROLES } = require("../utils/constants")

// All admin routes require ADMIN role
router.use(authenticate, authorize(USER_ROLES.ADMIN))

// Overview / metrics
router.get("/overview", adminController.getOverview)

// User management
router.get("/users", adminController.getUsers)
router.get("/users/:id", validate(idParamSchema, "params"), adminController.getUserById)
router.put("/users/:id/status", validate(idParamSchema, "params"), validate(updateUserStatusSchema), adminController.updateUserStatus)
router.put("/users/:id", validate(idParamSchema, "params"), validate(updateUserSchema), adminController.updateUser)
router.delete("/users/:id", validate(idParamSchema, "params"), adminController.deleteUser)

// Rider fleet management
router.get("/riders", adminController.getRiders)

// Delivery assignment dispatch
router.put("/deliveries/:id/assign", validate(idParamSchema, "params"), validate(assignRiderSchema), adminController.assignRider)

module.exports = router
