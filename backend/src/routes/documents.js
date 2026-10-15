import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { listDocuments } from "../services/ingest/processDocument.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const documents = await listDocuments();
    res.json({ data: { documents } });
  }),
);

export default router;
