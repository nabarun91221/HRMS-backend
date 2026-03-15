import cron from "node-cron";
import Attendance from "../modules/attendance/models/attendance.model.js"
import Employee from "../modules/employees/models/employee.model.js";
import LeaveApplication from "../modules/leave/models/leaveApplication.model.js";

cron.schedule("0 0 * * *", async () =>
{
    console.log("Running Day-End Attendance Job...");

    try {
        // Get yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const endTime = new Date(yesterday);
        endTime.setHours(19, 0, 0, 0); // 7:00 PM auto clock-out

        const employees = await Employee.find({ isActive: true });

        for (const emp of employees) {

            const attendance = await Attendance.findOne({
                employeeId: emp._id,
                date: yesterday,
            });

            //No Attendance → Check Leave
            if (!attendance) {

                const leave = await LeaveApplication.findOne({
                    employeeId: emp._id,
                    status: "APPROVED",
                    fromDate: { $lte: yesterday },
                    toDate: { $gte: yesterday },
                });

                if (leave) {
                    await Attendance.create({
                        employeeId: emp._id,
                        date: yesterday,
                        status: "ON_LEAVE",
                    });
                } else {
                    await Attendance.create({
                        employeeId: emp._id,
                        date: yesterday,
                        status: "ABSENT",
                    });
                }

                continue;
            }

            //Clocked In but No Clock Out
            if (attendance.clockIn && !attendance.clockOut) {

                attendance.clockOut = endTime;

                const diffMs = attendance.clockOut - attendance.clockIn;
                const totalHours = diffMs / (1000 * 60 * 60);

                attendance.totalWorkingHours = totalHours;

                if (totalHours > 8) {
                    attendance.overtimeHours = totalHours - 8;
                }

                await attendance.save();
            }

        }

        console.log("Day-End Attendance Job Completed");
    } catch (error) {
        console.error("Day-End Job Failed:", error.message);
    }

});