import Joi from "joi";
const applyLeaveDTO = Joi.object({
    leavePolicyId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
            "string.pattern.base": "Invalid leave policy ID",
        }),

    fromDate: Joi.date()
        .required()
        .messages({
            "date.base": "Invalid from date",
        }),

    toDate: Joi.date()
        .min(Joi.ref("fromDate"))
        .required()
        .messages({
            "date.min": "To date must be greater than or equal to from date",
        }),

    reason: Joi.string()
        .trim()
        .min(5)
        .max(500)
        .required()
        .messages({
            "string.empty": "Reason is required",
            "string.min": "Reason must be at least 5 characters",
        }),
});

export default applyLeaveDTO;