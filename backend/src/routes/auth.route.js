const express = require("express")
const router = express.Router()

const authController = require("../controllers/authController")
const { validate } = require("../middleware/validate")
const { authenticate } = require("../middleware/authentication")
const { authLimiter } = require("../middleware/rateLimiter")
const {
  registerSchema,
  loginSchema,
  changePasswordSchema
} = require("../validators/auth")

router.post("/register", authLimiter, validate(registerSchema), authController.register)
router.post("/login", authLimiter, validate(loginSchema), authController.login)
router.get("/me", authenticate, authController.getMe)
router.put("/password", authenticate, validate(changePasswordSchema), authController.changePassword)

module.exports = router
