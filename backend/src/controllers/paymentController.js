const { Op } = require("sequelize")
const { Payments, Deliveries, Users, Delivery_status_logs, sequelize } = require("../../models")
const AppError = require("../utils/appError")
const {
  USER_ROLES,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  DELIVERY_STATUS
} = require("../utils/constants")

// 1. Process / Record Payment for a delivery
const processPayment = async (req, res, next) => {
  const transaction = await sequelize.transaction()
  try {
    const { id } = req.params // deliveryId or paymentId
    const { paymentMethod, notes } = req.body
    const { role, id: userId } = req.user

    // Find payment record either by payment id or by deliveryId
    const payment = await Payments.findOne({
      where: {
        [Op.or]: [{ id: isNaN(id) ? 0 : Number(id) }, { deliveryId: isNaN(id) ? 0 : Number(id) }]
      },
      include: [{ model: Deliveries, as: "delivery" }],
      transaction
    })

    if (!payment) {
      await transaction.rollback()
      throw new AppError("Payment record not found", 404)
    }

    // Ownership check
    if (role === USER_ROLES.CUSTOMER && payment.userId !== userId) {
      await transaction.rollback()
      throw new AppError("Forbidden. You do not have access to this payment", 403)
    }

    if (payment.paymentStatus === PAYMENT_STATUS.SUCCESSFUL) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "This delivery has already been paid for successfully"
      })
    }

    if (payment.paymentStatus === PAYMENT_STATUS.REFUNDED) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "This payment has been refunded and cannot be processed again"
      })
    }

    const now = new Date()
    let newPaymentStatus = PAYMENT_STATUS.PENDING
    let paymentNotes = notes || ""

    if (paymentMethod === PAYMENT_METHODS.CARD || paymentMethod === PAYMENT_METHODS.TRANSFER) {
      // Mock payment gateway simulates instantaneous success
      newPaymentStatus = PAYMENT_STATUS.SUCCESSFUL
      paymentNotes = paymentNotes || `Mock payment completed via ${paymentMethod}`
    } else if (paymentMethod === PAYMENT_METHODS.CASH) {
      newPaymentStatus = PAYMENT_STATUS.PENDING
      paymentNotes = paymentNotes || "Cash on delivery selected. Payment due upon dropoff"
    }

    await payment.update(
      {
        paymentMethod,
        paymentStatus: newPaymentStatus,
        paidAt: newPaymentStatus === PAYMENT_STATUS.SUCCESSFUL ? now : null,
        notes: paymentNotes
      },
      { transaction }
    )

    // If delivery is still PENDING, confirm it now that payment method is established
    const delivery = payment.delivery
    if (delivery && delivery.status === DELIVERY_STATUS.PENDING) {
      await delivery.update(
        { status: DELIVERY_STATUS.CONFIRMED },
        { transaction }
      )

      await Delivery_status_logs.create(
        {
          deliveryId: delivery.id,
          status: DELIVERY_STATUS.CONFIRMED,
          changedBy: userId,
          notes: `Delivery confirmed upon ${paymentMethod} payment initialization (${newPaymentStatus})`
        },
        { transaction }
      )
    }

    await transaction.commit()

    const updatedPayment = await Payments.findByPk(payment.id, {
      include: [
        {
          model: Deliveries,
          as: "delivery",
          attributes: ["id", "trackingCode", "status", "pickupAddress", "deliveryAddress"]
        }
      ]
    })

    res.status(200).json({
      success: true,
      message: `Payment processed: status is ${newPaymentStatus}`,
      payment: updatedPayment
    })
  } catch (error) {
    if (transaction) await transaction.rollback()
    next(error)
  }
}

// 2. List payments
const getPayments = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user
    const { status, method, limit = 50, offset = 0 } = req.query

    const where = {}

    // Customers only see own payments; Admin sees all
    if (role === USER_ROLES.CUSTOMER) {
      where.userId = userId
    }

    if (status) {
      where.paymentStatus = status
    }

    if (method) {
      where.paymentMethod = method
    }

    const { count, rows: payments } = await Payments.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Deliveries,
          as: "delivery",
          attributes: ["id", "trackingCode", "status", "deliveryFee"]
        },
        {
          model: Users,
          as: "user",
          attributes: ["id", "name", "email"]
        }
      ]
    })

    res.status(200).json({
      success: true,
      total: count,
      payments
    })
  } catch (error) {
    next(error)
  }
}

// 3. Get single payment receipt
const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params
    const { role, id: userId } = req.user

    const payment = await Payments.findByPk(id, {
      include: [
        {
          model: Deliveries,
          as: "delivery"
        },
        {
          model: Users,
          as: "user",
          attributes: ["id", "name", "email", "phone"]
        }
      ]
    })

    if (!payment) {
      throw new AppError("Payment not found", 404)
    }

    if (role === USER_ROLES.CUSTOMER && payment.userId !== userId) {
      throw new AppError("Forbidden. You do not have access to this payment", 403)
    }

    res.status(200).json({
      success: true,
      payment
    })
  } catch (error) {
    next(error)
  }
}

// 4. Admin refunds a payment
const refundPayment = async (req, res, next) => {
  const transaction = await sequelize.transaction()
  try {
    const { id } = req.params
    const { reason } = req.body

    const payment = await Payments.findByPk(id, {
      include: [{ model: Deliveries, as: "delivery" }],
      transaction
    })

    if (!payment) {
      await transaction.rollback()
      throw new AppError("Payment not found", 404)
    }

    if (payment.paymentStatus !== PAYMENT_STATUS.SUCCESSFUL) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: `Only SUCCESSFUL payments can be refunded. Current status is '${payment.paymentStatus}'.`
      })
    }

    await payment.update(
      {
        paymentStatus: PAYMENT_STATUS.REFUNDED,
        refundedAt: new Date(),
        notes: `Refund processed by admin. Reason: ${reason}`
      },
      { transaction }
    )

    if (payment.delivery) {
      await Delivery_status_logs.create(
        {
          deliveryId: payment.delivery.id,
          status: payment.delivery.status,
          changedBy: req.user.id,
          notes: `Payment refunded: ${payment.amount} (Reason: ${reason})`
        },
        { transaction }
      )
    }

    await transaction.commit()

    res.status(200).json({
      success: true,
      message: "Payment refunded successfully",
      payment
    })
  } catch (error) {
    if (transaction) await transaction.rollback()
    next(error)
  }
}

module.exports = {
  processPayment,
  getPayments,
  getPaymentById,
  refundPayment
}
