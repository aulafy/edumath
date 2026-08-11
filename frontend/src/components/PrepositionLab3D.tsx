import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

type Relation = "ABOVE_A" | "LEFT_OF_A" | "BETWEEN_A_B" | "RIGHT_OF_B" | "BELOW_A";
const positions: Record<Relation, [number, number, number]> = { ABOVE_A: [-1.8, 2.3, 0], LEFT_OF_A: [-3.35, 0.8, 0], BETWEEN_A_B: [0, 0.8, 0], RIGHT_OF_B: [3.35, 0.8, 0], BELOW_A: [-1.8, 0.18, 0] };

function Drone({ relation }: { relation: Relation }) {
  const drone = useRef<Group>(null); const target = positions[relation];
  useFrame((frame) => { if (!drone.current) return; drone.current.position.x += (target[0] - drone.current.position.x) * 0.1; drone.current.position.y += (target[1] + Math.sin(frame.clock.elapsedTime * 3) * 0.06 - drone.current.position.y) * 0.1; });
  return <group ref={drone} position={target}><mesh><sphereGeometry args={[0.38, 20, 14]} /><meshStandardMaterial color="#efb63f" /></mesh>{[-0.65, 0.65].map((x) => <group key={x} position={[x, 0, 0]}><mesh><boxGeometry args={[0.75, 0.08, 0.12]} /><meshStandardMaterial color="#324c57" /></mesh><mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.3, 0.3, 0.04, 16]} /><meshStandardMaterial color="#526d76" /></mesh></group>)}</group>;
}

export function PrepositionLab3D({ relation }: { relation: Relation }) {
  return <div className="prepositionScene" role="img" aria-label={`Dron en la relación espacial ${relation}. Caja A a la izquierda y caja B a la derecha.`}><Canvas camera={{ position: [0, 2.2, 8], fov: 42 }} dpr={[1, 2]}><color attach="background" args={["#dceff0"]} /><ambientLight intensity={1.2} /><directionalLight position={[-4, 7, 5]} intensity={2} /><mesh position={[-1.8, 0.55, 0]}><boxGeometry args={[1.3, 1.1, 1.3]} /><meshStandardMaterial color="#dd6a58" /></mesh><mesh position={[1.8, 0.55, 0]}><boxGeometry args={[1.3, 1.1, 1.3]} /><meshStandardMaterial color="#4b8ea0" /></mesh><mesh position={[0, -0.08, 0]}><boxGeometry args={[8, 0.16, 4]} /><meshStandardMaterial color="#75958a" /></mesh><Drone relation={relation} /></Canvas></div>;
}
