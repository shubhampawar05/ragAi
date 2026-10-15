import { getChatModel, getOpenAI } from "../llm/openai.js";
import { retrieveChunks } from "../retrieve/vector.js";
import { buildRagPrompt } from "./buildPrompt.js";
import { buildTrace, traceStep, truncate } from "../../utils/trace.js";

const SNIPPET_LEN = 200;

function toCitations(chunks) {
  return chunks.map((c) => ({
    chunkId: c.chunkId,
    documentId: c.documentId,
    snippet:
      c.content.length > SNIPPET_LEN
        ? `${c.content.slice(0, SNIPPET_LEN)}…`
        : c.content,
    score: c.score,
    filename: c.filename,
  }));
}

export async function ragQuery({ question, documentId, topK = 5 }) {
  const retrieved = await retrieveChunks(question, { topK, documentId });
  const { messages, augmentedUser, system } = buildRagPrompt({
    question,
    chunks: retrieved,
  });

  const openai = getOpenAI();
  const started = Date.now();
  const completion = await openai.chat.completions.create({
    model: getChatModel(),
    messages,
    temperature: 0.2,
  });
  const latencyMs = Date.now() - started;

  const answer = completion.choices[0]?.message?.content?.trim() || "";
  const usage = completion.usage;

  const trace = buildTrace([
    traceStep("question", "Your question", { text: question }),
    traceStep("retrieval", "Retrieved chunks", {
      count: retrieved.length,
      chunks: retrieved.map((c) => ({
        chunkId: c.chunkId,
        filename: c.filename,
        score: c.score,
        preview: c.content.slice(0, 120),
      })),
    }),
    traceStep("augmentedPrompt", "Augmented prompt", {
      system,
      user: truncate(augmentedUser),
    }),
    traceStep("answer", "Model answer", { text: answer }),
    traceStep("usage", "Token usage", {
      model: getChatModel(),
      latencyMs,
      prompt_tokens: usage?.prompt_tokens,
      completion_tokens: usage?.completion_tokens,
    }),
  ]);

  return {
    answer,
    citations: toCitations(retrieved),
    trace,
  };
}
