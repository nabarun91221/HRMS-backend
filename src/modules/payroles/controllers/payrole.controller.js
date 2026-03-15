import mongoose from "mongoose";
import { generatePayrollPDF } from "../../../shared/utils/payrolPdf.utils.js";
import Employee from "../../employees/models/employee.model.js";
import Payroll from "../models/payrole.model.js";
import SalaryRevision from "../models/salaryRevision.model.js";
import calculateSalary from "../utils/calculateSalary.util.js";
class PayrollController {
  //GENERATE PAYROLL (FROM SALARY REVISION)
  async generatePayroll(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { employeeId, month, year } = req.body;
      //Cannot create payroll older than 2 months & Cannot create payroll for future months.
      validatePayrollCreation(month, year);
      // Check duplicate payroll
      const existing = await Payroll.findOne({
        employeeId,
        month,
        year,
      }).session(session);

      if (existing) {
        throw new Error("Payroll already generated for this month");
      }

      // Get active salary revision
      const revision = await SalaryRevision.findOne({
        employeeId,
        isActive: true,
        effectiveFrom: { $lte: new Date(year, month - 1, 1) },
      })
        .sort({ effectiveFrom: -1 })
        .session(session);

      if (!revision) {
        throw new Error("No active salary revision found");
      }

      const { grossSalary, totalDeductions, netSalary } = calculateSalary(
        revision.earnings,
        revision.deductions,
      );

      const payroll = await Payroll.create(
        [
          {
            employeeId,
            month,
            year,
            earnings: revision.earnings,
            deductions: revision.deductions,
            grossSalary,
            totalDeductions,
            netSalary,
            status: "DRAFT",
          },
        ],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        success: true,
        data: payroll[0],
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }

  // RECALCULATE PAYROLL(ONLY DRAFT)
  async recalculatePayroll(req, res) {
    try {
      const { payrollId } = req.params;

      const payroll = await Payroll.findById(payrollId);

      if (!payroll) throw new Error("Payroll not found");

      if (payroll.status !== "DRAFT") {
        throw new Error("Only DRAFT payroll can be recalculated");
      }

      const { grossSalary, totalDeductions, netSalary } = calculateSalary(
        payroll.earnings,
        payroll.deductions,
      );

      payroll.grossSalary = grossSalary;
      payroll.totalDeductions = totalDeductions;
      payroll.netSalary = netSalary;

      await payroll.save();

      return res.json({
        success: true,
        data: payroll,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }

  //APPROVE PAYROLL
  async approvePayroll(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { payrollId } = req.params;

      const payroll = await Payroll.findById(payrollId).session(session);

      if (!payroll) throw new Error("Payroll not found");

      if (payroll.status !== "DRAFT") {
        throw new Error("Only DRAFT payroll can be approved");
      }

      payroll.status = "APPROVED";
      payroll.approvedBy = req.user.id;
      payroll.approvedAt = new Date();

      await payroll.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.json({
        success: true,
        message: "Payroll approved",
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }

  //LOCK PAYROLL (FINAL STEP)
  async lockPayroll(req, res) {
    try {
      const { payrollId } = req.params;

      const payroll = await Payroll.findById(payrollId);

      if (!payroll) throw new Error("Payroll not found");

      if (payroll.status !== "APPROVED") {
        throw new Error("Only APPROVED payroll can be locked");
      }

      payroll.status = "LOCKED";
      await payroll.save();

      return res.json({
        success: true,
        message: "Payroll locked successfully",
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }

  //for admins

  async getAllPayroll(req, res) {
    try {
      let { sort } = req.query;

      let sortOption = { updatedAt: -1 };

      if (sort) {
        const order = sort === "asc" ? 1 : -1;
        sortOption = { updatedAt: order };
      }

      const payroll = await Payroll.aggregate([
        // employee lookup
        {
          $lookup: {
            from: "employees",
            localField: "employeeId",
            foreignField: "_id",
            as: "employee",
          },
        },
        { $unwind: "$employee" },

        // department lookup
        {
          $lookup: {
            from: "departments",
            localField: "employee.employment.departmentId",
            foreignField: "_id",
            as: "department",
          },
        },
        {
          $unwind: {
            path: "$department",
            preserveNullAndEmptyArrays: true,
          },
        },

        // designation lookup
        {
          $lookup: {
            from: "designations",
            localField: "employee.employment.designationId",
            foreignField: "_id",
            as: "designation",
          },
        },
        {
          $unwind: {
            path: "$designation",
            preserveNullAndEmptyArrays: true,
          },
        },

        // manager lookup
        {
          $lookup: {
            from: "employees",
            localField: "employee.employment.managerId",
            foreignField: "_id",
            as: "manager",
          },
        },
        {
          $unwind: {
            path: "$manager",
            preserveNullAndEmptyArrays: true,
          },
        },

        // projection
        {
          $project: {
            _id: 1,

            employeeId: "$employee._id",
            employeeName: "$employee.personalInfo.firstName",

            department: "$department.name",
            designation: "$designation.name",

            managerName: "$manager.personalInfo.firstName",

            month: 1,
            year: 1,
            netSalary: 1,
            status: 1,
            earnings: 1,
            deductions: 1,
            updatedAt: 1,
          },
        },

        {
          $sort: sortOption,
        },
      ]);

      if (!payroll) {
        return res.status(404).json({ message: "Payroll not found" });
      }

      return res.json({
        success: true,
        message: "All payrolls are fetched successfully",
        data: payroll,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
  //add earnings
  addEarnings = async (req, res) => {
    try {
      const { payrollId } = req.params;
      const newEarningPayload = req.body;
      const payroll = await Payroll.findById(payrollId);
      if (!payroll) {
        return res.status(404).json({
          success: false,
          message: "Payroll not found",
        });
      }
      if (payroll.status != "DRAFT") {
        return res.status(400).json({
          success: false,
          message: "Payroll is already approved or locked",
        });
      }
      const UpdatePayroll = await Payroll.findByIdAndUpdate(
        payrollId,
        { $push: { earnings: newEarningPayload } },
        { new: true },
      );
      if (UpdatePayroll) {
        return res.json({
          success: true,
          message: `Payroll updated successfully, #${newEarningPayload.name} earning added`,
          data: UpdatePayroll,
        });
      }
      return res.json({
        success: true,
        message: "Payroll can't be update",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  //add deductions
  addDeductions = async (req, res) => {
    try {
      const { payrollId } = req.params;
      const newDeductionPayload = req.body;
      const payroll = await Payroll.findById(payrollId);
      if (!payroll) {
        return res.status(404).json({
          success: false,
          message: "Payroll not found",
        });
      }
      if (payroll.status != "DRAFT") {
        return res.status(400).json({
          success: false,
          message: "Payroll is already approved or locked",
        });
      }
      const UpdatePayroll = await Payroll.findByIdAndUpdate(
        payrollId,
        { $push: { deductions: newDeductionPayload } },
        { new: true },
      );
      if (UpdatePayroll) {
        return res.json({
          success: true,
          message: `Payroll updated successfully, #${newDeductionPayload.name} deduction added`,
          data: UpdatePayroll,
        });
      }
      return res.json({
        success: true,
        message: "Payroll can't be update",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  //GET PAYROLL BY EMPLOYEE + MONTH
  async getPayrollByMonthYear(req, res) {
    try {
      const { employeeId, month, year } = req.query;

      const payroll = await Payroll.findOne({
        employeeId,
        month,
        year,
      }).populate("employeeId", "personalInfo");

      if (!payroll) {
        return res.status(404).json({ message: "Payroll not found" });
      }

      return res.json(payroll);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
  //GET PAYROLL for each EMPLOYEE
  async getAllPayrollPerUser(req, res) {
    const userId = req.user.sub;
    let { sort } = req.query;

    let sortOption = { updatedAt: -1 };

    if (sort) {
      const order = sort === "asc" ? 1 : -1;
      sortOption = { updatedAt: order };
    }
    try {
      const employee = await Employee.findOne({ userId: userId });
      let payroll = await Payroll.find({
        employeeId: employee._id,
        status: "LOCKED",
      })
        .populate("employeeId")
        .sort(sortOption);

      if (!payroll) {
        return res.status(404).json({ message: "Payroll not found" });
      }

      return res.json({
        success: true,
        message: "All final payrolls are fetched successfully",
        data: payroll,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
  // download payroll EMPLOYEE
  downloadPayrollPDF = async (req, res) => {
    try {
      const { payrollId } = req.params;
      const employee = await Employee.findOne({ userId: req.user.sub });

      const payroll = await Payroll.findOne({
        _id: payrollId,
        employeeId: employee._id,
        status: "LOCKED",
      }).populate({
        path: "employeeId",
        populate: [
          {
            path: "employment.designationId",
            select: "name",
          },
          {
            path: "employment.departmentId",
            select: "name",
          },
        ],
      });

      if (!payroll) {
        return res.status(404).json({
          success: false,
          message: "Payroll not found",
        });
      }

      await generatePayrollPDF(payroll, res);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Error generating PDF",
      });
    }
  };
}

export default new PayrollController();
