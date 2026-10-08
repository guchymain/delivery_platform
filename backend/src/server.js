const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, "../.env"), quiet: true })

const validateEnv = require("./utils/validateEnv")

// Validate all required environment variables strictly without fallbacks
validateEnv()

const app = require("./app")
const { sequelize } = require("../models")

const PORT = Number(process.env.PORT)

const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log("PostgreSQL Database connected successfully")

    app.listen(PORT, () => {
      console.log(`Delivery Platform server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Unable to connect to the database:", error.message || error)
    console.error("\nPlease ensure PostgreSQL is running and your database is created using:")
    console.error("  sudo -u postgres psql < backend/db/setup.sql")
    console.error("Then run migrations when ready:")
    console.error("  npm run db:migrate\n")
    process.exit(1)
  }
}

startServer()
