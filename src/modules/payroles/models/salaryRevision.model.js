import mongoose from "mongoose";
const salaryRevisionSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        effectiveFrom: Date,

        earnings: [
            {
                name: String,
                amount: Number
            }
        ],

        deductions: [
            {
                name: String,
                amount: Number
            }
        ],

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("SalaryRevision", salaryRevisionSchema);