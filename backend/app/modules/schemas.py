from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class ModuleAuthor(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    role: str = Field(default="AUTHOR", max_length=40)


class CurriculumMapping(BaseModel):
    jurisdiction: str = Field(default="ES", pattern="^ES$")
    autonomous_community: str = Field(default="STATE_BASE", max_length=60)
    stage: Literal["PRIMARY", "ESO"]
    grades: list[int] = Field(min_length=1)
    subject: str = Field(min_length=2, max_length=80)
    competencies: list[str] = Field(default_factory=list)
    assessment_criteria: list[str] = Field(default_factory=list)
    basic_knowledge: list[str] = Field(default_factory=list)

    @field_validator("grades")
    @classmethod
    def validate_grades(cls, grades: list[int], info):
        if len(grades) != len(set(grades)):
            raise ValueError("Grades must be unique.")
        return grades

    @model_validator(mode="after")
    def validate_stage_grades(self):
        valid = range(1, 7) if self.stage == "PRIMARY" else range(1, 5)
        if any(grade not in valid for grade in self.grades):
            raise ValueError(f"Grades are outside the valid range for {self.stage}.")
        return self


class EduModuleManifest(BaseModel):
    format: Literal["EDUMODULE"]
    format_version: Literal["1.0"]
    id: str = Field(pattern=r"^[a-z0-9]+(?:[.-][a-z0-9]+)+$", max_length=160)
    version: str = Field(pattern=r"^\d+\.\d+\.\d+$")
    title: str = Field(min_length=3, max_length=140)
    summary: str = Field(min_length=10, max_length=500)
    language: str = Field(default="es", pattern=r"^[a-z]{2}(?:-[A-Z]{2})?$")
    license: Literal["CC0-1.0", "CC-BY-4.0", "CC-BY-SA-4.0"]
    authors: list[ModuleAuthor] = Field(min_length=1)
    curriculum: list[CurriculumMapping] = Field(min_length=1)
    activity_files: list[str] = Field(min_length=1, max_length=100)
    asset_files: list[str] = Field(default_factory=list, max_length=100)
    created_at: str
    review_status: Literal["AI_DRAFT", "COMMUNITY_DRAFT", "EDUCATOR_REVIEWED"] = "COMMUNITY_DRAFT"
    curriculum_strand: str | None = Field(default=None, max_length=140)
    generation_provider: Literal["LM_STUDIO_QWEN", "GROK_CLI"] | None = None


class CoinValueScene(BaseModel):
    type: Literal["COIN_VALUE"]
    value: str = Field(min_length=1, max_length=40)
    answer: str = Field(min_length=1, max_length=120)


class FoodChainScene(BaseModel):
    type: Literal["FOOD_CHAIN"]
    answer: str = Field(min_length=1, max_length=120)


class ClosedQuestionContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    options: list[str] = Field(min_length=2, max_length=6)
    correct_option: str
    explanation: str = Field(min_length=3, max_length=500)
    scene: CoinValueScene | FoodChainScene | None = None

    @model_validator(mode="after")
    def validate_answer(self):
        if len(self.options) != len(set(self.options)):
            raise ValueError("Closed-question options must be unique.")
        if self.correct_option not in self.options:
            raise ValueError("The correct option must appear in options.")
        if self.scene and self.scene.answer != self.correct_option:
            raise ValueError("The scene answer must match the correct option.")
        return self


class ClassificationItem(BaseModel):
    label: str = Field(min_length=1, max_length=120)
    category: str = Field(min_length=1, max_length=80)


class ClassificationContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    categories: list[str] = Field(min_length=2, max_length=6)
    items: list[ClassificationItem] = Field(min_length=2, max_length=20)
    explanation: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_categories(self):
        if len(self.categories) != len(set(self.categories)):
            raise ValueError("Classification categories must be unique.")
        if any(item.category not in self.categories for item in self.items):
            raise ValueError("Every classification answer must use a declared category.")
        return self


class BalanceLabContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    left_value: int = Field(ge=1, le=100)
    weights: list[int] = Field(min_length=2, max_length=8)
    example_solution: list[int] = Field(min_length=1, max_length=8)
    explanation: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_balance(self):
        if len(self.weights) != len(set(self.weights)):
            raise ValueError("Balance-lab weights must be unique.")
        if any(weight < 1 or weight > 100 for weight in self.weights):
            raise ValueError("Balance-lab weights must be between 1 and 100.")
        if any(weight not in self.weights for weight in self.example_solution):
            raise ValueError("The example solution must use available weights.")
        if len(self.example_solution) != len(set(self.example_solution)):
            raise ValueError("The example solution cannot reuse a weight.")
        if sum(self.example_solution) != self.left_value:
            raise ValueError("The example solution must balance the left value.")
        return self


class TileCell(BaseModel):
    row: int = Field(ge=0, le=5)
    col: int = Field(ge=0, le=5)


def tile_shape_metrics(cells: list[TileCell]) -> tuple[int, int, bool]:
    points = {(cell.row, cell.col) for cell in cells}
    if not points:
        return 0, 0, False
    perimeter = sum(
        (row + dr, col + dc) not in points
        for row, col in points
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1))
    )
    visited = {next(iter(points))}
    frontier = list(visited)
    while frontier:
        row, col = frontier.pop()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            neighbor = (row + dr, col + dc)
            if neighbor in points and neighbor not in visited:
                visited.add(neighbor)
                frontier.append(neighbor)
    return len(points), perimeter, visited == points


class TileLabContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    rows: int = Field(ge=2, le=6)
    cols: int = Field(ge=2, le=6)
    target_area: int = Field(ge=1, le=36)
    target_perimeter: int = Field(ge=4, le=72)
    example_cells: list[TileCell] = Field(min_length=1, max_length=36)
    explanation: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_tiles(self):
        points = {(cell.row, cell.col) for cell in self.example_cells}
        if len(points) != len(self.example_cells):
            raise ValueError("Tile-lab example cells must be unique.")
        if any(cell.row >= self.rows or cell.col >= self.cols for cell in self.example_cells):
            raise ValueError("Tile-lab example cells must be inside the grid.")
        area, perimeter, connected = tile_shape_metrics(self.example_cells)
        if not connected:
            raise ValueError("The example tile shape must be connected by its sides.")
        if area != self.target_area or perimeter != self.target_perimeter:
            raise ValueError("The example tile shape must match the target area and perimeter.")
        return self


class TimelineEvent(BaseModel):
    id: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=80)
    label: str = Field(min_length=2, max_length=120)
    year: int = Field(ge=-10000, le=2100)
    date_label: str = Field(min_length=1, max_length=40)
    detail: str = Field(min_length=3, max_length=240)


class TimelineContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    era_label: str = Field(min_length=2, max_length=100)
    events: list[TimelineEvent] = Field(min_length=3, max_length=8)
    explanation: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_timeline(self):
        ids = [event.id for event in self.events]
        years = [event.year for event in self.events]
        if len(ids) != len(set(ids)):
            raise ValueError("Timeline event IDs must be unique.")
        if len(years) != len(set(years)):
            raise ValueError("Timeline event years must be unique.")
        return self


class FoodWebOrganism(BaseModel):
    id: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=80)
    label: str = Field(min_length=2, max_length=80)
    role: Literal["PRODUCER", "CONSUMER", "DECOMPOSER"]


class FoodWebLink(BaseModel):
    source: str = Field(min_length=1, max_length=80)
    target: str = Field(min_length=1, max_length=80)


class FoodWebLabContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    habitat: str = Field(min_length=2, max_length=100)
    organisms: list[FoodWebOrganism] = Field(min_length=3, max_length=7)
    links: list[FoodWebLink] = Field(min_length=2, max_length=12)
    explanation: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_food_web(self):
        organism_ids = [organism.id for organism in self.organisms]
        if len(organism_ids) != len(set(organism_ids)):
            raise ValueError("Food-web organism IDs must be unique.")
        ids = set(organism_ids)
        edges = {(link.source, link.target) for link in self.links}
        if len(edges) != len(self.links):
            raise ValueError("Food-web links must be unique.")
        if any(link.source not in ids or link.target not in ids for link in self.links):
            raise ValueError("Food-web links must reference declared organisms.")
        if any(link.source == link.target for link in self.links):
            raise ValueError("Food-web links cannot connect an organism to itself.")
        if any(organism_id not in {node for edge in edges for node in edge} for organism_id in ids):
            raise ValueError("Every food-web organism must participate in the network.")
        return self


class RhythmLabContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    beats: int = Field(ge=4, le=12)
    bpm: int = Field(ge=50, le=120)
    target_pattern: list[bool] = Field(min_length=4, max_length=12)
    visual_cue: str = Field(min_length=4, max_length=80)
    explanation: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_rhythm(self):
        if len(self.target_pattern) != self.beats:
            raise ValueError("The rhythm pattern length must match the beat count.")
        if not any(self.target_pattern) or all(self.target_pattern):
            raise ValueError("A rhythm must contain both sounds and rests.")
        return self


class SentenceToken(BaseModel):
    id: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=80)
    text: str = Field(min_length=1, max_length=40)
    role: Literal["SUBJECT", "PREDICATE", "CONNECTOR"]


class SentenceLabContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    tokens: list[SentenceToken] = Field(min_length=4, max_length=10)
    target_order: list[str] = Field(min_length=4, max_length=10)
    explanation: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_sentence(self):
        token_ids = [token.id for token in self.tokens]
        if len(token_ids) != len(set(token_ids)):
            raise ValueError("Sentence token IDs must be unique.")
        if len(self.target_order) != len(set(self.target_order)):
            raise ValueError("The sentence order cannot reuse a token.")
        if set(self.target_order) != set(token_ids):
            raise ValueError("The sentence order must use every declared token exactly once.")
        if not any(token.role == "SUBJECT" for token in self.tokens):
            raise ValueError("A sentence lab must include a subject token.")
        if not any(token.role == "PREDICATE" for token in self.tokens):
            raise ValueError("A sentence lab must include a predicate token.")
        return self


class OrbitBody(BaseModel):
    id: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=80)
    label: str = Field(min_length=1, max_length=60)
    distance_rank: int = Field(ge=1, le=8)
    color: str = Field(pattern=r"^#[0-9a-fA-F]{6}$")


class OrbitLabContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    center_label: str = Field(min_length=1, max_length=60)
    bodies: list[OrbitBody] = Field(min_length=4, max_length=8)
    explanation: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_orbits(self):
        ids = [body.id for body in self.bodies]
        ranks = [body.distance_rank for body in self.bodies]
        if len(ids) != len(set(ids)):
            raise ValueError("Orbit body IDs must be unique.")
        if sorted(ranks) != list(range(1, len(self.bodies) + 1)):
            raise ValueError("Orbit ranks must form a complete sequence starting at one.")
        return self


class MoleculeAtom(BaseModel):
    symbol: str = Field(pattern=r"^[A-Z][a-z]?$", max_length=2)
    label: str = Field(min_length=2, max_length=40)
    count: int = Field(ge=1, le=8)
    color: str = Field(pattern=r"^#[0-9a-fA-F]{6}$")


class MoleculeLabContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    molecule_name: str = Field(min_length=2, max_length=80)
    formula: str = Field(min_length=1, max_length=20)
    atoms: list[MoleculeAtom] = Field(min_length=2, max_length=4)
    explanation: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_molecule(self):
        symbols = [atom.symbol for atom in self.atoms]
        if len(symbols) != len(set(symbols)):
            raise ValueError("Molecule atom symbols must be unique.")
        if sum(atom.count for atom in self.atoms) > 12:
            raise ValueError("A molecule lab cannot require more than twelve atoms.")
        return self


class ForceLabContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    target_resultant: int = Field(ge=-20, le=20)
    forces: list[int] = Field(min_length=3, max_length=8)
    example_solution: list[int] = Field(min_length=1, max_length=8)
    explanation: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_forces(self):
        if 0 in self.forces:
            raise ValueError("Available forces cannot be zero.")
        if len(self.forces) != len(set(self.forces)):
            raise ValueError("Available forces must be unique.")
        if any(abs(force) > 20 for force in self.forces):
            raise ValueError("Available force magnitudes cannot exceed twenty newtons.")
        if len(self.example_solution) != len(set(self.example_solution)):
            raise ValueError("The force solution cannot reuse a force.")
        if any(force not in self.forces for force in self.example_solution):
            raise ValueError("The force solution must use available forces.")
        if sum(self.example_solution) != self.target_resultant:
            raise ValueError("The force solution must reach the target resultant.")
        return self


class RouteCell(BaseModel):
    row: int = Field(ge=0, le=5)
    col: int = Field(ge=0, le=5)


def simulate_route(start: RouteCell, moves: list[str], rows: int, cols: int, blocked: set[tuple[int, int]]) -> tuple[int, int] | None:
    row, col = start.row, start.col
    deltas = {"UP": (-1, 0), "DOWN": (1, 0), "LEFT": (0, -1), "RIGHT": (0, 1)}
    for move in moves:
        if move not in deltas:
            return None
        dr, dc = deltas[move]
        row, col = row + dr, col + dc
        if row < 0 or row >= rows or col < 0 or col >= cols or (row, col) in blocked:
            return None
    return row, col


class RouteLabContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    rows: int = Field(ge=3, le=6)
    cols: int = Field(ge=3, le=6)
    start: RouteCell
    target: RouteCell
    blocked: list[RouteCell] = Field(default_factory=list, max_length=16)
    max_moves: int = Field(ge=2, le=20)
    example_moves: list[Literal["UP", "DOWN", "LEFT", "RIGHT"]] = Field(min_length=2, max_length=20)
    explanation: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_route(self):
        cells = {(cell.row, cell.col) for cell in self.blocked}
        if len(cells) != len(self.blocked):
            raise ValueError("Blocked route cells must be unique.")
        if any(cell.row >= self.rows or cell.col >= self.cols for cell in [self.start, self.target, *self.blocked]):
            raise ValueError("Every route cell must be inside the grid.")
        if (self.start.row, self.start.col) == (self.target.row, self.target.col):
            raise ValueError("Route start and target must differ.")
        if (self.start.row, self.start.col) in cells or (self.target.row, self.target.col) in cells:
            raise ValueError("Route start and target cannot be blocked.")
        if len(self.example_moves) > self.max_moves:
            raise ValueError("The example route exceeds the move limit.")
        end = simulate_route(self.start, self.example_moves, self.rows, self.cols, cells)
        if end != (self.target.row, self.target.col):
            raise ValueError("The example route must reach the target without collisions.")
        return self


class ClimateLabContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    profile_label: str = Field(min_length=2, max_length=80)
    temperature_min: int = Field(ge=-20, le=40)
    temperature_max: int = Field(ge=-20, le=40)
    rainfall_min: int = Field(ge=0, le=2500)
    rainfall_max: int = Field(ge=0, le=2500)
    initial_temperature: int = Field(ge=-20, le=40)
    initial_rainfall: int = Field(ge=0, le=2500)
    example_temperature: int = Field(ge=-20, le=40)
    example_rainfall: int = Field(ge=0, le=2500)
    explanation: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_climate(self):
        if self.temperature_min > self.temperature_max or self.rainfall_min > self.rainfall_max:
            raise ValueError("Climate target ranges must be ordered.")
        if not self.temperature_min <= self.example_temperature <= self.temperature_max:
            raise ValueError("The climate example temperature must be inside the target range.")
        if not self.rainfall_min <= self.example_rainfall <= self.rainfall_max:
            raise ValueError("The climate example rainfall must be inside the target range.")
        initial_matches = (
            self.temperature_min <= self.initial_temperature <= self.temperature_max
            and self.rainfall_min <= self.initial_rainfall <= self.rainfall_max
        )
        if initial_matches:
            raise ValueError("The initial climate state must require an adjustment.")
        return self


class ProbabilityLabContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    target_numerator: int = Field(ge=1, le=11)
    target_denominator: int = Field(ge=2, le=12)
    max_balls: int = Field(ge=4, le=12)
    initial_blue: int = Field(ge=1, le=11)
    initial_gold: int = Field(ge=1, le=11)
    example_blue: int = Field(ge=1, le=11)
    example_gold: int = Field(ge=1, le=11)
    draws: int = Field(ge=10, le=40)
    seed: int = Field(ge=1, le=999999)
    explanation: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_probability(self):
        if self.target_numerator >= self.target_denominator:
            raise ValueError("The target probability must be strictly between zero and one.")
        if self.initial_blue + self.initial_gold > self.max_balls:
            raise ValueError("The initial probability machine exceeds its ball capacity.")
        if self.example_blue + self.example_gold > self.max_balls:
            raise ValueError("The probability example exceeds the machine capacity.")
        if self.example_blue * self.target_denominator != self.target_numerator * (self.example_blue + self.example_gold):
            raise ValueError("The probability example must match the target fraction.")
        if self.initial_blue * self.target_denominator == self.target_numerator * (self.initial_blue + self.initial_gold):
            raise ValueError("The initial probability state must require an adjustment.")
        return self


class ReflectionLabContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    target_normal_angle: int = Field(ge=-30, le=30)
    initial_normal_angle: int = Field(ge=-30, le=30)
    explanation: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_reflection(self):
        if self.initial_normal_angle == self.target_normal_angle:
            raise ValueError("The initial mirror normal must not already hit the target.")
        return self


class DiffusionLabContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    target_net_flow: Literal["INWARD", "OUTWARD", "EQUILIBRIUM"]
    initial_outside: int = Field(ge=1, le=10)
    initial_inside: int = Field(ge=1, le=10)
    example_outside: int = Field(ge=1, le=10)
    example_inside: int = Field(ge=1, le=10)
    explanation: str = Field(min_length=3, max_length=500)

    @staticmethod
    def net_flow(outside: int, inside: int) -> str:
        return "INWARD" if outside > inside else "OUTWARD" if inside > outside else "EQUILIBRIUM"

    @model_validator(mode="after")
    def validate_diffusion(self):
        if self.net_flow(self.example_outside, self.example_inside) != self.target_net_flow:
            raise ValueError("The diffusion example must create the target net flow.")
        if self.net_flow(self.initial_outside, self.initial_inside) == self.target_net_flow:
            raise ValueError("The initial diffusion state must require an adjustment.")
        return self


class StratumArtifact(BaseModel):
    id: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=80)
    label: str = Field(min_length=2, max_length=80)
    depth_rank: int = Field(ge=1, le=6)
    shape: Literal["STONE", "POTTERY", "METAL", "GLASS", "BONE", "WOOD"]


class StratigraphyLabContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    site_label: str = Field(min_length=2, max_length=100)
    artifacts: list[StratumArtifact] = Field(min_length=4, max_length=6)
    explanation: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_stratigraphy(self):
        ids = [artifact.id for artifact in self.artifacts]
        ranks = [artifact.depth_rank for artifact in self.artifacts]
        if len(ids) != len(set(ids)):
            raise ValueError("Stratigraphy artifact IDs must be unique.")
        if sorted(ranks) != list(range(1, len(self.artifacts) + 1)):
            raise ValueError("Stratigraphy depth ranks must form a complete sequence from one.")
        return self


class DensityLabContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    target_state: Literal["FLOAT", "SINK", "SUSPEND"]
    liquid_density: Literal[1.0]
    initial_mass: int = Field(ge=1, le=20)
    initial_volume: int = Field(ge=1, le=20)
    example_mass: int = Field(ge=1, le=20)
    example_volume: int = Field(ge=1, le=20)
    explanation: str = Field(min_length=3, max_length=500)

    @staticmethod
    def state(mass: int, volume: int) -> str:
        return "FLOAT" if mass < volume else "SINK" if mass > volume else "SUSPEND"

    @model_validator(mode="after")
    def validate_density(self):
        if self.state(self.example_mass, self.example_volume) != self.target_state:
            raise ValueError("The density example must create the target state.")
        if self.state(self.initial_mass, self.initial_volume) == self.target_state:
            raise ValueError("The initial density state must require an adjustment.")
        return self


class TectonicLabContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    target_motion: Literal["DIVERGENT", "CONVERGENT", "TRANSFORM"]
    target_feature: Literal["RIDGE", "MOUNTAIN_RANGE", "FAULT"]
    initial_motion: Literal["DIVERGENT", "CONVERGENT", "TRANSFORM"]
    explanation: str = Field(min_length=3, max_length=500)

    @staticmethod
    def feature(motion: str) -> str:
        return {
            "DIVERGENT": "RIDGE",
            "CONVERGENT": "MOUNTAIN_RANGE",
            "TRANSFORM": "FAULT",
        }[motion]

    @model_validator(mode="after")
    def validate_tectonics(self):
        if self.feature(self.target_motion) != self.target_feature:
            raise ValueError("The tectonic target motion must create the target feature.")
        if self.initial_motion == self.target_motion:
            raise ValueError("The initial tectonic motion must require a change.")
        return self


class LunarPhaseLabContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    target_phase: Literal["NEW", "FIRST_QUARTER", "FULL", "LAST_QUARTER"]
    initial_phase: Literal["NEW", "FIRST_QUARTER", "FULL", "LAST_QUARTER"]
    explanation: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_lunar_phase(self):
        if self.initial_phase == self.target_phase:
            raise ValueError("The initial lunar phase must require a change.")
        return self


class ModuleActivity(BaseModel):
    id: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=100)
    type: Literal[
        "EXPLANATION",
        "CLOSED_QUESTION",
        "OPEN_QUESTION",
        "CLASSIFICATION",
        "BALANCE_LAB",
        "TILE_LAB",
        "FOOD_WEB_LAB",
        "RHYTHM_LAB",
        "SENTENCE_LAB",
        "ORBIT_LAB",
        "MOLECULE_LAB",
        "FORCE_LAB",
        "ROUTE_LAB",
        "CLIMATE_LAB",
        "PROBABILITY_LAB",
        "REFLECTION_LAB",
        "DIFFUSION_LAB",
        "STRATIGRAPHY_LAB",
        "DENSITY_LAB",
        "TECTONIC_LAB",
        "LUNAR_PHASE_LAB",
        "TIMELINE",
        "MAP",
        "SIMULATION",
        "GUIDED_EXPERIMENT",
        "READING",
        "WRITING",
        "ASSESSMENT",
    ]
    title: str = Field(min_length=3, max_length=140)
    instructions: str = Field(min_length=3, max_length=1000)
    content: dict = Field(default_factory=dict)
    evidence: dict = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_interactive_content(self):
        if self.type == "CLOSED_QUESTION":
            ClosedQuestionContent.model_validate(self.content)
        elif self.type == "CLASSIFICATION":
            ClassificationContent.model_validate(self.content)
        elif self.type == "BALANCE_LAB":
            BalanceLabContent.model_validate(self.content)
        elif self.type == "TILE_LAB":
            TileLabContent.model_validate(self.content)
        elif self.type == "TIMELINE":
            TimelineContent.model_validate(self.content)
        elif self.type == "FOOD_WEB_LAB":
            FoodWebLabContent.model_validate(self.content)
        elif self.type == "RHYTHM_LAB":
            RhythmLabContent.model_validate(self.content)
        elif self.type == "SENTENCE_LAB":
            SentenceLabContent.model_validate(self.content)
        elif self.type == "ORBIT_LAB":
            OrbitLabContent.model_validate(self.content)
        elif self.type == "MOLECULE_LAB":
            MoleculeLabContent.model_validate(self.content)
        elif self.type == "FORCE_LAB":
            ForceLabContent.model_validate(self.content)
        elif self.type == "ROUTE_LAB":
            RouteLabContent.model_validate(self.content)
        elif self.type == "CLIMATE_LAB":
            ClimateLabContent.model_validate(self.content)
        elif self.type == "PROBABILITY_LAB":
            ProbabilityLabContent.model_validate(self.content)
        elif self.type == "REFLECTION_LAB":
            ReflectionLabContent.model_validate(self.content)
        elif self.type == "DIFFUSION_LAB":
            DiffusionLabContent.model_validate(self.content)
        elif self.type == "STRATIGRAPHY_LAB":
            StratigraphyLabContent.model_validate(self.content)
        elif self.type == "DENSITY_LAB":
            DensityLabContent.model_validate(self.content)
        elif self.type == "TECTONIC_LAB":
            TectonicLabContent.model_validate(self.content)
        elif self.type == "LUNAR_PHASE_LAB":
            LunarPhaseLabContent.model_validate(self.content)
        return self
