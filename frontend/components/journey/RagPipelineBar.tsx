"use client";

import {
  INGEST_STEPS,
  QUERY_STEPS,
  type PipelineStepDef,
  type StepStatus,
} from "@/lib/pipelineSteps";

type RagPipelineBarProps = {
  ingestStatuses: Record<string, StepStatus>;
  queryStatuses: Record<string, StepStatus>;
  caption?: string | null;
  topK?: number;
  retrievedCount?: number;
  className?: string;
};

function stepClasses(status: StepStatus) {
  switch (status) {
    case "done":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "active":
      return "border-indigo-300 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-200";
    case "error":
      return "border-red-300 bg-red-50 text-red-800";
    case "disabled":
      return "border-zinc-100 bg-zinc-50 text-zinc-400";
    default:
      return "border-zinc-200 bg-white text-zinc-600";
  }
}

function StepRow({
  title,
  steps,
  statuses,
  topK,
}: {
  title: string;
  steps: PipelineStepDef[];
  statuses: Record<string, StepStatus>;
  topK?: number;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">{title}</p>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {steps.map((step, index) => {
          const status = statuses[step.id] ?? "pending";
          const label =
            step.id === "top_k" && topK != null ? `Top ${topK}` : step.shortLabel;
          return (
            <div key={step.id} className="flex shrink-0 items-center gap-1">
              <div
                title={step.longLabel}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${stepClasses(status)} ${status === "active" ? "animate-pulse" : ""}`}
              >
                {label}
              </div>
              {index < steps.length - 1 && (
                <span className="text-zinc-300 select-none" aria-hidden>→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RagPipelineBar({
  ingestStatuses,
  queryStatuses,
  caption,
  topK = 5,
  retrievedCount,
  className = "",
}: RagPipelineBarProps) {
  return (
    <div className={`border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 ${className}`}>
      <div className="space-y-3">
        <StepRow title="Index document (once per file)" steps={INGEST_STEPS} statuses={ingestStatuses} />
        <StepRow
          title="Ask question (each chat)"
          steps={QUERY_STEPS}
          statuses={queryStatuses}
          topK={topK}
        />
      </div>
      {(caption || retrievedCount != null) && (
        <p className="mt-2 text-xs text-zinc-600">
          {caption}
          {retrievedCount != null && !caption && (
            <>Retrieved {retrievedCount} chunk{retrievedCount === 1 ? "" : "s"} for the last answer.</>
          )}
          {retrievedCount != null && caption && (
            <span className="text-zinc-400">
              {" "}
              · Retrieved {retrievedCount} chunk{retrievedCount === 1 ? "" : "s"}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
