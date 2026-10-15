import { getChatModel, getOpenAI } from "../llm/openai.js";
import { retrieveChunks } from "../retrieve/vector.js";
import { quizSchema } from "../../schemas/quiz.js";
import { buildTrace, traceStep } from "../../utils/trace.js";
import { AppError } from "../../utils/AppError.js";

function buildQuizPrompt({ contextBlock, topic, questionCount }) {
  const focus = topic.trim()
    ? `Focus the quiz on: ${topic.trim()}.`
    : "Cover the main ideas in the context.";

  return `You create study quizzes from document excerpts only.

${focus}
Return JSON with this shape:
{
  "title": "short quiz title",
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "why the answer is correct, citing the context"
    }
  ]
}

Rules:
- Exactly ${questionCount} questions.
- Each question has 4 options unless the context only supports 2–3 plausible distractors.
- correctIndex is 0-based into options.
- Do not invent facts not supported by the context.

### Context
${contextBlock}`;
}

export async function generateQuiz({
  documentId,
  topic = "",
  questionCount = 5,
  topK = 8,
}) {
  const retrievalQuery =
    topic.trim() || "key concepts definitions facts summary";
  const retrieved = await retrieveChunks(retrievalQuery, {
    topK,
    documentId,
  });

  if (retrieved.length === 0) {
    throw new AppError("No document chunks found. Upload a document first.", {
      code: "NO_CONTEXT",
      statusCode: 400,
    });
  }

  const contextBlock = retrieved
    .map(
      (c, i) =>
        `[${i + 1}: ${c.filename}]\n${c.content}`,
    )
    .join("\n\n---\n\n");

  const userPrompt = buildQuizPrompt({ contextBlock, topic, questionCount });
  const openai = getOpenAI();
  const started = Date.now();
  const completion = await openai.chat.completions.create({
    model: getChatModel(),
    messages: [
      {
        role: "system",
        content:
          "You output valid JSON only. Ground every question in the provided context.",
      },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });
  const latencyMs = Date.now() - started;

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) {
    throw new AppError("Model returned no quiz JSON", {
      code: "QUIZ_EMPTY",
      statusCode: 502,
    });
  }

  let parsed;
  try {
    parsed = quizSchema.parse(JSON.parse(raw));
  } catch (err) {
    throw new AppError("Quiz JSON failed validation. Try again with a narrower topic.", {
      code: "QUIZ_INVALID",
      statusCode: 502,
    });
  }

  for (const q of parsed.questions) {
    if (q.correctIndex >= q.options.length) {
      throw new AppError("Quiz JSON had an invalid correctIndex", {
        code: "QUIZ_INVALID",
        statusCode: 502,
      });
    }
  }

  const trace = buildTrace([
    traceStep("quizRequest", "Quiz request", {
      topic: topic || "(general)",
      questionCount,
      documentId,
    }),
    traceStep("retrieval", "Context for quiz", {
      count: retrieved.length,
      filenames: [...new Set(retrieved.map((c) => c.filename))],
    }),
    traceStep("quiz", "Validated quiz", {
      title: parsed.title,
      questionCount: parsed.questions.length,
    }),
    traceStep("usage", "Token usage", {
      model: getChatModel(),
      latencyMs,
      prompt_tokens: completion.usage?.prompt_tokens,
      completion_tokens: completion.usage?.completion_tokens,
    }),
  ]);

  return { quiz: parsed, trace };
}
