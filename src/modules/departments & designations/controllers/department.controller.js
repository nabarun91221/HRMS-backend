import Department from "../models/department.model.js";
class DepartmentController
{
  createDepartment = async (req, res) =>
  {
    const newDepartmentPayload = req.body;
    try {
      const newDepartment = await Department.create(newDepartmentPayload);
      return res.send({
        success: true,
        message: "The department is created successfully",
        data: newDepartment,
      });
    } catch (error) {
      console.error(error);
      return res.send({
        success: false,
        message: error.message,
      });
    }
  };
  updateDepartment = async (req, res) =>
  {
    const updateDepartmentPayload = req.body;
    const departmentId = req.params.id;
    try {
      const updatedDepartment = await Department.findByIdAndUpdate(
        departmentId,
        { ...updateDepartmentPayload },
        {
          new: true,
          runValidators: true,
        },
      );
      return res.send({
        success: true,
        message: "The Designation is updated successfully",
        data: updatedDepartment,
      });
    } catch (error) {
      console.error(error);
      return res.send({
        success: false,
        message: error.message,
      });
    }
  };
  getDepartments = async (req, res) =>
  {
    try {
      let { sort, ...query } = req.query;

      let sortOption = { updatedAt: -1 };

      if (sort) {
        const order = sort === "asc" ? 1 : -1;
        sortOption = { updatedAt: order };
      }
      console.log(query);

      const departments = await Department.find(query)
        .sort(sortOption)
        .lean();

      return res.send({
        success: true,
        message: "All departments fetched successfully",
        data: departments,
      });

    } catch (error) {
      console.log(error);
      return res.send({
        success: false,
        message: error.message,
      });
    }
  };
  getDepartmentById = async (req, res) =>
  {
    try {
      const department = await Department.findById(req.params.id);
      return res.send({
        success: true,
        message: "Department fetched successfully",
        data: department,
      });
    } catch (error) {
      console.log(error);
      return res.send({
        success: false,
        message: error.message,
      });
    }
  };
  deleteDepartment = async (req, res) =>
  {
    const departmentId = req.params.id;
    try {
      const deletedDepartment =
        await Department.findByIdAndDelete(departmentId);
      return res.send({
        success: true,
        message: "Department is deleted successfully",
        data: deletedDepartment,
      });
    } catch (error) {
      console.log(error);
      return res.send({
        success: false,
        message: error.message,
      });
    }
  };

  //aggregations:
  getDepartmentsWithDesignation = async (req, res) =>
  {
    try {
      const departmentsWithDesignations = await Department.aggregate([
        {
          $lookup: {
            from: "designations",
            localField: "_id",
            foreignField: "departmentId",
            as: "designations",
          },
        },
        {
          $project: {
            name: 1,
            code: 1,
            description: 1,
            designations: {
              _id: 1,
              name: 1,
            },
          },
        },
      ]);
      if (departmentsWithDesignations) {
        return res.send({
          success: true,
          message: "department with designations fetched successfully",
          data: departmentsWithDesignations,
        });
      }
    } catch (error) {
      console.log(error);
      return res.send({
        success: false,
        message: error.message,
      });
    }
  };
}
export default new DepartmentController();
