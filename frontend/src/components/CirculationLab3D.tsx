import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

type Station = "RIGHT_HEART" | "LUNGS" | "LEFT_HEART" | "BODY";
const positions: Record<Station, [number, number, number]> = { RIGHT_HEART: [-1.1, 0.8, 0], LUNGS: [0, 2.65, 0], LEFT_HEART: [1.1, 0.8, 0], BODY: [0, -1.45, 0] };

function Traveller({ station, rich }: { station: Station; rich: boolean }) {
  const cell = useRef<Mesh>(null);
  useFrame((frame) => { if (cell.current) cell.current.position.y = positions[station][1] + 0.45 + Math.sin(frame.clock.elapsedTime * 3) * 0.08; });
  return <mesh ref={cell} position={[positions[station][0], positions[station][1] + 0.45, 0.8]}><sphereGeometry args={[0.3, 22, 16]} /><meshStandardMaterial color={rich ? "#e64444" : "#7d66aa"} emissive={rich ? "#7c1111" : "#302451"} emissiveIntensity={0.4} /></mesh>;
}

export function CirculationLab3D({ station, oxygenRich }: { station: Station | null; oxygenRich: boolean }) {
  const label = station ? ({ RIGHT_HEART: "corazón derecho", LUNGS: "pulmones", LEFT_HEART: "corazón izquierdo", BODY: "cuerpo" } as const)[station] : "salida pendiente";
  return <div className="circulationScene" role="img" aria-label={`Modelo de doble circulación. Viajera en ${label}; sangre ${oxygenRich ? "rica" : "pobre"} en oxígeno.`}><Canvas camera={{ position: [0, 1, 8], fov: 42 }} dpr={[1, 2]}><color attach="background" args={["#e8f2f1"]} /><ambientLight intensity={1.2} /><directionalLight position={[-4, 7, 5]} intensity={2} /><mesh position={positions.LUNGS}><sphereGeometry args={[0.72, 24, 18]} /><meshStandardMaterial color="#78b7b2" /></mesh><mesh position={positions.BODY}><capsuleGeometry args={[0.58, 1.15, 8, 16]} /><meshStandardMaterial color="#e5b36a" /></mesh><mesh position={positions.RIGHT_HEART} rotation={[0, 0, -0.35]}><sphereGeometry args={[0.68, 24, 18]} /><meshStandardMaterial color="#856aa8" /></mesh><mesh position={positions.LEFT_HEART} rotation={[0, 0, 0.35]}><sphereGeometry args={[0.68, 24, 18]} /><meshStandardMaterial color="#d94e50" /></mesh>{[[0, 1.85, 0], [0, -0.3, 0]].map((position, index) => <mesh key={index} position={position as [number, number, number]}><torusGeometry args={[1.25 + index * 0.35, 0.08, 10, 40]} /><meshStandardMaterial color="#566f78" /></mesh>)}{station && <Traveller station={station} rich={oxygenRich} />}</Canvas></div>;
}
