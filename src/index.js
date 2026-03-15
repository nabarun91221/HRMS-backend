import "./jobs/dayEndAttendance.js";

import express from "express";
import path from "path";

import AttendanceRouter from "./modules/attendance/routes/attendance.route.js";
import AuthRouter from "./modules/authentication & users/routes/auth.route.js";
import OtpRouter from "./modules/authentication & users/routes/otp.route.js";
import UserRouter from "./modules/authentication & users/routes/user.route.js";
import DepartmentRouter from "./modules/departments & designations/routes/department.route.js";
import DesignationRouter from "./modules/departments & designations/routes/designation.route.js";
import EmployeeRouter from "./modules/employees/routes/employee.route.js";
import FileRouter from "./modules/file handle/routes/file.route.js";
import LeaveRouter from "./modules/leave/routes/leave.route.js";
import PayrollRouter from "./modules/payroles/routes/payrole.route.js";

import cookieParser from "cookie-parser";
import cors from "cors";
import { configDotenv } from "dotenv";
import connectMongoDb from "./configs/mongoDb.config.js";

configDotenv();

const PORT = process.env.PORT || 8080;
const baseUrl = "/api";


const App = express();

App.use(express.static("./../public/image"));

App.use(
  cors({
    origin: "https://hrms-two-silk.vercel.app/",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

App.use(express.urlencoded({ extended: true }));
App.use(express.json());
App.use(cookieParser());

// API routes
App.use(baseUrl, AuthRouter);
App.use(baseUrl, UserRouter);
App.use(baseUrl, DepartmentRouter);
App.use(baseUrl, DesignationRouter);
App.use(baseUrl, EmployeeRouter);
App.use(baseUrl, FileRouter);
App.use(baseUrl, OtpRouter);
App.use(baseUrl, AttendanceRouter);
App.use(baseUrl, LeaveRouter);
App.use(baseUrl, PayrollRouter);


App.listen(PORT, async () =>
{
  try {
    await connectMongoDb();
    console.log(`Server running at http://localhost:${PORT}`);
  } catch (error) {
    console.log(error);
  }
});