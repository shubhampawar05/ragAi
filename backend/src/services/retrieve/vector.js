import * as chunksRepo from "../../db/repositories/chunksRepository.js";
import * as documentsRepo from "../../db/repositories/documentsRepository.js";
import { embedQuery } from "../llm/embeddings.js";

export async function retrieveChunks(question, { topK = 5, documentId = null } = {}) {
  const embedding = await embedQuery(question);
  const rows = await chunksRepo.matchChunks(embedding, { topK, documentId });

  const docIds = [...new Set(rows.map((r) => r.document_id))];
  const filenameMap = await documentsRepo.getFilenamesByIds(docIds);

  return rows.map((row) => ({
    chunkId: row.id,
    documentId: row.document_id,
    content: row.content,
    score: row.similarity,
    filename: filenameMap[row.document_id] || "unknown",
  }));
}
