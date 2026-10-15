/** Original Phase 1 system prompt — used when preset is `phase1` */
export const PHASE1_SYSTEM_PROMPT = `You are a helpful study assistant. Answer ONLY using the provided context.
If the context does not contain enough information, say "I don't know based on the uploaded documents."
Cite sources by mentioning the filename when relevant. Be concise and accurate.`;

const BASE_RULES = `Answer ONLY using the provided context.
If the context does not contain enough information, say "I don't know based on the uploaded documents."
Cite sources by mentioning the filename when relevant. Be concise and accurate.`;

export const PERSONAS = {
  study: `You are a helpful study assistant. ${BASE_RULES}`,
  strict: `You are a strict exam tutor. Use precise terminology. ${BASE_RULES} Do not speculate.`,
  eli5: `You explain concepts in simple language for beginners. ${BASE_RULES} Use short sentences and analogies when helpful.`,
};

const COT_INSTRUCTION =
  "Think step by step before your final answer. Show brief reasoning, then give a clear final answer.";

/** Fixed few-shot pair (RAG-style) — teaches citation + grounded answers */
export const FEW_SHOT_MESSAGES = [
  {
    role: "user",
    content: `### Context\n[Source 1: sample.txt | score 0.910]\nPhotosynthesis converts light into chemical energy in plants.\n\n### Question\nWhat do plants do with light?`,
  },
  {
    role: "assistant",
    content:
      "According to sample.txt, plants use photosynthesis to convert light into chemical energy.",
  },
];

export function buildSystemPrompt({ persona = "study", chainOfThought = false }) {
  const base = PERSONAS[persona] ?? PERSONAS.study;
  if (!chainOfThought) return base;
  return `${base}\n\n${COT_INSTRUCTION}`;
}
