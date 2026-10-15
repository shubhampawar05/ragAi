"use client";

import { RagPipelineBar } from "@/components/journey/RagPipelineBar";
import { fetchDocuments, ragQuery, uploadDocument } from "@/lib/api";
import {
  activeStepCaption,
  buildIngestStatuses,
  buildQueryStatuses,
  INGEST_STEPS,
  QUERY_STEPS,
} from "@/lib/pipelineSteps";
import type { ChatMessage, DocumentRow, TraceStep } from "@/types/rag";
import { useCallback, useEffect, useState } from "react";

const DEFAULT_TOP_K = 5;
const INGEST_STEP_MS = 400;
const QUERY_STEP_MS = 350;

function statusColor(status: DocumentRow["status"]) {
  if (status === "ready") return "text-emerald-600";
  if (status === "failed") return "text-red-600";
  return "text-amber-600";
}

export function RagWorkspace() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | "all">("all");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showJourney, setShowJourney] = useState(true);
  const [showPipeline, setShowPipeline] = useState(true);
  const [activeTrace, setActiveTrace] = useState<TraceStep[] | null>(null);

  const [ingestStepIndex, setIngestStepIndex] = useState(0);
  const [ingestComplete, setIngestComplete] = useState(false);
  const [ingestError, setIngestError] = useState(false);

  const [queryStepIndex, setQueryStepIndex] = useState(0);
  const [queryComplete, setQueryComplete] = useState(false);
  const [queryError, setQueryError] = useState(false);
  const [lastRetrievedCount, setLastRetrievedCount] = useState<number | undefined>();

  const loadDocs = useCallback(async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load documents");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchDocuments()
      .then((docs) => {
        if (!cancelled) setDocuments(docs);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load documents");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!uploading) return;
    const max = INGEST_STEPS.length - 1;
    const timer = setInterval(() => {
      setIngestStepIndex((i) => (i < max ? i + 1 : i));
    }, INGEST_STEP_MS);
    return () => clearInterval(timer);
  }, [uploading]);

  useEffect(() => {
    if (!loading) return;
    const max = QUERY_STEPS.length - 1;
    const timer = setInterval(() => {
      setQueryStepIndex((i) => (i < max ? i + 1 : i));
    }, QUERY_STEP_MS);
    return () => clearInterval(timer);
  }, [loading]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    setIngestComplete(false);
    setIngestError(false);
    setIngestStepIndex(0);
    try {
      await uploadDocument(file);
      await loadDocs();
      setIngestComplete(true);
      setIngestStepIndex(INGEST_STEPS.length - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setIngestError(true);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);
    setQueryComplete(false);
    setQueryError(false);
    setQueryStepIndex(0);

    try {
      const result = await ragQuery({
        question,
        documentId: selectedDocId === "all" ? null : selectedDocId,
        topK: DEFAULT_TOP_K,
      });
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.answer,
        citations: result.citations,
        trace: result.trace,
      };
      setMessages((m) => [...m, assistantMsg]);
      setActiveTrace(result.trace.steps);
      setLastRetrievedCount(result.citations.length);
      setQueryComplete(true);
      setQueryStepIndex(QUERY_STEPS.length - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query failed");
      setQueryError(true);
    } finally {
      setLoading(false);
    }
  }

  const readyCount = documents.filter((d) => d.status === "ready").length;
  const hasReadyDocs = readyCount > 0;

  const ingestStatuses = buildIngestStatuses({
    uploading,
    activeStepIndex: ingestStepIndex,
    ingestComplete: ingestComplete || hasReadyDocs,
    ingestError,
  });

  const queryStatuses = buildQueryStatuses({
    loading,
    activeStepIndex: queryStepIndex,
    queryComplete,
    queryError,
    hasReadyDocs,
  });

  const caption =
    (uploading ? activeStepCaption(INGEST_STEPS, ingestStatuses) : null) ??
    (loading ? activeStepCaption(QUERY_STEPS, queryStatuses) : null);

  return (
    <div className="flex h-[calc(100vh-0px)] min-h-screen bg-zinc-50 text-zinc-900">
      <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white p-4">
        <h1 className="text-lg font-semibold tracking-tight">RAG Lab</h1>
        <p className="mt-1 text-xs text-zinc-500">Phase 1 — ingest &amp; cited Q&amp;A</p>

        <label
          className="mt-6 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-4 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          {uploading ? "Uploading…" : "Upload PDF / TXT / MD"}
          <input
            type="file"
            accept=".pdf,.txt,.md,text/plain,application/pdf"
            className="hidden"
            onChange={onUpload}
            disabled={uploading}
          />
        </label>

        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-400">
          Documents ({readyCount} ready)
        </p>
        <ul className="mt-2 flex-1 space-y-2 overflow-y-auto text-sm">
          {documents.length === 0 && (
            <li className="text-zinc-500">No documents yet.</li>
          )}
          {documents.map((doc) => (
            <li key={doc.id}>
              <button
                type="button"
                onClick={() => setSelectedDocId(doc.id)}
                className={`w-full rounded-md px-2 py-1.5 text-left hover:bg-zinc-100 ${
                  selectedDocId === doc.id ? "bg-indigo-50 ring-1 ring-indigo-200" : ""
                }`}
              >
                <span className="block truncate font-medium">{doc.filename}</span>
                <span className={`text-xs ${statusColor(doc.status)}`}>{doc.status}</span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-2 text-left text-xs text-indigo-600 hover:underline"
          onClick={() => setSelectedDocId("all")}
        >
          Search all documents
        </button>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-white px-4 py-3">
          <span className="text-sm text-zinc-600">
            Scope:{" "}
            <strong>
              {selectedDocId === "all"
                ? "All documents"
                : documents.find((d) => d.id === selectedDocId)?.filename ?? "—"}
            </strong>
          </span>
          <div className="flex items-center gap-4 text-sm text-zinc-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showPipeline}
                onChange={(e) => setShowPipeline(e.target.checked)}
              />
              Show pipeline
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showJourney}
                onChange={(e) => setShowJourney(e.target.checked)}
              />
              Show journey
            </label>
          </div>
        </header>

        {showPipeline && (
          <RagPipelineBar
            ingestStatuses={ingestStatuses}
            queryStatuses={queryStatuses}
            caption={caption}
            topK={DEFAULT_TOP_K}
            retrievedCount={queryComplete && !loading ? lastRetrievedCount : undefined}
          />
        )}

        {error && (
          <div className="mx-4 mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex min-h-0 flex-1">
          <section className="flex min-w-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.length === 0 && (
                <p className="text-center text-sm text-zinc-500">
                  Upload a document, then ask a question about its content.
                </p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-2xl rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "ml-auto bg-indigo-600 text-white"
                      : "bg-white shadow-sm ring-1 ring-zinc-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 space-y-1 border-t border-zinc-100 pt-2">
                      <p className="text-xs font-medium text-zinc-500">Sources</p>
                      {msg.citations.map((c) => (
                        <button
                          key={c.chunkId}
                          type="button"
                          className="block w-full rounded bg-zinc-50 px-2 py-1 text-left text-xs text-zinc-700 hover:bg-zinc-100"
                          onClick={() => setActiveTrace(msg.trace?.steps ?? null)}
                        >
                          <span className="font-medium text-indigo-700">{c.filename}</span>
                          <span className="text-zinc-400"> · score {c.score.toFixed(3)}</span>
                          <span className="mt-0.5 block text-zinc-500">{c.snippet}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <p className="text-sm text-zinc-500">Retrieving context and generating…</p>
              )}
            </div>

            <form onSubmit={onSend} className="border-t border-zinc-200 bg-white p-4">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your documents…"
                  className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  disabled={loading || readyCount === 0}
                />
                <button
                  type="submit"
                  disabled={loading || readyCount === 0}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </section>

          {showJourney && (
            <aside className="hidden w-96 shrink-0 overflow-y-auto border-l border-zinc-200 bg-white p-4 lg:block">
              <h2 className="text-sm font-semibold">Message journey</h2>
              <p className="mt-1 text-xs text-zinc-500">Retrieval &amp; prompt (Phase 1)</p>
              {!activeTrace && (
                <p className="mt-4 text-sm text-zinc-500">Send a question to see the pipeline.</p>
              )}
              <ol className="mt-4 space-y-3">
                {activeTrace?.map((step) => (
                  <li key={step.id} className="rounded-lg border border-zinc-200 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                      {step.title}
                    </p>
                    <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-[11px] text-zinc-700">
                      {JSON.stringify(step.data, null, 2)}
                    </pre>
                  </li>
                ))}
              </ol>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
