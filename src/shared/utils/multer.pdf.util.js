import multer from "multer";
import cloudinary from "../../configs/clodinery.config.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// ✅ File Filter (PDF only)
const fileFilter = function (req, file, cb)
{
    if (!file.originalname.match(/\.pdf$/i)) {
        return cb(new Error("Only PDF files are allowed!"), false);
    }
    cb(null, true);
};

const storage_cloudinary = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "documents",
        resource_type: "raw",
        allowed_formats: ["pdf"]
    },
});

const pdfUpload = multer({
    storage: storage_cloudinary,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

export default pdfUpload;


// FOR CONVERTING RAW DATA TO A PDF FILE:

// const fs = require("fs");

// const rawPdf = `PASTE_FULL_RAW_DATA_HERE`;

// fs.writeFileSync("resume.pdf", rawPdf, "binary");