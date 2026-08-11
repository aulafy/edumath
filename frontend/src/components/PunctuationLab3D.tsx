import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

const heights: Record<string, number> = { NONE: 0.15, COMMA: 0.7, COLON: 1.1, PERIOD: 1.5 };

function Baton() {
  const baton = useRef<Group>(null);
  useFrame((frame) => { if (baton.current) baton.current.rotation.z = -0.35 + Math.sin(frame.clock.elapsedTime * 1.8) * 0.18; });
  return <group ref={baton} position={[0, 2.2, 0]}><mesh position={[0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.045, 0.045, 1.7, 10]} /><meshStandardMaterial color="#f6efe0" /></mesh></group>;
}

export function PunctuationLab3D({ marks }: { marks: string[] }) {
  const spoken = marks.map((mark) => ({ NONE: "sin pausa", COMMA: "pausa breve", COLON: "pausa de anuncio", PERIOD: "cierre" } as Record<string, string>)[mark]).join(", ");
  return <div className="punctuationScene" role="img" aria-label={`Escenario de prosodia: ${spoken}.`}><Canvas camera={{ position: [0, 3.8, 8], fov: 42 }} dpr={[1, 2]}><color attach="background" args={["#24364a"]} /><ambientLight intensity={0.9} /><directionalLight position={[-4, 7, 5]} intensity={2} /><mesh position={[0, -0.15, 0]}><boxGeometry args={[9, 0.25, 4]} /><meshStandardMaterial color="#a56e4a" /></mesh>{marks.map((mark, index) => <group key={index} position={[-3 + index * (6 / Math.max(1, marks.length - 1)), 0, 0]}><mesh position={[0, 0.5, 0]}><boxGeometry args={[1.15, 0.9, 1]} /><meshStandardMaterial color="#f0c45b" /></mesh><mesh position={[0.72, heights[mark] / 2, 0]}><boxGeometry args={[0.12, heights[mark], 0.18]} /><meshStandardMaterial color="#e95f56" /></mesh></group>)}<Baton /></Canvas></div>;
}
