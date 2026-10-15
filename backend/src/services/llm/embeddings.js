import { getEmbeddingModel, getOpenAI } from "./openai.js";

export async function embedTexts(texts) {
  if (!texts.length) return [];
  const openai = getOpenAI();
  const model = getEmbeddingModel();
  const response = await openai.embeddings.create({
    model,
    input: texts,
  });
  return response.data
    .sort((a, b) => a.index - b.index)
    .map((row) => row.embedding);
}

export async function embedQuery(text) {
  const [vector] = await embedTexts([text]);
  return vector;
}
