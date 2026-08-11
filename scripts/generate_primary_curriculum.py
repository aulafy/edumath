import argparse
import json
import re
import subprocess
from pathlib import Path
from urllib.request import Request, urlopen

from app.modules.schemas import ModuleActivity

ROOT = Path(__file__).resolve().parents[1]
SCOPE_PATH = ROOT / "curriculum" / "primary_scope.v1.json"
OUTPUT_DIR = ROOT / "content" / "generated" / "primary"
LM_STUDIO_URL = "http://127.0.0.1:1234/v1/responses"
MODEL = "qwen/qwen3.5-9b"


def slug(value: str) -> str:
    normalized = value.lower().translate(str.maketrans("áéíóúüñ", "aeiouun"))
    return re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")


def targets() -> list[dict]:
    scope = json.loads(SCOPE_PATH.read_text())
    cycles = {item["cycle"]: item["grades"] for item in scope["cycles"]}
    result = []
    for area in scope["areas"]:
        for cycle in area.get("cycles", cycles):
            for strand in area["strands"]:
                result.append(
                    {
                        "subject": area["subject"],
                        "area_title": area["title"],
                        "cycle": cycle,
                        "grades": cycles[cycle],
                        "strand": strand,
                        "slug": f"{slug(area['subject'])}-c{cycle}-{slug(strand)}",
                    }
                )
    return result


def prompt(target: dict) -> str:
    safety = (
        "For Physical Education, use knowledge checks and safe decision scenarios only. "
        "Do not prescribe intense exercise, medical advice, body-weight goals, unsupervised stunts, "
        "or activities requiring equipment."
        if target["subject"] == "PHYSICAL_EDUCATION"
        else ""
    )
    return f"""Return ONLY one compact valid JSON object, no markdown.
Draft a Spanish Primary curriculum learning module aligned with Real Decreto 157/2022.
Area: {target["area_title"]}. Subject code (use exactly): {target["subject"]}.
Cycle: {target["cycle"]}. Grades (use exactly): {target["grades"]}. Knowledge strand: {target["strand"]}.
Required fields: id, title, summary, stage="PRIMARY", grades, subject, competencies, assessment_criteria, basic_knowledge, activities.
Use id "org.edumath.primary.{target["slug"]}". Write concise Spanish suitable for the youngest grade in the cycle.
Create exactly 3 activities. Use CLOSED_QUESTION or CLASSIFICATION only.
CLOSED_QUESTION content: prompt, options (exactly 3 unique strings), correct_option (exact option), explanation.
CLASSIFICATION content: prompt, categories (2 or 3 unique strings), items (exactly 4 objects with label and declared category), explanation.
Each activity fields: id (lowercase kebab-case), type, title, instructions, content, evidence={{}}.
Avoid personal data, unsafe physical instructions, stereotypes, trick questions, and ambiguous distractors.
{safety}
Do not invent legal criterion numbers. Use plain-language curriculum descriptions."""


def extract_json(text: str) -> dict:
    start = text.find("{")
    if start < 0:
        raise ValueError("Provider returned no JSON object.")
    value, _ = json.JSONDecoder().raw_decode(text[start:])
    return value


def generate_lm_studio(text: str) -> dict:
    body = json.dumps(
        {
            "model": MODEL,
            "instructions": "Return only valid JSON. Follow the requested schema exactly.",
            "input": text,
            "temperature": 0.2,
            "max_output_tokens": 2200,
            "reasoning": {"effort": "none"},
        }
    ).encode()
    request = Request(LM_STUDIO_URL, data=body, headers={"Content-Type": "application/json"})
    with urlopen(request, timeout=150) as response:
        payload = json.load(response)
    output = next(
        part["text"]
        for item in payload["output"]
        if item.get("type") == "message"
        for part in item.get("content", [])
        if part.get("type") == "output_text"
    )
    return extract_json(output)


def generate_grok(text: str) -> dict:
    completed = subprocess.run(
        [
            "grok",
            "--single",
            text,
            "--output-format",
            "plain",
            "--max-turns",
            "1",
            "--disable-web-search",
            "--no-subagents",
            "--no-memory",
            "--permission-mode",
            "dontAsk",
        ],
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=150,
        check=True,
    )
    return extract_json(completed.stdout)


def validate(module: dict, target: dict) -> dict:
    required = {
        "id",
        "title",
        "summary",
        "stage",
        "grades",
        "subject",
        "competencies",
        "assessment_criteria",
        "basic_knowledge",
        "activities",
    }
    if not required <= module.keys():
        raise ValueError(f"Missing fields: {sorted(required - module.keys())}")
    if module["stage"] != "PRIMARY" or module["grades"] != target["grades"]:
        raise ValueError("Provider changed the requested stage or grades.")
    if module["subject"] != target["subject"]:
        raise ValueError("Provider changed the requested subject code.")
    if module["id"] != f"org.edumath.primary.{target['slug']}":
        raise ValueError("Provider changed the requested module ID.")
    if len(module["activities"]) != 3:
        raise ValueError("A generated module must contain exactly three activities.")
    module["activities"] = [
        ModuleActivity.model_validate(activity).model_dump() for activity in module["activities"]
    ]
    module["version"] = "0.1.0"
    module["review_status"] = "AI_DRAFT"
    module["curriculum_strand"] = target["strand"]
    return module


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=4)
    parser.add_argument(
        "--provider", choices=["alternating", "lmstudio", "grok"], default="alternating"
    )
    args = parser.parse_args()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    pending = [item for item in targets() if not (OUTPUT_DIR / f"{item['slug']}.json").exists()]
    completed = 0
    for index, target in enumerate(pending):
        if completed >= args.limit:
            break
        provider = args.provider
        if provider == "alternating":
            provider = "lmstudio" if index % 2 == 0 else "grok"
        try:
            draft = (
                generate_lm_studio(prompt(target))
                if provider == "lmstudio"
                else generate_grok(prompt(target))
            )
            module = validate(draft, target)
            module["generation_provider"] = (
                "LM_STUDIO_QWEN" if provider == "lmstudio" else "GROK_CLI"
            )
        except (
            ValueError,
            KeyError,
            StopIteration,
            TimeoutError,
            OSError,
            subprocess.SubprocessError,
        ) as exc:
            print(f"FAILED {target['slug']} via {provider}: {exc}")
            continue
        path = OUTPUT_DIR / f"{target['slug']}.json"
        path.write_text(json.dumps(module, ensure_ascii=False, indent=2) + "\n")
        completed += 1
        print(f"GENERATED {target['slug']} via {provider}")
    print(f"Generated {completed}; remaining {len(pending) - completed} of {len(targets())}")


if __name__ == "__main__":
    main()
