import mongoose from "mongoose";
import autoGenerateCode from "../../../shared/utils/autoGenerateCode.js";
const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },

    code: {
      type: String
    },

    description: {
      type: String
    },

    headId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee"
    },

    parentDepartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department"
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

departmentSchema.pre("save", function ()
{
  if (!this.code && this.name) {
    this.code = autoGenerateCode(this.name);
  }
})
export default mongoose.model("Department", departmentSchema);