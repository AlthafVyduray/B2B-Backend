import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../lib/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Extract file extension
    const ext = file.originalname.split('.').pop();

    // Generate a unique public_id 
    const publicId = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;

    return {
      folder: "hotels",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: publicId, // This will be returned in req.file.filename
      transformation: [{ quality: "auto", fetch_format: "auto" }],
      format: ext // Keep original extension if desired
    };
  }
});

// Multer upload middleware
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only .jpeg, .png, .webp formats allowed"));
    }
    cb(null, true);
  },
});
