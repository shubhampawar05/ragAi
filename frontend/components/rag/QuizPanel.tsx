"use client";

import type { Quiz, TraceStep } from "@/types/rag";
import { useState } from "react";

type Props = {
  quiz: Quiz | null;
  loading: boolean;
  onGenerate: (topic: string) => void;
  disabled?: boolean;
  onShowTrace?: (steps: TraceStep[]) => void;
  trace?: TraceStep[] | null;
};

export function QuizPanel({
  quiz,
  loading,
  onGenerate,
  disabled,
  onShowTrace,
  trace,
}: Props) {
  const [topic, setTopic] = useState("");
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  function toggleReveal(index: number) {
    setRevealed((r) => ({ ...r, [index]: !r[index] }));
  }

  return (
    <div className="mt-4 space-y-3 border-t border-zinc-200 pt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Study quiz
      </p>
      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Optional topic (e.g. Chapter 3)"
        className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
        disabled={disabled || loading}
      />
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => {
          setRevealed({});
          onGenerate(topic);
        }}
        className="w-full rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Generating…" : "Generate quiz"}
      </button>

      {quiz && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-zinc-800">{quiz.title}</p>
            {trace && onShowTrace && (
              <button
                type="button"
                className="text-xs text-indigo-600 hover:underline"
                onClick={() => onShowTrace(trace)}
              >
                Journey
              </button>
            )}
          </div>
          <ol className="space-y-3 text-sm">
            {quiz.questions.map((q, i) => (
              <li key={i} className="rounded-md border border-zinc-200 bg-white p-2">
                <p className="font-medium text-zinc-800">
                  {i + 1}. {q.question}
                </p>
                <ul className="mt-2 space-y-1 text-xs text-zinc-600">
                  {q.options.map((opt, j) => (
                    <li key={j}>
                      {String.fromCharCode(65 + j)}. {opt}
                      {revealed[i] && j === q.correctIndex && (
                        <span className="ml-1 font-medium text-emerald-600">✓</span>
                      )}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-2 text-xs text-indigo-600 hover:underline"
                  onClick={() => toggleReveal(i)}
                >
                  {revealed[i] ? "Hide answer" : "Show answer"}
                </button>
                {revealed[i] && (
                  <p className="mt-1 text-xs text-zinc-500">{q.explanation}</p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
