import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

function SoluteParticle({ side, index, reducedMotion }: { side: "OUTSIDE" | "INSIDE"; index: number; reducedMotion: boolean }) {
  const mesh = useRef<Mesh>(null);
  const direction = side === "OUTSIDE" ? -1 : 1;
  const baseX = direction * (0.6 + (index % 3) * 0.62);
  const phase = index * 1.73 + (side === "INSIDE" ? 0.8 : 0);
  const traveler = index === 0;
  useFrame((state) => {
    if (!mesh.current) return;
    const speed = reducedMotion ? 0.18 : 0.55;
    mesh.current.position.x = baseX + Math.sin(state.clock.elapsedTime * speed + phase) * (traveler ? 1.05 : 0.22);
    mesh.current.position.z = z + Math.sin(state.clock.elapsedTime * speed * 0.7 + phase) * 0.1;
  });
  const z = -1.45 + (index % 4) * 0.95; const y = 0.38 + Math.floor(index / 4) * 0.58;
  return <mesh ref={mesh} position={[baseX, y, z]}><icosahedronGeometry args={[0.18, 1]} /><meshStandardMaterial color="#704fa3" roughness={0.35} /></mesh>;
}

function DiffusionWorld({ outside, inside, reducedMotion }: { outside: number; inside: number; reducedMotion: boolean }) {
  return <>
    <mesh position={[0, -0.05, 0]}><boxGeometry args={[6.8, 0.14, 4.4]} /><meshStandardMaterial color="#dce9e3" /></mesh>
    <mesh position={[-1.7, 0.07, 0]}><boxGeometry args={[3.2, 0.08, 4]} /><meshStandardMaterial color="#d7e9f0" transparent opacity={0.72} /></mesh>
    <mesh position={[1.7, 0.07, 0]}><boxGeometry args={[3.2, 0.08, 4]} /><meshStandardMaterial color="#e9e1d5" transparent opacity={0.75} /></mesh>
    {Array.from({ length: 9 }, (_, index) => <group key={index} position={[0, 0.42 + (index % 3) * 0.55, -1.55 + Math.floor(index / 3) * 1.55]}><mesh><sphereGeometry args={[0.16, 16, 12]} /><meshStandardMaterial color="#e4b947" /></mesh><mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.055, 0.055, 0.32, 10]} /><meshStandardMaterial color="#3f7f72" /></mesh></group>)}
    {Array.from({ length: outside }, (_, index) => <SoluteParticle key={`outside-${index}`} side="OUTSIDE" index={index} reducedMotion={reducedMotion} />)}
    {Array.from({ length: inside }, (_, index) => <SoluteParticle key={`inside-${index}`} side="INSIDE" index={index} reducedMotion={reducedMotion} />)}
  </>;
}

export function DiffusionLab3D({ outside, inside }: { outside: number; inside: number }) {
  const direction = outside > inside ? "hacia dentro" : inside > outside ? "hacia fuera" : "equilibrio dinámico";
  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return <div className="diffusionLabScene" role="img" aria-label={`Membrana permeable con ${outside} partículas fuera y ${inside} dentro. Flujo neto ${direction}. Las partículas se mueven en ambos sentidos.`}>
    <Canvas camera={{ position: [0, 4.8, 6.4], fov: 44 }} dpr={[1, 2]}><color attach="background" args={["#edf4f1"]} /><ambientLight intensity={1.8} /><directionalLight position={[4, 7, 5]} intensity={3.1} /><DiffusionWorld outside={outside} inside={inside} reducedMotion={reducedMotion} /></Canvas>
  </div>;
}
