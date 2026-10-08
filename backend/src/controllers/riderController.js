const { Op } = require("sequelize")
const {
  Rider_profiles,
  Users,
  Deliveries,
  Payments
} = require("../../models")
const AppError = require("../utils/appError")
const {
  RIDER_AVAILABILITY,
  DELIVERY_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS
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

    // Safety rule: Cannot manually select BUSY (managed automatically by job dispatch)
    if (availabilityStatus === RIDER_AVAILABILITY.BUSY) {
      return res.status(400).json({
        success: false,
        message: "Riders cannot manually select 'BUSY'. The system assigns BUSY status upon accepting a delivery job."
      })
    }

    // Safety rule: Cannot manually go OFFLINE while actively handling a delivery job
    if (availabilityStatus === RIDER_AVAILABILITY.OFFLINE) {
      const activeDeliveryCount = await Deliveries.count({
        where: {
          riderId: riderUserId,
          status: {
            [Op.in]: [DELIVERY_STATUS.ASSIGNED, DELIVERY_STATUS.PICKED_UP, DELIVERY_STATUS.IN_TRANSIT]
          }
        }
      })

      if (activeDeliveryCount > 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot switch to OFFLINE while actively handling a delivery job. Complete or release your active job first."
        })
      }
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

// 4. View available delivery jobs (CONFIRMED & unassigned & pre-paid/COD ready)
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
          where: {
            [Op.or]: [
              { paymentMethod: PAYMENT_METHODS.CASH },
              { paymentStatus: PAYMENT_STATUS.SUCCESSFUL }
            ]
          },
          attributes: ["paymentMethod", "paymentStatus", "amount"]
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
