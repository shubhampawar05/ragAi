import { getPool } from "../pool.js";

export async function findDocumentByContentHash(contentHash) {
  const { rows } = await getPool().query(
    `SELECT id, filename, status, created_at
     FROM documents WHERE content_hash = $1 LIMIT 1`,
    [contentHash],
  );
  return rows[0] ?? null;
}

export async function insertDocument({ filename, contentHash }) {
  const { rows } = await getPool().query(
    `INSERT INTO documents (filename, content_hash, status)
     VALUES ($1, $2, 'processing')
     RETURNING id, filename, status, created_at`,
    [filename, contentHash],
  );
  return rows[0];
}

export async function updateDocumentReady(id, storagePath) {
  const { rows } = await getPool().query(
    `UPDATE documents
     SET status = 'ready', storage_path = $2, error_message = NULL
     WHERE id = $1
     RETURNING id, filename, status, created_at, storage_path`,
    [id, storagePath],
  );
  return rows[0];
}

export async function markDocumentFailed(id, errorMessage) {
  await getPool().query(
    `UPDATE documents SET status = 'failed', error_message = $2 WHERE id = $1`,
    [id, errorMessage],
  );
}

export async function listDocuments() {
  const { rows } = await getPool().query(
    `SELECT id, filename, status, created_at, error_message
     FROM documents
     ORDER BY created_at DESC`,
  );
  return rows;
}

export async function getFilenamesByIds(ids) {
  if (!ids.length) return {};
  const { rows } = await getPool().query(
    `SELECT id, filename FROM documents WHERE id = ANY($1::uuid[])`,
    [ids],
  );
  return Object.fromEntries(rows.map((r) => [r.id, r.filename]));
}
