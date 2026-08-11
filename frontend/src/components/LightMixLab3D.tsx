import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

function Sculpture() {
  const group = useRef<Group>(null);
  useFrame((frame) => {
    if (!group.current) return;
    group.current.rotation.y = frame.clock.elapsedTime * 0.32;
    group.current.position.y = 0.35 + Math.sin(frame.clock.elapsedTime * 0.8) * 0.08;
  });
  return <group ref={group} position={[0, 0.35, 0]}><mesh><dodecahedronGeometry args={[1.15, 1]} /><meshStandardMaterial color="#ffffff" roughness={0.48} metalness={0.08} /></mesh><mesh position={[0, -1.35, 0]}><cylinderGeometry args={[0.65, 0.82, 0.3, 28]} /><meshStandardMaterial color="#727779" /></mesh></group>;
}

function Lamp({ position, color, on }: { position: [number, number, number]; color: string; on: boolean }) {
  return <group position={position}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.28, 0.42, 0.72, 22]} /><meshStandardMaterial color={on ? color : "#596064"} emissive={on ? color : "#000000"} emissiveIntensity={on ? 0.7 : 0} /></mesh><mesh position={[0, -0.48, 0]}><cylinderGeometry args={[0.09, 0.09, 1.05, 12]} /><meshStandardMaterial color="#333a3e" /></mesh></group>;
}

export function LightMixLab3D({ red, green, blue }: { red: number; green: number; blue: number }) {
  const active = [red ? "rojo" : "", green ? "verde" : "", blue ? "azul" : ""].filter(Boolean);
  return <div className="lightMixScene" role="img" aria-label={`Teatro de mezcla aditiva. Focos activos: ${active.length ? active.join(", ") : "ninguno"}.`}>
    <Canvas camera={{ position: [0, 2.5, 7], fov: 42 }} dpr={[1, 2]}><color attach="background" args={["#171c24"]} /><ambientLight intensity={0.12} />
      {!!red && <directionalLight position={[-4, 4, 4]} color="#ff3030" intensity={3.8} />}
      {!!green && <directionalLight position={[0, 5, 3]} color="#24e36e" intensity={3.8} />}
      {!!blue && <directionalLight position={[4, 4, 4]} color="#347cff" intensity={3.8} />}
      <mesh position={[0, -1.17, 0]}><cylinderGeometry args={[3.1, 3.4, 0.28, 48]} /><meshStandardMaterial color="#343943" roughness={0.85} /></mesh>
      <Sculpture /><Lamp position={[-3, 0.15, 0.5]} color="#ff3030" on={!!red} /><Lamp position={[0, 2.25, -1]} color="#24e36e" on={!!green} /><Lamp position={[3, 0.15, 0.5]} color="#347cff" on={!!blue} />
    </Canvas>
  </div>;
}
