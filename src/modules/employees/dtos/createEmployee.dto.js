import Joi from "joi";

const objectId = Joi.string().hex().length(24);

const createEmployeeDto = Joi.object({
  userCredentials: {
    name: Joi.string(),
    email: Joi.string().email().required(),
  },

  assignedTo: {
    email: Joi.string().email().required(),
  },

  employeeCode: Joi.string().trim().max(50).required(),

  personalInfo: Joi.object({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    phone: Joi.string().trim().required(),
    dob: Joi.date().required(),
    gender: Joi.string().valid("MALE", "FEMALE", "OTHER").optional(),
  }).required(),

  address: Joi.object({
    current: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      zip: Joi.string().required(),
    }).required(),

    permanent: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      zip: Joi.string().optional(),
    }).optional(),
  }).required(),

  employment: Joi.object({
    designationId: objectId.required(),
    departmentId: objectId.required(),
    managerId: objectId.optional(),

    employmentType: Joi.string()
      .valid("FULL_TIME", "PART_TIME", "CONTRACT", "INTERN")
      .required(),
    baseSalary: Joi.number().required().min(7000),
    joiningDate: Joi.date().required(),

    confirmationDate: Joi.date().optional(),

    status: Joi.string()
      .valid("ACTIVE", "PROBATION", "RESIGNED", "TERMINATED")
      .optional(),
  }).required(),

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
}).unknown(false);

export default createEmployeeDto;
