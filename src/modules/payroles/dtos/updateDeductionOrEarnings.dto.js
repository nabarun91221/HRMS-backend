import Joi from "joi"

const updateDeductionsOrEarningsDto = Joi.object({
    name: Joi.string().required(),
    amount: Joi.number().required()
});
export default updateDeductionsOrEarningsDto;