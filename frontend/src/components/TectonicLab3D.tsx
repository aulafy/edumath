import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";

export type PlateMotion = "DIVERGENT" | "CONVERGENT" | "TRANSFORM";

function Plate({ side, motion }: { side: -1 | 1; motion: PlateMotion }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const targetX = motion === "DIVERGENT" ? side * 1.85 : motion === "CONVERGENT" ? side * 1.18 : side * 1.5;
    const targetZ = motion === "TRANSFORM" ? side * 0.72 : 0;
    group.current.position.x += (targetX - group.current.position.x) * 0.055;
    group.current.position.z += (targetZ - group.current.position.z) * 0.055;
  });
  return <group ref={group} position={[side * 1.5, 0, 0]}>
    <mesh position={[0, -0.18, 0]}><boxGeometry args={[2.85, 0.55, 3.5]} /><meshStandardMaterial color={side < 0 ? "#ba7041" : "#4d8b78"} roughness={0.72} /></mesh>
    <mesh position={[0, 0.13, 0]}><boxGeometry args={[2.85, 0.12, 3.5]} /><meshStandardMaterial color={side < 0 ? "#dda95b" : "#75b27e"} roughness={0.9} /></mesh>
  </group>;
}

function Landform({ motion }: { motion: PlateMotion }) {
  const form = useRef<Group>(null);
  const glow = useRef<Mesh>(null);
  useFrame((frame) => {
    if (form.current) form.current.position.y += (0 - form.current.position.y) * 0.05;
    if (glow.current) glow.current.scale.y = 0.85 + Math.sin(frame.clock.elapsedTime * 2.2) * 0.12;
  });
  if (motion === "DIVERGENT") return <group ref={form} position={[0, -1, 0]}>
    <mesh ref={glow} position={[0, -0.12, 0]}><boxGeometry args={[0.34, 0.55, 3]} /><meshStandardMaterial color="#f36f3d" emissive="#c83f22" emissiveIntensity={1.2} /></mesh>
    {[-0.36, 0.36].map((x) => <mesh key={x} position={[x, 0.02, 0]} rotation={[0, 0, x < 0 ? -0.48 : 0.48]}><boxGeometry args={[0.55, 0.42, 3.1]} /><meshStandardMaterial color="#6b5548" /></mesh>)}
  </group>;
  if (motion === "CONVERGENT") return <group ref={form} position={[0, -1, 0]}>
    {[-0.62, 0, 0.62].map((z, index) => <mesh key={z} position={[0, 0.38 + index * 0.1, z]} rotation={[0, 0, Math.PI / 4]}><coneGeometry args={[0.72, 1.5 + index * 0.22, 4]} /><meshStandardMaterial color={index === 1 ? "#8a6956" : "#a47d58"} roughness={0.9} /></mesh>)}
  </group>;
  return <group ref={form} position={[0, -1, 0]}>
    <mesh position={[0, 0.18, 0]} rotation={[0, 0, 0.08]}><boxGeometry args={[0.12, 0.18, 4.2]} /><meshStandardMaterial color="#342d2a" /></mesh>
    {[-1, 1].map((side) => <mesh key={side} position={[side * 0.38, 0.22, side * 0.55]}><boxGeometry args={[0.58, 0.16, 2.5]} /><meshStandardMaterial color="#c09061" /></mesh>)}
  </group>;
}

function TectonicWorld({ motion }: { motion: PlateMotion }) {
  return <>
    <mesh position={[0, -0.7, 0]}><boxGeometry args={[7.2, 0.38, 4.8]} /><meshStandardMaterial color="#394c58" /></mesh>
    <Plate side={-1} motion={motion} /><Plate side={1} motion={motion} />
    <Landform motion={motion} />
  </>;
}

const motionLabels: Record<PlateMotion, string> = { DIVERGENT: "se separan y aparece una dorsal", CONVERGENT: "convergen y se eleva una cordillera", TRANSFORM: "se deslizan lateralmente y aparece una falla" };

export function TectonicLab3D({ motion }: { motion: PlateMotion }) {
  return <div className="tectonicLabScene" role="img" aria-label={`Mesa tectónica conceptual: las placas ${motionLabels[motion]}.`}>
    <Canvas camera={{ position: [0, 4.8, 7.4], fov: 40 }} dpr={[1, 2]}><color attach="background" args={["#e7f0ee"]} /><ambientLight intensity={1.7} /><directionalLight position={[4, 8, 5]} intensity={3.4} /><TectonicWorld motion={motion} /></Canvas>
  </div>;
}
