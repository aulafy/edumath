import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

type Body = { id: string; label: string; distance_rank: number; color: string };

function Orbiter({ body, slot, count }: { body: Body; slot: number; count: number }) {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (!group.current || slot < 0) return;
    group.current.rotation.y = state.clock.elapsedTime * (0.28 + (count - slot) * 0.035) + slot;
  });
  if (slot < 0) return null;
  const radius = 1.05 + slot * 0.64;
  return <group ref={group}>
    <mesh position={[radius, 0.12 + (slot % 2) * 0.08, 0]}>
      <sphereGeometry args={[0.17 + slot * 0.018, 28, 20]} />
      <meshStandardMaterial color={body.color} roughness={0.65} />
    </mesh>
  </group>;
}

export function OrbitLab3D({ centerLabel, bodies, order }: { centerLabel: string; bodies: Body[]; order: string[] }) {
  return <div className="orbitLabScene" role="img" aria-label={`${centerLabel}: ${order.length} de ${bodies.length} órbitas ocupadas`}>
    <Canvas camera={{ position: [0, 5.8, 6.5], fov: 43 }} dpr={[1, 2]}>
      <color attach="background" args={["#eef3f0"]} />
      <ambientLight intensity={1.5} />
      <pointLight position={[0, 1.2, 0]} intensity={25} color="#ffd36b" distance={9} />
      <mesh position={[0, 0.12, 0]}><sphereGeometry args={[0.48, 32, 24]} /><meshStandardMaterial color="#f4bd3e" emissive="#d98b20" emissiveIntensity={0.8} /></mesh>
      {bodies.map((_, index) => <mesh key={`ring-${index}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><ringGeometry args={[1.03 + index * 0.64, 1.05 + index * 0.64, 96]} /><meshBasicMaterial color="#9eaaa4" /></mesh>)}
      {bodies.map((body) => <Orbiter key={body.id} body={body} slot={order.indexOf(body.id)} count={bodies.length} />)}
    </Canvas>
  </div>;
}
