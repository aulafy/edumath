import type { VisualSpec } from "../types/contracts";
import { NumberLine } from "../manipulatives/NumberLine";
import { PartPartWhole } from "../manipulatives/PartPartWhole";
import { TenFrame } from "../manipulatives/TenFrame";

export function VisualRenderer({ visual }: { visual: VisualSpec }) {
  if (visual.type === "TEN_FRAME") return <TenFrame filled={visual.filled} added={visual.added} />;
  if (visual.type === "NUMBER_LINE") return <NumberLine start={visual.start} jumps={visual.jumps} maximum={visual.maximum} />;
  return <PartPartWhole partA={visual.part_a} partB={visual.part_b} />;
}
