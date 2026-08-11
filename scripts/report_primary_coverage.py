import json

from generate_primary_curriculum import ROOT, targets

OUTPUT_DIR = ROOT / "content" / "generated" / "primary"
REPORT = ROOT / "docs" / "PRIMARY_CURRICULUM_COVERAGE.md"


def main() -> None:
    expected = targets()
    generated = {
        path.stem: json.loads(path.read_text()) for path in sorted(OUTPUT_DIR.glob("*.json"))
    }
    lines = [
        "# Primary Curriculum Coverage",
        "",
        "This report is generated from `curriculum/primary_scope.v1.json`. Coverage means that a technically valid AI draft exists for an area, knowledge strand, and cycle. It does not mean that a qualified educator has approved the content.",
        "",
        f"- Expected modules: **{len(expected)}**",
        f"- Generated AI drafts: **{len(generated)}**",
        f"- Remaining: **{len(expected) - len(generated)}**",
        f"- Technical coverage: **{len(generated) / len(expected):.1%}**",
        "",
        "| Area | Cycle | Knowledge strand | Status |",
        "|---|---:|---|---|",
    ]
    for target in expected:
        status = "AI draft" if target["slug"] in generated else "Missing"
        lines.append(
            f"| {target['area_title']} | {target['cycle']} | {target['strand']} | {status} |"
        )
    lines.extend(
        [
            "",
            "Source: [Real Decreto 157/2022](https://www.boe.es/buscar/act.php?id=BOE-A-2022-3296). Autonomous-community curriculum extensions are not yet included in this state-level coverage report.",
            "",
        ]
    )
    REPORT.write_text("\n".join(lines))
    print(f"Wrote {REPORT.relative_to(ROOT)} with {len(generated)}/{len(expected)} drafts")


if __name__ == "__main__":
    main()
