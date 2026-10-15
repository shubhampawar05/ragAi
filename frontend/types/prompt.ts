export type PromptPreset = "phase1" | "custom";
export type PromptMode = "zeroShot" | "fewShot";
export type Persona = "study" | "strict" | "eli5";

export type PromptOptions = {
  preset: PromptPreset;
  promptMode: PromptMode;
  persona: Persona;
  chainOfThought: boolean;
};

export const DEFAULT_PROMPT_OPTIONS: PromptOptions = {
  preset: "phase1",
  promptMode: "zeroShot",
  persona: "study",
  chainOfThought: false,
};
