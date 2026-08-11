import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

function Beacon({ x, on, delay }: { x: number; on: boolean; delay: number }) {
  const light = useRef<Mesh>(null);
  useFrame((frame) => {
    if (!light.current || !on) return;
    const scale = 1 + Math.sin(frame.clock.elapsedTime * 3.2 + delay) * 0.08;
    light.current.scale.setScalar(scale);
  });
  return <group position={[x, 0, 0]}><mesh position={[0, 1.25, 0]}><cylinderGeometry args={[0.22, 0.38, 2.5, 14]} /><meshStandardMaterial color="#324c56" /></mesh><mesh ref={light} position={[0, 2.75, 0]}><sphereGeometry args={[0.48, 20, 16]} /><meshStandardMaterial color={on ? "#ffe277" : "#718087"} emissive={on ? "#ffbd31" : "#000000"} emissiveIntensity={on ? 2.4 : 0} /></mesh>{on && <pointLight position={[0, 2.75, 0]} color="#ffd76a" intensity={2.5} distance={4} />}</group>;
}

export function BinarySignalLab3D({ bits }: { bits: number[] }) {
  const state = bits.map((bit) => bit ? "encendida" : "apagada").join(", ");
  return <div className="binarySignalScene" role="img" aria-label={`Torre de cuatro balizas, de 8 a 1: ${state}.`}><Canvas camera={{ position: [0, 3.2, 9], fov: 40 }} dpr={[1, 2]}><color attach="background" args={["#162b3d"]} /><ambientLight intensity={0.55} /><directionalLight position={[-3, 6, 5]} intensity={1.6} /><mesh position={[0, -0.12, 0]}><boxGeometry args={[9, 0.25, 4]} /><meshStandardMaterial color="#43616a" /></mesh>{bits.map((bit, index) => <Beacon key={index} x={-3 + index * 2} on={!!bit} delay={index * 0.7} />)}</Canvas></div>;
}
