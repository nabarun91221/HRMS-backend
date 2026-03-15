import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  name: String,
  fileUrl: String,
  publicId: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const employeeSchema = new mongoose.Schema(
  {

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    employeeCode: {
      type: String,
      required: true
    },

    personalInfo: {
      firstName: String,
      lastName: String,
      phone: String,
      dob: Date,
      gender: String
    },

    address: {
      current: {
        street: String,
        city: String,
        state: String,
        country: String,
        zip: String
      },
      permanent: {
        street: String,
        city: String,
        state: String,
        country: String,
        zip: String
      }
    },

    employment: {
      designationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Designation"
      },
      departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
      },

      managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
      },

      employmentType: {
        type: String,
        enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"]
      },

      joiningDate: Date,
      confirmationDate: Date,

      status: {
        type: String,
        enum: ["ACTIVE", "PROBATION", "RESIGNED", "TERMINATED"],
        default: "ACTIVE"
      }
    },

    bankDetails: {
      accountNumber: String, // encrypt this
      ifsc: String,
      bankName: String
    },

    documents: [documentSchema]
  },
  { timestamps: true }
);

employeeSchema.index({ employeeCode: 1 }, { unique: true });

export default mongoose.model("Employee", employeeSchema);