import Joi from "joi";

const generatePayrollDto = Joi.object({
    employeeId: Joi.string().required(),
    month: Joi.number().required(),
    year: Joi.number().required(),
})

export default generatePayrollDto;