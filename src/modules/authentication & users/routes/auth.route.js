import { Router } from "express";
import AuthController from "../controllers/authentication.controller.js"
import registerDto from "../dtos/register.dto.js";
import loginDto from "../dtos/login.dto.js";
import validateDto from "../../../shared/middlewares/dto.validation.middleware.js"
const route = Router();
// route.post("/register", validateDto(registerDto), AuthController.registerUser);
route.post("/login", validateDto(loginDto), AuthController.logIn);
route.post("/logout", AuthController.logout)

export default route;