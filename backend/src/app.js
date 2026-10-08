const express = require("express")
const cors = require("cors")
const app = express()

const logger = require("./middleware/logger")
const errorHandler = require("./middleware/error")
const notFound = require("./middleware/notFound")
const { apiLimiter } = require("./middleware/rateLimiter")

const authRoutes = require("./routes/auth.route")
const userRoutes = require("./routes/user.route")
const deliveryRoutes = require("./routes/delivery.route")
const riderRoutes = require("./routes/rider.route")
const paymentRoutes = require("./routes/payment.route")
const adminRoutes = require("./routes/admin.route")

// Configurable CORS setup
const rawCorsOrigin = process.env.CORS_ORIGIN || '*';
const allowedOrigins = rawCorsOrigin.split(',').map((o) => o.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, curl, mobile, or direct requests without Origin header
    if (!origin) return callback(null, true);

    // Allow wildcard or matching explicit origin
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Support local development origins
    if (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.use(logger);
app.use(express.json({ limit: "15kb" }))

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Delivery Platform REST API is running",
    version: "1.0.0"
  })
})

// Rate limit all /api routes
app.use("/api", apiLimiter)

// Mount application routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/deliveries", deliveryRoutes)
app.use("/api/riders", riderRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/admin", adminRoutes)

// 404 & Global Error Handler
app.use(notFound)
app.use(errorHandler)

module.exports = app
