import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname.split('.')[0].trim().replace(/\s+/g, '_')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.post("/", (req: Request, res: Response, next) => {
  upload.single("media")(req, res, (err) => {
    if (err) {
      console.error("Upload Error:", err.message);
      return res.status(400).json({ error: err.message || "File upload failed" });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided. Please upload an image with field name 'media'." });
      }

      const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
      res.status(201).json({
        status: "ok",
        url: fileUrl,
        message: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Upload Route Error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });
});

export default router;
