const { z } = require("zod")
const { name, phone } = require("./common")

const updateProfileSchema = z.object({
  name: name.optional(),
  phone: phone.optional()
}).strict().refine((data) => Object.keys(data).length > 0, "Provide at least one field to update")

module.exports = {
  updateProfileSchema
}
