import Router from "express";
import verifyRequestJwt from "../../../shared/middlewares/auth.middleware.js";
import validateDto from "../../../shared/middlewares/dto.validation.middleware.js";
import scopeValidation from "../../../shared/middlewares/scope.validation.middleware.js";
import LeaveController from "../controllers/leave.controller.js";
import applyLeaveDTO from "../dtos/applyLeave.dto.js";
import createLeavePolicyDTO from "../dtos/createLeavePoicy.dto.js";
import updateLeavePolicyDTO from "../dtos/updateLeavePoicy.dto.js";

const router = Router();

//All
router.get("/leave-policy", verifyRequestJwt, LeaveController.getPolicies);

//ADMIN (leave policy)
router.post(
  "/leave-policy",
  verifyRequestJwt,
  scopeValidation("leave:policy:create"),
  validateDto(createLeavePolicyDTO),
  LeaveController.createPolicy,
);
router.patch(
  "/leave-policy/:policyId",
  verifyRequestJwt,
  scopeValidation("leave:policy:update"),
  validateDto(updateLeavePolicyDTO),
  LeaveController.updatePolicy,
);
router.delete(
  "/leave-policy/:policyId",
  verifyRequestJwt,
  scopeValidation("leave:policy:delete"),
  LeaveController.deletePolicy,
);
router.get(
  "/leave-policy/:policyId",
  verifyRequestJwt,
  scopeValidation("leave:policy:read"),
  LeaveController.getPolicyById,
);

//ADMIN (leave application)
router.get(
  "/leave-applications",
  verifyRequestJwt,
  scopeValidation("leave:approve"),
  LeaveController.getAllAppliedLeave,
);
router.post(
  "/leave-approve/:applicationId",
  verifyRequestJwt,
  scopeValidation("leave:approve"),
  LeaveController.approveLeave,
);
router.post(
  "/leave-reject/:applicationId",
  verifyRequestJwt,
  scopeValidation("leave:approve"),
  LeaveController.rejectLeave,
);

//EMPLOYEE (leave application)
router.post(
  "/leave-application",
  verifyRequestJwt,
  scopeValidation("leave:apply"),
  validateDto(applyLeaveDTO),
  LeaveController.applyLeave,
);
router.get(
  "/leave-application",
  verifyRequestJwt,
  scopeValidation("leave:apply"),
  LeaveController.getAppliedLeave,
);
router.post(
  "/leave-cancel/:applicationId",
  verifyRequestJwt,
  scopeValidation("leave:apply"),
  LeaveController.cancelLeave,
);
router.get("/leave-remaining", verifyRequestJwt, LeaveController.getBalance);
router.get(
  "/leave-remaining/:policyId",
  verifyRequestJwt,
  LeaveController.getBalanceByPolicy,
);

export default router;
