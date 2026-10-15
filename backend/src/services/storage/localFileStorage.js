import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "../../config/env.js";

const backendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

export async function saveUploadedFile(documentId, filename, buffer) {
  const dir = path.join(backendRoot, env.LOCAL_STORAGE_DIR, documentId);
  await mkdir(dir, { recursive: true });
  const safeName = path.basename(filename);
  const fullPath = path.join(dir, safeName);
  await writeFile(fullPath, buffer);
  return path.join(env.LOCAL_STORAGE_DIR, documentId, safeName);
}
