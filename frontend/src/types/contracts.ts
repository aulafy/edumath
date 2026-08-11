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
export type CurriculumUnit = {
  id: string;
  stage: "PRIMARY" | "ESO";
  grades: number[];
  cycle: number | null;
  title: string;
  sense: string;
  competency_refs: string[];
  assessment_refs: string[];
  basic_knowledge_refs: string[];
  skill_ids: string[];
  content_status: "READY" | "PLANNED";
};
export type Classroom = {
  id: string;
  teacher_key: string;
  name: string;
  stage: "PRIMARY" | "ESO";
  grade: number;
  autonomous_community: string;
};
export type Lesson = {
  id: string;
  classroom_id: string;
  title: string;
  instructions: string;
  curriculum_unit_id: string;
  skill_ids: string[];
  problem_count: number;
  theme: string;
  pacing: string;
};
export type Assignment = { id: string; join_code: string; status: string; lesson: Lesson };
export type EducationalModule = {
  id: string;
  module_id: string;
  version: string;
  title: string;
  summary: string;
  subject: string;
  stage: "PRIMARY" | "ESO";
  grades: number[];
  license: string;
  authors: { name: string; role: string }[];
  status: "VALIDATED";
  package_sha256: string;
  imported_at: string;
  review_status: "AI_DRAFT" | "COMMUNITY_DRAFT" | "EDUCATOR_REVIEWED";
  curriculum_strand: string | null;
};
export type ModuleActivity = {
  id: string;
  type: string;
  title: string;
  instructions: string;
  content: Record<string, unknown>;
  evidence: Record<string, unknown>;
};
export type EducationalModuleDetail = EducationalModule & {
  manifest: Record<string, unknown>;
  activities: ModuleActivity[];
};
export type ModuleAssignment = {
  kind: "MODULE";
  id: string;
  join_code: string;
  status: string;
  module: EducationalModule;
  activities: ModuleActivity[];
  completed_activity_ids: string[];
};
export type JoinedAssignment = ModuleAssignment | ({ kind: "LESSON" } & Assignment);
