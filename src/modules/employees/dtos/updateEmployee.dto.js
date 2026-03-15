import Joi from "joi";
import { objectId } from "../../../shared/validators/objectId.js";
const updateEmployeeDto = Joi.object({
  employeeCode: Joi.string().trim().max(50).optional(),

  personalInfo: Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phone: Joi.string().optional(),
    dob: Joi.date().optional(),
    gender: Joi.string().valid("MALE", "FEMALE", "OTHER").optional(),
  }).optional(),

  address: Joi.object({
    current: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      zip: Joi.string().optional(),
    }).optional(),

    permanent: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      zip: Joi.string().optional(),
    }).optional(),
  }).optional(),

  employment: Joi.object({
    designationId: objectId.optional(),
    departmentId: objectId.optional(),
    managerId: objectId.optional(),

    employmentType: Joi.string()
      .valid("FULL_TIME", "PART_TIME", "CONTRACT", "INTERN")
      .optional(),

    joiningDate: Joi.date().optional(),

    confirmationDate: Joi.date().optional(),

    status: Joi.string()
      .valid("ACTIVE", "PROBATION", "RESIGNED", "TERMINATED")
      .optional(),
  }).optional(),

  bankDetails: Joi.object({
    accountNumber: Joi.string().optional(),
    ifsc: Joi.string().optional(),
    bankName: Joi.string().optional(),
  }).optional(),
  documents: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        fileUrl: Joi.string().uri().required(),
        publicId: Joi.string().required(),
      }),
    )
    .optional(),
})
  .min(1)
  .unknown(false);

export default updateEmployeeDto;
