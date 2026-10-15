import { z } from "zod";

export const promptOptionsSchema = z.object({
  /** `phase1` = original RAG system prompt only; `custom` = Phase 2 controls */
  preset: z.enum(["phase1", "custom"]).optional().default("phase1"),
  promptMode: z.enum(["zeroShot", "fewShot"]).optional().default("zeroShot"),
  persona: z.enum(["study", "strict", "eli5"]).optional().default("study"),
  chainOfThought: z.boolean().optional().default(false),
});
