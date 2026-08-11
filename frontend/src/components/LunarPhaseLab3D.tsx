import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

export type LunarPhase = "NEW" | "FIRST_QUARTER" | "FULL" | "LAST_QUARTER";

const positions: Record<LunarPhase, [number, number, number]> = {
  NEW: [2.45, 0, 0],
  FIRST_QUARTER: [0, 0, -2.45],
  FULL: [-2.45, 0, 0],
  LAST_QUARTER: [0, 0, 2.45],
};

function LunarSystem({ phase }: { phase: LunarPhase }) {
  const moon = useRef<Group>(null);
  const target = positions[phase];
  useFrame((frame) => {
    if (!moon.current) return;
    moon.current.position.x += (target[0] - moon.current.position.x) * 0.055;
    moon.current.position.z += (target[2] - moon.current.position.z) * 0.055;
    moon.current.rotation.y = frame.clock.elapsedTime * 0.16;
  });
  return <>
    <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.42, 2.47, 96]} /><meshBasicMaterial color="#8a9aa8" transparent opacity={0.65} /></mesh>
    <mesh position={[0, 0, 0]}><sphereGeometry args={[0.72, 36, 24]} /><meshStandardMaterial color="#2f82b7" roughness={0.78} /></mesh>
    <mesh position={[0.25, 0.35, 0.54]} rotation={[0.3, 0.2, 0]}><sphereGeometry args={[0.16, 16, 10]} /><meshStandardMaterial color="#6dac66" /></mesh>
    <group ref={moon} position={positions.NEW}>
      <mesh><sphereGeometry args={[0.34, 32, 20]} /><meshStandardMaterial color="#d8d5ca" roughness={0.92} /></mesh>
      <mesh position={[0.1, 0.13, 0.29]}><sphereGeometry args={[0.055, 12, 8]} /><meshStandardMaterial color="#9e9b92" /></mesh>
    </group>
    <group position={[5.25, 0.2, 0]}>
      <mesh><sphereGeometry args={[0.82, 32, 20]} /><meshBasicMaterial color="#f5b62c" /></mesh>
      <pointLight color="#fff1b8" intensity={90} distance={14} decay={1.35} />
    </group>
    <directionalLight position={[7, 2, 0]} intensity={4.8} color="#fff6d1" />
  </>;
}

const phaseLabels: Record<LunarPhase, string> = { NEW: "Luna nueva", FIRST_QUARTER: "Cuarto creciente", FULL: "Luna llena", LAST_QUARTER: "Cuarto menguante" };

export function LunarPhaseLab3D({ phase }: { phase: LunarPhase }) {
  return <div className="lunarPhaseScene" role="img" aria-label={`Modelo orbital visto desde arriba. El Sol está a la derecha, la Tierra en el centro y la Luna está en posición de ${phaseLabels[phase].toLowerCase()}.`}>
    <Canvas camera={{ position: [0, 6.9, 6.6], fov: 40 }} dpr={[1, 2]}><color attach="background" args={["#10182b"]} /><ambientLight intensity={0.16} /><LunarSystem phase={phase} /></Canvas>
  </div>;
}
