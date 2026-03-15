import mongoose from "mongoose";

const leaveApplicationSchema = new mongoose.Schema(
    {

        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        leavePolicyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LeavePolicy",
            required: true
        },

        fromDate: Date,
        toDate: Date,

        totalDays: Number,

        reason: String,

        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
            default: "PENDING"
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee"
        },

        approvedAt: Date
    },
    { timestamps: true }
);

export default mongoose.model("LeaveApplication", leaveApplicationSchema);