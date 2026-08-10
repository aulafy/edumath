import type { ProblemResponse, Student, TranscriptionResult, VoiceCapabilities } from "../types/contracts";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  return response.json() as Promise<T>;
}

export const api = {
  students: () => request<Student[]>("/students"),
  createStudent: (display_name: string) =>
    request<Student>("/students", { method: "POST", body: JSON.stringify({ display_name }) }),
  startSession: (student_id: string, theme: string) =>
    request<ProblemResponse>("/sessions", { method: "POST", body: JSON.stringify({ student_id, theme }) }),
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
