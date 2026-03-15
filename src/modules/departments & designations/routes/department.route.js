import { Router } from "express";
import verifyRequestJwt from "../../../shared/middlewares/auth.middleware.js";
import validateDto from "../../../shared/middlewares/dto.validation.middleware.js";
import scopeValidation from "../../../shared/middlewares/scope.validation.middleware.js";
import DepartmentController from "../controllers/department.controller.js";
import createDepartmentDto from "../dtos/createDepartment.dto.js";
import updateDepartmentDto from "../dtos/updateDepartment.dto.js";

const router = Router();

router.post(
  "/departments",
  verifyRequestJwt,
  scopeValidation("department:create"),
  validateDto(createDepartmentDto),
  DepartmentController.createDepartment,
);
router.put(
  "/departments/:id",
  verifyRequestJwt,
  scopeValidation("department:update"),
  validateDto(updateDepartmentDto),
  DepartmentController.updateDepartment,
);
router.get(
  "/departments",
  verifyRequestJwt,
  scopeValidation("department:read"),
  DepartmentController.getDepartments,
);
router.get(
  "/departments/:id",
  verifyRequestJwt,
  scopeValidation("department:read"),
  DepartmentController.getDepartmentById,
);
router.delete(
  "/departments/:id",
  verifyRequestJwt,
  scopeValidation("department:delete"),
  DepartmentController.deleteDepartment,
);
router.get(
  "/departments-with-designations",
  verifyRequestJwt,
  scopeValidation("department:read"),
  DepartmentController.getDepartmentsWithDesignation,
);
export default router;
