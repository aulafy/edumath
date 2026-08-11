import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

function BeatPad({ index, count, enabled, active }: { index: number; count: number; enabled: boolean; active: boolean }) {
  const pad = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!pad.current) return;
    const target = active ? 1.28 : enabled ? 1.08 : 1;
    pad.current.scale.y += (target - pad.current.scale.y) * Math.min(1, delta * 12);
  });
  const columns = Math.min(count, 6);
  const row = Math.floor(index / columns);
  const col = index % columns;
  const rowCount = Math.ceil(count / columns);
  return <mesh ref={pad} position={[(col - (columns - 1) / 2) * 1.05, 0, (row - (rowCount - 1) / 2) * 1.1]}>
    <boxGeometry args={[0.82, 0.34, 0.82]} />
    <meshStandardMaterial color={active ? "#ffd166" : enabled ? "#ef7658" : "#b9cbc2"} emissive={active ? "#d69318" : "#000000"} emissiveIntensity={active ? 0.75 : 0} />
  </mesh>;
}

export function RhythmLab3D({ pattern, activeBeat }: { pattern: boolean[]; activeBeat: number }) {
  return <div className="rhythmLabScene" role="img" aria-label={`Secuencia de ${pattern.length} pulsos; pulso activo ${activeBeat >= 0 ? activeBeat + 1 : "ninguno"}`}>
    <Canvas camera={{ position: [0, 4.4, 5.8], fov: 43 }} dpr={[1, 2]}>
      <color attach="background" args={["#f2f5ed"]} />
      <ambientLight intensity={1.8} />
      <directionalLight position={[4, 7, 5]} intensity={3.2} color="#fff0c4" />
      {pattern.map((enabled, index) => <BeatPad key={index} index={index} count={pattern.length} enabled={enabled} active={index === activeBeat} />)}
    </Canvas>
  </div>;
}
