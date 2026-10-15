import { z } from "zod";
import { promptOptionsSchema } from "./promptOptions.js";

export const ragQuerySchema = z
  .object({
    question: z.string().min(1, "Question is required").max(8000),
    documentId: z.string().uuid().optional().nullable(),
    topK: z.coerce.number().int().min(1).max(20).optional().default(5),
  })
  .merge(promptOptionsSchema);
