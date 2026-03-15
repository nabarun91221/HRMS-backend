import Joi from "joi";
const updateDesignationDto = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),

  level: Joi.number().integer().min(1).max(20).optional(),

  description: Joi.string().max(500).optional(),

  departmentId: Joi.string().hex().length(24).optional(),

  isActive: Joi.boolean().optional()
})
.min(1)
.unknown(false);

export default updateDesignationDto;