import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ragQuerySchema } from "../schemas/ragQuery.js";
import { ragQuery } from "../services/rag/query.js";

const router = Router();

router.post(
  "/query",
  asyncHandler(async (req, res) => {
    const body = ragQuerySchema.parse(req.body);
    const result = await ragQuery({
      question: body.question,
      documentId: body.documentId ?? null,
      topK: body.topK,
    });
    res.json({ data: result });
  }),
);

export default router;
