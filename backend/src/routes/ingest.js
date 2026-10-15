import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { processUploadedFile } from "../services/ingest/processDocument.js";
import { AppError } from "../utils/AppError.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.post(
  "/upload",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError("No file uploaded. Use field name 'file'.", {
        statusCode: 400,
        code: "NO_FILE",
      });
    }
    const result = await processUploadedFile(req.file);
    res.status(result.duplicate ? 200 : 201).json({ data: result });
  }),
);

export default router;
