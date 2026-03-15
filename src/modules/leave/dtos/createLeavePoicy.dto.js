import Joi from "joi";

const createLeavePolicyDTO = Joi.object({
    name: Joi.string()
        .trim()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.empty": "Policy name is required",
            "string.min": "Policy name must be at least 3 characters",
        }),

    daysPerYear: Joi.number()
        .integer()
        .min(1)
        .max(365)
        .required()
        .messages({
            "number.base": "Days per year must be a number",
            "number.min": "Days per year must be at least 1",
        }),

    carryForward: Joi.boolean().optional(),

    maxCarryForwardDays: Joi.when("carryForward", {
        is: true,
        then: Joi.number().integer().min(1).required(),
        otherwise: Joi.number().integer().allow(0).optional(),
    }),

    isPaid: Joi.boolean().optional(),

    isActive: Joi.boolean().optional(),
});

export default createLeavePolicyDTO;