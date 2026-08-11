import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";

function Nucleus({ protons, neutrons }: { protons: number; neutrons: number }) {
  const group = useRef<Group>(null);
  const particles = useMemo(() => Array.from({ length: protons + neutrons }, (_, index) => {
    const radius = 0.18 * Math.cbrt(index + 1);
    const angle = index * 2.39996;
    return { proton: index < protons, position: [Math.cos(angle) * radius, Math.sin(angle * 1.7) * radius * 0.75, Math.sin(angle) * radius] as [number, number, number] };
  }), [protons, neutrons]);
  useFrame((frame) => { if (group.current) group.current.rotation.y = frame.clock.elapsedTime * 0.16; });
  return <group ref={group}>{particles.map((particle, index) => <mesh key={index} position={particle.position}><sphereGeometry args={[0.19, 14, 10]} /><meshStandardMaterial color={particle.proton ? "#d85d55" : "#7d8588"} roughness={0.52} /></mesh>)}</group>;
}

function ElectronShell({ radius, count, index }: { radius: number; count: number; index: number }) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => { if (group.current) group.current.rotation.z += delta * (0.28 + index * 0.12) * (index % 2 ? -1 : 1); });
  return <group rotation={[index * 0.42, index * 0.58, 0]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius, 0.015, 8, 64]} /><meshStandardMaterial color="#71899a" transparent opacity={0.55} /></mesh>
    <group ref={group}>{Array.from({ length: count }, (_, electron) => { const angle = electron / count * Math.PI * 2; return <mesh key={electron} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}><sphereGeometry args={[0.11, 14, 10]} /><meshStandardMaterial color="#3f89bd" emissive="#24597d" emissiveIntensity={0.35} /></mesh>; })}</group>
  </group>;
}

export function AtomBuilderLab3D({ protons, neutrons, electrons }: { protons: number; neutrons: number; electrons: number }) {
  const shellCounts = [Math.min(2, electrons), Math.min(8, Math.max(0, electrons - 2)), Math.min(8, Math.max(0, electrons - 10))];
  return <div className="atomBuilderScene" role="img" aria-label={`Modelo atómico conceptual con ${protons} protones, ${neutrons} neutrones y ${electrons} electrones distribuidos en capas.`}>
    <Canvas camera={{ position: [0, 2.3, 7.2], fov: 40 }} dpr={[1, 2]}><color attach="background" args={["#eef2f6"]} /><ambientLight intensity={1.7} /><directionalLight position={[4, 7, 5]} intensity={3.2} /><Nucleus protons={protons} neutrons={neutrons} />{shellCounts.map((count, index) => count > 0 && <ElectronShell key={index} radius={1.25 + index * 0.72} count={count} index={index} />)}</Canvas>
  </div>;
}
