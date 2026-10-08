const express = require("express")
const router = express.Router()

const userController = require("../controllers/userController")
const { authenticate } = require("../middleware/authentication")
const { validate } = require("../middleware/validate")
const { updateProfileSchema } = require("../validators/user")

router.use(authenticate)

router.get("/profile", userController.getProfile)
router.put("/profile", validate(updateProfileSchema), userController.updateProfile)
router.post("/deactivate", userController.deactivateAccount)

module.exports = router
