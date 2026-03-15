import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {

        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        clockIn: Date,
        clockOut: Date,

        totalWorkingHours: Number,

        overtimeHours: {
            type: Number,
            default: 0
        },

        status: {
            type: String,
            enum: ["PRESENT", "ABSENT", "HALF_DAY", "ON_LEAVE"],
            default: "PRESENT"
        },

        source: {
            type: String,
            enum: ["WEB", "MOBILE", "BIOMETRIC"],
            default: "WEB"
        }
    },
    { timestamps: true }
);

// Prevent duplicate attendance per day
attendanceSchema.index(
    { companyId: 1, employeeId: 1, date: 1 },
    { unique: true }
);

export default mongoose.model("Attendance", attendanceSchema);