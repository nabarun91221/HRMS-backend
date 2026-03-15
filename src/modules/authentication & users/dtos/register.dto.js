import joi from "joi"

const registerDto = joi.object({
    name: joi.string(),
    email: joi.string().email(),
    password: joi.string().min(6),
})
export default registerDto;