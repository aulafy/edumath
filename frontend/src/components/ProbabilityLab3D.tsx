import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";

type Draw = "BLUE" | "GOLD";

function Machine({ blueCount, goldCount, results }: { blueCount: number; goldCount: number; results: Draw[] }) {
  const drum = useRef<Group>(null);
  useFrame((state) => {
    if (drum.current) drum.current.rotation.y = state.clock.elapsedTime * (results.length ? 0.22 : 0.08);
  });
  const balls = useMemo(() => [
    ...Array.from({ length: blueCount }, (_, index) => ({ color: "#2777b8", index })),
    ...Array.from({ length: goldCount }, (_, index) => ({ color: "#e0ad32", index: index + blueCount })),
  ], [blueCount, goldCount]);
  const recent = results.slice(-12);
  return <>
    <mesh position={[0, -1.25, 0]}><cylinderGeometry args={[2.45, 2.65, 0.25, 32]} /><meshStandardMaterial color="#315e52" /></mesh>
    <group ref={drum} position={[0, 0.35, 0]}>
      <mesh><sphereGeometry args={[1.75, 40, 28]} /><meshPhysicalMaterial color="#dbeae8" transparent opacity={0.22} roughness={0.05} transmission={0.6} thickness={0.18} /></mesh>
      {balls.map((ball) => {
        const angle = ball.index * 2.4; const radius = 0.45 + (ball.index % 3) * 0.34;
        return <mesh key={`${ball.color}-${ball.index}`} position={[Math.cos(angle) * radius, -0.65 + (ball.index % 4) * 0.42, Math.sin(angle) * radius]}><sphereGeometry args={[0.22, 20, 16]} /><meshStandardMaterial color={ball.color} roughness={0.3} /></mesh>;
      })}
    </group>
    <mesh position={[0, -0.95, 1.45]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.25, 0.38, 1.15, 20]} /><meshStandardMaterial color="#688e83" /></mesh>
    {recent.map((result, index) => <mesh key={`${index}-${result}`} position={[-2.25 + index * 0.41, -1.02, 2.15]}><sphereGeometry args={[0.16, 16, 12]} /><meshStandardMaterial color={result === "BLUE" ? "#2777b8" : "#e0ad32"} /></mesh>)}
  </>;
}

export function ProbabilityLab3D({ blueCount, goldCount, results }: { blueCount: number; goldCount: number; results: Draw[] }) {
  const blueResults = results.filter((result) => result === "BLUE").length;
  return <div className="probabilityLabScene" role="img" aria-label={`Máquina con ${blueCount} bolas azules, ${goldCount} doradas y ${blueResults} resultados azules de ${results.length} extracciones`}>
    <Canvas camera={{ position: [0, 2.2, 7], fov: 42 }} dpr={[1, 2]}><color attach="background" args={["#e8f1ed"]} /><ambientLight intensity={1.8} /><directionalLight position={[4, 7, 5]} intensity={3.2} /><Machine blueCount={blueCount} goldCount={goldCount} results={results} /></Canvas>
  </div>;
}
