/** Format embedding array for Postgres `vector` type (pgvector). */
export function toPgVector(embedding) {
  return `[${embedding.join(",")}]`;
}
