import { ArrowLeft, Check, ChevronLeft, ChevronRight, FlaskConical, ListChecks } from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";
import { api } from "../api/client";
import type { ModuleAssignment, Student } from "../types/contracts";
import { contentLabel, subjectLabel } from "../utils/labels";

const LearningScene3D = lazy(() => import("./LearningScene3D").then((module) => ({ default: module.LearningScene3D })));

type ClosedQuestion = { prompt: string; options: string[]; correct_option: string; explanation: string; scene?: { type: "COIN_VALUE"; value: string; answer: string } | { type: "FOOD_CHAIN"; answer: string } };
type Classification = { prompt: string; categories: string[]; items: { label: string; category: string }[]; explanation: string };

function ContentValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) return <ul>{value.map((item, index) => <li key={index}>{String(item)}</li>)}</ul>;
  if (typeof value === "boolean") return <span>{value ? "Sí" : "No"}</span>;
  if (value && typeof value === "object") {
    return <dl>{Object.entries(value).map(([key, item]) => <div key={key}><dt>{contentLabel(key)}</dt><dd><ContentValue value={item} /></dd></div>)}</dl>;
  }
  return <span>{String(value ?? "")}</span>;
}

function ClosedQuestionExercise({ content, onSolved }: { content: ClosedQuestion; onSolved: (response: string) => void }) {
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const correct = selected === content.correct_option;
  return <div className="interactiveExercise">
    <strong>{content.prompt}</strong>
    {content.scene && <Suspense fallback={<div className="learningScene loadingScene" aria-label="Preparando escena 3D" />}><LearningScene3D scene={content.scene} selected={selected} onSelect={(answer) => { setSelected(answer); setChecked(false); }} /></Suspense>}
    <div className="optionGrid">{content.options.map((option) => <button key={option} className={selected === option ? "exerciseOption selected" : "exerciseOption"} aria-pressed={selected === option} onClick={() => { setSelected(option); setChecked(false); }}>{option}</button>)}</div>
    <button disabled={!selected} onClick={() => { setChecked(true); if (correct) onSolved(selected); }}><Check /> Comprobar</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Bien! ${content.explanation}` : "Todavía no. Prueba otra opción."}</p>}
  </div>;
}

function ClassificationExercise({ content, onSolved }: { content: Classification; onSolved: (response: Record<string, string>) => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const correct = content.items.every((item) => answers[item.label] === item.category);
  return <div className="interactiveExercise">
    <strong>{content.prompt}</strong>
    <div className="classificationList">{content.items.map((item) => <label key={item.label}><span>{item.label}</span><select value={answers[item.label] ?? ""} onChange={(event) => { setAnswers((current) => ({ ...current, [item.label]: event.target.value })); setChecked(false); }}><option value="">Elige una categoría</option>{content.categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>)}</div>
    <button disabled={Object.keys(answers).length !== content.items.length} onClick={() => { setChecked(true); if (correct) onSolved(answers); }}><Check /> Comprobar clasificación</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Todo en su sitio! ${content.explanation}` : "Revisa las categorías marcadas e inténtalo otra vez."}</p>}
  </div>;
}

export function ModuleLesson({ initial, student, onClose }: { initial: ModuleAssignment; student: Student; onClose: () => void }) {
  const [assignment, setAssignment] = useState(initial);
  const firstPending = Math.max(0, assignment.activities.findIndex((item) => !assignment.completed_activity_ids.includes(item.id)));
  const [index, setIndex] = useState(firstPending);
  const [busy, setBusy] = useState(false);
  const [solvedActivityIds, setSolvedActivityIds] = useState<string[]>([]);
  const [solvedResponses, setSolvedResponses] = useState<Record<string, unknown>>({});
  const activity = assignment.activities[index];
  const completed = assignment.completed_activity_ids.includes(activity.id);
  const interactive = activity.type === "CLOSED_QUESTION" || activity.type === "CLASSIFICATION";
  const solved = completed || solvedActivityIds.includes(activity.id);
  const progress = useMemo(() => Math.round((assignment.completed_activity_ids.length / assignment.activities.length) * 100), [assignment]);

  async function complete() {
    setBusy(true);
    try {
      const next = await api.completeModuleActivity(assignment, student.id, activity.id, solvedResponses[activity.id]);
      setAssignment(next);
      if (index < next.activities.length - 1) setIndex(index + 1);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="moduleLessonShell">
      <header className="moduleLessonTopbar">
        <button className="iconButton" aria-label="Volver al inicio" title="Volver al inicio" onClick={onClose}><ArrowLeft /></button>
        <div><span>{subjectLabel(assignment.module.subject)}</span><strong>{assignment.module.title}</strong></div>
        <span className="moduleProgressLabel">{assignment.completed_activity_ids.length}/{assignment.activities.length}</span>
      </header>
      <div className="moduleProgressTrack" aria-label={`${progress}% completado`}><span style={{ width: `${progress}%` }} /></div>
      <section className={"scene" in activity.content ? "moduleActivity hasLearningScene" : "moduleActivity"}>
        <div className="activityEyebrow"><FlaskConical /> Actividad {index + 1}</div>
        <h1>{activity.title}</h1>
        <p className="activityInstructions">{activity.instructions}</p>
        {activity.type === "CLOSED_QUESTION" && <ClosedQuestionExercise key={activity.id} content={activity.content as ClosedQuestion} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "CLASSIFICATION" && <ClassificationExercise key={activity.id} content={activity.content as Classification} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {!interactive && Object.keys(activity.content).length > 0 && <div className="activityContent"><ListChecks /> <ContentValue value={activity.content} /></div>}
        <div className="activityNavigation">
          <button className="iconButton secondary" aria-label="Actividad anterior" title="Actividad anterior" disabled={index === 0} onClick={() => setIndex(index - 1)}><ChevronLeft /></button>
          <button onClick={() => void complete()} disabled={busy || completed || (interactive && !solved)}><Check />{completed ? "Completada" : interactive && !solved ? "Resuelve el ejercicio" : "Completar y continuar"}</button>
          <button className="iconButton secondary" aria-label="Actividad siguiente" title="Actividad siguiente" disabled={index === assignment.activities.length - 1 || !completed} onClick={() => setIndex(index + 1)}><ChevronRight /></button>
        </div>
      </section>
    </main>
  );
}
