import { Router } from "express";
import verifyRequestJwt from "../../../shared/middlewares/auth.middleware.js";
import imageUpload from "../../../shared/utils/multer.image.util.js";
import pdfUpload from "../../../shared/utils/multer.pdf.util.js";
import FileController from "../controllers/file.controller.js";
const router = Router();
router.post(
  "/file/image/upload",
  verifyRequestJwt,
  imageUpload.single("image"),
  FileController.fileUpload,
);
router.post(
  "/file/pdf/upload",
  verifyRequestJwt,
  pdfUpload.single("pdf"),
  FileController.fileUpload,
);
router.delete("/file/delete", verifyRequestJwt, FileController.fileDelete);
export default router;
