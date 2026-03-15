import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
    {

        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        month: Number,
        year: Number,

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

        grossSalary: Number,
        totalDeductions: Number,
        netSalary: Number,

        status: {
            type: String,
            enum: ["DRAFT", "APPROVED", "LOCKED"],
            default: "DRAFT"
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee"
        },

        approvedAt: Date
    },
    { timestamps: true }
);

// Prevent duplicate payroll for same month
payrollSchema.index(
    { companyId: 1, employeeId: 1, month: 1, year: 1 },
    { unique: true }
);

export default mongoose.model("Payroll", payrollSchema);