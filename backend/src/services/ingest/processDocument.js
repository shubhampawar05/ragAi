import { createHash } from "crypto";
import * as documentsRepo from "../../db/repositories/documentsRepository.js";
import * as chunksRepo from "../../db/repositories/chunksRepository.js";
import { AppError } from "../../utils/AppError.js";
import { chunkText } from "../../utils/chunkText.js";
import { embedTexts } from "../llm/embeddings.js";
import { saveUploadedFile } from "../storage/localFileStorage.js";
import { extractTextFromFile } from "./extractText.js";

function contentHash(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export async function processUploadedFile(file) {
  const hash = contentHash(file.buffer);

  const existing = await documentsRepo.findDocumentByContentHash(hash);
  if (existing?.status === "ready") {
    return { document: existing, duplicate: true };
  }

  const doc = await documentsRepo.insertDocument({
    filename: file.originalname,
    contentHash: hash,
  });

  try {
    const storagePath = await saveUploadedFile(
      doc.id,
      file.originalname,
      file.buffer,
    );

    const text = await extractTextFromFile(
      file.buffer,
      file.mimetype,
      file.originalname,
    );
    if (!text.trim()) {
      throw new AppError("No text could be extracted from this file.", {
        statusCode: 400,
        code: "EMPTY_DOCUMENT",
      });
    }

    const pieces = chunkText(text);
    const embeddings = await embedTexts(pieces);

    await chunksRepo.insertChunks(
      doc.id,
      pieces.map((content, index) => ({
        chunkIndex: index,
        content,
        embedding: embeddings[index],
      })),
    );

    const updated = await documentsRepo.updateDocumentReady(doc.id, storagePath);

    return {
      document: updated,
      duplicate: false,
      chunkCount: pieces.length,
    };
  } catch (err) {
    await documentsRepo.markDocumentFailed(
      doc.id,
      err.message || "Processing failed",
    );
    throw err;
  }
}

export async function listDocuments() {
  return documentsRepo.listDocuments();
}
