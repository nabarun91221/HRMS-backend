import joi from "joi"
const loginDto = joi.object({
    email: joi.string().email(),
    password:joi.string()
})
export default loginDto;