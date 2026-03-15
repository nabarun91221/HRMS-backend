import Department from "../models/department.model.js";
import Designation from "../models/designation.model.js";
class DesignationController {
  getDesignations = async (req, res) => {
    try {
      const designations = await Designation.find().populate("departmentId", {
        _id: 1,
        name: 1,
      });
      return res.send({
        success: true,
        message: "All designations fetched successfully",
        data: designations,
      });
    } catch (error) {
      console.log(error);
      return res.send({
        success: false,
        message: error.message,
      });
    }
  };

  getDesignationById = async (req, res) => {
    try {
      const designation = await Designation.findById(req.params.id).populate(
        "departmentId",
        {
          _id: 1,
          name: 1,
        },
      );
      return res.send({
        success: true,
        message: "Designation fetched successfully",
        data: designation,
      });
    } catch (error) {
      console.log(error);
      return res.send({
        success: false,
        message: error.message,
      });
    }
  };
  createDesignation = async (req, res) => {
    const departmentId = req.params.departmentid;
    const newDesignationPayload = req.body;
    try {
      const isDepartmentExist = await Department.findById(departmentId);
      if (isDepartmentExist) {
        const newDesignation = await Designation.create({
          ...newDesignationPayload,
          departmentId,
        });
        return res.send({
          success: true,
          message: "The Designation is created successfully",
          data: newDesignation,
        });
      } else
        return res.send({
          success: false,
          message: "Department with this id is not",
        });
    } catch (error) {
      console.error(error);
      return res.send({
        success: false,
        message: error.message,
      });
    }
  };
  updateDesignation = async (req, res) => {
    const designationId = req.params.id;
    const updateDesignationPayload = req.body;

    try {
      const updatedDesignation = await Designation.findByIdAndUpdate(
        designationId,
        updateDesignationPayload,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedDesignation) {
        return res.status(404).send({
          success: false,
          message: "Designation not found",
        });
      }

      return res.status(200).send({
        success: true,
        message: "The Designation is updated successfully",
        data: updatedDesignation,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  };

  getDesignationsByDepartmentId = async (req, res) => {
    const DepartmentId = req.params.id;
    try {
      const isDepartmentExist = await Department.findById(DepartmentId);
      if (isDepartmentExist) {
        const designations = await Designation.find({
          departmentId: DepartmentId,
        });
        return res.send({
          success: true,
          message: "Designations fetched successfully",
          data: designations,
        });
      } else
        return res.send({
          success: false,
          message: "Department with this id is not there",
        });
    } catch (error) {
      console.log(error);
      return res.send({
        success: false,
        message: error.message,
      });
    }
  };
  deleteDesignation = async (req, res) => {
    const designationId = req.params.id;
    try {
      const deletedDesignation =
        await Designation.findByIdAndDelete(designationId);
      if (deletedDesignation) {
        return res.send({
          success: true,
          message: "designation is deleted successfully",
          data: deletedDesignation,
        });
      } else {
        return res.send({
          success: false,
          message: "Designation is not exist",
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
export default new DesignationController();
