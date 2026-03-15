import mongoose from "mongoose";

const designationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true
    },

    level: {
      type: Number
    },

    description: {
      type: String
    },

    departmentId: {
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


export default mongoose.model("Designation", designationSchema);