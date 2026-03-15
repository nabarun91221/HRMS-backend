import multer from "multer";
import cloudinary from "../../configs/clodinery.config.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

//File Filter
const fileFilter = function (req, file, cb)
{
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|avif|gif|bmp|tiff|tif|ico|heic|heif|jxl)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};
//in cloud storage for "production" environment
const storage_cloudinery = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "avif", "gif", "bmp", "tiff", "tif", "ico", "heic", "heif", "jxl"],
    transformation: [{ width: 800, crop: "limit" }],
  },
});

const imageUpload = multer({
  storage: storage_cloudinery,
  fileFilter
});

export default imageUpload;
