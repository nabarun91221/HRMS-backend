import Router from "express"
import verifyRequestJwt from "../../../shared/middlewares/auth.middleware.js";
import scopeValidation from "../../../shared/middlewares/scope.validation.middleware.js";
import PayrollController from "../controllers/payrole.controller.js"
import validateDto from "../../../shared/middlewares/dto.validation.middleware.js";
import generatePayrollDto from "../dtos/generatePayroll.dto.js";
import getPayrollByMonthYearDto from "../dtos/getPayrollByMonthYear.dto.js";
import updateDeductionsOrEarningsDto from "../dtos/updateDeductionOrEarnings.dto.js";


const router = Router();

//for admins
router.post("/generate-payroll", verifyRequestJwt, scopeValidation("payroll:run"), validateDto(generatePayrollDto), PayrollController.generatePayroll);
router.post("/recalculate-payroll/:payrollId", verifyRequestJwt, scopeValidation("payroll:run"), PayrollController.recalculatePayroll);
router.post("/payroll-approve/:payrollId", verifyRequestJwt, scopeValidation("payroll:approve"), PayrollController.approvePayroll);
router.post("/payroll-lock/:payrollId", verifyRequestJwt, scopeValidation("payroll:approve"), PayrollController.lockPayroll);
router.get("/payroll", verifyRequestJwt, scopeValidation("payroll:approve"), PayrollController.getAllPayroll);
router.get("/payroll-dated", verifyRequestJwt, scopeValidation("payroll:approve"), validateDto(getPayrollByMonthYearDto), PayrollController.getPayrollByMonthYear);
router.put("/payroll/add/deduction/:payrollId", verifyRequestJwt, scopeValidation("payroll:configure"), validateDto(updateDeductionsOrEarningsDto), PayrollController.addDeductions);
router.put("/payroll/add/earning/:payrollId", verifyRequestJwt, scopeValidation("payroll:configure"), validateDto(updateDeductionsOrEarningsDto), PayrollController.addEarnings);




//for employee
router.get("/payroll-me", verifyRequestJwt, scopeValidation("payroll:view"), PayrollController.getAllPayrollPerUser);
router.get("/payroll/download/:payrollId", verifyRequestJwt, scopeValidation("payroll:download"), PayrollController.downloadPayrollPDF);

export default router;

