import mongoose from "mongoose";
import Employee from "../../employees/models/employee.model.js";
import LeaveApplication from "../models/leaveApplication.model.js";
import LeavePolicy from "../models/leavePolicy.model.js";
import LeaveTransaction from "../models/leaveTransaction.model.js";
class LeaveController
{
  //CREATE LEAVE POLICY (ADMIN ONLY)
  async createPolicy(req, res)
  {
    try {
      const newPolicyPayload = req.body;
      const policy = await LeavePolicy.create({
        ...newPolicyPayload,
      });

      return res.status(201).send({
        success: true,
        message: "policy is successfully created",
        data: policy,
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  }

  async updatePolicy(req, res)
  {
    try {
      const { policyId } = req.params;
      const updatePayload = req.body;
      const policy = await LeavePolicy.findByIdAndUpdate(
        policyId,
        updatePayload,
        { new: true },
      );
      if (!policy) {
        return res.status(404).send({
          success: false,
          message: "Policy not found",
        });
      }
      return res.status(200).send({
        success: true,
        message: "Policy updated successfully",
        data: policy,
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  }

  async deletePolicy(req, res)
  {
    try {
      const { policyId } = req.params;
      const policy = await LeavePolicy.findByIdAndDelete(policyId);
      if (!policy) {
        return res.status(404).send({
          success: false,
          message: "Policy not found",
        });
      }
      return res.status(200).send({
        success: true,
        message: "Policy deleted successfully",
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  }

  async getPolicyById(req, res)
  {
    try {
      const { policyId } = req.params;
      const policy = await LeavePolicy.findById(policyId);
      if (!policy) {
        return res.status(404).send({
          success: false,
          message: "Policy not found",
        });
      }
      return res.status(200).send({
        success: true,
        message: "Policy found successfully",
        data: policy,
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  }

  //GET ALL POLICIES
  async getPolicies(req, res)
  {
    try {

      const policies = await LeavePolicy.find({
        isActive: true,
      });

      return res.status(200).send({
        success: true,
        message: "policies are successfully",
        data: policies,
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  }

  //APPLY FOR LEAVE
  async applyLeave(req, res)
  {
    try {
      let newLeavePayload = req.body;

      const start = new Date(newLeavePayload.fromDate);
      const end = new Date(newLeavePayload.toDate);

      if (end < start) {
        return res.status(400).json({
          success: false,
          message: "Invalid date range",
        });
      }

      const diffTime = end - start;
      const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24) + 1);

      newLeavePayload.fromDate = start;
      newLeavePayload.toDate = end;
      newLeavePayload.totalDays = totalDays;

      const employee = await Employee.find({ userId: req.user.sub });
      console.log("The employee that wants to apply for a leave", employee);
      const application = await LeaveApplication.create({
        ...newLeavePayload,
        employeeId: employee[0]._id,
      });

      return res.status(201).json(application);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
  //GET Applied leave list per user (employee)
  getAppliedLeave = async (req, res) =>
  {
    const userId = req.user.sub;
    try {
      const employee = await Employee.findOne({ userId: userId });
      const leaveApplicationList = await LeaveApplication.find({
        employeeId: employee._id,
      });

      if (!leaveApplicationList) {
        throw new Error("Applications not found");
      }
      return res.send({
        success: true,
        message: "Applications are successfully fetched",
        data: leaveApplicationList,
      });
    } catch (error) {
      return res.send({
        success: false,
        message: error.message,
      });
    }
  };
  //GET Applied leave list all (ADMIN)
  getAllAppliedLeave = async (req, res) =>
  {
    try {
      const leaveApplicationList = await LeaveApplication.find()
        .populate({
          path: "employeeId",

          select: {
            personalInfo: {
              firstName: 1,
              lastName: 1,
            },
            userId: 1,
          },
          populate: {
            path: "userId",
            select: "email",
          },
        })
        .populate("leavePolicyId", "name");
      if (!leaveApplicationList) {
        throw new Error("Applications not found");
      }
      return res.send({
        success: true,
        message: "Applications are successfully fetched",
        data: leaveApplicationList,
      });
    } catch (error) {
      return res.send({
        success: false,
        message: error.message,
      });
    }
  };

  // GET EMPLOYEE BALANCE
  async getBalanceByPolicy(req, res)
  {
    try {
      const { policyId } = req.params;

      const policy = LeavePolicy.findById(policyId);
      if (!policy) {
        return res.status(404).json({
          success: false,
          message: "No policy with this id has found",
        });
      }

      const lastTransaction = await LeaveTransaction.findOne({
        employeeId: req.user.sub,
        leavePolicyId: policyId,
      }).sort({ createdAt: -1 });

      return res.json({
        success: true,
        data: {
          balance: lastTransaction
            ? lastTransaction.balanceAfter
            : policy.daysPerYear,
        },
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
  //All balance
  async getBalance(req, res)
  {
    try {
      const leavePolicies = await LeavePolicy.find({ isActive: true });

      let getBalanceOfEachLeavePolices = [];

      if (leavePolicies.length > 0) {
        getBalanceOfEachLeavePolices = await Promise.all(
          leavePolicies.map(async (lp) =>
          {
            const lastTransaction = await LeaveTransaction.findOne({
              employeeId: req.user.sub,
              leavePolicyId: lp._id,
            }).sort({ createdAt: -1 });

            return {
              id: lp._id,
              policy_name: lp.name,
              balance: lastTransaction
                ? lastTransaction.balanceAfter
                : lp.daysPerYear,
            };
          }),
        );
      }

      return res.json({
        success: true,
        data: getBalanceOfEachLeavePolices,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
  //APPROVE LEAVE (HR / ADMIN)
  async approveLeave(req, res)
  {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { applicationId } = req.params;

      const application = await LeaveApplication.findById(applicationId)
        .populate("leavePolicyId", "daysPerYear")
        .session(session);

      if (!application) {
        throw new Error("Application not found");
      }

      if (application.status !== "PENDING") {
        throw new Error("Leave already processed");
      }

      // Get latest balance
      const lastTransaction = await LeaveTransaction.findOne({
        employeeId: application.employeeId,
        leavePolicyId: application.leavePolicyId,
      })
        .sort({ createdAt: -1 })
        .session(session);

      const currentBalance = lastTransaction
        ? lastTransaction.balanceAfter
        : application.leavePolicyId.daysPerYear;

      if (currentBalance < application.totalDays) {
        throw new Error("Insufficient leave balance");
      }

      const newBalance = currentBalance - application.totalDays;

      // Create DEBIT transaction
      await LeaveTransaction.create(
        [
          {
            employeeId: application.employeeId,
            leavePolicyId: application.leavePolicyId,
            type: "DEBIT",
            days: application.totalDays,
            balanceAfter: newBalance,
            referenceId: application._id,
          },
        ],
        { session },
      );

      application.status = "APPROVED";
      application.approvedBy = req.user.sub;
      application.approvedAt = new Date();

      await application.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.json({ message: "Leave approved successfully" });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: err.message });
    }
  }

  //REJECT LEAVE
  async rejectLeave(req, res)
  {
    try {
      const { applicationId } = req.params;

      const application = await LeaveApplication.findById(applicationId);

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      if (application.status !== "PENDING") {
        return res.status(400).json({ message: "Already processed" });
      }

      application.status = "REJECTED";
      application.approvedBy = req.user.sub;
      application.approvedAt = new Date();

      await application.save();

      return res.json({ message: "Leave rejected" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  // CANCEL LEAVE (EMPLOYEE)
  async cancelLeave(req, res)
  {
    try {
      const { applicationId } = req.params;

      const application = await LeaveApplication.findById(applicationId);

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      const employee = await Employee.findOne({ userId: req.user.sub });
      if (!employee) {
        throw new Error(`Employee with the id:${req.user.sub} is not found`);
      }
      if (application.employeeId.toString() !== employee._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      if (application.status !== "PENDING") {
        return res
          .status(400)
          .json({ message: "Cannot cancel processed leave" });
      }

      application.status = "CANCELLED";
      await application.save();

      return res.json({ message: "Leave cancelled" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default new LeaveController();
