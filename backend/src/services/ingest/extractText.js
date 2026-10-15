import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { AppError } from "../../utils/AppError.js";

const TEXT_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "application/octet-stream",
]);

export async function extractTextFromFile(buffer, mimetype, originalname) {
  const lower = (originalname || "").toLowerCase();

  if (mimetype === "application/pdf" || lower.endsWith(".pdf")) {
    const result = await pdfParse(buffer);
    return result.text || "";
  }

  if (
    TEXT_TYPES.has(mimetype) ||
    lower.endsWith(".txt") ||
    lower.endsWith(".md")
  ) {
    return buffer.toString("utf8");
  }

  throw new AppError("Unsupported file type. Use PDF, TXT, or MD.", {
    statusCode: 400,
    code: "UNSUPPORTED_FILE",
  });
}
