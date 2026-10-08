const { z } = require("zod")
const { email, name, phone } = require("./common")
const { USER_ROLES, VEHICLE_TYPES } = require("../utils/constants")

const password = z
  .string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string"
  })
  .min(6, "Password must be at least 6 characters")
  .max(64, "Password must not exceed 64 characters")

const loginSchema = z.object({
  email,
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string"
    })
    .min(1, "Password is required")
}).strict()

// Public registration strictly prohibits registering as ADMIN
const registerSchema = z.object({
  name,
  email,
  phone,
  password,
  role: z
    .enum([USER_ROLES.CUSTOMER, USER_ROLES.RIDER], {
      errorMap: (issue, ctx) => {
        if (ctx.data === USER_ROLES.ADMIN) {
          return { message: "Admin registration is strictly prohibited" }
        }
        return { message: `Role must be ${USER_ROLES.CUSTOMER} or ${USER_ROLES.RIDER}` }
      }
    })
    .default(USER_ROLES.CUSTOMER),
  // Optional rider specific fields (used if role is RIDER)
  vehicleType: z
    .enum([
      VEHICLE_TYPES.BICYCLE,
      VEHICLE_TYPES.MOTORCYCLE,
      VEHICLE_TYPES.CAR,
      VEHICLE_TYPES.VAN
    ])
    .optional(),
  plateNumber: z.string().trim().max(30).optional(),
  licenseNumber: z.string().trim().max(50).optional()
}).strict().superRefine((data, ctx) => {
  if (data.role === USER_ROLES.RIDER && !data.vehicleType) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Vehicle type is required when registering as a rider",
      path: ["vehicleType"]
    })
  }
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: password
}).strict()

module.exports = {
  loginSchema,
  registerSchema,
  changePasswordSchema
}
