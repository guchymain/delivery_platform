const REQUIRED_ENV_VARS = [
  "PORT",
  "NODE_ENV",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "SALT_ROUNDS",
  "DB_USERNAME",
  "DB_PASSWORD",
  "DB_DATABASE",
  "DB_HOST",
  "DB_PORT",
  "DB_DIALECT"
]

const validateEnv = () => {
  const missing = []

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar] || process.env[envVar].trim() === "") {
      missing.push(envVar)
    }
  }

  if (missing.length > 0) {
    const errorMsg = `FATAL: Missing required environment variables in .env: ${missing.join(", ")}`
    console.error(errorMsg)
    throw new Error(errorMsg)
  }
}

module.exports = validateEnv
