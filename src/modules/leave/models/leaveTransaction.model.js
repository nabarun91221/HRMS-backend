import mongoose from "mongoose";

const leaveTransactionSchema = new mongoose.Schema(
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

        type: {
            type: String,
            enum: ["ALLOCATION", "DEBIT", "CREDIT", "CARRY_FORWARD"]
        },

        days: Number,

        balanceAfter: Number,

        referenceId: {
            type: mongoose.Schema.Types.ObjectId
        }
    },
    { timestamps: true }
);

export default mongoose.model("LeaveTransaction", leaveTransactionSchema);