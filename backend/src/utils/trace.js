export function traceStep(id, title, data) {
  return { id, title, data };
}

export function buildTrace(steps) {
  return { steps };
}

export function truncate(text, max = 4000) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max)}\n… [truncated]`;
}
