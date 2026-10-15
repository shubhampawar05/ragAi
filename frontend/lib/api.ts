const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ApiError = { error: { code: string; message: string } };

async function parseJson<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    const err = body as ApiError;
    throw new Error(err.error?.message ?? res.statusText);
  }
  return body as T;
}

export async function fetchDocuments() {
  const res = await fetch(`${API_URL}/api/documents`);
  const json = await parseJson<{ data: { documents: import("../types/rag").DocumentRow[] } }>(res);
  return json.data.documents;
}

export async function uploadDocument(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/api/ingest/upload`, {
    method: "POST",
    body: form,
  });
  return parseJson<{
    data: {
      document: import("../types/rag").DocumentRow;
      duplicate?: boolean;
      chunkCount?: number;
    };
  }>(res);
}

export async function ragQuery(body: {
  question: string;
  documentId?: string | null;
  topK?: number;
}) {
  const res = await fetch(`${API_URL}/api/rag/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await parseJson<{ data: import("../types/rag").RagQueryResult }>(res);
  return json.data;
}
