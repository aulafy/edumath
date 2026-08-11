import { ArrowDown, ArrowLeft, ArrowLeftRight, ArrowRight, ArrowUp, Check, ChevronLeft, ChevronRight, CloudRain, Dices, FlaskConical, Gauge, Lightbulb, ListChecks, Minus, Moon, Play, Plus, Shovel, Sun, Thermometer, Undo2, Volume2, Weight, X } from "lucide-react";
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
const SentenceLab3D = lazy(() => import("./SentenceLab3D").then((module) => ({ default: module.SentenceLab3D })));
const OrbitLab3D = lazy(() => import("./OrbitLab3D").then((module) => ({ default: module.OrbitLab3D })));
const MoleculeLab3D = lazy(() => import("./MoleculeLab3D").then((module) => ({ default: module.MoleculeLab3D })));
const ForceLab3D = lazy(() => import("./ForceLab3D").then((module) => ({ default: module.ForceLab3D })));
const RouteLab3D = lazy(() => import("./RouteLab3D").then((module) => ({ default: module.RouteLab3D })));
const ClimateLab3D = lazy(() => import("./ClimateLab3D").then((module) => ({ default: module.ClimateLab3D })));
const ProbabilityLab3D = lazy(() => import("./ProbabilityLab3D").then((module) => ({ default: module.ProbabilityLab3D })));
const ReflectionLab3D = lazy(() => import("./ReflectionLab3D").then((module) => ({ default: module.ReflectionLab3D })));
const DiffusionLab3D = lazy(() => import("./DiffusionLab3D").then((module) => ({ default: module.DiffusionLab3D })));
const StratigraphyLab3D = lazy(() => import("./StratigraphyLab3D").then((module) => ({ default: module.StratigraphyLab3D })));
const DensityLab3D = lazy(() => import("./DensityLab3D").then((module) => ({ default: module.DensityLab3D })));
const TectonicLab3D = lazy(() => import("./TectonicLab3D").then((module) => ({ default: module.TectonicLab3D })));
const LunarPhaseLab3D = lazy(() => import("./LunarPhaseLab3D").then((module) => ({ default: module.LunarPhaseLab3D })));
const FunctionMachineLab3D = lazy(() => import("./FunctionMachineLab3D").then((module) => ({ default: module.FunctionMachineLab3D })));
const SoundWaveLab3D = lazy(() => import("./SoundWaveLab3D").then((module) => ({ default: module.SoundWaveLab3D })));
const AtomBuilderLab3D = lazy(() => import("./AtomBuilderLab3D").then((module) => ({ default: module.AtomBuilderLab3D })));
const LightMixLab3D = lazy(() => import("./LightMixLab3D").then((module) => ({ default: module.LightMixLab3D })));

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
type SentenceToken = { id: string; text: string; role: "SUBJECT" | "PREDICATE" | "CONNECTOR" };
type SentenceLab = { prompt: string; tokens: SentenceToken[]; target_order: string[]; explanation: string };
type OrbitBody = { id: string; label: string; distance_rank: number; color: string };
type OrbitLab = { prompt: string; center_label: string; bodies: OrbitBody[]; explanation: string };
type MoleculeAtom = { symbol: string; label: string; count: number; color: string };
type MoleculeLab = { prompt: string; molecule_name: string; formula: string; atoms: MoleculeAtom[]; explanation: string };
type ForceLab = { prompt: string; target_resultant: number; forces: number[]; example_solution: number[]; explanation: string };
type RouteCell = { row: number; col: number };
type RouteMove = "UP" | "DOWN" | "LEFT" | "RIGHT";
type RouteLab = { prompt: string; rows: number; cols: number; start: RouteCell; target: RouteCell; blocked: RouteCell[]; max_moves: number; example_moves: RouteMove[]; explanation: string };
type ClimateLab = { prompt: string; profile_label: string; temperature_min: number; temperature_max: number; rainfall_min: number; rainfall_max: number; initial_temperature: number; initial_rainfall: number; example_temperature: number; example_rainfall: number; explanation: string };
type ProbabilityDraw = "BLUE" | "GOLD";
type ProbabilityLab = { prompt: string; target_numerator: number; target_denominator: number; max_balls: number; initial_blue: number; initial_gold: number; example_blue: number; example_gold: number; draws: number; seed: number; explanation: string };
type ReflectionLab = { prompt: string; target_normal_angle: number; initial_normal_angle: number; explanation: string };
type NetFlow = "INWARD" | "OUTWARD" | "EQUILIBRIUM";
type DiffusionLab = { prompt: string; target_net_flow: NetFlow; initial_outside: number; initial_inside: number; example_outside: number; example_inside: number; explanation: string };
type StratumArtifact = { id: string; label: string; depth_rank: number; shape: "STONE" | "POTTERY" | "METAL" | "GLASS" | "BONE" | "WOOD" };
type StratigraphyLab = { prompt: string; site_label: string; artifacts: StratumArtifact[]; explanation: string };
type DensityState = "FLOAT" | "SINK" | "SUSPEND";
type DensityLab = { prompt: string; target_state: DensityState; liquid_density: 1; initial_mass: number; initial_volume: number; example_mass: number; example_volume: number; explanation: string };
type PlateMotion = "DIVERGENT" | "CONVERGENT" | "TRANSFORM";
type TectonicFeature = "RIDGE" | "MOUNTAIN_RANGE" | "FAULT";
type TectonicLab = { prompt: string; target_motion: PlateMotion; target_feature: TectonicFeature; initial_motion: PlateMotion; explanation: string };
type LunarPhase = "NEW" | "FIRST_QUARTER" | "FULL" | "LAST_QUARTER";
type LunarPhaseLab = { prompt: string; target_phase: LunarPhase; initial_phase: LunarPhase; explanation: string };
type FunctionCard = { id: string; kind: "ADD" | "MULTIPLY"; value: number };
type FunctionMachineLab = { prompt: string; inputs: number[]; target_outputs: number[]; cards: FunctionCard[]; example_solution: string[]; explanation: string };
type SoundWaveLab = { prompt: string; frequency_min: number; frequency_max: number; amplitude_min: number; amplitude_max: number; initial_frequency: number; initial_amplitude: number; example_frequency: number; example_amplitude: number; explanation: string };
type AtomBuilderLab = { prompt: string; element_symbol: string; element_name: string; target_protons: number; target_neutrons: number; target_electrons: number; initial_protons: number; initial_neutrons: number; initial_electrons: number; explanation: string };
type LightChannel = 0 | 1;
type LightMixLab = { prompt: string; target_label: "CYAN" | "YELLOW" | "MAGENTA" | "WHITE"; target_red: LightChannel; target_green: LightChannel; target_blue: LightChannel; initial_red: LightChannel; initial_green: LightChannel; initial_blue: LightChannel; explanation: string };

const routeDeltas: Record<RouteMove, [number, number]> = { UP: [-1, 0], DOWN: [1, 0], LEFT: [0, -1], RIGHT: [0, 1] };

function routePosition(content: RouteLab, moves: RouteMove[]) {
  return moves.reduce((cell, move) => ({ row: cell.row + routeDeltas[move][0], col: cell.col + routeDeltas[move][1] }), content.start);
}

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

function SentenceExercise({ content, onSolved }: { content: SentenceLab; onSolved: (response: string[]) => void }) {
  const [order, setOrder] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const byId = new Map(content.tokens.map((token) => [token.id, token]));
  const correct = order.length === content.target_order.length && order.every((id, index) => id === content.target_order[index]);
  function toggle(id: string) {
    setOrder((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setChecked(false);
  }
  return <div className="interactiveExercise sentenceExercise">
    <strong>{content.prompt}</strong>
    <Suspense fallback={<div className="sentenceLabScene loadingScene" aria-label="Preparando laboratorio de frases" />}>
      <SentenceLab3D tokens={content.tokens} order={order} />
    </Suspense>
    <div className="sentenceRail" aria-live="polite">{order.length === 0 ? <span>Tu frase aparecerá aquí</span> : order.map((id, index) => <button key={id} onClick={() => toggle(id)}><small>{index + 1}</small>{byId.get(id)?.text}</button>)}</div>
    <div className="sentenceTokenTray" role="group" aria-label="Fichas de palabras">{content.tokens.map((token) => <button key={token.id} className={`sentenceToken ${token.role.toLowerCase()} ${order.includes(token.id) ? "selected" : ""}`} disabled={order.includes(token.id)} onClick={() => toggle(token.id)}>{token.text}<small>{token.role === "SUBJECT" ? "Sujeto" : token.role === "CONNECTOR" ? "Enlace" : "Predicado"}</small></button>)}</div>
    <button disabled={order.length !== content.tokens.length} onClick={() => { setChecked(true); if (correct) onSolved(order); }}><Check /> Comprobar frase</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Frase en órbita! ${content.explanation}` : "La frase todavía no fluye. Retira una ficha del carril y prueba otro orden."}</p>}
  </div>;
}

function OrbitExercise({ content, onSolved }: { content: OrbitLab; onSolved: (response: string[]) => void }) {
  const [order, setOrder] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const expected = [...content.bodies].sort((a, b) => a.distance_rank - b.distance_rank).map((body) => body.id);
  const correct = order.length === expected.length && order.every((id, index) => id === expected[index]);
  function toggle(id: string) {
    setOrder((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setChecked(false);
  }
  return <div className="interactiveExercise orbitExercise">
    <strong>{content.prompt}</strong>
    <Suspense fallback={<div className="orbitLabScene loadingScene" aria-label="Preparando observatorio 3D" />}>
      <OrbitLab3D centerLabel={content.center_label} bodies={content.bodies} order={order} />
    </Suspense>
    <div className="orbitStatus" aria-live="polite"><span>Centro: {content.center_label}</span><strong>{order.length}/{content.bodies.length} órbitas</strong></div>
    <div className="orbitChoices" role="group" aria-label="Cuerpos disponibles">{content.bodies.map((body) => {
      const slot = order.indexOf(body.id);
      return <button key={body.id} className={slot >= 0 ? "orbitChoice selected" : "orbitChoice"} aria-pressed={slot >= 0} onClick={() => toggle(body.id)}><span className="orbitSwatch" style={{ background: body.color }} /><strong>{body.label}</strong><small>{slot >= 0 ? `Órbita ${slot + 1}` : "Sin colocar"}</small></button>;
    })}</div>
    <button disabled={order.length !== content.bodies.length} onClick={() => { setChecked(true); if (correct) onSolved(order); }}><Check /> Comprobar sistema</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Sistema estabilizado! ${content.explanation}` : "Algún cuerpo está en una órbita incorrecta. Retíralo y reconstruye desde el centro hacia fuera."}</p>}
  </div>;
}

function MoleculeExercise({ content, onSolved }: { content: MoleculeLab; onSolved: (response: Record<string, number>) => void }) {
  const [composition, setComposition] = useState<Record<string, number>>(() => Object.fromEntries(content.atoms.map((atom) => [atom.symbol, 0])));
  const [checked, setChecked] = useState(false);
  const correct = content.atoms.every((atom) => composition[atom.symbol] === atom.count);
  function change(symbol: string, delta: number) {
    setComposition((current) => ({ ...current, [symbol]: Math.max(0, Math.min(8, current[symbol] + delta)) }));
    setChecked(false);
  }
  return <div className="interactiveExercise moleculeExercise">
    <strong>{content.prompt}</strong>
    <div className="moleculeTarget"><span>{content.molecule_name}</span><strong>{content.formula}</strong></div>
    <Suspense fallback={<div className="moleculeLabScene loadingScene" aria-label="Preparando mesa molecular 3D" />}>
      <MoleculeLab3D atoms={content.atoms} composition={composition} />
    </Suspense>
    <div className="atomWorkbench" aria-label="Mesa de átomos">{content.atoms.map((atom) => <section key={atom.symbol} className="atomControl">
      <span className="atomSample" style={{ background: atom.color }}>{atom.symbol}</span><div><strong>{atom.label}</strong><small>Símbolo {atom.symbol}</small></div>
      <div className="atomStepper"><button className="iconButton secondary" aria-label={`Quitar ${atom.label}`} title={`Quitar ${atom.label}`} disabled={composition[atom.symbol] === 0} onClick={() => change(atom.symbol, -1)}><Minus /></button><output aria-label={`${atom.label}: ${composition[atom.symbol]}`}>{composition[atom.symbol]}</output><button className="iconButton" aria-label={`Añadir ${atom.label}`} title={`Añadir ${atom.label}`} onClick={() => change(atom.symbol, 1)}><Plus /></button></div>
    </section>)}</div>
    <button disabled={Object.values(composition).every((value) => value === 0)} onClick={() => { setChecked(true); if (correct) onSolved(composition); }}><Check /> Analizar composición</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Composición conseguida! ${content.explanation}` : "La composición aún no coincide con la fórmula. Lee cada subíndice y ajusta los contadores."}</p>}
  </div>;
}

function ForceExercise({ content, onSolved }: { content: ForceLab; onSolved: (response: number[]) => void }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const resultant = selected.reduce((sum, force) => sum + force, 0);
  const correct = selected.length > 0 && resultant === content.target_resultant;
  function toggle(force: number) {
    setSelected((current) => current.includes(force) ? current.filter((value) => value !== force) : [...current, force]);
    setChecked(false);
  }
  const direction = resultant === 0 ? "Equilibrio" : resultant > 0 ? "Derecha" : "Izquierda";
  return <div className="interactiveExercise forceExercise">
    <strong>{content.prompt}</strong>
    <Suspense fallback={<div className="forceLabScene loadingScene" aria-label="Preparando banco de fuerzas 3D" />}>
      <ForceLab3D selected={selected} resultant={resultant} />
    </Suspense>
    <div className="forceMeters" aria-live="polite"><span><small>Objetivo</small><strong>{content.target_resultant > 0 ? "+" : ""}{content.target_resultant} N</strong></span><span className={correct ? "ready" : ""}><small>Resultante</small><strong>{resultant > 0 ? "+" : ""}{resultant} N</strong></span><span><small>Dirección</small><strong>{direction}</strong></span></div>
    <div className="forceTray" role="group" aria-label="Fuerzas disponibles">{content.forces.map((force) => <button key={force} className={selected.includes(force) ? "forceChoice selected" : "forceChoice"} aria-pressed={selected.includes(force)} onClick={() => toggle(force)}><span>{force < 0 ? "←" : "→"}</span><strong>{Math.abs(force)} N</strong><small>{force < 0 ? "Izquierda" : "Derecha"}</small></button>)}</div>
    <button disabled={selected.length === 0} onClick={() => { setChecked(true); if (correct) onSolved(selected); }}><Check /> Medir resultante</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Objetivo conseguido! ${content.explanation}` : `La resultante es ${resultant} N. Activa o retira fuerzas para llegar a ${content.target_resultant} N.`}</p>}
  </div>;
}

function RouteExercise({ content, onSolved }: { content: RouteLab; onSolved: (response: RouteMove[]) => void }) {
  const [moves, setMoves] = useState<RouteMove[]>([]);
  const [checked, setChecked] = useState(false);
  const position = routePosition(content, moves);
  const reached = position.row === content.target.row && position.col === content.target.col;
  const blocked = new Set(content.blocked.map((cell) => `${cell.row}:${cell.col}`));
  function canMove(move: RouteMove) {
    const row = position.row + routeDeltas[move][0]; const col = position.col + routeDeltas[move][1];
    return moves.length < content.max_moves && row >= 0 && row < content.rows && col >= 0 && col < content.cols && !blocked.has(`${row}:${col}`) && !reached;
  }
  function addMove(move: RouteMove) { if (canMove(move)) { setMoves((current) => [...current, move]); setChecked(false); } }
  const labels: Record<RouteMove, string> = { UP: "Arriba", DOWN: "Abajo", LEFT: "Izquierda", RIGHT: "Derecha" };
  return <div className="interactiveExercise routeExercise">
    <strong>{content.prompt}</strong>
    <Suspense fallback={<div className="routeLabScene loadingScene" aria-label="Preparando tablero de rutas 3D" />}>
      <RouteLab3D rows={content.rows} cols={content.cols} blocked={content.blocked} target={content.target} position={position} />
    </Suspense>
    <div className="routeStatus" aria-live="polite"><span>Fila {position.row + 1}, columna {position.col + 1}</span><strong>{moves.length}/{content.max_moves} comandos</strong></div>
    <div className="routeProgram" aria-label="Programa actual">{moves.length === 0 ? <span>Programa vacío</span> : moves.map((move, index) => <span key={`${move}-${index}`}>{index + 1}. {labels[move]}</span>)}</div>
    <div className="routePad" role="group" aria-label="Controles de movimiento">
      <button className="iconButton" aria-label="Mover arriba" title="Mover arriba" disabled={!canMove("UP")} onClick={() => addMove("UP")}><ArrowUp /></button>
      <button className="iconButton" aria-label="Mover izquierda" title="Mover izquierda" disabled={!canMove("LEFT")} onClick={() => addMove("LEFT")}><ArrowLeft /></button>
      <button className="iconButton secondary" aria-label="Deshacer último movimiento" title="Deshacer último movimiento" disabled={moves.length === 0} onClick={() => { setMoves((current) => current.slice(0, -1)); setChecked(false); }}><Undo2 /></button>
      <button className="iconButton" aria-label="Mover derecha" title="Mover derecha" disabled={!canMove("RIGHT")} onClick={() => addMove("RIGHT")}><ArrowRight /></button>
      <button className="iconButton" aria-label="Mover abajo" title="Mover abajo" disabled={!canMove("DOWN")} onClick={() => addMove("DOWN")}><ArrowDown /></button>
    </div>
    <button disabled={!reached} onClick={() => { setChecked(true); if (reached) onSolved(moves); }}><Check /> Ejecutar programa</button>
    {checked && <p className="exerciseFeedback correct">¡Destino alcanzado! {content.explanation}</p>}
  </div>;
}

function ClimateExercise({ content, onSolved }: { content: ClimateLab; onSolved: (response: { temperature: number; rainfall: number }) => void }) {
  const [temperature, setTemperature] = useState(content.initial_temperature);
  const [rainfall, setRainfall] = useState(content.initial_rainfall);
  const [checked, setChecked] = useState(false);
  const temperatureReady = temperature >= content.temperature_min && temperature <= content.temperature_max;
  const rainfallReady = rainfall >= content.rainfall_min && rainfall <= content.rainfall_max;
  const correct = temperatureReady && rainfallReady;
  return <div className="interactiveExercise climateExercise">
    <strong>{content.prompt}</strong>
    <div className="climateTargets"><span>{content.profile_label}</span><strong>{content.temperature_min}–{content.temperature_max} °C</strong><strong>{content.rainfall_min}–{content.rainfall_max} mm/año</strong></div>
    <Suspense fallback={<div className="climateLabScene loadingScene" aria-label="Preparando estación climática 3D" />}>
      <ClimateLab3D temperature={temperature} rainfall={rainfall} />
    </Suspense>
    <div className="climateControls">
      <label className={temperatureReady ? "ready" : ""}><span><Thermometer /> Temperatura media</span><output>{temperature} °C</output><input aria-label="Temperatura media anual" type="range" min="-20" max="40" step="1" value={temperature} onInput={(event) => { setTemperature(Number(event.currentTarget.value)); setChecked(false); }} /></label>
      <label className={rainfallReady ? "ready" : ""}><span><CloudRain /> Precipitación anual</span><output>{rainfall} mm</output><input aria-label="Precipitación anual" type="range" min="0" max="2500" step="50" value={rainfall} onInput={(event) => { setRainfall(Number(event.currentTarget.value)); setChecked(false); }} /></label>
    </div>
    <button onClick={() => { setChecked(true); if (correct) onSolved({ temperature, rainfall }); }}><Check /> Analizar perfil</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Perfil construido! ${content.explanation}` : `Ajusta ${!temperatureReady && !rainfallReady ? "las dos variables" : !temperatureReady ? "la temperatura" : "la precipitación"} hasta entrar en el intervalo objetivo.`}</p>}
  </div>;
}

function probabilityDraws(seed: number, blue: number, gold: number, count: number): ProbabilityDraw[] {
  let state = seed >>> 0;
  return Array.from({ length: count }, () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296 * (blue + gold) < blue ? "BLUE" : "GOLD";
  });
}

function ProbabilityExercise({ content, onSolved }: { content: ProbabilityLab; onSolved: (response: { blue_count: number; gold_count: number }) => void }) {
  const [blue, setBlue] = useState(content.initial_blue);
  const [gold, setGold] = useState(content.initial_gold);
  const [results, setResults] = useState<ProbabilityDraw[]>([]);
  const [checked, setChecked] = useState(false);
  const total = blue + gold;
  const correct = blue * content.target_denominator === content.target_numerator * total;
  const blueResults = results.filter((result) => result === "BLUE").length;
  const change = (color: "BLUE" | "GOLD", delta: number) => {
    if (delta > 0 && total >= content.max_balls) return;
    if (color === "BLUE" && blue + delta >= 1) setBlue(blue + delta);
    if (color === "GOLD" && gold + delta >= 1) setGold(gold + delta);
    setResults([]); setChecked(false);
  };
  return <div className="interactiveExercise probabilityExercise">
    <strong>{content.prompt}</strong>
    <div className="probabilityTarget"><span>Probabilidad objetivo de azul</span><strong>{content.target_numerator}/{content.target_denominator}</strong></div>
    <Suspense fallback={<div className="probabilityLabScene loadingScene" aria-label="Preparando máquina de probabilidad 3D" />}>
      <ProbabilityLab3D blueCount={blue} goldCount={gold} results={results} />
    </Suspense>
    <div className="probabilityEquation" aria-live="polite"><span>P(azul)</span><strong>{blue}/{total}</strong><small>{Math.round(blue / total * 100)}%</small></div>
    <div className="probabilityControls">
      {(["BLUE", "GOLD"] as const).map((color) => { const value = color === "BLUE" ? blue : gold; const label = color === "BLUE" ? "Azules" : "Doradas"; return <div key={color} className={`ballCounter ${color.toLowerCase()}`}><span>{label}</span><div><button className="iconButton secondary" aria-label={`Quitar bola ${label.toLowerCase()}`} disabled={value <= 1} onClick={() => change(color, -1)}><Minus /></button><output aria-label={`${label}: ${value}`}>{value}</output><button className="iconButton" aria-label={`Añadir bola ${label.toLowerCase()}`} disabled={total >= content.max_balls} onClick={() => change(color, 1)}><Plus /></button></div></div>; })}
    </div>
    <p className="machineRule">Extracciones con reposición · {content.draws} intentos · semilla {content.seed}</p>
    <button className="secondary" onClick={() => { setResults(probabilityDraws(content.seed, blue, gold, content.draws)); setChecked(false); }}><Dices /> Ejecutar experimento</button>
    {results.length > 0 && <div className="experimentResult" aria-live="polite"><span>Predicción teórica: aproximadamente {(content.draws * blue / total).toFixed(1)} azules</span><strong>Observado: {blueResults} de {content.draws}</strong></div>}
    <button disabled={results.length === 0} onClick={() => { setChecked(true); if (correct) onSolved({ blue_count: blue, gold_count: gold }); }}><Check /> Comparar y comprobar</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Máquina bien diseñada! ${content.explanation}` : `El experimento puede variar, pero la fracción teórica todavía es ${blue}/${total}. Ajusta las bolas hasta obtener ${content.target_numerator}/${content.target_denominator}.`}</p>}
  </div>;
}

function ReflectionExercise({ content, onSolved }: { content: ReflectionLab; onSolved: (response: { normal_angle: number }) => void }) {
  const [angle, setAngle] = useState(content.initial_normal_angle);
  const [checked, setChecked] = useState(false);
  const hit = angle === content.target_normal_angle;
  return <div className="interactiveExercise reflectionExercise">
    <strong>{content.prompt}</strong>
    <div className="rayLegend" aria-label="Leyenda del banco óptico"><span className="incident">Rayo incidente</span><span className="normal">Normal</span><span className="reflected">Rayo reflejado</span><span className="sensor">Sensor</span></div>
    <Suspense fallback={<div className="reflectionLabScene loadingScene" aria-label="Preparando banco óptico 3D" />}>
      <ReflectionLab3D angle={angle} targetAngle={content.target_normal_angle} />
    </Suspense>
    <div className="angleMeters" aria-live="polite"><span><small>Incidencia i</small><strong>{Math.abs(angle)}°</strong></span><span><small>Reflexión r</small><strong>{Math.abs(angle)}°</strong></span><span className={hit ? "ready" : ""}><small>Sensor</small><strong>{hit ? "Alcanzado" : "Buscando"}</strong></span></div>
    <label className="mirrorControl"><span><Gauge /> Inclinación de la normal</span><output>{angle}°</output><input aria-label="Inclinación de la normal" type="range" min="-30" max="30" step="1" value={angle} onInput={(event) => { setAngle(Number(event.currentTarget.value)); setChecked(false); }} /></label>
    <p className="opticsRule">Los ángulos se miden desde la normal, no desde la superficie del espejo.</p>
    <button onClick={() => { setChecked(true); if (hit) onSolved({ normal_angle: angle }); }}><Check /> Medir trayectoria</button>
    {checked && <p className={hit ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{hit ? `¡Sensor alcanzado! ${content.explanation}` : "El rayo aún no atraviesa el sensor. Gira la normal y observa cómo cambia la trayectoria reflejada."}</p>}
  </div>;
}

function netFlow(outside: number, inside: number): NetFlow { return outside > inside ? "INWARD" : inside > outside ? "OUTWARD" : "EQUILIBRIUM"; }
const flowLabels: Record<NetFlow, string> = { INWARD: "Hacia dentro →", OUTWARD: "← Hacia fuera", EQUILIBRIUM: "Equilibrio dinámico ⇄" };

function DiffusionExercise({ content, onSolved }: { content: DiffusionLab; onSolved: (response: { outside_count: number; inside_count: number }) => void }) {
  const [outside, setOutside] = useState(content.initial_outside);
  const [inside, setInside] = useState(content.initial_inside);
  const [checked, setChecked] = useState(false);
  const flow = netFlow(outside, inside); const correct = flow === content.target_net_flow;
  const change = (side: "OUTSIDE" | "INSIDE", delta: number) => {
    if (side === "OUTSIDE" && outside + delta >= 1 && outside + delta <= 10) setOutside(outside + delta);
    if (side === "INSIDE" && inside + delta >= 1 && inside + delta <= 10) setInside(inside + delta);
    setChecked(false);
  };
  return <div className="interactiveExercise diffusionExercise">
    <strong>{content.prompt}</strong>
    <div className="diffusionTarget"><span>Flujo neto objetivo</span><strong>{flowLabels[content.target_net_flow]}</strong></div>
    <div className="compartmentLabels"><span>Exterior celular</span><span>Interior celular</span></div>
    <Suspense fallback={<div className="diffusionLabScene loadingScene" aria-label="Preparando membrana 3D" />}><DiffusionLab3D outside={outside} inside={inside} /></Suspense>
    <div className={correct ? "netFlow ready" : "netFlow"} aria-live="polite"><ArrowLeftRight /><span>Flujo neto actual</span><strong>{flowLabels[flow]}</strong></div>
    <div className="diffusionControls">
      {(["OUTSIDE", "INSIDE"] as const).map((side) => { const value = side === "OUTSIDE" ? outside : inside; const label = side === "OUTSIDE" ? "Partículas fuera" : "Partículas dentro"; return <div className="concentrationCounter" key={side}><span>{label}</span><div><button className="iconButton secondary" aria-label={`Reducir ${label.toLowerCase()}`} disabled={value === 1} onClick={() => change(side, -1)}><Minus /></button><output aria-label={`${label}: ${value}`}>{value}</output><button className="iconButton" aria-label={`Aumentar ${label.toLowerCase()}`} disabled={value === 10} onClick={() => change(side, 1)}><Plus /></button></div></div>; })}
    </div>
    <p className="diffusionRule">Difusión simple del mismo soluto · volúmenes iguales · movimiento en ambos sentidos</p>
    <p className="modelBoundary">El agua no se mueve en este modelo. No representa ósmosis ni transporte activo.</p>
    <button onClick={() => { setChecked(true); if (correct) onSolved({ outside_count: outside, inside_count: inside }); }}><Check /> Analizar gradiente</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Gradiente construido! ${content.explanation}` : `El flujo neto actual es ${flowLabels[flow].toLowerCase()}. Ajusta las concentraciones para crear ${flowLabels[content.target_net_flow].toLowerCase()}.`}</p>}
  </div>;
}

function StratigraphyExercise({ content, onSolved }: { content: StratigraphyLab; onSolved: (response: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const expected = [...content.artifacts].sort((a, b) => b.depth_rank - a.depth_rank).map((artifact) => artifact.id);
  const correct = selected.length === expected.length && selected.every((id, index) => id === expected[index]);
  const byId = new Map(content.artifacts.map((artifact) => [artifact.id, artifact]));
  function toggle(id: string) { setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); setChecked(false); }
  return <div className="interactiveExercise stratigraphyExercise">
    <strong>{content.prompt}</strong>
    <div className="trenchHeader"><span><Shovel /> {content.site_label}</span><strong>Capas intactas</strong></div>
    <Suspense fallback={<div className="stratigraphyLabScene loadingScene" aria-label="Preparando excavación 3D" />}><StratigraphyLab3D artifacts={content.artifacts} selectedIds={selected} /></Suspense>
    <div className="stratigraphyRule"><strong>Más profundo = más antiguo, en esta trinchera</strong><span>Cronología relativa · no proporciona fechas exactas</span></div>
    <div className="artifactTray" role="group" aria-label="Objetos encontrados">{content.artifacts.map((artifact) => <button key={artifact.id} className={selected.includes(artifact.id) ? "artifactChoice selected" : "artifactChoice"} aria-pressed={selected.includes(artifact.id)} onClick={() => toggle(artifact.id)}><span>{selected.includes(artifact.id) ? selected.indexOf(artifact.id) + 1 : "?"}</span><strong>{artifact.label}</strong><small>Estrato {artifact.depth_rank}</small></button>)}</div>
    <div className="relativeTimeline" aria-label="Cronología de más antiguo a más reciente"><span>Más antiguo</span>{selected.map((id, index) => <button key={id} onClick={() => toggle(id)} aria-label={`Retirar ${byId.get(id)?.label}`}><small>{index + 1}</small>{byId.get(id)?.label}</button>)}{Array.from({ length: content.artifacts.length - selected.length }, (_, index) => <i key={index}>Vacío</i>)}<span>Más reciente</span></div>
    <p className="modelBoundary">Modelo ideal: las capas no han sido removidas. En un yacimiento real, hoyos, raíces, erosión u obras pueden alterar el orden.</p>
    <button disabled={selected.length !== content.artifacts.length} onClick={() => { setChecked(true); if (correct) onSolved(selected); }}><Check /> Reconstruir cronología</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Secuencia reconstruida! ${content.explanation}` : "Revisa la profundidad: empieza por el objeto de la capa inferior y avanza hacia la superficie."}</p>}
  </div>;
}

function densityState(mass: number, volume: number): DensityState { return mass < volume ? "FLOAT" : mass > volume ? "SINK" : "SUSPEND"; }
const densityLabels: Record<DensityState, string> = { FLOAT: "Flota", SINK: "Se hunde", SUSPEND: "Queda suspendido" };

function DensityExercise({ content, onSolved }: { content: DensityLab; onSolved: (response: { mass: number; volume: number }) => void }) {
  const [mass, setMass] = useState(content.initial_mass);
  const [volume, setVolume] = useState(content.initial_volume);
  const [checked, setChecked] = useState(false);
  const state = densityState(mass, volume); const correct = state === content.target_state; const density = mass / volume;
  return <div className="interactiveExercise densityExercise">
    <strong>{content.prompt}</strong>
    <div className="densityTarget"><span>Comportamiento objetivo</span><strong>{densityLabels[content.target_state]}</strong><small>Líquido: {content.liquid_density.toFixed(1)} g/cm³</small></div>
    <Suspense fallback={<div className="densityLabScene loadingScene" aria-label="Preparando tanque de densidad 3D" />}><DensityLab3D mass={mass} volume={volume} state={state} /></Suspense>
    <div className={correct ? "densityFormula ready" : "densityFormula"} aria-live="polite"><span>ρ = masa ÷ volumen</span><strong>{mass} ÷ {volume} = {density.toFixed(2)} g/cm³</strong><b>{densityLabels[state]}</b></div>
    <div className="densityControls">
      <label><span><Weight /> Masa</span><output>{mass} g</output><input aria-label="Masa del bloque" type="range" min="1" max="20" step="1" value={mass} onInput={(event) => { setMass(Number(event.currentTarget.value)); setChecked(false); }} /></label>
      <label><span><Volume2 /> Volumen</span><output>{volume} cm³</output><input aria-label="Volumen del bloque" type="range" min="1" max="20" step="1" value={volume} onInput={(event) => { setVolume(Number(event.currentTarget.value)); setChecked(false); }} /></label>
    </div>
    <p className="modelBoundary">Modelo estático simplificado: no calcula olas, viscosidad ni fracción sumergida. La densidad por sí sola no identifica un material.</p>
    <button onClick={() => { setChecked(true); if (correct) onSolved({ mass, volume }); }}><Check /> Comparar densidades</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Comportamiento conseguido! ${content.explanation}` : `La densidad del bloque es ${density.toFixed(2)} g/cm³ y por eso ${densityLabels[state].toLowerCase()}. Ajusta masa o volumen para que ${densityLabels[content.target_state].toLowerCase()}.`}</p>}
  </div>;
}

const tectonicFeatureByMotion: Record<PlateMotion, TectonicFeature> = { DIVERGENT: "RIDGE", CONVERGENT: "MOUNTAIN_RANGE", TRANSFORM: "FAULT" };
const tectonicMotionLabels: Record<PlateMotion, string> = { DIVERGENT: "Separar", CONVERGENT: "Comprimir", TRANSFORM: "Deslizar" };
const tectonicFeatureLabels: Record<TectonicFeature, string> = { RIDGE: "Dorsal", MOUNTAIN_RANGE: "Cordillera", FAULT: "Falla" };

function TectonicExercise({ content, onSolved }: { content: TectonicLab; onSolved: (response: PlateMotion) => void }) {
  const [motion, setMotion] = useState<PlateMotion>(content.initial_motion);
  const [checked, setChecked] = useState(false);
  const feature = tectonicFeatureByMotion[motion];
  const correct = motion === content.target_motion && feature === content.target_feature;
  return <div className="interactiveExercise tectonicExercise">
    <strong>{content.prompt}</strong>
    <div className="tectonicTarget"><span>Relieve objetivo</span><strong>{tectonicFeatureLabels[content.target_feature]}</strong></div>
    <Suspense fallback={<div className="tectonicLabScene loadingScene" aria-label="Preparando mesa tectónica 3D" />}><TectonicLab3D motion={motion} /></Suspense>
    <div className="tectonicReadout" aria-live="polite"><span>Movimiento: <strong>{tectonicMotionLabels[motion]}</strong></span><span>Resultado: <strong>{tectonicFeatureLabels[feature]}</strong></span></div>
    <div className="tectonicControls" role="group" aria-label="Movimiento relativo de las placas">
      {(Object.keys(tectonicMotionLabels) as PlateMotion[]).map((option) => <button key={option} className={motion === option ? "selected" : "secondary"} aria-pressed={motion === option} onClick={() => { setMotion(option); setChecked(false); }}><ArrowLeftRight />{tectonicMotionLabels[option]}</button>)}
    </div>
    <p className="modelBoundary">Modelo conceptual, no simulación geofísica: las placas reales son enormes y se mueven muy lentamente. Aquí mostramos un proceso dominante; existen límites convergentes con subducción y casos mixtos.</p>
    <button onClick={() => { setChecked(true); if (correct) onSolved(motion); }}><Check /> Observar el relieve</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Causa y relieve conectados! ${content.explanation}` : `Al ${tectonicMotionLabels[motion].toLowerCase()} las placas, la mesa crea una ${tectonicFeatureLabels[feature].toLowerCase()}. Prueba otro movimiento para formar una ${tectonicFeatureLabels[content.target_feature].toLowerCase()}.`}</p>}
  </div>;
}

const lunarPhaseLabels: Record<LunarPhase, string> = { NEW: "Luna nueva", FIRST_QUARTER: "Cuarto creciente", FULL: "Luna llena", LAST_QUARTER: "Cuarto menguante" };

function LunarPhaseExercise({ content, onSolved }: { content: LunarPhaseLab; onSolved: (response: LunarPhase) => void }) {
  const [phase, setPhase] = useState<LunarPhase>(content.initial_phase);
  const [checked, setChecked] = useState(false);
  const correct = phase === content.target_phase;
  return <div className="interactiveExercise lunarPhaseExercise">
    <strong>{content.prompt}</strong>
    <div className="lunarTarget"><span><Moon /> Fase objetivo</span><strong>{lunarPhaseLabels[content.target_phase]}</strong></div>
    <Suspense fallback={<div className="lunarPhaseScene loadingScene" aria-label="Preparando observatorio lunar 3D" />}><LunarPhaseLab3D phase={phase} /></Suspense>
    <div className="earthView" aria-live="polite"><div className={`phaseDisc phase-${phase.toLowerCase()}`} role="img" aria-label={`Desde la Tierra se observa ${lunarPhaseLabels[phase].toLowerCase()}`} /><span><small>Vista desde la Tierra</small><strong>{lunarPhaseLabels[phase]}</strong></span><b><Sun /> La luz llega desde el Sol</b></div>
    <div className="lunarPhaseControls" role="group" aria-label="Posición de la Luna en su órbita">
      {(Object.keys(lunarPhaseLabels) as LunarPhase[]).map((option) => <button key={option} className={phase === option ? "selected" : "secondary"} aria-pressed={phase === option} onClick={() => { setPhase(option); setChecked(false); }}><Moon />{lunarPhaseLabels[option]}</button>)}
    </div>
    <p className="modelBoundary">Modelo conceptual visto desde encima del polo norte. Las distancias y tamaños no están a escala. Las fases muestran cuánta parte iluminada vemos desde la Tierra; la sombra terrestre solo interviene en un eclipse lunar.</p>
    <button onClick={() => { setChecked(true); if (correct) onSolved(phase); }}><Check /> Comprobar alineación</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Geometría resuelta! ${content.explanation}` : `Has construido ${lunarPhaseLabels[phase].toLowerCase()}. Cambia la posición orbital hasta observar ${lunarPhaseLabels[content.target_phase].toLowerCase()}.`}</p>}
  </div>;
}

function applyFunctionCards(value: number, cards: FunctionCard[]) {
  return cards.reduce((current, card) => card.kind === "ADD" ? current + card.value : current * card.value, value);
}

function functionCardLabel(card: FunctionCard) {
  if (card.kind === "MULTIPLY") return `× ${card.value}`;
  return card.value > 0 ? `+ ${card.value}` : `− ${Math.abs(card.value)}`;
}

function FunctionMachineExercise({ content, onSolved }: { content: FunctionMachineLab; onSolved: (response: string[]) => void }) {
  const [program, setProgram] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const cardsById = new Map(content.cards.map((card) => [card.id, card]));
  const selectedCards = program.map((id) => cardsById.get(id)!);
  const outputs = content.inputs.map((value) => applyFunctionCards(value, selectedCards));
  const correct = program.length === 2 && outputs.every((value, index) => value === content.target_outputs[index]);
  function toggle(cardId: string) {
    setProgram((current) => current.includes(cardId) ? current.filter((id) => id !== cardId) : current.length < 2 ? [...current, cardId] : current);
    setChecked(false);
  }
  return <div className="interactiveExercise functionMachineExercise">
    <strong>{content.prompt}</strong>
    <Suspense fallback={<div className="functionMachineScene loadingScene" aria-label="Preparando máquina de funciones 3D" />}><FunctionMachineLab3D slots={program.length} /></Suspense>
    <div className="functionProgram" aria-label="Programa de la máquina"><span>Entrada x</span>{[0, 1].map((slot) => <strong key={slot} className={program[slot] ? "filled" : ""}>{program[slot] ? functionCardLabel(cardsById.get(program[slot])!) : `Operación ${slot + 1}`}</strong>)}<span>Salida y</span><button className="iconButton secondary" aria-label="Quitar última operación" title="Quitar última operación" disabled={program.length === 0} onClick={() => { setProgram((current) => current.slice(0, -1)); setChecked(false); }}><Undo2 /></button></div>
    <div className="functionCardTray" role="group" aria-label="Tarjetas de operaciones disponibles">{content.cards.map((card) => <button key={card.id} className={program.includes(card.id) ? "selected" : "secondary"} aria-pressed={program.includes(card.id)} disabled={!program.includes(card.id) && program.length === 2} onClick={() => toggle(card.id)}><span>{functionCardLabel(card)}</span><small>{card.kind === "ADD" ? "Sumar" : "Multiplicar"}</small></button>)}</div>
    <div className="functionProbeTable" aria-live="polite"><span>Entrada</span><span>Tu salida</span><span>Objetivo</span>{content.inputs.map((input, index) => <div key={input} className={outputs[index] === content.target_outputs[index] && program.length === 2 ? "ready" : ""}><strong>{input}</strong><b>{outputs[index]}</b><strong>{content.target_outputs[index]}</strong></div>)}</div>
    <p className="machineRule">La máquina aplica primero la tarjeta izquierda y después la derecha.</p>
    <button disabled={program.length !== 2} onClick={() => { setChecked(true); if (correct) onSolved(program); }}><Check /> Probar las tres entradas</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Programa descubierto! ${content.explanation}` : `La máquina no coincide en ${outputs.filter((value, index) => value !== content.target_outputs[index]).length} de las 3 pruebas. Cambia una tarjeta o invierte el orden.`}</p>}
  </div>;
}

function SoundWaveExercise({ content, onSolved }: { content: SoundWaveLab; onSolved: (response: { frequency: number; amplitude: number }) => void }) {
  const [frequency, setFrequency] = useState(content.initial_frequency);
  const [amplitude, setAmplitude] = useState(content.initial_amplitude);
  const [checked, setChecked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const frequencyReady = frequency >= content.frequency_min && frequency <= content.frequency_max;
  const amplitudeReady = amplitude >= content.amplitude_min && amplitude <= content.amplitude_max;
  const correct = frequencyReady && amplitudeReady;
  const pitch = frequency < 350 ? "Más grave" : frequency > 600 ? "Más agudo" : "Tono intermedio";
  async function playTone() {
    if (playing) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = "sine"; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(amplitude * 0.015, now + 0.04);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.58);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now); oscillator.stop(now + 0.6);
    setPlaying(true);
    window.setTimeout(() => { setPlaying(false); void context.close(); }, 650);
  }
  return <div className="interactiveExercise soundWaveExercise">
    <strong>{content.prompt}</strong>
    <div className="soundTargets"><span>Frecuencia objetivo <strong>{content.frequency_min}–{content.frequency_max} Hz</strong></span><span>Amplitud objetivo <strong>{content.amplitude_min}–{content.amplitude_max}</strong></span></div>
    <Suspense fallback={<div className="soundWaveScene loadingScene" aria-label="Preparando estudio de ondas 3D" />}><SoundWaveLab3D frequency={frequency} amplitude={amplitude} /></Suspense>
    <div className="soundReadout" aria-live="polite"><span><small>Frecuencia</small><strong>{frequency} Hz</strong><b>{pitch}</b></span><span><small>Amplitud visual</small><strong>{amplitude}/5</strong><b>{amplitude < 3 ? "Crestas bajas" : amplitude > 3 ? "Crestas altas" : "Crestas medias"}</b></span></div>
    <div className="soundControls">
      <label className={frequencyReady ? "ready" : ""}><span>Frecuencia</span><output>{frequency} Hz</output><input aria-label="Frecuencia de la onda" type="range" min="200" max="800" step="25" value={frequency} onInput={(event) => { setFrequency(Number(event.currentTarget.value)); setChecked(false); }} /></label>
      <label className={amplitudeReady ? "ready" : ""}><span>Amplitud visual</span><output>{amplitude}</output><input aria-label="Amplitud visual de la onda" type="range" min="1" max="5" step="1" value={amplitude} onInput={(event) => { setAmplitude(Number(event.currentTarget.value)); setChecked(false); }} /></label>
    </div>
    <button className="secondary soundPreview" disabled={playing} onClick={() => void playTone()}>{playing ? <Volume2 /> : <Play />}{playing ? "Reproduciendo tono breve" : "Escuchar 0,6 segundos"}</button>
    <p className="modelBoundary">Audio opcional y limitado a una ganancia máxima de 0,075. La escena es una representación transversal idealizada, no muestra moléculas de aire ni mide intensidad en decibelios. El reto se resuelve sin escuchar.</p>
    <button onClick={() => { setChecked(true); if (correct) onSolved({ frequency, amplitude }); }}><Check /> Analizar la onda</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Onda ajustada! ${content.explanation}` : `Ajusta ${!frequencyReady && !amplitudeReady ? "frecuencia y amplitud" : !frequencyReady ? "la frecuencia" : "la amplitud"} hasta entrar en la zona objetivo.`}</p>}
  </div>;
}

const elementSymbols = ["", "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"];

function AtomBuilderExercise({ content, onSolved }: { content: AtomBuilderLab; onSolved: (response: { protons: number; neutrons: number; electrons: number }) => void }) {
  const [protons, setProtons] = useState(content.initial_protons);
  const [neutrons, setNeutrons] = useState(content.initial_neutrons);
  const [electrons, setElectrons] = useState(content.initial_electrons);
  const [checked, setChecked] = useState(false);
  const mass = protons + neutrons;
  const charge = protons - electrons;
  const targetMass = content.target_protons + content.target_neutrons;
  const targetCharge = content.target_protons - content.target_electrons;
  const correct = protons === content.target_protons && neutrons === content.target_neutrons && electrons === content.target_electrons;
  const values = [
    { key: "protons", label: "Protones", value: protons, min: 1, max: 18, set: setProtons, color: "proton" },
    { key: "neutrons", label: "Neutrones", value: neutrons, min: 0, max: 22, set: setNeutrons, color: "neutron" },
    { key: "electrons", label: "Electrones", value: electrons, min: 0, max: 18, set: setElectrons, color: "electron" },
  ];
  const signed = (value: number) => value > 0 ? `+${value}` : String(value);
  return <div className="interactiveExercise atomBuilderExercise">
    <strong>{content.prompt}</strong>
    <div className="atomTarget"><div><sup>{targetMass}</sup><strong>{content.element_symbol}</strong><sup>{signed(targetCharge)}</sup></div><span><b>{content.element_name}</b><small>Número másico A = {targetMass} · carga q = {signed(targetCharge)}</small></span></div>
    <Suspense fallback={<div className="atomBuilderScene loadingScene" aria-label="Preparando constructor atómico 3D" />}><AtomBuilderLab3D protons={protons} neutrons={neutrons} electrons={electrons} /></Suspense>
    <div className="atomicEquations" aria-live="polite"><span><small>Identidad Z = p</small><strong>{elementSymbols[protons]} · Z = {protons}</strong></span><span className={mass === targetMass ? "ready" : ""}><small>A = p + n</small><strong>{protons} + {neutrons} = {mass}</strong></span><span className={charge === targetCharge ? "ready" : ""}><small>q = p − e</small><strong>{protons} − {electrons} = {signed(charge)}</strong></span></div>
    <div className="particleControls">{values.map((item) => <div key={item.key} className={`particleCounter ${item.color}`}><span>{item.label}</span><div><button className="iconButton secondary" aria-label={`Quitar ${item.label.toLowerCase()}`} disabled={item.value <= item.min} onClick={() => { item.set(item.value - 1); setChecked(false); }}><Minus /></button><output aria-label={`${item.label}: ${item.value}`}>{item.value}</output><button className="iconButton" aria-label={`Añadir ${item.label.toLowerCase()}`} disabled={item.value >= item.max} onClick={() => { item.set(item.value + 1); setChecked(false); }}><Plus /></button></div></div>)}</div>
    <p className="modelBoundary">Modelo de capas conceptual: partículas, distancias y trayectorias no están a escala y los electrones no recorren órbitas planetarias reales. Sirve aquí para contar composición, número másico y carga.</p>
    <button onClick={() => { setChecked(true); if (correct) onSolved({ protons, neutrons, electrons }); }}><Check /> Analizar especie</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Especie construida! ${content.explanation}` : `${elementSymbols[protons]} tiene Z=${protons}, A=${mass} y carga ${signed(charge)}. Ajusta las partículas hasta obtener ${content.element_symbol}, A=${targetMass} y q=${signed(targetCharge)}.`}</p>}
  </div>;
}

const additiveColorLabels: Record<string, string> = { "000": "Oscuridad", "100": "Rojo", "010": "Verde", "001": "Azul", "110": "Amarillo", "101": "Magenta", "011": "Cian", "111": "Blanco" };
const additiveTargetLabels = { CYAN: "Cian", YELLOW: "Amarillo", MAGENTA: "Magenta", WHITE: "Blanco" };

function LightMixExercise({ content, onSolved }: { content: LightMixLab; onSolved: (response: { red: number; green: number; blue: number }) => void }) {
  const [red, setRed] = useState<LightChannel>(content.initial_red);
  const [green, setGreen] = useState<LightChannel>(content.initial_green);
  const [blue, setBlue] = useState<LightChannel>(content.initial_blue);
  const [checked, setChecked] = useState(false);
  const key = `${red}${green}${blue}`;
  const result = additiveColorLabels[key];
  const correct = red === content.target_red && green === content.target_green && blue === content.target_blue;
  const channels = [
    { key: "red", short: "R", label: "Rojo", value: red, set: setRed, css: "red" },
    { key: "green", short: "G", label: "Verde", value: green, set: setGreen, css: "green" },
    { key: "blue", short: "B", label: "Azul", value: blue, set: setBlue, css: "blue" },
  ];
  const color = `rgb(${red * 255} ${green * 255} ${blue * 255})`;
  return <div className="interactiveExercise lightMixExercise">
    <strong>{content.prompt}</strong>
    <div className="lightTarget"><span><Lightbulb /> Color objetivo</span><strong>{additiveTargetLabels[content.target_label]}</strong></div>
    <Suspense fallback={<div className="lightMixScene loadingScene" aria-label="Preparando teatro de luz 3D" />}><LightMixLab3D red={red} green={green} blue={blue} /></Suspense>
    <div className="lightResult" aria-live="polite"><span className="lightResultSwatch" style={{ backgroundColor: color }} aria-hidden="true" /><span><small>Resultado de la mezcla</small><strong>{result}</strong><b>{red + green + blue} focos encendidos</b></span></div>
    <div className="lightSwitches" role="group" aria-label="Interruptores de los focos RGB">{channels.map((channel) => <button key={channel.key} className={`${channel.css} ${channel.value ? "selected" : "secondary"}`} aria-pressed={!!channel.value} onClick={() => { channel.set(channel.value ? 0 : 1); setChecked(false); }}><span className="channelSwatch" /><strong>{channel.short} · {channel.label}</strong><small>{channel.value ? "Encendido" : "Apagado"}</small></button>)}</div>
    <p className="modelBoundary">Mezcla aditiva de luz: al sumar focos el resultado se acerca al blanco. Las pinturas y tintas mezclan pigmentos de forma sustractiva y no siguen estas mismas combinaciones.</p>
    <button onClick={() => { setChecked(true); if (correct) onSolved({ red, green, blue }); }}><Check /> Comprobar iluminación</button>
    {checked && <p className={correct ? "exerciseFeedback correct" : "exerciseFeedback incorrect"}>{correct ? `¡Escena iluminada! ${content.explanation}` : `La combinación actual produce ${result.toLowerCase()}. Cambia los interruptores hasta crear ${additiveTargetLabels[content.target_label].toLowerCase()}.`}</p>}
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
  const interactive = activity.type === "CLOSED_QUESTION" || activity.type === "CLASSIFICATION" || activity.type === "BALANCE_LAB" || activity.type === "TILE_LAB" || activity.type === "TIMELINE" || activity.type === "FOOD_WEB_LAB" || activity.type === "RHYTHM_LAB" || activity.type === "SENTENCE_LAB" || activity.type === "ORBIT_LAB" || activity.type === "MOLECULE_LAB" || activity.type === "FORCE_LAB" || activity.type === "ROUTE_LAB" || activity.type === "CLIMATE_LAB" || activity.type === "PROBABILITY_LAB" || activity.type === "REFLECTION_LAB" || activity.type === "DIFFUSION_LAB" || activity.type === "STRATIGRAPHY_LAB" || activity.type === "DENSITY_LAB" || activity.type === "TECTONIC_LAB" || activity.type === "LUNAR_PHASE_LAB" || activity.type === "FUNCTION_MACHINE_LAB" || activity.type === "SOUND_WAVE_LAB" || activity.type === "ATOM_BUILDER_LAB" || activity.type === "LIGHT_MIX_LAB";
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
        {activity.type === "SENTENCE_LAB" && <SentenceExercise key={activity.id} content={activity.content as SentenceLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "ORBIT_LAB" && <OrbitExercise key={activity.id} content={activity.content as OrbitLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "MOLECULE_LAB" && <MoleculeExercise key={activity.id} content={activity.content as MoleculeLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "FORCE_LAB" && <ForceExercise key={activity.id} content={activity.content as ForceLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "ROUTE_LAB" && <RouteExercise key={activity.id} content={activity.content as RouteLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "CLIMATE_LAB" && <ClimateExercise key={activity.id} content={activity.content as ClimateLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "PROBABILITY_LAB" && <ProbabilityExercise key={activity.id} content={activity.content as ProbabilityLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "REFLECTION_LAB" && <ReflectionExercise key={activity.id} content={activity.content as ReflectionLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "DIFFUSION_LAB" && <DiffusionExercise key={activity.id} content={activity.content as DiffusionLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "STRATIGRAPHY_LAB" && <StratigraphyExercise key={activity.id} content={activity.content as StratigraphyLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "DENSITY_LAB" && <DensityExercise key={activity.id} content={activity.content as DensityLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "TECTONIC_LAB" && <TectonicExercise key={activity.id} content={activity.content as TectonicLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "LUNAR_PHASE_LAB" && <LunarPhaseExercise key={activity.id} content={activity.content as LunarPhaseLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "FUNCTION_MACHINE_LAB" && <FunctionMachineExercise key={activity.id} content={activity.content as FunctionMachineLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "SOUND_WAVE_LAB" && <SoundWaveExercise key={activity.id} content={activity.content as SoundWaveLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "ATOM_BUILDER_LAB" && <AtomBuilderExercise key={activity.id} content={activity.content as AtomBuilderLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
        {activity.type === "LIGHT_MIX_LAB" && <LightMixExercise key={activity.id} content={activity.content as LightMixLab} onSolved={(response) => { setSolvedActivityIds((current) => [...new Set([...current, activity.id])]); setSolvedResponses((current) => ({ ...current, [activity.id]: response })); }} />}
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
