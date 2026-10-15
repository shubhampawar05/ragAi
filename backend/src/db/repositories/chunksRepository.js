import { toPgVector } from "../pgvector.js";
import { getPool, withTransaction } from "../pool.js";

export async function insertChunks(documentId, chunks) {
  await withTransaction(async (client) => {
    for (const { chunkIndex, content, embedding } of chunks) {
      await client.query(
        `INSERT INTO chunks (document_id, chunk_index, content, embedding)
         VALUES ($1, $2, $3, $4::vector)`,
        [documentId, chunkIndex, content, toPgVector(embedding)],
      );
    }
  });
}

export async function matchChunks(queryEmbedding, { topK = 5, documentId = null }) {
  const { rows } = await getPool().query(
    `SELECT id, document_id, content, similarity
     FROM match_chunks($1::vector, $2, $3)`,
    [toPgVector(queryEmbedding), topK, documentId],
  );
  return rows;
}
