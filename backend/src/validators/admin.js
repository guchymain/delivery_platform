const { z } = require("zod")
const { name, phone } = require("./common")
const { USER_ROLES, ACCOUNT_STATUS } = require("../utils/constants")

const updateUserStatusSchema = z.object({
  status: z.enum([
    ACCOUNT_STATUS.ACTIVE,
    ACCOUNT_STATUS.INACTIVE,
    ACCOUNT_STATUS.SUSPENDED
  ], {
    errorMap: () => ({
      message: `Status must be one of: ${ACCOUNT_STATUS.ACTIVE}, ${ACCOUNT_STATUS.INACTIVE}, ${ACCOUNT_STATUS.SUSPENDED}`
    })
  })
}).strict()

const updateUserSchema = z.object({
  name: name.optional(),
  phone: phone.optional(),
  role: z.enum([USER_ROLES.CUSTOMER, USER_ROLES.RIDER, USER_ROLES.ADMIN]).optional(),
  status: z.enum([ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.INACTIVE, ACCOUNT_STATUS.SUSPENDED]).optional()
}).strict().refine((data) => Object.keys(data).length > 0, "Provide at least one field to update")

module.exports = {
  updateUserStatusSchema,
  updateUserSchema
}
