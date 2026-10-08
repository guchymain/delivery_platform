const {
  Rider_profiles,
  Users,
  Deliveries,
  Payments
} = require("../../models")
const AppError = require("../utils/appError")
const {
  RIDER_AVAILABILITY,
  DELIVERY_STATUS
} = require("../utils/constants")

// 1. Get rider profile & statistics
const getRiderProfile = async (req, res, next) => {
  try {
    const riderUserId = req.user.id

    const profile = await Rider_profiles.findOne({
      where: { userId: riderUserId },
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["id", "name", "email", "phone", "status"]
        }
      ]
    })

    if (!profile) {
      throw new AppError("Rider profile not found", 404)
    }

    res.status(200).json({
      success: true,
      profile
    })
  } catch (error) {
    next(error)
  }
}

// 2. Update rider vehicle profile
const updateRiderProfile = async (req, res, next) => {
  try {
    const riderUserId = req.user.id
    const { vehicleType, plateNumber, licenseNumber } = req.body

    const profile = await Rider_profiles.findOne({
      where: { userId: riderUserId }
    })

    if (!profile) {
      throw new AppError("Rider profile not found", 404)
    }

    await profile.update({
      vehicleType: vehicleType !== undefined ? vehicleType : profile.vehicleType,
      plateNumber: plateNumber !== undefined ? plateNumber : profile.plateNumber,
      licenseNumber: licenseNumber !== undefined ? licenseNumber : profile.licenseNumber
    })

    res.status(200).json({
      success: true,
      message: "Rider profile updated successfully",
      profile
    })
  } catch (error) {
    next(error)
  }
}

// 3. Update rider availability (AVAILABLE, OFFLINE)
const updateAvailability = async (req, res, next) => {
  try {
    const riderUserId = req.user.id
    const { availabilityStatus } = req.body

    const profile = await Rider_profiles.findOne({
      where: { userId: riderUserId }
    })

    if (!profile) {
      throw new AppError("Rider profile not found", 404)
    }

    // Safety rule: Cannot manually change availability while BUSY
    if (profile.availabilityStatus === RIDER_AVAILABILITY.BUSY) {
      return res.status(400).json({
        success: false,
        message: "Cannot change availability status while actively handling a delivery job ('BUSY'). Complete or reassign the delivery first."
      })
    }

    await profile.update({ availabilityStatus })

    res.status(200).json({
      success: true,
      message: `Availability updated to ${availabilityStatus}`,
      profile
    })
  } catch (error) {
    next(error)
  }
}

// 4. View available delivery jobs (CONFIRMED & unassigned)
const getAvailableJobs = async (req, res, next) => {
  try {
    const jobs = await Deliveries.findAll({
      where: {
        status: DELIVERY_STATUS.CONFIRMED,
        riderId: null
      },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: Users,
          as: "customer",
          attributes: ["id", "name", "phone"]
        },
        {
          model: Payments,
          as: "payment",
          attributes: ["paymentMethod", "paymentStatus"]
        }
      ]
    })

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    })
  } catch (error) {
    next(error)
  }
}

// 5. View rider delivery history & earnings stats
const getRiderHistory = async (req, res, next) => {
  try {
    const riderUserId = req.user.id
    const { status, limit = 50, offset = 0 } = req.query

    const where = { riderId: riderUserId }
    if (status) {
      where.status = status
    }

    const { count, rows: deliveries } = await Deliveries.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Users,
          as: "customer",
          attributes: ["id", "name", "phone"]
        },
        {
          model: Payments,
          as: "payment"
        }
      ]
    })

    // Calculate rider performance metrics
    const completedCount = await Deliveries.count({
      where: {
        riderId: riderUserId,
        status: DELIVERY_STATUS.DELIVERED
      }
    })

    const profile = await Rider_profiles.findOne({ where: { userId: riderUserId } })

    res.status(200).json({
      success: true,
      summary: {
        totalAssigned: count,
        totalCompleted: completedCount,
        rating: profile?.rating || 5.0,
        availabilityStatus: profile?.availabilityStatus || RIDER_AVAILABILITY.OFFLINE
      },
      deliveries
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getRiderProfile,
  updateRiderProfile,
  updateAvailability,
  getAvailableJobs,
  getRiderHistory
}
