const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { Users, Rider_profiles, sequelize } = require("../../models")
const AppError = require("../utils/appError")
const { USER_ROLES, ACCOUNT_STATUS, RIDER_AVAILABILITY } = require("../utils/constants")

const register = async (req, res, next) => {
  const transaction = await sequelize.transaction()
  try {
    const {
      name,
      email,
      phone,
      password,
      role = USER_ROLES.CUSTOMER,
      vehicleType,
      plateNumber,
      licenseNumber
    } = req.body

    // Security check: prohibit admin registration
    if (role === USER_ROLES.ADMIN) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "Admin registration is strictly prohibited"
      })
    }

    const existingUser = await Users.findOne({ where: { email }, transaction })
    if (existingUser) {
      await transaction.rollback()
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists"
      })
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS)
    )

    const newUser = await Users.create(
      {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        status: ACCOUNT_STATUS.ACTIVE
      },
      { transaction }
    )

    let riderProfile = null
    if (role === USER_ROLES.RIDER) {
      riderProfile = await Rider_profiles.create(
        {
          userId: newUser.id,
          vehicleType: vehicleType || "MOTORCYCLE",
          plateNumber: plateNumber || null,
          licenseNumber: licenseNumber || null,
          availabilityStatus: RIDER_AVAILABILITY.OFFLINE,
          rating: 5.0,
          totalDeliveries: 0
        },
        { transaction }
      )
    }

    await transaction.commit()

    const token = jwt.sign(
      {
        id: newUser.id,
        role: newUser.role,
        email: newUser.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    )

    const userResponse = newUser.toJSON()
    if (riderProfile) {
      userResponse.riderProfile = riderProfile
    }

    return res.status(201).json({
      success: true,
      message: `${role} registered successfully`,
      user: userResponse,
      token
    })
  } catch (error) {
    if (transaction) await transaction.rollback()
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await Users.findOne({
      where: { email },
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
        message: "Invalid email or password"
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      })
    }

    // Account status check
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

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    )

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: user.toJSON(),
      token
    })
  } catch (error) {
    next(error)
  }
}

const getMe = async (req, res, next) => {
  try {
    const user = await Users.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Rider_profiles,
          as: "riderProfile"
        }
      ]
    })

    if (!user) {
      throw new AppError("User no longer exists", 401)
    }

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    next(error)
  }
}

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await Users.findByPk(req.user.id)
    if (!user) {
      throw new AppError("User not found", 404)
    }

    const match = await bcrypt.compare(currentPassword, user.password)
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password"
      })
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(process.env.SALT_ROUNDS)
    )

    await user.update({ password: hashedPassword })

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  register,
  login,
  getMe,
  changePassword
}
