import Joi from "joi";

const createDepartmentDto = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  code: Joi.string()
    .trim()
    .uppercase()
    .max(10)
    .optional(),

  description: Joi.string().max(500).optional(),

  headId: Joi.string().hex().length(24).optional(),

  parentDepartmentId: Joi.string().hex().length(24).optional(),

  isActive: Joi.boolean().optional()
}).unknown(false);
export default createDepartmentDto;