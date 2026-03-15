// controllers/AttendanceController.js

import mongoose from "mongoose";
import Employee from "../../employees/models/employee.model.js";
import Office from "../../office/models/office.model.js";
import Attendance from "../models/attendance.model.js";
class AttendanceController {
  async clockIn(req, res) {
    try {
      const { latitude, longitude } = req.body;
      const userId = req.user.sub;
      const employee = await Employee.findOne({ userId: userId });
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Location required" });
      }

      const office = await Office.findOne({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: 200,
          },
        },
      });

      if (!office) {
        return res.status(403).json({
          message: "You are outside office location. Cannot clock in.",
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let attendance = await Attendance.findOne({
        employeeId: employee._id,
        date: today,
      });

      if (attendance && attendance.clockIn) {
        return res.status(400).json({
          message: "Already clocked in today",
        });
      }
      if (!attendance) {
        attendance = await Attendance.create({
          employeeId: employee._id,
          date: today,
          clockIn: new Date(),
          source: "WEB",
        });
      } else {
        attendance.clockIn = new Date();
        await attendance.save();
      }

      return res.status(200).json({
        message: "Clock-in successful",
        data: attendance,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async clockOut(req, res) {
    try {
      const userId = req.user.sub;
      const employee = await Employee.findOne({ userId: userId });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const attendance = await Attendance.findOne({
        employeeId: employee._id,
        date: today,
      });

      if (!attendance || !attendance.clockIn) {
        return res.status(400).json({
          message: "Clock-in not found",
        });
      }

      if (attendance.clockOut) {
        return res.status(400).json({
          message: "Already clocked out",
        });
      }

      attendance.clockOut = new Date();

      const diffMs = attendance.clockOut - attendance.clockIn;
      const totalHours = diffMs / (1000 * 60 * 60);

      attendance.totalWorkingHours = totalHours;

      if (totalHours > 8) {
        attendance.overtimeHours = totalHours - 8;
      }

      await attendance.save();

      return res.status(200).json({
        message: "Clock-out successful",
        data: attendance,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getMyTodayAttendance(req, res) {
    try {
      const userId = req.user.sub;
      const employee = await Employee.findOne({ userId: userId });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const attendance = await Attendance.findOne({
        employeeId: employee._id,
        date: today,
      });

      return res
        .status(200)
        .json({ message: "Attendance found", data: attendance });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  // ANALYTICS
  async employeeMonthlyAnalytics(req, res) {
    try {
      const userId = req.user.sub;
      const employee = await Employee.findOne({ userId: userId });
      const { month, year } = req.query;
      console.log(userId, month, year);

      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);

      const analytics = await Attendance.aggregate([
        {
          $match: {
            employeeId: new mongoose.Types.ObjectId(employee._id),
            date: { $gte: start, $lte: end },
          },
        },

        {
          $group: {
            _id: null,

            presentDays: {
              $sum: {
                $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0],
              },
            },

            absentDays: {
              $sum: {
                $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0],
              },
            },

            leaveDays: {
              $sum: {
                $cond: [{ $eq: ["$status", "ON_LEAVE"] }, 1, 0],
              },
            },

            halfDays: {
              $sum: {
                $cond: [{ $eq: ["$status", "HALF_DAY"] }, 1, 0],
              },
            },

            totalWorkingHours: {
              $sum: "$totalWorkingHours",
            },

            totalOvertimeHours: {
              $sum: "$overtimeHours",
            },
          },
        },
      ]);

      return res.json({
        success: true,
        message: "employee monthly analytics aggregated successfully",
        data: analytics[0] || {
          _id: null,
          presentDays: 0,
          absentDays: 0,
          leaveDays: 0,
          halfDays: 0,
          totalWorkingHours: 0,
          totalOvertimeHours: 0,
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async employeeAttendanceCalendar(req, res) {
    try {
      const userId = req.user.sub;
      const employee = await Employee.findOne({ userId: userId });
      const { from, to } = req.query;

      const start = new Date(from).setHours(0, 0, 0, 0);
      const end = new Date(to).setHours(23, 59, 59, 999);

      const data = await Attendance.find({
        employeeId: employee._id,
        date: { $gte: start, $lte: end },
      }).select("date status clockIn clockOut totalWorkingHours");

      res.json({
        success: true,
        message: "employee calender aggregated successfully",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.send({
        success: false,
        message: error.message,
      });
    }
  }
  //Admin Dashboard Analytics (All Employees)
  async adminTodayAnalytics(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await Attendance.aggregate([
        {
          $match: {
            date: today,
          },
        },

        {
          $group: {
            _id: null,

            present: {
              $sum: {
                $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0],
              },
            },

            absent: {
              $sum: {
                $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0],
              },
            },

            leave: {
              $sum: {
                $cond: [{ $eq: ["$status", "ON_LEAVE"] }, 1, 0],
              },
            },

            halfDay: {
              $sum: {
                $cond: [{ $eq: ["$status", "HALF_DAY"] }, 1, 0],
              },
            },

            totalOvertime: {
              $sum: "$overtimeHours",
            },
          },
        },
      ]);

      return res.send({
        success: true,
        message: "Today's attendance of all employee is fetched successfully",
        data: result[0] || {},
      });
    } catch (error) {
      console.log(error);
      return res.send({
        success: false,
        message: "failed fetching Today's attendance of all employee",
      });
    }
  }
  async employeeWorkRanking(req, res) {
    try {
      const { month, year } = req.query;

      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);

      const result = await Attendance.aggregate([
        {
          $match: {
            date: { $gte: start, $lte: end },
          },
        },

        {
          $group: {
            _id: "$employeeId",
            totalHours: { $sum: "$totalWorkingHours" },
            overtime: { $sum: "$overtimeHours" },
          },
        },

        {
          $sort: { totalHours: -1 },
        },

        {
          $lookup: {
            from: "employees",
            localField: "_id",
            foreignField: "_id",
            as: "employee",
          },
        },

        {
          $unwind: "$employee",
        },
      ]);

      return res.send({
        success: true,
        message: "Employee ranking fetched successfully",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.send({
        success: false,
        message: error.message,
      });
    }
  }
  async companyMonthlyAnalytics(req, res) {
    try {
      const { month, year } = req.query;

      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);

      const result = await Attendance.aggregate([
        {
          $match: {
            date: { $gte: start, $lte: end },
          },
        },

        {
          $group: {
            _id: null,

            present: {
              $sum: {
                $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0],
              },
            },

            absent: {
              $sum: {
                $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0],
              },
            },

            leave: {
              $sum: {
                $cond: [{ $eq: ["$status", "ON_LEAVE"] }, 1, 0],
              },
            },

            halfDay: {
              $sum: {
                $cond: [{ $eq: ["$status", "HALF_DAY"] }, 1, 0],
              },
            },

            totalOvertime: {
              $sum: "$overtimeHours",
            },
          },
        },
      ]);

      return res.send({
        success: true,
        message: "company monthly attendance fetched successfully",
        data: result[0] || {},
      });
    } catch (error) {
      console.log(error);
      res.send({
        success: false,
        message: error.message,
      });
    }
  }
  async overtimeAnalytics(req, res) {
    try {
      const result = await Attendance.aggregate([
        {
          $match: {
            overtimeHours: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: "$employeeId",
            totalOvertime: { $sum: "$overtimeHours" },
          },
        },
        {
          $sort: { totalOvertime: -1 },
        },
      ]);

      return res.send({
        success: true,
        message: "overtime analytics fetched successfully",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.send({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new AttendanceController();
