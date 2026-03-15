import { ROLES } from "../../../shared/utils/roles.js";
import Employee from "../../employees/models/employee.model.js";
import User from "../models/user.model.js";
import GenerateTokenUtil from "../utils/generateToken.util.js";
class AuthController {
  registerUser = async (req, res) => {
    try {
      const user = await User.create(req.body);
      if (user) {
        const { password, role, isActive, ...safeUser } = user._doc;
        return res.send(safeUser);
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  };
  logIn = async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res.status(401).send({
          success: false,
          message: "no user found with this email",
        });
      }

      const isSame = await user.comparePasswords(req.body.password);

      if (!isSame) {
        return res.status(401).send({
          success: false,
          message: "password verification failed",
        });
      }

      const accessToken = await GenerateTokenUtil.generateAccessToken(user);
      const refreshToken = await GenerateTokenUtil.generateRefreshToken(user);

      const { _id, name, email, role } = user;

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 3 * 60 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie("userRole", role, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      let employee = null;

      if (role === ROLES.EMPLOYEE) {
        try {
          const employeeRes = await Employee.findOne({
            userId: _id,
          }).populate({
            path: "employment",
            populate: [
              {
                path: "designationId",
                select: "name",
              },
              {
                path: "departmentId",
                select: "name",
              },
            ],
          });

          employee = employeeRes;
        } catch (error) {
          return res.status(404).json({ message: "Employee not found" });
        }
      }

      return res.send({
        success: true,
        message: "successful login",
        user: {
          id: _id.toString(),
          name: name.toString(),
          email: email.toString(),
          role: role.toString(),
          ...(role === ROLES.EMPLOYEE && { employeeId: employee }),
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  };

  logout = async (req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken", { path: "/refresh" });
    res.status(200).json({
      success: true,
      message: "successful logout",
    });
  };

  resetPassword = async (req, res) => {
    const { email } = req.params;
    try {
      const isUserExist = await User.findOne({ email: email });
      if (!isUserExist) {
        return res.status(401).send({
          success: false,
          message: "No user found with this mailId",
        });
      }
      const passwordResetToken =
        await GenerateTokenUtil.generateResetPasswordToken(isUserExist);
      if (passwordResetToken) {
        return res.send({
          success: true,
          message: "password reset link has been send to your mail",
        });
      }
    } catch (error) {
      console.log(error);
      return res.send({
        success: false,
        message: "password reset failed",
      });
    }
  };
}
export default new AuthController();
