const jwt = require("jsonwebtoken")
const { Users, Rider_profiles } = require("../../models")
const { ACCOUNT_STATUS } = require("../utils/constants")

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Verify user exists and check current account status
    const user = await Users.findByPk(decoded.id, {
      include: [
        {
          model: Rider_profiles,
          as: "riderProfile"
        }
      ]
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      })
    }

    if (user.status === ACCOUNT_STATUS.SUSPENDED) {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact support."
      })
    }

    if (user.status === ACCOUNT_STATUS.INACTIVE) {
      return res.status(403).json({
        success: false,
        message: "Your account is currently inactive."
      })
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      riderProfile: user.riderProfile
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === "TokenExpiredError" ? "Token has expired" : "Invalid token"
    })
  }
}

// Optional authentication middleware: if token is present, verify and attach user
const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next()
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await Users.findByPk(decoded.id, {
      include: [
        {
          model: Rider_profiles,
          as: "riderProfile"
        }
      ]
    })

    if (user && user.status === ACCOUNT_STATUS.ACTIVE) {
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        riderProfile: user.riderProfile
      }
    }
  } catch {
    // Ignore invalid optional tokens
  }

  next()
}

module.exports = { authenticate, optionalAuthenticate }
