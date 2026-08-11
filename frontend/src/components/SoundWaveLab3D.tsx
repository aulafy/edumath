import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";

const particleCount = 48;

function WaveParticles({ frequency, amplitude }: { frequency: number; amplitude: number }) {
  const group = useRef<Group>(null);
  const cycles = 2 + (frequency - 200) / 600 * 5;
  const height = 0.24 + amplitude * 0.18;
  useFrame((frame) => {
    if (!group.current) return;
    const phase = frame.clock.elapsedTime * 2.4;
    group.current.children.forEach((child, index) => {
      const x = -3 + index / (particleCount - 1) * 6;
      child.position.y = Math.sin(index / (particleCount - 1) * Math.PI * 2 * cycles - phase) * height;
      child.position.x = x;
    });
  });
  return <group ref={group}>{Array.from({ length: particleCount }, (_, index) => <mesh key={index} position={[-3 + index / (particleCount - 1) * 6, 0, 0]}><sphereGeometry args={[0.075, 10, 8]} /><meshStandardMaterial color={index % 2 ? "#3c82a2" : "#57a88c"} roughness={0.46} /></mesh>)}</group>;
}

function Speaker({ amplitude }: { amplitude: number }) {
  const cone = useRef<Mesh>(null);
  useFrame((frame) => { if (cone.current) cone.current.scale.x = 1 + Math.sin(frame.clock.elapsedTime * 12) * amplitude * 0.015; });
  return <group position={[-3.7, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><mesh><cylinderGeometry args={[0.55, 0.82, 0.7, 28]} /><meshStandardMaterial color="#48575c" /></mesh><mesh ref={cone} position={[0, -0.38, 0]}><cylinderGeometry args={[0.12, 0.48, 0.16, 28]} /><meshStandardMaterial color="#d0a642" /></mesh></group>;
}

export function SoundWaveLab3D({ frequency, amplitude }: { frequency: number; amplitude: number }) {
  return <div className="soundWaveScene" role="img" aria-label={`Onda sonora conceptual de ${frequency} hercios y amplitud visual ${amplitude} de 5. Una frecuencia mayor muestra más oscilaciones; una amplitud mayor muestra crestas más altas.`}>
    <Canvas camera={{ position: [0, 2.4, 7.8], fov: 38 }} dpr={[1, 2]}><color attach="background" args={["#eef4f1"]} /><ambientLight intensity={1.8} /><directionalLight position={[4, 7, 5]} intensity={3.2} />
      <mesh position={[0, -1.35, 0]}><boxGeometry args={[8.4, 0.14, 2.2]} /><meshStandardMaterial color="#c8d5cf" /></mesh>
      <Speaker amplitude={amplitude} /><WaveParticles frequency={frequency} amplitude={amplitude} />
      <mesh position={[3.65, 0, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.55, 0.13, 14, 28]} /><meshStandardMaterial color="#775d92" /></mesh>
    </Canvas>
  </div>;
}
