import {
  ArrowLeft,
  Check,
  Egg,
  Lightbulb,
  Orbit,
  Play,
  Rocket,
  Sparkles,
  Star,
  Trophy,
  School,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { VisualRenderer } from "../components/VisualRenderer";
import { ThemeScene } from "../components/ThemeScene";
import { VoiceControls } from "../components/VoiceControls";
import { TeacherDashboard } from "../components/TeacherDashboard";
import type { ProblemResponse, Student } from "../types/contracts";

export function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [session, setSession] = useState<ProblemResponse | null>(null);
  const [answer, setAnswer] = useState("");
  const [name, setName] = useState("Ada");
  const [theme, setTheme] = useState("DINOSAURS");
  const [progress, setProgress] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [teacherMode, setTeacherMode] = useState(false);
  const [assignmentCode, setAssignmentCode] = useState("");

  useEffect(() => {
    api.students().then(setStudents).catch(() => setStudents([]));
    const saved = localStorage.getItem("math-ai-session");
    if (saved) api.getSession(saved).then(setSession).catch(() => localStorage.removeItem("math-ai-session"));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [session?.session_id]);

  async function createProfile() {
    const created = await api.createStudent(name);
    setStudent(created);
    setStudents([...students, created]);
  }

  async function start() {
    const active = student ?? students[0] ?? await api.createStudent(name);
    setStudent(active);
    const code = assignmentCode.trim().toUpperCase();
    if (code) await api.joinAssignment(code, active.id);
    const next = await api.startSession(active.id, theme, code || undefined);
    localStorage.setItem("math-ai-session", next.session_id);
    setSession(next);
    setProgress(null);
  }

  if (teacherMode) return <TeacherDashboard onClose={() => setTeacherMode(false)} />;

  async function submitValue(value: string) {
    if (!session) return;
    try {
      const next = await api.submitAnswer(session, value);
      setSession(next);
      setAnswer("");
      setError(null);
      return next;
    } catch (_err) {
      setError("La sesión cambió. Recuperando el estado...");
      const recovered = await api.getSession(session.session_id);
      setSession(recovered);
      return null;
    }
  }

  async function submit() {
    await submitValue(answer);
  }

  async function showProgress() {
    const active = student ?? students[0];
    if (active) setProgress(await api.progress(active.id));
  }

  if (session) {
    return (
      <main className={`appFrame session theme-${session.ui.theme.toLowerCase()}`}>
        <ThemeScene theme={session.ui.theme} />
        <header className="topbar">
          <button className="iconButton" aria-label="Volver al inicio" title="Volver al inicio" onClick={() => setSession(null)}>
            <ArrowLeft aria-hidden="true" />
          </button>
          <strong>EduMath</strong>
          <span className="worldBadge">
            {session.ui.theme === "SPACE" ? <Orbit aria-hidden="true" /> : <Egg aria-hidden="true" />}
            {session.ui.theme === "SPACE" ? "Espacio" : "Dinosaurios"}
          </span>
        </header>
        <section className="problem lessonCapsule">
          <div className="lessonStatus" aria-label={`Pista ${session.hint_level} de 3`}>
            <span><Star aria-hidden="true" /> Reto {session.attempt_number}</span>
            <span className="hintDots" aria-hidden="true">
              {[0, 1, 2].map((level) => <i key={level} className={level < session.hint_level ? "used" : ""} />)}
            </span>
          </div>
          <p className="story">{session.rendered_story}</p>
          <VisualRenderer visual={session.visual} />
          {session.tutor_message && <p className="feedback capsuleMessage">{session.tutor_message}</p>}
          <div className="answerRow">
            <input aria-label="Respuesta" inputMode="numeric" value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void submit(); }} />
            <button onClick={submit}><Check aria-hidden="true" />{session.ui.submit_label}</button>
          </div>
          <div className="supportRow">
            <VoiceControls
              tutorMessage={session.tutor_message}
              onDraft={setAnswer}
              onAnswer={async (spokenAnswer) => {
                const next = await submitValue(spokenAnswer);
                return next?.tutor_message ?? null;
              }}
            />
            <button className="secondary hintButton" onClick={() => api.hint(session).then(setSession)}>
              <Lightbulb aria-hidden="true" />Necesito una pista
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className={`appFrame home theme-${theme.toLowerCase()}`}>
      <ThemeScene theme={theme} />
      <header className="brand">
        <Rocket aria-hidden="true" />
        <h1>EduMath</h1>
        <Sparkles aria-hidden="true" />
      </header>
      <button className="teacherEntry" onClick={() => setTeacherMode(true)}><School aria-hidden="true" />Panel docente</button>
      <section className="homeGrid">
        <div className="capsulePanel profileCapsule">
          <div className="capsuleTitle"><UserPlus aria-hidden="true" /><span>Mi perfil</span></div>
          <label className="srOnly" htmlFor="student-name">Nombre</label>
          <input id="student-name" aria-label="Nombre del perfil" value={name} onChange={(event) => setName(event.target.value)} />
          <button onClick={createProfile}><UserPlus aria-hidden="true" />Crear perfil</button>
        </div>
        <div className="capsulePanel worldCapsule">
          <div className="capsuleTitle"><Sparkles aria-hidden="true" /><span>Elige un mundo</span></div>
          <div className="themeChoices" role="group" aria-label="Mundo">
            <button className={theme === "DINOSAURS" ? "themeChoice selected" : "themeChoice"} aria-pressed={theme === "DINOSAURS"} onClick={() => setTheme("DINOSAURS")}>
              <Egg aria-hidden="true" /><span>Dinosaurios</span>
            </button>
            <button className={theme === "SPACE" ? "themeChoice selected" : "themeChoice"} aria-pressed={theme === "SPACE"} onClick={() => setTheme("SPACE")}>
              <Orbit aria-hidden="true" /><span>Espacio</span>
            </button>
          </div>
          <label className="assignmentJoin">Código de clase<input value={assignmentCode} maxLength={6} placeholder="ABC234" onChange={(event) => setAssignmentCode(event.target.value.toUpperCase())} /></label>
          <button className="startButton" onClick={start}><Play aria-hidden="true" />Comenzar</button>
        </div>
        <div className="capsulePanel progressCapsule">
          <div className="capsuleTitle"><Trophy aria-hidden="true" /><span>Mis logros</span></div>
          <button className="secondary" onClick={showProgress}><Trophy aria-hidden="true" />Ver progreso</button>
          {progress && <pre>{JSON.stringify(progress, null, 2)}</pre>}
        </div>
      </section>
    </main>
  );
}
