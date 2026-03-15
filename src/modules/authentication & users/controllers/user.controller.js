import User from "../models/user.model.js"
import Employee from "../../employees/models/employee.model.js"
class UserController
{
    //for everyone
    getUser = async (req, res) =>
    {
        const userId = req.user.sub.toString();
        try {
            const user = await User.findById(userId)
            const employee = await Employee.findOne({ userId: userId }).populate({
                path: "employment",
                populate: [
                    {
                        path: "designationId",
                        select: "name"
                    },
                    {
                        path: "departmentId",
                        select: "name"
                    }
                ]
            });
            const { _id, role, email, name } = user._doc;
            return res.send({
                success: true,
                message: "user fetched successfully",
                data: {
                    user: {
                        id: _id,
                        role,
                        email,
                        name,
                        employeeId: employee ?? null
                    }
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                success: true,
                message: error.message
            });
        }
    }
    //for admins
    createUser = async (req, res) =>
    {
        const newUserPayload = req.body;
        try {
            const newUser = await User.create(newUserPayload);
            return res.send({
                status: "success",
                message: "New employee is created successfully",
                data: newUser
            })
        } catch (error) {
            console.log(error)
            return res.send({
                status: "failed",
                message: error.message,
            })
        }
    }
    //for admins
    getAllUser = async (req, res) =>
    {
        try {
            const users = await User.find();

            const formattedUsers = users.map(user => ({
                _id: user._doc._id,
                role: user._doc.role,
                email: user._doc.email,
                name: user._doc.name
            }));
            return res.send({
                success: true,
                message: "user fetched successfully",
                users: formattedUsers
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                success: true,
                message: error.message
            });
        }
    }
    //for admins
    updateUserRole = async (req, res) =>
    {
        if (req.user.role == "SUPERADMIN") {
            const userId = req.params.id;
            const { role } = req.body;
            try {
                const user = await User.findByIdAndUpdate(userId, { role: role })
                if (user) {
                    return res.send({
                        status: true,
                        message: "user has successfully updated",
                        user: user
                    })
                }
            } catch (error) {
                console.log(error);
                return res.send({
                    status: true,
                    message: error.message,
                })
            }
        }

    }

}
export default new UserController();