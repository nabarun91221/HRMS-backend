import { generatePassword } from "../../../shared/utils/autoGeneratePassword.js";
import sendMail from "../../../shared/utils/mail.service.js";
import Attendance from "../../attendance/models/attendance.model.js";
import PersonalEmail from "../../authentication & users/models/personalEmail.model.js";
import User from "../../authentication & users/models/user.model.js";
import Department from "../../departments & designations/models/department.model.js";
import Designation from "../../departments & designations/models/designation.model.js";
import LeaveApplication from "../../leave/models/leaveApplication.model.js";
import LeaveTransaction from "../../leave/models/leaveTransaction.model.js";
import SalaryRevision from "../../payroles/models/salaryRevision.model.js";
import Employee from "../models/employee.model.js";
import readTemplate from "../utils/readTemplate.utils.js";

import mongoose from "mongoose";
class EmployeeController {
  //ADMIN ONLY
  createEmployee = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payload = req.body;

      //Validate Assigned Email

      const personalEmail = await PersonalEmail.findOne({
        email: payload.assignedTo.email,
      }).session(session);

      if (!personalEmail) {
        throw new Error(
          `No record found with assigned email: ${payload.assignedTo.email}`,
        );
      } else if (personalEmail.userId !== null) {
        throw new Error(
          `There already a employee linked with this email: ${payload.assignedTo.email}`,
        );
      }

      //Validate Department & Designation
      const department = await Department.findOne({
        _id: payload.employment.departmentId,
      }).session(session);

      if (!department) {
        throw new Error("Invalid department");
      }

      const designation = await Designation.findOne({
        _id: payload.employment.designationId,
        departmentId: department._id,
      }).session(session);

      if (!designation) {
        throw new Error("Invalid designation for department");
      }

      //Create User
      const password = generatePassword(8);

      const userPayload = {
        ...payload.userCredentials,
        password,
      };

      const user = await User.create([userPayload], { session });
      const createdUser = user[0];

      //Create Employee
      const employeePayload = {
        ...payload,
        userId: createdUser._id,
      };

      const employee = await Employee.create([employeePayload], { session });
      const createdEmployee = employee[0];

      // create salary revision
      const baseSalary = payload.employment.baseSalary; // required field
      const basic = Math.round(baseSalary * 0.5);
      const hra = Math.round(basic * 0.4);
      const special = baseSalary - (basic + hra);

      const pf = Math.round(basic * 0.12);
      const professionalTax = 200;

      await SalaryRevision.create(
        [
          {
            employeeId: createdEmployee._id,
            effectiveFrom: new Date(),
            earnings: [
              { name: "Basic", amount: basic },
              { name: "HRA", amount: hra },
              { name: "Special Allowance", amount: special },
            ],
            deductions: [
              { name: "PF", amount: pf },
              { name: "Professional Tax", amount: professionalTax },
            ],
            isActive: true,
          },
        ],
        { session },
      );

      //Link Personal Email
      await PersonalEmail.updateOne(
        { email: payload.assignedTo.email },
        { userId: createdUser._id },
        { session },
      );

      //Commit Transaction
      await session.commitTransaction();
      session.endSession();

      //Send Email (AFTER COMMIT)
      try {
        const template = await readTemplate("credential.html", {
          appName: "N.M CAROLINA",
          logoUrl:
            "https://res.cloudinary.com/dm6sdxom1/image/upload/v1772351961/logo_ms0wge.jpg",
          loginUrl: "http://localhost:3000/web/login",
          email: createdUser.email,
          password,
          passwordExpiry: 90,
        });

        await sendMail({
          mailTemplate: template,
          receiverEmail: payload.assignedTo.email,
          subject: "Successful corporate profile creation with N.M Carolina",
        });
      } catch (mailError) {
        console.error("Mail failed:", mailError.message);
      }

      return res.status(201).json({
        success: true,
        message: "Employee created successfully",
        data: createdEmployee,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.error(error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
  //ADMIN ONLY
  getEmployee = async (req, res) => {
    try {
      console.log(req.query);

      const {
        name,
        gender,
        departmentId,
        designationId,
        status,
        employmentType,
        employeeCode,
        sort,
      } = req.query;
      let sortOption = { updatedAt: -1 };

      if (sort) {
        const order = sort === "asc" ? 1 : -1;
        sortOption = { updatedAt: order };
      }

      let filter = {};

      if (name) {
        filter.$or = [
          { "personalInfo.firstName": { $regex: name, $options: "i" } },
          { "personalInfo.lastName": { $regex: name, $options: "i" } },
        ];
      }

      if (gender) {
        filter["personalInfo.gender"] = gender.toUpperCase();
      }

      if (departmentId) {
        filter["employment.departmentId"] = new mongoose.Types.ObjectId(
          departmentId,
        );
      }

      if (designationId) {
        filter["employment.designationId"] = new mongoose.Types.ObjectId(
          designationId,
        );
      }
      if (status) {
        filter["employment.status"] = status.toUpperCase();
      }
      if (employmentType) {
        filter["employment.employmentType"] = employmentType.toUpperCase();
      }
      if (employeeCode) {
        filter["employeeCode"] = employeeCode;
      }

      console.log(filter);

      const employees = await Employee.find(filter, {
        personalInfo: 1,
        employment: 1,
        employeeCode: 1,
      })
        .populate("employment.designationId", "_id name")
        .populate("employment.departmentId", "_id name")
        .populate(
          "employment.managerId",
          "_id personalInfo.firstName personalInfo.lastName",
        )
        .sort(sortOption)
        .lean();

      return res.send({
        success: true,
        message: "Employees fetched successfully",
        data: employees,
      });
    } catch (error) {
      console.log(error);
      return res.send({
        success: false,
        message: error.message,
      });
    }
  };

  getEmployeeById = async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id)
        .populate("employment.designationId", "id name")
        .populate("employment.departmentId", "id name")
        .populate("employment.managerId", "id name");
      if (employee) {
        return res.send({
          success: true,
          message: "Employee fetched successfully",
          data: employee,
        });
      }
      return res.send({
        success: true,
        message: "Employee fetched successfully with no data",
      });
    } catch (error) {
      console.log(error);
      return res.send({
        success: false,
        message: error.message,
      });
    }
  };

  //ADMIN ONLY
  async updateEmployee(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { employeeId } = req.params;
      const updateEmployeePayload = req.body;

      const employee = await Employee.findById(employeeId).session(session);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      if (updateEmployeePayload.employment?.departmentId) {
        const dept = await Department.findById(
          updateEmployeePayload.employment.departmentId,
        ).session(session);

        if (!dept) {
          throw new Error("Department not found");
        }
      }

      if (updateEmployeePayload.employment?.designationId) {
        const designation = await Designation.findOne({
          _id: updateEmployeePayload.employment.designationId,
          departmentId:
            updateEmployeePayload.employment.departmentId ||
            employee.employment.departmentId,
        }).session(session);

        if (!designation) {
          throw new Error("Invalid designation for department");
        }
      }

      const updatedEmployee = await Employee.findByIdAndUpdate(
        employeeId,
        updateEmployeePayload,
        {
          new: true,
          session,
          runValidators: true,
        },
      );

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: "Employee updated successfully",
        data: updatedEmployee,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
  //ADMIN ONLY
  async deleteEmployee(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { employeeId } = req.params;

      const employee = await Employee.findById(employeeId).session(session);

      if (!employee) {
        throw new Error("Employee not found");
      }

      // delete linked fields
      await Attendance.deleteMany({ employeeId }).session(session);

      // await Payroll.deleteMany({ employeeId }).session(session);

      await SalaryRevision.deleteMany({ employeeId }).session(session);

      await LeaveApplication.deleteMany({ employeeId }).session(session);

      await LeaveTransaction.deleteMany({ employeeId }).session(session);

      await User.deleteOne({ _id: employee.userId }).session(session);

      //DELETE EMPLOYEE

      await Employee.deleteOne({ _id: employeeId }).session(session);

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: "Employee and related data deleted successfully",
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
  // for employee
  async uploadEmployeeDocuments(req, res) {
    try {
      const userId = req.user.sub;
      const { documents } = req.body;

      if (!documents || !Array.isArray(documents)) {
        return res.status(400).json({
          success: false,
          message: "Documents array is required",
        });
      }

      const employee = await Employee.findOne({ userId: userId });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      employee.documents.push(...documents);

      await employee.save();

      return res.status(200).json({
        success: true,
        message: "Documents uploaded successfully",
        data: employee.documents,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
export default new EmployeeController();
