import { ArrowLeft, Check, ChevronLeft, ChevronRight, FlaskConical, ListChecks } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../api/client";
import type { ModuleAssignment, Student } from "../types/contracts";
import { contentLabel, subjectLabel } from "../utils/labels";

function ContentValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) return <ul>{value.map((item, index) => <li key={index}>{String(item)}</li>)}</ul>;
  if (typeof value === "boolean") return <span>{value ? "Sí" : "No"}</span>;
  if (value && typeof value === "object") {
    return <dl>{Object.entries(value).map(([key, item]) => <div key={key}><dt>{contentLabel(key)}</dt><dd><ContentValue value={item} /></dd></div>)}</dl>;
  }
  return <span>{String(value ?? "")}</span>;
}

export function ModuleLesson({ initial, student, onClose }: { initial: ModuleAssignment; student: Student; onClose: () => void }) {
  const [assignment, setAssignment] = useState(initial);
  const firstPending = Math.max(0, assignment.activities.findIndex((item) => !assignment.completed_activity_ids.includes(item.id)));
  const [index, setIndex] = useState(firstPending);
  const [busy, setBusy] = useState(false);
  const activity = assignment.activities[index];
  const completed = assignment.completed_activity_ids.includes(activity.id);
  const progress = useMemo(() => Math.round((assignment.completed_activity_ids.length / assignment.activities.length) * 100), [assignment]);

  async function complete() {
    setBusy(true);
    try {
      const next = await api.completeModuleActivity(assignment, student.id, activity.id);
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
      <section className="moduleActivity">
        <div className="activityEyebrow"><FlaskConical /> Actividad {index + 1}</div>
        <h1>{activity.title}</h1>
        <p className="activityInstructions">{activity.instructions}</p>
        {Object.keys(activity.content).length > 0 && <div className="activityContent"><ListChecks /> <ContentValue value={activity.content} /></div>}
        <div className="activityNavigation">
          <button className="iconButton secondary" aria-label="Actividad anterior" title="Actividad anterior" disabled={index === 0} onClick={() => setIndex(index - 1)}><ChevronLeft /></button>
          <button onClick={() => void complete()} disabled={busy || completed}><Check />{completed ? "Completada" : "Marcar como completada"}</button>
          <button className="iconButton secondary" aria-label="Actividad siguiente" title="Actividad siguiente" disabled={index === assignment.activities.length - 1} onClick={() => setIndex(index + 1)}><ChevronRight /></button>
        </div>
      </section>
    </main>
  );
}
