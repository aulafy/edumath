import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";

type Atom = { symbol: string; label: string; count: number; color: string };

function MoleculeCluster({ particles }: { particles: Array<Atom & { key: string }> }) {
  const group = useRef<Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.28;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.45) * 0.08;
  });
  return <group ref={group}>{particles.map((atom, index) => {
    const angle = index * 2.399;
    const radius = index === 0 ? 0 : 0.72 + Math.floor((index - 1) / 5) * 0.55;
    return <mesh key={atom.key} position={[Math.cos(angle) * radius, ((index % 3) - 1) * 0.38, Math.sin(angle) * radius]}>
      <sphereGeometry args={[atom.symbol === "H" ? 0.28 : 0.39, 30, 22]} />
      <meshStandardMaterial color={atom.color} roughness={0.55} metalness={0.05} />
    </mesh>;
  })}</group>;
}

export function MoleculeLab3D({ atoms, composition }: { atoms: Atom[]; composition: Record<string, number> }) {
  const particles = useMemo(() => atoms.flatMap((atom) => Array.from({ length: composition[atom.symbol] ?? 0 }, (_, index) => ({ ...atom, key: `${atom.symbol}-${index}` }))), [atoms, composition]);
  return <div className="moleculeLabScene" role="img" aria-label={`Modelo de composición con ${particles.length} átomos`}>
    <Canvas camera={{ position: [0, 2.8, 5.7], fov: 42 }} dpr={[1, 2]}>
      <color attach="background" args={["#eef4f2"]} />
      <ambientLight intensity={1.7} />
      <directionalLight position={[4, 6, 5]} intensity={3.2} />
      <MoleculeCluster particles={particles} />
      {particles.length === 0 && <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.72, 0.76, 64]} /><meshBasicMaterial color="#8ea59a" /></mesh>}
    </Canvas>
  </div>;
}
