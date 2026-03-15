import mongoose from "mongoose";
import autoGenerateCode from "../../../shared/utils/autoGenerateCode.js";
const leavePolicySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        code: {
            type: String,
        },

        daysPerYear: {
            type: Number,
            required: true
        },

        carryForward: {
            type: Boolean,
            default: false
        },

        maxCarryForwardDays: {
            type: Number,
            default: 0
        },

        isPaid: {
            type: Boolean,
            default: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);



leavePolicySchema.pre("save", function ()
{
    if (!this.code && this.name) {
        this.code = autoGenerateCode(this.name);
    }
})

leavePolicySchema.index(
    { companyId: 1, code: 1 },
    { unique: true }
);

export default mongoose.model("LeavePolicy", leavePolicySchema);