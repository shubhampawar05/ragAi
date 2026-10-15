const SYSTEM = `You are a helpful study assistant. Answer ONLY using the provided context.
If the context does not contain enough information, say "I don't know based on the uploaded documents."
Cite sources by mentioning the filename when relevant. Be concise and accurate.`;

export function buildRagPrompt({ question, chunks }) {
  const contextBlock = chunks
    .map(
      (c, i) =>
        `[Source ${i + 1}: ${c.filename} | score ${c.score?.toFixed(3) ?? "n/a"}]\n${c.content}`,
    )
    .join("\n\n---\n\n");

  const userContent = `### Context\n${contextBlock}\n\n### Question\n${question}`;

  return {
    system: SYSTEM,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userContent },
    ],
    augmentedUser: userContent,
  };
}
