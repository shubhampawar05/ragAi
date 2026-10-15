import OpenAI from "openai";
import { env } from "../../config/env.js";

let openai;

export function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return openai;
}

export function getChatModel() {
  return env.OPENAI_CHAT_MODEL;
}

export function getEmbeddingModel() {
  return env.OPENAI_EMBEDDING_MODEL;
}
