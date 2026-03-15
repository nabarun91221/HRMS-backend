import { Router } from "express";
import OtpController from "../controllers/otp.controller.js";
import verifyRequestJwt from "../../../shared/middlewares/auth.middleware.js";
import scopeValidation from "../../../shared/middlewares/scope.validation.middleware.js";

const router = Router();

router.post("/otp/:email", verifyRequestJwt, scopeValidation("employee:create"), OtpController.createOptAndSendMail);
router.post("/verify/otp/:email", verifyRequestJwt, scopeValidation("employee:create"), OtpController.verifyOtpAndCreatePersonalEmailRecord);


export default router;