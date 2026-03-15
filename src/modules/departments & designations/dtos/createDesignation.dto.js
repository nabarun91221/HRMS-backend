import Joi from "joi";

const createDesignationDto = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  level: Joi.number().integer().min(1).max(20).optional(),

  description: Joi.string().max(500).optional(),

  isActive: Joi.boolean().optional()
}).unknown(false);

export default createDesignationDto;