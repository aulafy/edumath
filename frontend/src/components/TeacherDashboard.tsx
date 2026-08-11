import { ArrowLeft, BookOpen, Check, Copy, Download, Library, ListChecks, School, Send, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Assignment, Classroom, CurriculumUnit, EducationalModule, EducationalModuleDetail, ModuleAssignment } from "../types/contracts";
import { subjectLabel } from "../utils/labels";

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
  const [assignment, setAssignment] = useState<Assignment | ModuleAssignment | null>(null);
  const [error, setError] = useState("");
  const [modules, setModules] = useState<EducationalModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<EducationalModuleDetail | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  useEffect(() => {
    api.curriculum(classroom?.stage ?? stage, classroom?.grade ?? grade)
      .then(({ units: next }) => {
        setUnits(next);
        const ready = next.find((unit) => unit.content_status === "READY");
        setUnitId(ready?.id ?? "");
      })
      .catch(() => setUnits([]));
  }, [classroom, stage, grade]);

  useEffect(() => {
    if (classroom) api.modules().then(setModules).catch(() => setModules([]));
  }, [classroom]);

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

  async function importModule(file: File) {
    if (!classroom) return;
    try {
      const imported = await api.importModule(classroom, file);
      setModules((current) => [imported, ...current.filter((item) => item.id !== imported.id)]);
      setError("");
    } catch {
      setError("El paquete no cumple el formato seguro EduModule.");
    }
  }

  async function exportModule(module: EducationalModule) {
    const blob = await api.exportModule(module.id);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${module.module_id}-${module.version}.edumath`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function prepareModule(module: EducationalModule) {
    try {
      const detail = await api.module(module.id);
      setSelectedModule(detail);
      setSelectedActivities(detail.activities.map((activity) => activity.id));
      setError("");
    } catch {
      setError("No se pudo abrir el módulo.");
    }
  }

  async function publishSelectedModule() {
    if (!classroom || !selectedModule || selectedActivities.length === 0) return;
    try {
      setAssignment(await api.publishModule(classroom, selectedModule.id, selectedActivities));
      setSelectedModule(null);
      setError("");
    } catch {
      setError("El módulo no corresponde a la etapa y curso de esta clase.");
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
            <div className="teacherSection moduleLibrary">
              <div className="moduleLibraryHeader">
                <h1><Library /> Biblioteca abierta</h1>
                <label className="importModuleButton"><Upload /> Importar<input className="srOnly" type="file" accept=".edumath,application/zip" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importModule(file); event.target.value = ""; }} /></label>
              </div>
              <div className="moduleList">
                {modules.map((module) => (
                  <article className="moduleItem" key={module.id}>
                    <div><strong>{module.title}</strong><span>{subjectLabel(module.subject)} · {module.stage === "PRIMARY" ? "Primaria" : "ESO"} · v{module.version}</span></div>
                    <span className="licenseBadge">{module.license}</span>
                    <button className="secondary moduleAssignButton" onClick={() => void prepareModule(module)}><ListChecks /> Asignar</button>
                    <button className="iconButton secondary" aria-label={`Exportar ${module.title}`} title="Exportar módulo" onClick={() => void exportModule(module)}><Download /></button>
                  </article>
                ))}
                {modules.length === 0 && <p className="emptyLibrary">No hay módulos importados.</p>}
              </div>
              {selectedModule && (
                <div className="moduleComposer">
                  <div><span>Preparar módulo</span><strong>{selectedModule.title}</strong></div>
                  <fieldset>
                    <legend>Actividades para la clase</legend>
                    {selectedModule.activities.map((activity) => (
                      <label key={activity.id}>
                        <input type="checkbox" checked={selectedActivities.includes(activity.id)} onChange={(event) => setSelectedActivities((current) => event.target.checked ? [...current, activity.id] : current.filter((id) => id !== activity.id))} />
                        <span><strong>{activity.title}</strong><small>{activity.type.replaceAll("_", " ")}</small></span>
                      </label>
                    ))}
                  </fieldset>
                  <div className="composerActions"><button className="secondary" onClick={() => setSelectedModule(null)}>Cancelar</button><button disabled={selectedActivities.length === 0} onClick={() => void publishSelectedModule()}><Send /> Publicar módulo</button></div>
                </div>
              )}
            </div>
          </>
        )}
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}
