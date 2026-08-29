import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../../uploads"); // We should put uploads inside core-api/uploads
// Wait, __dirname in src/routes is core-api/src/routes. So ../../uploads is core-api/uploads.
// Let's use path.join(process.cwd(), 'uploads') to be safe and robust, or specifically path.resolve(__dirname, "../../uploads").

const storageDir = path.resolve(__dirname, "../../uploads");
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, storageDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomUUID();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

router.post("/", upload.single("media"), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided. Please upload an image with field name 'media'." });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({
      status: "ok",
      url: fileUrl,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;
