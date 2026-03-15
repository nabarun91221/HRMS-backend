import cloudinary from "../../../configs/clodinery.config.js";

class FileController {
  fileUpload = async (req, res) => {
    if (req.file) {
      console.log(req.file);
      return res.send({
        success: true,
        message: `${req.file.originalname} has uploaded successfully`,
        data: {
          name: req.file.originalname,
          fileUrl: req.file.path,
          publicId: req.file.filename,
        },
      });
    } else
      return res.send({
        success: false,
        message: "file upload failed",
      });
  };
  fileDelete = async (req, res) => {
    try {
      const { publicId } = req.body;

      const resultImage = await cloudinary.uploader.destroy(publicId);

      let result = resultImage;

      // if image not found, try raw
      if (resultImage.result === "not found") {
        result = await cloudinary.uploader.destroy(publicId, {
          resource_type: "raw",
        });
      }

      if (result.result !== "ok") {
        return res.status(400).json({
          success: false,
          message: "File not found or already deleted",
        });
      }

      return res.json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
}

export default new FileController();
