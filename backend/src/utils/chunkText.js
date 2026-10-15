const DEFAULT_SIZE = 2000;
const DEFAULT_OVERLAP = 200;

/**
 * Split text into overlapping character chunks (Phase 1 heuristic).
 */
export function chunkText(text, { size = DEFAULT_SIZE, overlap = DEFAULT_OVERLAP } = {}) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks = [];
  let start = 0;
  while (start < normalized.length) {
    const end = Math.min(start + size, normalized.length);
    const piece = normalized.slice(start, end).trim();
    if (piece) chunks.push(piece);
    if (end >= normalized.length) break;
    start = end - overlap;
    if (start < 0) start = 0;
  }
  return chunks;
}
