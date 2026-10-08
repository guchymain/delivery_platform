const { z } = require("zod")
const { RIDER_AVAILABILITY, VEHICLE_TYPES } = require("../utils/constants")

const updateAvailabilitySchema = z.object({
  availabilityStatus: z.enum(
    [RIDER_AVAILABILITY.AVAILABLE, RIDER_AVAILABILITY.OFFLINE],
    {
      errorMap: () => ({
        message: `Rider can only set availability to '${RIDER_AVAILABILITY.AVAILABLE}' or '${RIDER_AVAILABILITY.OFFLINE}'`
      })
    }
  )
}).strict()

const updateRiderProfileSchema = z.object({
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
}).strict().refine((data) => Object.keys(data).length > 0, "Provide at least one field to update")

module.exports = {
  updateAvailabilitySchema,
  updateRiderProfileSchema
}
