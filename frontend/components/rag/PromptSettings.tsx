"use client";

import type { Persona, PromptMode, PromptOptions, PromptPreset } from "@/types/prompt";

type Props = {
  value: PromptOptions;
  onChange: (next: PromptOptions) => void;
  disabled?: boolean;
};

export function PromptSettings({ value, onChange, disabled }: Props) {
  const isCustom = value.preset === "custom";

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Answer style
      </p>

      <label className="block text-xs text-zinc-600">
        Prompt profile
        <select
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
          value={value.preset}
          disabled={disabled}
          onChange={(e) =>
            onChange({ ...value, preset: e.target.value as PromptPreset })
          }
        >
          <option value="phase1">From your documents only (recommended)</option>
          <option value="custom">Customize tone & teaching style</option>
        </select>
      </label>

      {value.preset === "phase1" && (
        <p className="text-xs leading-relaxed text-zinc-500">
          Standard RAG: answers stay grounded in retrieved chunks, cite filenames,
          and say when the upload doesn&apos;t contain enough information.
        </p>
      )}

      {isCustom && (
        <p className="text-xs leading-relaxed text-zinc-500">
          Same retrieval as above — you change how the model is instructed to read
          that context.
        </p>
      )}

      {isCustom && (
        <>
          <label className="block text-xs text-zinc-600">
            Examples in prompt
            <select
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
              value={value.promptMode}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...value, promptMode: e.target.value as PromptMode })
              }
            >
              <option value="zeroShot">No examples — question only</option>
              <option value="fewShot">Include sample Q&A (few-shot)</option>
            </select>
          </label>

          <label className="block text-xs text-zinc-600">
            Voice
            <select
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
              value={value.persona}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...value, persona: e.target.value as Persona })
              }
            >
              <option value="study">Study assistant</option>
              <option value="strict">Strict tutor</option>
              <option value="eli5">Explain simply</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs text-zinc-700">
            <input
              type="checkbox"
              checked={value.chainOfThought}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...value, chainOfThought: e.target.checked })
              }
            />
            Explain reasoning step-by-step before the answer
          </label>
        </>
      )}
    </div>
  );
}
