import { z } from "zod";

export const quizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(6),
  correctIndex: z.number().int().min(0),
  explanation: z.string().min(1),
});

export const quizSchema = z.object({
  title: z.string().min(1),
  questions: z.array(quizQuestionSchema).min(1).max(15),
});

export const quizRequestSchema = z.object({
  documentId: z.string().uuid().optional().nullable(),
  topic: z.string().max(500).optional().default(""),
  questionCount: z.coerce.number().int().min(1).max(10).optional().default(5),
});
