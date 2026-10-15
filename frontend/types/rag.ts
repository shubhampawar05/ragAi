export type DocumentRow = {
  id: string;
  filename: string;
  status: "processing" | "ready" | "failed";
  created_at: string;
  error_message?: string | null;
};

export type Citation = {
  chunkId: string;
  documentId: string;
  snippet: string;
  score: number;
  filename: string;
};

export type TraceStep = {
  id: string;
  title: string;
  data: Record<string, unknown>;
};

export type RagQueryResult = {
  answer: string;
  citations: Citation[];
  trace: { steps: TraceStep[] };
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  trace?: { steps: TraceStep[] };
};
