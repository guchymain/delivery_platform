const express = require("express")
const router = express.Router()

const riderController = require("../controllers/riderController")
const { authenticate } = require("../middleware/authentication")
const authorize = require("../middleware/authorization")
const { validate } = require("../middleware/validate")
const {
  updateAvailabilitySchema,
  updateRiderProfileSchema
} = require("../validators/rider")
const { USER_ROLES } = require("../utils/constants")

router.use(authenticate, authorize(USER_ROLES.RIDER))

// Rider profile endpoints
router.get("/profile", riderController.getRiderProfile)
router.put("/profile", validate(updateRiderProfileSchema), riderController.updateRiderProfile)

// Rider availability toggle
router.put("/availability", validate(updateAvailabilitySchema), riderController.updateAvailability)

// Browse unassigned confirmed jobs
router.get("/available-jobs", riderController.getAvailableJobs)

// Delivery history & stats
router.get("/history", riderController.getRiderHistory)

module.exports = router
