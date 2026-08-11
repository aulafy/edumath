import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

type Role = "SUBJECT" | "PREDICATE" | "CONNECTOR";
type Token = { id: string; text: string; role: Role };

const colors: Record<Role, string> = { SUBJECT: "#48a88c", PREDICATE: "#ef7658", CONNECTOR: "#e7b84b" };

function WordBlock({ index, count, token, selected }: { index: number; count: number; token: Token; selected: boolean }) {
  const mesh = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (!mesh.current) return;
    const targetY = selected ? 0.55 : -0.35;
    mesh.current.position.y += (targetY - mesh.current.position.y) * Math.min(1, delta * 9);
    mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.4 + index) * 0.035;
  });
  const columns = Math.min(count, 5);
  const row = Math.floor(index / columns);
  const col = index % columns;
  return <mesh ref={mesh} position={[(col - (columns - 1) / 2) * 1.12, selected ? 0.55 : -0.35, row * 1.05 - 0.5]}>
    <boxGeometry args={[0.92, 0.42, 0.72]} />
    <meshStandardMaterial color={colors[token.role]} emissive={selected ? colors[token.role] : "#000000"} emissiveIntensity={selected ? 0.2 : 0} />
  </mesh>;
}

export function SentenceLab3D({ tokens, order }: { tokens: Token[]; order: string[] }) {
  return <div className="sentenceLabScene" role="img" aria-label={`Carril de frase con ${order.length} de ${tokens.length} fichas colocadas`}>
    <Canvas camera={{ position: [0, 4.5, 6.4], fov: 42 }} dpr={[1, 2]}>
      <color attach="background" args={["#f3f6ee"]} />
      <ambientLight intensity={1.9} />
      <directionalLight position={[4, 7, 5]} intensity={3} color="#fff1cc" />
      <mesh position={[0, 0.12, -0.4]}><boxGeometry args={[5.8, 0.12, 1.05]} /><meshStandardMaterial color="#d8e1da" /></mesh>
      {tokens.map((token, index) => <WordBlock key={token.id} index={index} count={tokens.length} token={token} selected={order.includes(token.id)} />)}
    </Canvas>
  </div>;
}
