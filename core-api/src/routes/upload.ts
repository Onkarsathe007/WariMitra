import { Router, Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "visava_uploads",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: `${Date.now()}-${file.originalname.split('.')[0].trim().replace(/\s+/g, '_')}`,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post("/", (req: Request, res: Response, next) => {
  upload.single("media")(req, res, (err) => {
    if (err) {
      console.error("Multer/Cloudinary Upload Error:", err);
      return res.status(400).json({ error: err.message || "File upload failed" });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided. Please upload an image with field name 'media'." });
      }

      // req.file.path contains the absolute Cloudinary URL when using CloudinaryStorage
      const fileUrl = req.file.path;
      res.status(201).json({
        status: "ok",
        url: fileUrl,
        message: "Image uploaded successfully to Cloudinary",
      });
    } catch (error) {
      console.error("Upload Route Error:", error);
      res.status(500).json({ error: "Failed to upload image to Cloudinary" });
    }
  });
});

export default router;
