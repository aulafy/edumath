export type MathSpec = { operation: "add"; a: number; b: number; answer: number };
export type ProblemSpec = {
  id: string;
  spec_version: string;
  skill_id: string;
  skill_version: string;
  strategy: string;
  representation: string;
  difficulty: number;
  math: MathSpec;
  unknown: string;
  template_id: string;
  template_version: string;
};
export type VisualSpec =
  | { type: "TEN_FRAME"; filled: number; added: number; unknown: "TOTAL" | null }
  | { type: "NUMBER_LINE"; minimum: number; maximum: number; start: number; jumps: number[]; unknown: "END" | null }
  | { type: "PART_PART_WHOLE"; part_a: number; part_b: number; whole: number | null; unknown: "WHOLE" | "PART_A" | "PART_B" };
export type ProblemResponse = {
  session_id: string;
  session_revision: number;
  state: string;
  problem: ProblemSpec;
  visual: VisualSpec;
  rendered_story: string;
  tutor_message: string | null;
  allowed_actions: string[];
  attempt_number: number;
  hint_level: number;
  ui: { input_mode: "NUMBER" | "MULTIPLE_CHOICE" | "MANIPULATIVE"; submit_label: string; show_hint_button: boolean; theme: string };
};
export type Student = { id: string; display_name: string; age_band: string };
export type VoiceCapabilities = {
  enabled: boolean;
  stt_available: boolean;
  tts_available: boolean;
  stt_provider: string;
  tts_provider: string;
  browser_tts_fallback: boolean;
};
export type TranscriptionResult = {
  text: string;
  normalized_answer: number | null;
  confidence: number | null;
  provider: string;
};
