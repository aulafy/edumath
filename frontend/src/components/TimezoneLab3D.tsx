import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

function Globe({ offset }: { offset: number }) {
  const marker = useRef<Group>(null);
  const targetAngle = -offset * Math.PI / 12;
  useFrame(() => { if (marker.current) marker.current.rotation.y += (targetAngle - marker.current.rotation.y) * 0.1; });
  return <group rotation={[0.18, 0, -0.18]}><mesh><sphereGeometry args={[2.25, 48, 32]} /><meshStandardMaterial color="#3d8ea1" roughness={0.78} /></mesh>{[-1.2, -0.6, 0, 0.6, 1.2].map((y) => <mesh key={y} rotation={[Math.PI / 2, 0, 0]} position={[0, y, 0]}><torusGeometry args={[Math.sqrt(Math.max(0.2, 2.25 ** 2 - y ** 2)), 0.018, 6, 64]} /><meshBasicMaterial color="#d8eef0" /></mesh>)}<group ref={marker}><mesh position={[0, 0.15, 2.38]}><sphereGeometry args={[0.22, 18, 14]} /><meshStandardMaterial color="#f3bf46" emissive="#8b5c00" emissiveIntensity={0.5} /></mesh></group></group>;
}

export function TimezoneLab3D({ offset }: { offset: number }) {
  const signed = offset > 0 ? `+${offset}` : String(offset);
  return <div className="timezoneScene" role="img" aria-label={`Globo de husos horarios. Marcador conceptual en UTC ${signed}.`}><Canvas camera={{ position: [0, 0.4, 7.5], fov: 42 }} dpr={[1, 2]}><color attach="background" args={["#152638"]} /><ambientLight intensity={0.24} /><directionalLight position={[-5, 3, 5]} intensity={3.2} /><Globe offset={offset} /></Canvas></div>;
}
