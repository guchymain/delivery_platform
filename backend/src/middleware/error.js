const errorHandler = (err, req, res, next) => {
  // Malformed JSON body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in request body"
    })
  }

  // Sequelize Unique Constraint error (e.g. duplicate email, unique trackingCode)
  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors?.[0]?.path || "field"
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists`,
      field
    })
  }

  // Sequelize Validation error
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.errors?.map((e) => ({
        field: e.path,
        message: e.message
      }))
    })
  }

  // Sequelize Foreign Key Constraint error
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      success: false,
      message: "Referenced resource does not exist"
    })
  }

  const statusCode = err.statusCode || err.status || 500
  const isSafe = err.isOperational || (err.expose && statusCode < 500)

  if (!isSafe && statusCode >= 500) {
    console.error("Unhandled error:", err.stack || err)
  }

  res.status(statusCode).json({
    success: false,
    message: isSafe ? err.message : "Internal server error"
  })
}

module.exports = errorHandler
