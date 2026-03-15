import { Router } from "express";
import verifyRequestJwt from "../../../shared/middlewares/auth.middleware.js";
import validateDto from "../../../shared/middlewares/dto.validation.middleware.js";
import scopeValidation from "../../../shared/middlewares/scope.validation.middleware.js";
import DesignationController from "../controllers/designation.controller.js";
import createDesignationDto from "../dtos/createDesignation.dto.js";
import updateDesignationDto from "../dtos/updateDesignation.dto.js";
const router = Router();

router.post(
  "/designations/:departmentid",
  verifyRequestJwt,
  scopeValidation("designation:create"),
  validateDto(createDesignationDto),
  DesignationController.createDesignation,
);
router.put(
  "/designations/:id",
  verifyRequestJwt,
  scopeValidation("designation:update"),
  validateDto(updateDesignationDto),
  DesignationController.updateDesignation,
);
// router.get(
//   "/designations/:id",
//   verifyRequestJwt,
//   scopeValidation("designation:read"),
//   DesignationController.getDesignationsByDepartmentId,
// );
router.get(
  "/designations",
  verifyRequestJwt,
  scopeValidation("designation:read"),
  DesignationController.getDesignations,
);
router.get(
  "/designations/:id",
  verifyRequestJwt,
  scopeValidation("designation:read"),
  DesignationController.getDesignationById,
);
router.delete(
  "/designations/:id",
  verifyRequestJwt,
  scopeValidation("designation:delete"),
  DesignationController.deleteDesignation,
);
export default router;
