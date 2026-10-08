const { Op } = require("sequelize")
const {
  Users,
  Rider_profiles,
  Deliveries,
  Payments,
  Delivery_status_logs,
  sequelize
} = require("../../models")
const AppError = require("../utils/appError")
const {
  USER_ROLES,
  ACCOUNT_STATUS,
  RIDER_AVAILABILITY,
  DELIVERY_STATUS,
  PAYMENT_STATUS
} = require("../utils/constants")

// 1. Platform overview & dashboard metrics
const getOverview = async (req, res, next) => {
  try {
    const totalUsers = await Users.count()
    const customerCount = await Users.count({ where: { role: USER_ROLES.CUSTOMER } })
    const riderCount = await Users.count({ where: { role: USER_ROLES.RIDER } })
    const adminCount = await Users.count({ where: { role: USER_ROLES.ADMIN } })

    const availableRiders = await Rider_profiles.count({
      where: { availabilityStatus: RIDER_AVAILABILITY.AVAILABLE }
    })
    const busyRiders = await Rider_profiles.count({
      where: { availabilityStatus: RIDER_AVAILABILITY.BUSY }
    })
    const offlineRiders = await Rider_profiles.count({
      where: { availabilityStatus: RIDER_AVAILABILITY.OFFLINE }
    })

    const totalDeliveries = await Deliveries.count()
    const pendingDeliveries = await Deliveries.count({ where: { status: DELIVERY_STATUS.PENDING } })
    const confirmedDeliveries = await Deliveries.count({ where: { status: DELIVERY_STATUS.CONFIRMED } })
    const inTransitDeliveries = await Deliveries.count({
      where: { status: { [Op.in]: [DELIVERY_STATUS.ASSIGNED, DELIVERY_STATUS.PICKED_UP, DELIVERY_STATUS.IN_TRANSIT] } }
    })
    const completedDeliveries = await Deliveries.count({ where: { status: DELIVERY_STATUS.DELIVERED } })
    const cancelledDeliveries = await Deliveries.count({ where: { status: DELIVERY_STATUS.CANCELLED } })

    const totalRevenue = await Payments.sum("amount", {
      where: { paymentStatus: PAYMENT_STATUS.SUCCESSFUL }
    })

    res.status(200).json({
      success: true,
      metrics: {
        users: {
          total: totalUsers,
          customers: customerCount,
          riders: riderCount,
          admins: adminCount
        },
        ridersFleet: {
          total: riderCount,
          available: availableRiders,
          busy: busyRiders,
          offline: offlineRiders
        },
        deliveries: {
          total: totalDeliveries,
          pending: pendingDeliveries,
          confirmed: confirmedDeliveries,
          active: inTransitDeliveries,
          delivered: completedDeliveries,
          cancelled: cancelledDeliveries
        },
        financials: {
          totalRevenue: Number((totalRevenue || 0).toFixed(2))
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

// 2. List all users with filtering
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search, limit = 50, offset = 0 } = req.query

    const where = {}
    if (role) where.role = role
    if (status) where.status = status
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ]
    }

    const { count, rows: users } = await Users.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Rider_profiles,
          as: "riderProfile"
        }
      ]
    })

    res.status(200).json({
      success: true,
      total: count,
      users
    })
  } catch (error) {
    next(error)
  }
}

// 3. Get single user details
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await Users.findByPk(id, {
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

    // Include statistics
    const customerOrdersCount = await Deliveries.count({ where: { customerId: id } })
    const riderJobsCount = await Deliveries.count({ where: { riderId: id } })

    res.status(200).json({
      success: true,
      user,
      stats: {
        customerOrders: customerOrdersCount,
        riderJobs: riderJobsCount
      }
    })
  } catch (error) {
    next(error)
  }
}

// 4. Update user account status (ACTIVE, INACTIVE, SUSPENDED)
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const user = await Users.findByPk(id)
    if (!user) {
      throw new AppError("User not found", 404)
    }

    // Prevent admin from suspending themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change the status of your own administrator account"
      })
    }

    await user.update({ status })

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      user: user.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

// 5. Update user details
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, phone, role, status } = req.body

    const user = await Users.findByPk(id)
    if (!user) {
      throw new AppError("User not found", 404)
    }

    const updates = {}
    if (name !== undefined) updates.name = name
    if (phone !== undefined) updates.phone = phone
    if (role !== undefined) updates.role = role
    if (status !== undefined) updates.status = status

    await user.update(updates)

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: user.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

// 6. Delete user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params

    if (Number(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own administrator account"
      })
    }

    const user = await Users.findByPk(id)
    if (!user) {
      throw new AppError("User not found", 404)
    }

    await user.destroy()

    res.status(200).json({
      success: true,
      message: `User ${user.name} deleted successfully`
    })
  } catch (error) {
    next(error)
  }
}

// 7. List all riders with fleet status
const getRiders = async (req, res, next) => {
  try {
    const { availability, status, search } = req.query

    const userWhere = { role: USER_ROLES.RIDER }
    if (status) userWhere.status = status
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ]
    }

    const profileWhere = {}
    if (availability) profileWhere.availabilityStatus = availability

    const riders = await Users.findAll({
      where: userWhere,
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Rider_profiles,
          as: "riderProfile",
          where: Object.keys(profileWhere).length ? profileWhere : undefined
        }
      ]
    })

    res.status(200).json({
      success: true,
      count: riders.length,
      riders
    })
  } catch (error) {
    next(error)
  }
}

// 8. Assign or reassign rider to a delivery
const assignRider = async (req, res, next) => {
  const transaction = await sequelize.transaction()
  try {
    const { id } = req.params // deliveryId
    const { riderId } = req.body

    const delivery = await Deliveries.findByPk(id, { transaction })
    if (!delivery) {
      await transaction.rollback()
      throw new AppError("Delivery not found", 404)
    }

    // Verify delivery is in assignable state
    const assignableStates = [DELIVERY_STATUS.PENDING, DELIVERY_STATUS.CONFIRMED, DELIVERY_STATUS.ASSIGNED]
    if (!assignableStates.includes(delivery.status)) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: `Cannot assign rider to delivery with status '${delivery.status}'`
      })
    }

    // Verify target rider exists, is ACTIVE, and is AVAILABLE
    const rider = await Users.findOne({
      where: { id: riderId, role: USER_ROLES.RIDER },
      include: [{ model: Rider_profiles, as: "riderProfile" }],
      transaction
    })

    if (!rider) {
      await transaction.rollback()
      return res.status(404).json({
        success: false,
        message: `Rider with ID ${riderId} does not exist`
      })
    }

    if (rider.status !== ACCOUNT_STATUS.ACTIVE) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: `Cannot assign rider: Rider account status is '${rider.status}'`
      })
    }

    if (rider.riderProfile?.availabilityStatus !== RIDER_AVAILABILITY.AVAILABLE) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: `Cannot assign rider: Rider availability is '${rider.riderProfile?.availabilityStatus}'. Only AVAILABLE riders can be assigned.`
      })
    }

    // If delivery was already assigned to a different rider, free the previous rider back to AVAILABLE
    if (delivery.riderId && delivery.riderId !== riderId) {
      await Rider_profiles.update(
        { availabilityStatus: RIDER_AVAILABILITY.AVAILABLE },
        { where: { userId: delivery.riderId }, transaction }
      )
    }

    // Update delivery
    await delivery.update(
      {
        riderId,
        status: DELIVERY_STATUS.ASSIGNED
      },
      { transaction }
    )

    // Mark new rider as BUSY
    await rider.riderProfile.update(
      { availabilityStatus: RIDER_AVAILABILITY.BUSY },
      { transaction }
    )

    // Add status audit log
    await Delivery_status_logs.create(
      {
        deliveryId: delivery.id,
        status: DELIVERY_STATUS.ASSIGNED,
        changedBy: req.user.id,
        notes: `Rider ${rider.name} manually assigned by administrator`
      },
      { transaction }
    )

    await transaction.commit()

    const updatedDelivery = await Deliveries.findByPk(delivery.id, {
      include: [
        { model: Users, as: "customer", attributes: ["id", "name", "phone"] },
        { model: Users, as: "rider", attributes: ["id", "name", "phone"] },
        { model: Payments, as: "payment" }
      ]
    })

    res.status(200).json({
      success: true,
      message: `Rider ${rider.name} assigned to delivery ${delivery.trackingCode}`,
      delivery: updatedDelivery
    })
  } catch (error) {
    if (transaction) await transaction.rollback()
    next(error)
  }
}

module.exports = {
  getOverview,
  getUsers,
  getUserById,
  updateUserStatus,
  updateUser,
  deleteUser,
  getRiders,
  assignRider
}
