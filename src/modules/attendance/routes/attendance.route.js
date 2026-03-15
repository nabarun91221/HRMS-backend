import express from "express";
import verifyRequestJwt from "../../../shared/middlewares/auth.middleware.js";
import scopeValidation from "../../../shared/middlewares/scope.validation.middleware.js";
import AttendanceController from "../controllers/attendance.controller.js";

const router = express.Router();

//register attendance
router.post("/clockin", verifyRequestJwt, AttendanceController.clockIn);
router.post("/clockout", verifyRequestJwt, AttendanceController.clockOut);
router.get(
  "/attendance/getMyTodayAttendance",
  verifyRequestJwt,
  AttendanceController.getMyTodayAttendance,
);

//Analytics for employee
router.get(
  "/analytics/me/monthly",
  verifyRequestJwt,
  AttendanceController.employeeMonthlyAnalytics,
);
router.get(
  "/analytics/me/calendar",
  verifyRequestJwt,
  AttendanceController.employeeAttendanceCalendar,
);

//Analytics for admins
router.get(
  "/analytics/admin/today",
  verifyRequestJwt,
  scopeValidation("attendance:update"),
  AttendanceController.adminTodayAnalytics,
);
router.get(
  "/analytics/admin/monthly",
  verifyRequestJwt,
  scopeValidation("attendance:update"),
  AttendanceController.companyMonthlyAnalytics,
);
router.get(
  "/analytics/admin/ranking",
  verifyRequestJwt,
  scopeValidation("attendance:update"),
  AttendanceController.employeeWorkRanking,
);
router.get(
  "/analytics/admin/overtime",
  verifyRequestJwt,
  scopeValidation("attendance:update"),
  AttendanceController.overtimeAnalytics,
);

export default router;
