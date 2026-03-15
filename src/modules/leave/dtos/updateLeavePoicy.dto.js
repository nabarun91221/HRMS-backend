import Joi from "joi";

const updateLeavePolicyDTO = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "Policy name is required",
      "string.min": "Policy name must be at least 3 characters",
    })
    .optional(),

  daysPerYear: Joi.number()
    .integer()
    .min(1)
    .max(365)
    .required()
    .messages({
      "number.base": "Days per year must be a number",
      "number.min": "Days per year must be at least 1",
    })
    .optional(),

  carryForward: Joi.boolean().optional(),

  maxCarryForwardDays: Joi.when("carryForward", {
    is: true,
    then: Joi.number().integer().min(1).required(),
    otherwise: Joi.number().integer().allow(0).optional(),
  }).optional(),

  isPaid: Joi.boolean().optional(),

  isActive: Joi.boolean().optional(),
});

export default updateLeavePolicyDTO;
