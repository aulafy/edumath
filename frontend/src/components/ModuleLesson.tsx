import { ArrowLeft, Check, ChevronLeft, ChevronRight, FlaskConical, ListChecks, Play, Volume2, X } from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";
import { api } from "../api/client";
import type { ModuleAssignment, Student } from "../types/contracts";
import { contentLabel, subjectLabel } from "../utils/labels";

const LearningScene3D = lazy(() => import("./LearningScene3D").then((module) => ({ default: module.LearningScene3D })));
const BalanceLab3D = lazy(() => import("./BalanceLab3D").then((module) => ({ default: module.BalanceLab3D })));
const TileLab3D = lazy(() => import("./TileLab3D").then((module) => ({ default: module.TileLab3D })));
const TimePath3D = lazy(() => import("./TimePath3D").then((module) => ({ default: module.TimePath3D })));
const FoodWebLab3D = lazy(() => import("./FoodWebLab3D").then((module) => ({ default: module.FoodWebLab3D })));
const RhythmLab3D = lazy(() => import("./RhythmLab3D").then((module) => ({ default: module.RhythmLab3D })));

type ClosedQuestion = { prompt: string; options: string[]; correct_option: string; explanation: string; scene?: { type: "COIN_VALUE"; value: string; answer: string } | { type: "FOOD_CHAIN"; answer: string } };
type Classification = { prompt: string; categories: string[]; items: { label: string; category: string }[]; explanation: string };
type BalanceLab = { prompt: string; left_value: number; weights: number[]; example_solution: number[]; explanation: string };
type TileCell = { row: number; col: number };
type TileLab = { prompt: string; rows: number; cols: number; target_area: number; target_perimeter: number; example_cells: TileCell[]; explanation: string };
type TimelineEvent = { id: string; label: string; year: number; date_label: string; detail: string };
type Timeline = { prompt: string; era_label: string; events: TimelineEvent[]; explanation: string };
type FoodWebOrganism = { id: string; label: string; role: "PRODUCER" | "CONSUMER" | "DECOMPOSER" };
type FoodWebLink = { source: string; target: string };
type FoodWebLab = { prompt: string; habitat: string; organisms: FoodWebOrganism[]; links: FoodWebLink[]; explanation: string };
type RhythmLab = { prompt: string; beats: number; bpm: number; target_pattern: boolean[]; visual_cue: string; explanation: string };

function tileMetrics(cells: TileCell[]) {
  const points = new Set(cells.map((cell) => `${cell.row}:${cell.col}`));
  const perimeter = cells.reduce((total, cell) => total + [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dr, dc]) => !points.has(`${cell.row + dr}:${cell.col + dc}`)).length, 0);
  if (cells.length === 0) return { area: 0, perimeter: 0, connected: false };
  const seen = new Set([`${cells[0].row}:${cells[0].col}`]);
  const queue = [cells[0]];
  while (queue.length) {
    const cell = queue.shift()!;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const key = `${cell.row + dr}:${cell.col + dc}`;
      if (points.has(key) && !seen.has(key)) { seen.add(key); queue.push({ row: cell.row + dr, col: cell.col + dc }); }
    }
  }
  return { area: cells.length, perimeter, connected: seen.size === cells.length };
}

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

function BalanceLabExercise({ content, onSolved }: { content: BalanceLab; onSolved: (response: number[]) => void }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const total = selected.reduce((sum, value) => sum + value, 0);
  const correct = total === content.left_value;
  function toggle(weight: number) {
    setSelected((current) => current.includes(weight) ? current.filter((value) => value !== weight) : [...current, weight]);
    setChecked(false);
  }
  return <div className="interactiveExercise balanceExercise">
    <strong>{content.prompt}</strong>
    <Suspense fallback={<div className="balanceLabScene loadingScene" aria-label="Preparando laboratorio 3D" />}>
      <BalanceLab3D leftValue={content.left_value} rightValue={total} />
    </Suspense>
    <div className="balanceReadout" aria-live="polite"><span>{content.left_value}</span><strong>{correct ? "=" : total < content.left_value ? ">" : "<"}</strong><span>{total}</span></div>
    <div className="weightTray" aria-label="Pesas disponibles">{content.weights.map((weight) => <button key={weight} className={selected.includes(weight) ? "weightButton selected" : "weightButton"} aria-pressed={selected.includes(weight)} onClick={() => toggle(weight)}><span>{weight}</span> kg</button>)}</div>
    <button disabled={selected.length === 0} onClick={() => { setChecked(true); if (correct) onSolved(selected); }}><Check /> Comprobar equilibrio</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Equilibrio conseguido! ${content.explanation}` : total < content.left_value ? `Faltan ${content.left_value - total}. Prueba a añadir otra pesa.` : `Sobran ${total - content.left_value}. Retira o cambia alguna pesa.`}</p>}
  </div>;
}

function TileLabExercise({ content, onSolved }: { content: TileLab; onSolved: (response: TileCell[]) => void }) {
  const [cells, setCells] = useState<TileCell[]>([]);
  const [checked, setChecked] = useState(false);
  const metrics = tileMetrics(cells);
  const correct = metrics.connected && metrics.area === content.target_area && metrics.perimeter === content.target_perimeter;
  function toggle(cell: TileCell) {
    const key = `${cell.row}:${cell.col}`;
    setCells((current) => current.some((item) => `${item.row}:${item.col}` === key) ? current.filter((item) => `${item.row}:${item.col}` !== key) : [...current, cell]);
    setChecked(false);
  }
  const areaState = metrics.area === content.target_area ? "ready" : "";
  const perimeterState = metrics.perimeter === content.target_perimeter ? "ready" : "";
  return <div className="interactiveExercise tileExercise">
    <strong>{content.prompt}</strong>
    <Suspense fallback={<div className="tileLabScene loadingScene" aria-label="Preparando taller 3D" />}>
      <TileLab3D rows={content.rows} cols={content.cols} cells={cells} onToggle={toggle} />
    </Suspense>
    <div className="geometryMeters" aria-live="polite">
      <span className={areaState}><small>Área</small><strong>{metrics.area}/{content.target_area}</strong></span>
      <span className={perimeterState}><small>Perímetro</small><strong>{metrics.perimeter}/{content.target_perimeter}</strong></span>
      <span className={metrics.connected ? "ready" : ""}><small>Figura</small><strong>{metrics.connected ? "Unida" : "Separada"}</strong></span>
    </div>
    <button disabled={cells.length === 0} onClick={() => { setChecked(true); if (correct) onSolved(cells); }}><Check /> Comprobar mosaico</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Mosaico conseguido! ${content.explanation}` : !metrics.connected ? "Las piezas deben tocarse por un lado y formar una sola figura." : "Observa los dos medidores y cambia algunas casillas."}</p>}
  </div>;
}

function TimelineExercise({ content, onSolved }: { content: Timeline; onSolved: (response: string[]) => void }) {
  const [order, setOrder] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const expected = [...content.events].sort((a, b) => a.year - b.year).map((event) => event.id);
  const correct = order.length === expected.length && order.every((id, index) => id === expected[index]);
  function choose(id: string) {
    setOrder((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setChecked(false);
  }
  return <div className="interactiveExercise timelineExercise">
    <strong>{content.prompt}</strong>
    <Suspense fallback={<div className="timePathScene loadingScene" aria-label="Preparando sendero 3D" />}>
      <TimePath3D events={content.events} order={order} />
    </Suspense>
    <div className="timelineStatus"><span>{content.era_label}</span><strong>{order.length}/{content.events.length} estaciones</strong></div>
    <div className="eventChoices">{content.events.map((event) => {
      const position = order.indexOf(event.id);
      return <button key={event.id} className={position >= 0 ? "eventChoice selected" : "eventChoice"} aria-pressed={position >= 0} onClick={() => choose(event.id)}>
        <span className="eventOrder">{position >= 0 ? position + 1 : "?"}</span><span><strong>{event.label}</strong><small>{event.date_label}</small></span>
      </button>;
    })}</div>
    <button disabled={order.length !== content.events.length} onClick={() => { setChecked(true); if (correct) onSolved(order); }}><Check /> Comprobar recorrido</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Recorrido completo! ${content.explanation}` : "Alguna estación está fuera de época. Toca eventos para retirarlos y vuelve a ordenar."}</p>}
  </div>;
}

function FoodWebExercise({ content, onSolved }: { content: FoodWebLab; onSolved: (response: FoodWebLink[]) => void }) {
  const [links, setLinks] = useState<FoodWebLink[]>([]);
  const [pending, setPending] = useState("");
  const [checked, setChecked] = useState(false);
  const edgeKey = (link: FoodWebLink) => `${link.source}:${link.target}`;
  const expected = new Set(content.links.map(edgeKey));
  const correct = links.length === content.links.length && links.every((link) => expected.has(edgeKey(link)));
  const labels = new Map(content.organisms.map((organism) => [organism.id, organism.label]));
  function choose(id: string) {
    if (!pending) { setPending(id); setChecked(false); return; }
    if (pending === id) { setPending(""); return; }
    const candidate = { source: pending, target: id };
    setLinks((current) => current.some((link) => edgeKey(link) === edgeKey(candidate)) ? current : [...current, candidate]);
    setPending(""); setChecked(false);
  }
  return <div className="interactiveExercise foodWebExercise">
    <strong>{content.prompt}</strong>
    <Suspense fallback={<div className="foodWebScene loadingScene" aria-label="Preparando ecosistema 3D" />}>
      <FoodWebLab3D organisms={content.organisms} links={links} pending={pending} />
    </Suspense>
    <div className="foodWebStatus"><span>{content.habitat}</span><strong>{pending ? `Ahora elige quién obtiene energía de ${labels.get(pending)}` : "Primero alimento, después consumidor"}</strong></div>
    <div className="organismChoices">{content.organisms.map((organism) => <button key={organism.id} className={pending === organism.id ? "organismChoice selected" : "organismChoice"} aria-pressed={pending === organism.id} onClick={() => choose(organism.id)}><strong>{organism.label}</strong><small>{organism.role === "PRODUCER" ? "Productor" : organism.role === "DECOMPOSER" ? "Descomponedor" : "Consumidor"}</small></button>)}</div>
    <div className="builtLinks" aria-live="polite">{links.length === 0 ? <span>Aún no hay conexiones</span> : links.map((link) => <span key={edgeKey(link)}>{labels.get(link.source)} → {labels.get(link.target)}<button className="iconButton" aria-label={`Eliminar conexión ${labels.get(link.source)} a ${labels.get(link.target)}`} title="Eliminar conexión" onClick={() => { setLinks((current) => current.filter((item) => edgeKey(item) !== edgeKey(link))); setChecked(false); }}><X /></button></span>)}</div>
    <button disabled={links.length === 0} onClick={() => { setChecked(true); if (correct) onSolved(links); }}><Check /> Comprobar ecosistema</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Red completa! ${content.explanation}` : "La red aún no explica todas las relaciones. Revisa la dirección y las conexiones."}</p>}
  </div>;
}

function RhythmExercise({ content, onSolved }: { content: RhythmLab; onSolved: (response: boolean[]) => void }) {
  const [pattern, setPattern] = useState<boolean[]>(Array(content.beats).fill(false));
  const [activeBeat, setActiveBeat] = useState(-1);
  const [checked, setChecked] = useState(false);
  const correct = pattern.every((value, index) => value === content.target_pattern[index]);
  function playRhythm(sequence: boolean[]) {
    const context = new AudioContext();
    const interval = 60 / content.bpm;
    sequence.forEach((enabled, index) => {
      window.setTimeout(() => { setActiveBeat(index); if (index === sequence.length - 1) window.setTimeout(() => setActiveBeat(-1), interval * 800); }, index * interval * 1000);
      if (!enabled) return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startsAt = context.currentTime + index * interval;
      oscillator.type = "triangle"; oscillator.frequency.setValueAtTime(index % 4 === 0 ? 260 : 210, startsAt);
      gain.gain.setValueAtTime(0.0001, startsAt); gain.gain.exponentialRampToValueAtTime(0.24, startsAt + 0.01); gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + 0.15);
      oscillator.connect(gain); gain.connect(context.destination); oscillator.start(startsAt); oscillator.stop(startsAt + 0.17);
    });
    window.setTimeout(() => void context.close(), (sequence.length * interval + 0.3) * 1000);
  }
  return <div className="interactiveExercise rhythmExercise">
    <strong>{content.prompt}</strong>
    <div className="rhythmReference"><span aria-label={`Pista visual: ${content.visual_cue}`}>{content.visual_cue}</span><button className="secondary" onClick={() => playRhythm(content.target_pattern)}><Volume2 /> Escuchar modelo</button></div>
    <Suspense fallback={<div className="rhythmLabScene loadingScene" aria-label="Preparando secuenciador 3D" />}>
      <RhythmLab3D pattern={pattern} activeBeat={activeBeat} />
    </Suspense>
    <div className="beatControls" role="group" aria-label="Pulsos de la secuencia">{pattern.map((enabled, index) => <button key={index} className={enabled ? "beatButton selected" : "beatButton"} aria-pressed={enabled} aria-label={`Pulso ${index + 1}: ${enabled ? "sonido" : "silencio"}`} onClick={() => { setPattern((current) => current.map((value, position) => position === index ? !value : value)); setChecked(false); }}><span>{index + 1}</span>{enabled ? "TA" : "—"}</button>)}</div>
    <button className="secondary" onClick={() => playRhythm(pattern)}><Play /> Escuchar mi ritmo</button>
    <button onClick={() => { setChecked(true); if (correct) onSolved(pattern); }}><Check /> Comprobar ritmo</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Ritmo reconstruido! ${content.explanation}` : "Todavía suena diferente. Compara el modelo, los sonidos y los silencios."}</p>}
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
  const interactive = activity.type === "CLOSED_QUESTION" || activity.type === "CLASSIFICATION" || activity.type === "BALANCE_LAB" || activity.type === "TILE_LAB" || activity.type === "TIMELINE" || activity.type === "FOOD_WEB_LAB" || activity.type === "RHYTHM_LAB";
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
        {activity.type === "BALANCE_LAB" && <BalanceLabExercise key={activity.id} content={activity.content as BalanceLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "TILE_LAB" && <TileLabExercise key={activity.id} content={activity.content as TileLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "TIMELINE" && <TimelineExercise key={activity.id} content={activity.content as Timeline} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "FOOD_WEB_LAB" && <FoodWebExercise key={activity.id} content={activity.content as FoodWebLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "RHYTHM_LAB" && <RhythmExercise key={activity.id} content={activity.content as RhythmLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
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
