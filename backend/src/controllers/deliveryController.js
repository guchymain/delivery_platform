const { Op } = require("sequelize")
const {
  Deliveries,
  Users,
  Rider_profiles,
  Payments,
  Delivery_status_logs,
  sequelize
} = require("../../models")
const AppError = require("../utils/appError")
const {
  USER_ROLES,
  DELIVERY_STATUS,
  RIDER_AVAILABILITY,
  PAYMENT_STATUS,
  PAYMENT_METHODS
} = require("../utils/constants")
const {
  generateTrackingCode,
  generateTransactionReference,
  calculateDeliveryFee,
  isValidTransition,
  maskPhoneNumber
} = require("../utils/helpers")

// 1. Create delivery request (Customer only)
const createDelivery = async (req, res, next) => {
  const transaction = await sequelize.transaction()
  try {
    const customerId = req.user.id
    const {
      pickupAddress,
      pickupContactName,
      pickupContactPhone,
      pickupNotes,
      deliveryAddress,
      recipientName,
      recipientPhone,
      deliveryNotes,
      packageType,
      packageWeight = 1.0,
      packageDescription,
      paymentMethod = PAYMENT_METHODS.CASH
    } = req.body

    const deliveryFee = calculateDeliveryFee(packageWeight)
    const trackingCode = generateTrackingCode()

    const delivery = await Deliveries.create(
      {
        trackingCode,
        customerId,
        riderId: null,
        pickupAddress,
        pickupContactName,
        pickupContactPhone,
        pickupNotes,
        deliveryAddress,
        recipientName,
        recipientPhone,
        deliveryNotes,
        packageType,
        packageWeight,
        packageDescription,
        deliveryFee,
        status: DELIVERY_STATUS.PENDING
      },
      { transaction }
    )

    await Payments.create(
      {
        deliveryId: delivery.id,
        userId: customerId,
        amount: deliveryFee,
        paymentMethod,
        paymentStatus: PAYMENT_STATUS.PENDING,
        transactionReference: generateTransactionReference(),
        notes: `Initial payment record for delivery ${trackingCode}`
      },
      { transaction }
    )

    await Delivery_status_logs.create(
      {
        deliveryId: delivery.id,
        status: DELIVERY_STATUS.PENDING,
        changedBy: customerId,
        notes: "Delivery request created by customer"
      },
      { transaction }
    )

    await transaction.commit()

    const fullDelivery = await Deliveries.findByPk(delivery.id, {
      include: [
        { model: Payments, as: "payment" },
        { model: Delivery_status_logs, as: "statusLogs" }
      ]
    })

    res.status(201).json({
      success: true,
      message: "Delivery request created successfully",
      delivery: fullDelivery
    })
  } catch (error) {
    if (transaction) await transaction.rollback()
    next(error)
  }
}

// 2. List deliveries
const getDeliveries = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user
    const { status, search, limit = 50, offset = 0 } = req.query

    const where = {}

    // Role-specific scoping
    if (role === USER_ROLES.CUSTOMER) {
      where.customerId = userId
    } else if (role === USER_ROLES.RIDER) {
      // Riders see deliveries assigned to them OR unassigned confirmed deliveries
      if (status === DELIVERY_STATUS.CONFIRMED) {
        where.status = DELIVERY_STATUS.CONFIRMED
        where.riderId = null
      } else {
        where.riderId = userId
      }
    }

    // Status filter
    if (status && role !== USER_ROLES.RIDER) {
      where.status = status
    }

    // Search by tracking code or recipient
    if (search) {
      where[Op.or] = [
        { trackingCode: { [Op.iLike]: `%${search}%` } },
        { recipientName: { [Op.iLike]: `%${search}%` } },
        { deliveryAddress: { [Op.iLike]: `%${search}%` } }
      ]
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
          attributes: ["id", "name", "email", "phone"]
        },
        {
          model: Users,
          as: "rider",
          attributes: ["id", "name", "email", "phone"],
          include: [{ model: Rider_profiles, as: "riderProfile" }]
        },
        {
          model: Payments,
          as: "payment"
        }
      ]
    })

    res.status(200).json({
      success: true,
      total: count,
      deliveries
    })
  } catch (error) {
    next(error)
  }
}

// 3. Get single delivery details
const getDeliveryById = async (req, res, next) => {
  try {
    const { id } = req.params
    const { role, id: userId } = req.user

    const delivery = await Deliveries.findByPk(id, {
      include: [
        {
          model: Users,
          as: "customer",
          attributes: ["id", "name", "email", "phone"]
        },
        {
          model: Users,
          as: "rider",
          attributes: ["id", "name", "email", "phone"],
          include: [{ model: Rider_profiles, as: "riderProfile" }]
        },
        {
          model: Payments,
          as: "payment"
        },
        {
          model: Delivery_status_logs,
          as: "statusLogs",
          include: [{ model: Users, as: "actor", attributes: ["id", "name", "role"] }]
        }
      ],
      order: [[{ model: Delivery_status_logs, as: "statusLogs" }, "createdAt", "ASC"]]
    })

    if (!delivery) {
      throw new AppError("Delivery not found", 404)
    }

    // Ownership check: Customer can only view their own delivery
    if (role === USER_ROLES.CUSTOMER && delivery.customerId !== userId) {
      throw new AppError("Forbidden. You do not have access to this delivery", 403)
    }

    // Rider check: Rider can only view deliveries assigned to them or unassigned CONFIRMED
    if (role === USER_ROLES.RIDER) {
      const isAssigned = delivery.riderId === userId
      const isUnassignedConfirmed = delivery.status === DELIVERY_STATUS.CONFIRMED && !delivery.riderId
      if (!isAssigned && !isUnassignedConfirmed) {
        throw new AppError("Forbidden. You do not have access to this delivery", 403)
      }
    }

    res.status(200).json({
      success: true,
      delivery
    })
  } catch (error) {
    next(error)
  }
}

// 4. Track delivery by tracking code (Public / Authenticated - Sanitized for privacy)
const trackDelivery = async (req, res, next) => {
  try {
    const { trackingCode } = req.params

    const delivery = await Deliveries.findOne({
      where: { trackingCode },
      include: [
        {
          model: Users,
          as: "customer",
          attributes: ["id", "name"]
        },
        {
          model: Users,
          as: "rider",
          attributes: ["id", "name"],
          include: [{ model: Rider_profiles, as: "riderProfile", attributes: ["vehicleType", "rating"] }]
        },
        {
          model: Payments,
          as: "payment",
          attributes: ["paymentMethod", "paymentStatus", "amount"]
        },
        {
          model: Delivery_status_logs,
          as: "statusLogs",
          attributes: ["id", "status", "notes", "createdAt"]
        }
      ],
      order: [[{ model: Delivery_status_logs, as: "statusLogs" }, "createdAt", "ASC"]]
    })

    if (!delivery) {
      throw new AppError("No delivery found with the provided tracking code", 404)
    }

    // Sanitize PII for public view
    const sanitized = delivery.toJSON()
    if (sanitized.recipientPhone) {
      sanitized.recipientPhone = maskPhoneNumber(sanitized.recipientPhone)
    }
    if (sanitized.pickupContactPhone) {
      sanitized.pickupContactPhone = maskPhoneNumber(sanitized.pickupContactPhone)
    }

    res.status(200).json({
      success: true,
      delivery: sanitized
    })
  } catch (error) {
    next(error)
  }
}

// 5. Update delivery (Customer only, allowed ONLY if PENDING)
const updateDelivery = async (req, res, next) => {
  const transaction = await sequelize.transaction()
  try {
    const { id } = req.params
    const customerId = req.user.id

    const delivery = await Deliveries.findByPk(id, { transaction })
    if (!delivery) {
      await transaction.rollback()
      throw new AppError("Delivery not found", 404)
    }

    if (delivery.customerId !== customerId && req.user.role !== USER_ROLES.ADMIN) {
      await transaction.rollback()
      throw new AppError("Forbidden. You cannot edit this delivery", 403)
    }

    if (delivery.status !== DELIVERY_STATUS.PENDING) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: `Delivery cannot be modified while in '${delivery.status}' status. Only PENDING requests can be edited.`
      })
    }

    const updates = { ...req.body }

    // If package weight changed, recalculate fee and update payment
    if (updates.packageWeight && updates.packageWeight !== Number(delivery.packageWeight)) {
      const newFee = calculateDeliveryFee(updates.packageWeight)
      updates.deliveryFee = newFee

      await Payments.update(
        { amount: newFee },
        { where: { deliveryId: delivery.id }, transaction }
      )
    }

    // If payment method updated
    if (updates.paymentMethod) {
      await Payments.update(
        { paymentMethod: updates.paymentMethod },
        { where: { deliveryId: delivery.id }, transaction }
      )
      delete updates.paymentMethod
    }

    await delivery.update(updates, { transaction })

    await Delivery_status_logs.create(
      {
        deliveryId: delivery.id,
        status: delivery.status,
        changedBy: req.user.id,
        notes: "Delivery details updated by customer"
      },
      { transaction }
    )

    await transaction.commit()

    const updatedDelivery = await Deliveries.findByPk(delivery.id, {
      include: [{ model: Payments, as: "payment" }]
    })

    res.status(200).json({
      success: true,
      message: "Delivery updated successfully",
      delivery: updatedDelivery
    })
  } catch (error) {
    if (transaction) await transaction.rollback()
    next(error)
  }
}

// 6. Confirm delivery request (Customer or Admin)
const confirmDelivery = async (req, res, next) => {
  const transaction = await sequelize.transaction()
  try {
    const { id } = req.params
    const delivery = await Deliveries.findByPk(id, {
      include: [{ model: Payments, as: "payment" }],
      transaction
    })

    if (!delivery) {
      await transaction.rollback()
      throw new AppError("Delivery not found", 404)
    }

    if (delivery.customerId !== req.user.id && req.user.role !== USER_ROLES.ADMIN) {
      await transaction.rollback()
      throw new AppError("Forbidden. You cannot confirm this delivery", 403)
    }

    if (!isValidTransition(delivery.status, DELIVERY_STATUS.CONFIRMED)) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: `Cannot transition delivery from '${delivery.status}' to '${DELIVERY_STATUS.CONFIRMED}'`
      })
    }

    // Payment pre-condition: Pre-paid orders (CARD/TRANSFER) MUST be paid before confirmation
    if (
      delivery.payment &&
      [PAYMENT_METHODS.CARD, PAYMENT_METHODS.TRANSFER].includes(delivery.payment.paymentMethod) &&
      delivery.payment.paymentStatus !== PAYMENT_STATUS.SUCCESSFUL
    ) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: `Pre-paid delivery requires payment. Please complete payment before confirming dispatch.`
      })
    }

    await delivery.update({ status: DELIVERY_STATUS.CONFIRMED }, { transaction })

    await Delivery_status_logs.create(
      {
        deliveryId: delivery.id,
        status: DELIVERY_STATUS.CONFIRMED,
        changedBy: req.user.id,
        notes: "Delivery request confirmed and open for rider assignment"
      },
      { transaction }
    )

    await transaction.commit()

    res.status(200).json({
      success: true,
      message: "Delivery confirmed successfully",
      delivery
    })
  } catch (error) {
    if (transaction) await transaction.rollback()
    next(error)
  }
}

// 7. Cancel delivery (Customer if PENDING/CONFIRMED; Admin anytime before completion)
const cancelDelivery = async (req, res, next) => {
  const transaction = await sequelize.transaction()
  try {
    const { id } = req.params
    const { reason } = req.body
    const { role, id: userId } = req.user

    const delivery = await Deliveries.findByPk(id, {
      include: [{ model: Payments, as: "payment" }],
      transaction
    })

    if (!delivery) {
      await transaction.rollback()
      throw new AppError("Delivery not found", 404)
    }

    // Ownership check
    if (role === USER_ROLES.CUSTOMER && delivery.customerId !== userId) {
      await transaction.rollback()
      throw new AppError("Forbidden. You cannot cancel this delivery", 403)
    }

    // Completed delivery protection: DELIVERED deliveries are NEVER cancellable
    if (delivery.status === DELIVERY_STATUS.DELIVERED) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "Completed deliveries cannot be cancelled under any circumstance."
      })
    }

    if (delivery.status === DELIVERY_STATUS.CANCELLED) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "Delivery is already cancelled."
      })
    }

    // Customer cancellation boundary: blocked once rider is assigned or in transit
    if (role === USER_ROLES.CUSTOMER) {
      const cancellableStatuses = [DELIVERY_STATUS.PENDING, DELIVERY_STATUS.CONFIRMED]
      if (!cancellableStatuses.includes(delivery.status)) {
        await transaction.rollback()
        return res.status(400).json({
          success: false,
          message: `Customers cannot cancel delivery once it is '${delivery.status}'. Please contact customer support.`
        })
      }
    }

    // If a rider was assigned, free the rider back to AVAILABLE
    if (delivery.riderId) {
      await Rider_profiles.update(
        { availabilityStatus: RIDER_AVAILABILITY.AVAILABLE },
        { where: { userId: delivery.riderId }, transaction }
      )
    }

    // If payment was already successful, auto-refund
    if (delivery.payment && delivery.payment.paymentStatus === PAYMENT_STATUS.SUCCESSFUL) {
      await delivery.payment.update(
        {
          paymentStatus: PAYMENT_STATUS.REFUNDED,
          refundedAt: new Date(),
          notes: `Auto-refunded due to delivery cancellation. Reason: ${reason}`
        },
        { transaction }
      )
    } else if (delivery.payment && delivery.payment.paymentStatus === PAYMENT_STATUS.PENDING) {
      await delivery.payment.update(
        {
          paymentStatus: PAYMENT_STATUS.FAILED,
          notes: `Payment cancelled due to order cancellation. Reason: ${reason}`
        },
        { transaction }
      )
    }

    await delivery.update(
      {
        status: DELIVERY_STATUS.CANCELLED,
        cancellationReason: reason
      },
      { transaction }
    )

    await Delivery_status_logs.create(
      {
        deliveryId: delivery.id,
        status: DELIVERY_STATUS.CANCELLED,
        changedBy: userId,
        notes: `Delivery cancelled. Reason: ${reason}`
      },
      { transaction }
    )

    await transaction.commit()

    res.status(200).json({
      success: true,
      message: "Delivery cancelled successfully",
      delivery
    })
  } catch (error) {
    if (transaction) await transaction.rollback()
    next(error)
  }
}

// 8. Rider accepts delivery job (Concurrency-safe with row locking & pre-conditions)
const acceptDelivery = async (req, res, next) => {
  const transaction = await sequelize.transaction()
  try {
    const { id } = req.params
    const riderUserId = req.user.id

    // Check rider profile & current availability
    const riderProfile = await Rider_profiles.findOne({
      where: { userId: riderUserId },
      transaction
    })

    if (!riderProfile) {
      await transaction.rollback()
      throw new AppError("Rider profile not found", 404)
    }

    if (riderProfile.availabilityStatus !== RIDER_AVAILABILITY.AVAILABLE) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: `Cannot accept delivery. Rider status is '${riderProfile.availabilityStatus}'. Rider must be '${RIDER_AVAILABILITY.AVAILABLE}' to accept jobs.`
      })
    }

    // Single active delivery per courier invariant
    const activeJobsCount = await Deliveries.count({
      where: {
        riderId: riderUserId,
        status: {
          [Op.in]: [DELIVERY_STATUS.ASSIGNED, DELIVERY_STATUS.PICKED_UP, DELIVERY_STATUS.IN_TRANSIT]
        }
      },
      transaction
    })

    if (activeJobsCount > 0) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "Riders can only handle one active delivery at a time. Please complete your current run first."
      })
    }

    // Fetch delivery with ROW LOCK to prevent race conditions (no outer join on lock)
    const delivery = await Deliveries.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    })

    if (!delivery) {
      await transaction.rollback()
      throw new AppError("Delivery not found", 404)
    }

    if (delivery.status !== DELIVERY_STATUS.CONFIRMED || delivery.riderId !== null) {
      await transaction.rollback()
      return res.status(409).json({
        success: false,
        message: `Delivery is no longer available for acceptance. Current status: '${delivery.status}', assigned: ${Boolean(delivery.riderId)}`
      })
    }

    const payment = await Payments.findOne({ where: { deliveryId: delivery.id }, transaction })

    // Pre-condition: Pre-paid orders (CARD/TRANSFER) must be paid before courier acceptance
    if (
      payment &&
      [PAYMENT_METHODS.CARD, PAYMENT_METHODS.TRANSFER].includes(payment.paymentMethod) &&
      payment.paymentStatus !== PAYMENT_STATUS.SUCCESSFUL
    ) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "Cannot accept delivery. Pre-paid order has not been completed."
      })
    }

    // Assign delivery to rider and update rider availability to BUSY
    await delivery.update(
      {
        riderId: riderUserId,
        status: DELIVERY_STATUS.ASSIGNED
      },
      { transaction }
    )

    await riderProfile.update(
      { availabilityStatus: RIDER_AVAILABILITY.BUSY },
      { transaction }
    )

    await Delivery_status_logs.create(
      {
        deliveryId: delivery.id,
        status: DELIVERY_STATUS.ASSIGNED,
        changedBy: riderUserId,
        notes: `Rider ${req.user.name} accepted delivery job`
      },
      { transaction }
    )

    await transaction.commit()

    const updatedDelivery = await Deliveries.findByPk(delivery.id, {
      include: [
        { model: Users, as: "customer", attributes: ["id", "name", "phone"] },
        { model: Payments, as: "payment" }
      ]
    })

    res.status(200).json({
      success: true,
      message: "Delivery job accepted successfully",
      delivery: updatedDelivery
    })
  } catch (error) {
    if (transaction) await transaction.rollback()
    next(error)
  }
}

// 8b. Rider releases assigned delivery job before pickup (Emergency / Breakdown)
const releaseDelivery = async (req, res, next) => {
  const transaction = await sequelize.transaction()
  try {
    const { id } = req.params
    const { reason } = req.body
    const riderUserId = req.user.id

    const delivery = await Deliveries.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    })

    if (!delivery) {
      await transaction.rollback()
      throw new AppError("Delivery not found", 404)
    }

    if (delivery.riderId !== riderUserId) {
      await transaction.rollback()
      throw new AppError("Forbidden. You are not the assigned rider for this delivery", 403)
    }

    // Rider can only release while ASSIGNED (before physical pickup)
    if (delivery.status !== DELIVERY_STATUS.ASSIGNED) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: `Cannot release delivery once status is '${delivery.status}'. Packages physically in custody must be escalated to dispatch support.`
      })
    }

    // Unassign delivery and return to CONFIRMED
    await delivery.update(
      {
        riderId: null,
        status: DELIVERY_STATUS.CONFIRMED
      },
      { transaction }
    )

    // Return rider to AVAILABLE
    await Rider_profiles.update(
      { availabilityStatus: RIDER_AVAILABILITY.AVAILABLE },
      { where: { userId: riderUserId }, transaction }
    )

    await Delivery_status_logs.create(
      {
        deliveryId: delivery.id,
        status: DELIVERY_STATUS.CONFIRMED,
        changedBy: riderUserId,
        notes: `Rider ${req.user.name} released job before pickup. Reason: ${reason}`
      },
      { transaction }
    )

    await transaction.commit()

    res.status(200).json({
      success: true,
      message: "Delivery released successfully and returned to open job pool",
      delivery
    })
  } catch (error) {
    if (transaction) await transaction.rollback()
    next(error)
  }
}

// 9. Rider updates delivery progress: ASSIGNED -> PICKED_UP -> IN_TRANSIT -> DELIVERED
const updateDeliveryStatus = async (req, res, next) => {
  const transaction = await sequelize.transaction()
  try {
    const { id } = req.params
    const { status: targetStatus, notes } = req.body
    const { role, id: userId } = req.user

    const delivery = await Deliveries.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    })

    if (!delivery) {
      await transaction.rollback()
      throw new AppError("Delivery not found", 404)
    }

    const payment = await Payments.findOne({ where: { deliveryId: delivery.id }, transaction })

    // Completed delivery protection: terminal state is immutable
    if (delivery.status === DELIVERY_STATUS.DELIVERED || delivery.status === DELIVERY_STATUS.CANCELLED) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: `Delivery is in terminal state '${delivery.status}' and cannot be modified.`
      })
    }

    // Permissions: Only assigned rider or Admin can update progress
    if (role === USER_ROLES.RIDER && delivery.riderId !== userId) {
      await transaction.rollback()
      throw new AppError("Forbidden. You are not the assigned rider for this delivery", 403)
    }

    // State machine validity check
    if (!isValidTransition(delivery.status, targetStatus)) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${delivery.status}' to '${targetStatus}'`
      })
    }

    // Physical progression invariants:
    // DELIVERED requires IN_TRANSIT
    if (targetStatus === DELIVERY_STATUS.DELIVERED && delivery.status !== DELIVERY_STATUS.IN_TRANSIT) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: `Cannot mark delivery as DELIVERED directly from '${delivery.status}'. Package must first be PICKED_UP and IN_TRANSIT.`
      })
    }

    // IN_TRANSIT requires PICKED_UP
    if (targetStatus === DELIVERY_STATUS.IN_TRANSIT && delivery.status !== DELIVERY_STATUS.PICKED_UP) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: `Cannot transition to IN_TRANSIT before package is PICKED_UP.`
      })
    }

    const updates = { status: targetStatus }
    const now = new Date()

    if (targetStatus === DELIVERY_STATUS.PICKED_UP) {
      updates.pickedUpAt = now
    }

    if (targetStatus === DELIVERY_STATUS.DELIVERED) {
      updates.deliveredAt = now

      // Free rider back to AVAILABLE and increment completed deliveries count
      if (delivery.riderId) {
        await Rider_profiles.increment("totalDeliveries", {
          by: 1,
          where: { userId: delivery.riderId },
          transaction
        })
        await Rider_profiles.update(
          { availabilityStatus: RIDER_AVAILABILITY.AVAILABLE },
          { where: { userId: delivery.riderId }, transaction }
        )
      }

      // COD Rule: If CASH on delivery, automatically mark payment as SUCCESSFUL upon delivery
      if (
        payment &&
        payment.paymentMethod === PAYMENT_METHODS.CASH &&
        payment.paymentStatus === PAYMENT_STATUS.PENDING
      ) {
        await payment.update(
          {
            paymentStatus: PAYMENT_STATUS.SUCCESSFUL,
            paidAt: now,
            notes: "Cash collected by rider upon delivery dropoff"
          },
          { transaction }
        )
      }
    }

    await delivery.update(updates, { transaction })

    await Delivery_status_logs.create(
      {
        deliveryId: delivery.id,
        status: targetStatus,
        changedBy: userId,
        notes: notes || `Status updated to ${targetStatus}`
      },
      { transaction }
    )

    await transaction.commit()

    const fullDelivery = await Deliveries.findByPk(delivery.id, {
      include: [
        { model: Payments, as: "payment" },
        { model: Delivery_status_logs, as: "statusLogs" }
      ]
    })

    res.status(200).json({
      success: true,
      message: `Delivery status updated to ${targetStatus}`,
      delivery: fullDelivery
    })
  } catch (error) {
    if (transaction) await transaction.rollback()
    next(error)
  }
}

module.exports = {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  trackDelivery,
  updateDelivery,
  confirmDelivery,
  cancelDelivery,
  acceptDelivery,
  releaseDelivery,
  updateDeliveryStatus
}

