import { Router } from "express"
import userController from "../controllers/user.controller.js"
import verifyRequestJwt from "../../../shared/middlewares/auth.middleware.js";
import scopeValidation from "../../../shared/middlewares/scope.validation.middleware.js"
const router = Router();
router.get("/me", verifyRequestJwt, userController.getUser)
router.get("/users", verifyRequestJwt, scopeValidation("employees:read"), userController.getAllUser)
router.post("/users",verifyRequestJwt,scopeValidation("employee:create"),userController.createUser)
router.put("/users/:id/role", verifyRequestJwt, scopeValidation("employee:delete"), userController.updateUserRole);
export default router;