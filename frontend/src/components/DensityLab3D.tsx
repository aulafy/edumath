import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";

type DensityState = "FLOAT" | "SINK" | "SUSPEND";

function TankWorld({ volume, state }: { volume: number; state: DensityState }) {
  const block = useRef<Group>(null);
  const bubbles = useRef<Group>(null);
  const targetY = state === "FLOAT" ? 1.05 : state === "SINK" ? -1.12 : 0;
  const size = 0.58 + Math.cbrt(volume / 20) * 0.65;
  useFrame((frame) => {
    if (block.current) {
      block.current.position.y += (targetY - block.current.position.y) * 0.07;
      block.current.rotation.y = Math.sin(frame.clock.elapsedTime * 0.45) * 0.06;
    }
    if (bubbles.current) bubbles.current.position.y = (frame.clock.elapsedTime * 0.2) % 1.5;
  });
  const bubblePositions = useMemo(() => Array.from({ length: 8 }, (_, index) => ({ x: -2.1 + (index % 4) * 1.35, y: -1.55 + Math.floor(index / 4) * 0.45, z: -0.6 + (index % 3) * 0.6 })), []);
  return <>
    <mesh position={[0, -0.15, 0]}><boxGeometry args={[5.7, 3.4, 3.5]} /><meshPhysicalMaterial color="#65a9bf" transparent opacity={0.22} transmission={0.45} roughness={0.08} thickness={0.15} /></mesh>
    <mesh position={[0, 1.48, 0]}><boxGeometry args={[5.35, 0.04, 3.2]} /><meshStandardMaterial color="#4f9db9" transparent opacity={0.62} /></mesh>
    <mesh position={[0, -1.8, 0]}><boxGeometry args={[6.1, 0.18, 3.9]} /><meshStandardMaterial color="#365a54" /></mesh>
    <group ref={block} position={[0, 0, 0]}>
      <mesh scale={[size, size, size]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#d8a62d" roughness={0.38} /></mesh>
      <mesh position={[0, size * 0.52, 0]} scale={[size * 0.72, 0.05, size * 0.72]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#6c4e9b" /></mesh>
    </group>
    <group ref={bubbles}>{bubblePositions.map((bubble, index) => <mesh key={index} position={[bubble.x, bubble.y, bubble.z]}><sphereGeometry args={[0.05 + (index % 3) * 0.02, 12, 8]} /><meshStandardMaterial color="#dff5f7" transparent opacity={0.78} /></mesh>)}</group>
  </>;
}

export function DensityLab3D({ volume, state, mass }: { volume: number; state: DensityState; mass: number }) {
  const label = state === "FLOAT" ? "flota" : state === "SINK" ? "se hunde" : "queda suspendido";
  return <div className="densityLabScene" role="img" aria-label={`Tanque conceptual: bloque de ${mass} gramos y ${volume} centímetros cúbicos. El bloque ${label}.`}>
    <Canvas camera={{ position: [0, 2.7, 7.2], fov: 42 }} dpr={[1, 2]}><color attach="background" args={["#eaf3f1"]} /><ambientLight intensity={1.8} /><directionalLight position={[4, 7, 5]} intensity={3.2} /><TankWorld volume={volume} state={state} /></Canvas>
  </div>;
}
