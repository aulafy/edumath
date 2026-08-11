import type { Assignment, Classroom, CurriculumUnit, EducationalModule, Lesson, ProblemResponse, Student, TranscriptionResult, VoiceCapabilities } from "../types/contracts";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  return response.json() as Promise<T>;
}

export const api = {
  students: () => request<Student[]>("/students"),
  createStudent: (display_name: string) =>
    request<Student>("/students", { method: "POST", body: JSON.stringify({ display_name }) }),
  startSession: (student_id: string, theme: string, assignment_code?: string) =>
    request<ProblemResponse>("/sessions", { method: "POST", body: JSON.stringify({ student_id, theme, assignment_code: assignment_code || null }) }),
  getSession: (sessionId: string) => request<ProblemResponse>(`/sessions/${sessionId}`),
  submitAnswer: (session: ProblemResponse, answer: string) =>
    request<ProblemResponse>(`/sessions/${session.session_id}/answers`, {
      method: "POST",
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        expected_revision: session.session_revision,
        answer,
        response_ms: null
      })
    }),
  hint: (session: ProblemResponse) =>
    request<ProblemResponse>(`/sessions/${session.session_id}/hint`, {
      method: "POST",
      body: JSON.stringify({ expected_revision: session.session_revision })
    }),
  progress: (studentId: string) => request<Record<string, unknown>>(`/students/${studentId}/progress`),
  voiceCapabilities: () => request<VoiceCapabilities>("/voice/capabilities"),
  curriculum: (stage: string, grade: number) =>
    request<{ units: CurriculumUnit[] }>(`/curriculum/spain/mathematics?stage=${stage}&grade=${grade}`),
  createClassroom: (data: { name: string; stage: string; grade: number }) =>
    request<Classroom>("/teacher/classrooms", { method: "POST", body: JSON.stringify(data) }),
  createLesson: (classroom: Classroom, data: Record<string, unknown>) =>
    request<Lesson>(`/teacher/classrooms/${classroom.id}/lessons`, {
      method: "POST",
      headers: { "X-Teacher-Key": classroom.teacher_key },
      body: JSON.stringify(data)
    }),
  publishLesson: (classroom: Classroom, lessonId: string) =>
    request<Assignment>(`/teacher/lessons/${lessonId}/publish`, {
      method: "POST",
      headers: { "X-Teacher-Key": classroom.teacher_key },
      body: JSON.stringify({})
    }),
  joinAssignment: (code: string, student_id: string) =>
    request(`/assignments/${code}/join`, { method: "POST", body: JSON.stringify({ student_id }) }),
  modules: () => request<EducationalModule[]>("/modules"),
  importModule: async (classroom: Classroom, file: File) => {
    const form = new FormData();
    form.append("package", file);
    const response = await fetch(`${API_BASE}/modules/import`, {
      method: "POST",
      headers: { "X-Teacher-Key": classroom.teacher_key },
      body: form
    });
    if (!response.ok) throw new Error(`Module import error ${response.status}`);
    return response.json() as Promise<EducationalModule>;
  },
  exportModule: async (moduleId: string) => {
    const response = await fetch(`${API_BASE}/modules/${moduleId}/export`);
    if (!response.ok) throw new Error(`Module export error ${response.status}`);
    return response.blob();
  },
  transcribe: async (audio: Blob) => {
    const form = new FormData();
    form.append("audio", audio, "answer.webm");
    const response = await fetch(`${API_BASE}/voice/transcribe`, { method: "POST", body: form });
    if (!response.ok) throw new Error(`Voice API error ${response.status}`);
    return response.json() as Promise<TranscriptionResult>;
  },
  synthesize: async (text: string) => {
    const response = await fetch(`${API_BASE}/voice/speech`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language: "es-ES", voice: "lola" })
    });
    if (!response.ok) throw new Error(`Voice API error ${response.status}`);
    return response.blob();
  }
};
