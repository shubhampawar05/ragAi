import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { quizRequestSchema } from "../schemas/quiz.js";
import { generateQuiz } from "../services/rag/generateQuiz.js";

const router = Router();

router.post(
  "/generate",
  asyncHandler(async (req, res) => {
    const body = quizRequestSchema.parse(req.body);
    const result = await generateQuiz({
      documentId: body.documentId ?? null,
      topic: body.topic,
      questionCount: body.questionCount,
    });
    res.json({ data: result });
  }),
);

export default router;
