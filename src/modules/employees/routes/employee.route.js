import { Router } from "express";
import verifyRequestJwt from "../../../shared/middlewares/auth.middleware.js";
import validateDto from "../../../shared/middlewares/dto.validation.middleware.js";
import scopeValidation from "../../../shared/middlewares/scope.validation.middleware.js";
import EmployeeController from "../controllers/employee.controller.js";
import createEmployeeDto from "../dtos/createEmployee.dto.js";
import updateEmployeeDto from "../dtos/updateEmployee.dto.js";
const router = Router();

//for admins
router.post(
  "/employees",
  verifyRequestJwt,
  scopeValidation("employee:create"),
  validateDto(createEmployeeDto),
  EmployeeController.createEmployee,
);
router.put(
  "/employees/:employeeId",
  verifyRequestJwt,
  scopeValidation("employee:update"),
  validateDto(updateEmployeeDto),
  EmployeeController.updateEmployee,
);
router.delete(
  "/employees/:employeeId",
  verifyRequestJwt,
  scopeValidation("employee:delete"),
  EmployeeController.deleteEmployee,
);
router.get(
  "/employees",
  verifyRequestJwt,
  scopeValidation("employees:read"),
  EmployeeController.getEmployee,
);
router.get(
  "/employees/:id",
  verifyRequestJwt,
  scopeValidation("employees:read"),
  EmployeeController.getEmployeeById,
);

//for employee
router.put(
  "/employees/me/update",
  verifyRequestJwt,
  scopeValidation("document:upload"),
  EmployeeController.uploadEmployeeDocuments,
);

export default router;
