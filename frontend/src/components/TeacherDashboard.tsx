import { ArrowLeft, BookOpen, Check, Copy, School, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Assignment, Classroom, CurriculumUnit } from "../types/contracts";

export function TeacherDashboard({ onClose }: { onClose: () => void }) {
  const [classroom, setClassroom] = useState<Classroom | null>(() => {
    const saved = localStorage.getItem("edumath-teacher-classroom");
    return saved ? JSON.parse(saved) as Classroom : null;
  });
  const [name, setName] = useState("1.º A");
  const [stage, setStage] = useState("PRIMARY");
  const [grade, setGrade] = useState(1);
  const [units, setUnits] = useState<CurriculumUnit[]>([]);
  const [unitId, setUnitId] = useState("");
  const [title, setTitle] = useState("Sumamos cantidades pequeñas");
  const [theme, setTheme] = useState("DINOSAURS");
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.curriculum(classroom?.stage ?? stage, classroom?.grade ?? grade)
      .then(({ units: next }) => {
        setUnits(next);
        const ready = next.find((unit) => unit.content_status === "READY");
        setUnitId(ready?.id ?? "");
      })
      .catch(() => setUnits([]));
  }, [classroom, stage, grade]);

  async function createClassroom() {
    try {
      const created = await api.createClassroom({ name, stage, grade });
      localStorage.setItem("edumath-teacher-classroom", JSON.stringify(created));
      setClassroom(created);
      setError("");
    } catch {
      setError("No se pudo crear la clase.");
    }
  }

  async function publish() {
    const unit = units.find((item) => item.id === unitId);
    if (!classroom || !unit) return;
    try {
      const lesson = await api.createLesson(classroom, {
        title,
        curriculum_unit_id: unit.id,
        skill_ids: unit.skill_ids,
        problem_count: 8,
        theme,
        pacing: "STUDENT"
      });
      setAssignment(await api.publishLesson(classroom, lesson.id));
      setError("");
    } catch {
      setError("Esta unidad todavía no está disponible para asignar.");
    }
  }

  return (
    <main className="teacherShell">
      <header className="teacherTopbar">
        <button className="iconButton" aria-label="Volver" title="Volver" onClick={onClose}><ArrowLeft /></button>
        <div><span>EduMath</span><strong>Panel docente</strong></div>
      </header>
      <section className="teacherWorkspace">
        {!classroom ? (
          <div className="teacherSection">
            <h1><School /> Crea tu clase</h1>
            <div className="teacherFormGrid">
              <label>Nombre de la clase<input value={name} onChange={(event) => setName(event.target.value)} /></label>
              <label>Etapa<select value={stage} onChange={(event) => { setStage(event.target.value); setGrade(1); }}><option value="PRIMARY">Primaria</option><option value="ESO">ESO</option></select></label>
              <label>Curso<select value={grade} onChange={(event) => setGrade(Number(event.target.value))}>{Array.from({ length: stage === "PRIMARY" ? 6 : 4 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}.º</option>)}</select></label>
            </div>
            <button onClick={createClassroom}><Check /> Crear clase</button>
          </div>
        ) : (
          <>
            <div className="teacherSummary"><School /><div><span>{classroom.stage === "PRIMARY" ? "Primaria" : "ESO"} · {classroom.grade}.º</span><strong>{classroom.name}</strong></div></div>
            <div className="teacherSection">
              <h1><BookOpen /> Prepara una lección</h1>
              <label>Título<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
              <label>Unidad curricular<select value={unitId} onChange={(event) => setUnitId(event.target.value)}>{units.map((unit) => <option key={unit.id} value={unit.id} disabled={unit.content_status !== "READY"}>{unit.title}{unit.content_status === "PLANNED" ? " · Próximamente" : ""}</option>)}</select></label>
              <label>Mundo<select value={theme} onChange={(event) => setTheme(event.target.value)}><option value="DINOSAURS">Dinosaurios</option><option value="SPACE">Espacio</option></select></label>
              <button onClick={publish} disabled={!unitId}><Send /> Publicar para la clase</button>
            </div>
            {assignment && <div className="assignmentCode"><span>Código de la lección</span><strong>{assignment.join_code}</strong><button className="secondary" onClick={() => navigator.clipboard.writeText(assignment.join_code)}><Copy /> Copiar</button></div>}
          </>
        )}
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}
