const { Users, Rider_profiles } = require("../../models")
const AppError = require("../utils/appError")
const { ACCOUNT_STATUS } = require("../utils/constants")

const getProfile = async (req, res, next) => {
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
      throw new AppError("User not found", 404)
    }

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    next(error)
  }
}

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body

    const user = await Users.findByPk(req.user.id)
    if (!user) {
      throw new AppError("User not found", 404)
    }

    const updates = {}
    if (name !== undefined) updates.name = name
    if (phone !== undefined) updates.phone = phone

    await user.update(updates)

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: user.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

const deactivateAccount = async (req, res, next) => {
  try {
    const user = await Users.findByPk(req.user.id)
    if (!user) {
      throw new AppError("User not found", 404)
    }

    await user.update({ status: ACCOUNT_STATUS.INACTIVE })

    res.status(200).json({
      success: true,
      message: "Your account has been deactivated successfully"
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getProfile,
  updateProfile,
  deactivateAccount
}
