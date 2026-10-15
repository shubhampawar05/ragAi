export type PipelinePhase = "ingest" | "query";

export type StepStatus = "pending" | "active" | "done" | "error" | "disabled";

export type PipelineStepDef = {
  id: string;
  shortLabel: string;
  longLabel: string;
  phase: PipelinePhase;
};

export const INGEST_STEPS: PipelineStepDef[] = [
  {
    id: "upload",
    shortLabel: "Upload",
    longLabel: "Upload PDF / text",
    phase: "ingest",
  },
  {
    id: "extract",
    shortLabel: "Extract",
    longLabel: "Extract & chunk",
    phase: "ingest",
  },
  {
    id: "embed_chunks",
    shortLabel: "Embed",
    longLabel: "Embed chunks",
    phase: "ingest",
  },
  {
    id: "save_db",
    shortLabel: "Save",
    longLabel: "Save to database",
    phase: "ingest",
  },
];

export const QUERY_STEPS: PipelineStepDef[] = [
  {
    id: "question",
    shortLabel: "Question",
    longLabel: "Your question",
    phase: "query",
  },
  {
    id: "embed_query",
    shortLabel: "Embed",
    longLabel: "Embed query",
    phase: "query",
  },
  {
    id: "similarity",
    shortLabel: "Search",
    longLabel: "Similarity search",
    phase: "query",
  },
  {
    id: "top_k",
    shortLabel: "Top K",
    longLabel: "Top K chunks",
    phase: "query",
  },
  {
    id: "generate",
    shortLabel: "LLM",
    longLabel: "Generate answer",
    phase: "query",
  },
  {
    id: "done",
    shortLabel: "Done",
    longLabel: "Done",
    phase: "query",
  },
];

function statusesForSteps(
  steps: PipelineStepDef[],
  activeIndex: number,
  opts: { running: boolean; complete: boolean; errored: boolean; disabled: boolean },
): Record<string, StepStatus> {
  const out: Record<string, StepStatus> = {};
  if (opts.disabled) {
    for (const s of steps) out[s.id] = "disabled";
    return out;
  }
  if (opts.errored) {
    steps.forEach((s, i) => {
      if (i < activeIndex) out[s.id] = "done";
      else if (i === activeIndex) out[s.id] = "error";
      else out[s.id] = "pending";
    });
    return out;
  }
  if (opts.complete) {
    for (const s of steps) out[s.id] = "done";
    return out;
  }
  if (!opts.running) {
    for (const s of steps) out[s.id] = "pending";
    return out;
  }
  steps.forEach((s, i) => {
    if (i < activeIndex) out[s.id] = "done";
    else if (i === activeIndex) out[s.id] = "active";
    else out[s.id] = "pending";
  });
  return out;
}

export function buildIngestStatuses(params: {
  uploading: boolean;
  activeStepIndex: number;
  ingestComplete: boolean;
  ingestError: boolean;
}): Record<string, StepStatus> {
  return statusesForSteps(INGEST_STEPS, params.activeStepIndex, {
    running: params.uploading,
    complete: params.ingestComplete && !params.uploading,
    errored: params.ingestError,
    disabled: false,
  });
}

export function buildQueryStatuses(params: {
  loading: boolean;
  activeStepIndex: number;
  queryComplete: boolean;
  queryError: boolean;
  hasReadyDocs: boolean;
}): Record<string, StepStatus> {
  return statusesForSteps(QUERY_STEPS, params.activeStepIndex, {
    running: params.loading,
    complete: params.queryComplete && !params.loading,
    errored: params.queryError,
    disabled: !params.hasReadyDocs,
  });
}

export function activeStepCaption(
  steps: PipelineStepDef[],
  statuses: Record<string, StepStatus>,
): string | null {
  const active = steps.find((s) => statuses[s.id] === "active");
  return active ? `Right now: ${active.longLabel}…` : null;
}
