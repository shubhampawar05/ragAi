import {
  buildSystemPrompt,
  FEW_SHOT_MESSAGES,
  PHASE1_SYSTEM_PROMPT,
} from "../llm/promptModes.js";

export function buildRagPrompt({
  question,
  chunks,
  preset = "phase1",
  promptMode = "zeroShot",
  persona = "study",
  chainOfThought = false,
}) {
  const usePhase1 = preset === "phase1";
  const system = usePhase1
    ? PHASE1_SYSTEM_PROMPT
    : buildSystemPrompt({ persona, chainOfThought });
  const contextBlock = chunks
    .map(
      (c, i) =>
        `[Source ${i + 1}: ${c.filename} | score ${c.score?.toFixed(3) ?? "n/a"}]\n${c.content}`,
    )
    .join("\n\n---\n\n");

  const userContent = `### Context\n${contextBlock}\n\n### Question\n${question}`;

  const fewShot =
    !usePhase1 && promptMode === "fewShot" ? FEW_SHOT_MESSAGES : [];

  return {
    system,
    promptConfig: usePhase1
      ? {
          preset: "phase1",
          label: "From your documents only (recommended)",
        }
      : {
          preset: "custom",
          label: "Customize tone & teaching style",
          promptMode,
          persona,
          chainOfThought,
        },
    messages: [
      { role: "system", content: system },
      ...fewShot,
      { role: "user", content: userContent },
    ],
    augmentedUser: userContent,
  };
}
