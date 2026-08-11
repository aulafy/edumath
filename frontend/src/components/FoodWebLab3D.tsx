import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

type Organism = { id: string; label: string; role: "PRODUCER" | "CONSUMER" | "DECOMPOSER" };
type Link = { source: string; target: string };

function Web({ organisms, links, pending }: { organisms: Organism[]; links: Link[]; pending: string }) {
  const group = useRef<Group>(null);
  useFrame((state) => { if (group.current) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.08; });
  const positions = new Map(organisms.map((organism, index) => {
    const angle = (index / organisms.length) * Math.PI * 2 - Math.PI / 2;
    return [organism.id, { x: Math.cos(angle) * 2.35, z: Math.sin(angle) * 1.55 }];
  }));
  return <group ref={group}>
    <mesh position={[0, -0.45, 0]}><cylinderGeometry args={[3.3, 3.3, 0.18, 48]} /><meshStandardMaterial color="#8fc58a" /></mesh>
    {links.map((link) => {
      const source = positions.get(link.source)!;
      const target = positions.get(link.target)!;
      const dx = target.x - source.x; const dz = target.z - source.z;
      const length = Math.hypot(dx, dz); const angle = Math.atan2(dz, dx);
      return <group key={`${link.source}:${link.target}`} position={[(source.x + target.x) / 2, 0.08, (source.z + target.z) / 2]} rotation={[0, -angle, 0]}>
        <mesh><boxGeometry args={[length, 0.07, 0.07]} /><meshStandardMaterial color="#f0b541" emissive="#b77b16" emissiveIntensity={0.25} /></mesh>
        <mesh position={[length / 2 - 0.34, 0.02, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.15, 0.34, 16]} /><meshStandardMaterial color="#d99520" /></mesh>
      </group>;
    })}
    {organisms.map((organism) => {
      const position = positions.get(organism.id)!;
      const color = organism.role === "PRODUCER" ? "#3f9754" : organism.role === "DECOMPOSER" ? "#80644d" : "#ef7658";
      return <group key={organism.id} position={[position.x, 0.28, position.z]} scale={pending === organism.id ? 1.18 : 1}>
        <mesh><sphereGeometry args={[0.42, 24, 16]} /><meshStandardMaterial color={color} emissive={pending === organism.id ? color : "#000000"} emissiveIntensity={pending === organism.id ? 0.5 : 0} /></mesh>
      </group>;
    })}
  </group>;
}

export function FoodWebLab3D({ organisms, links, pending }: { organisms: Organism[]; links: Link[]; pending: string }) {
  return <div className="foodWebScene" role="img" aria-label={`Red alimentaria con ${links.length} conexiones creadas`}>
    <Canvas camera={{ position: [0, 4.8, 6.2], fov: 43 }} dpr={[1, 2]}>
      <color attach="background" args={["#eaf6ed"]} />
      <ambientLight intensity={1.8} />
      <directionalLight position={[4, 7, 5]} intensity={3.2} color="#fff0c4" />
      <Web organisms={organisms} links={links} pending={pending} />
    </Canvas>
  </div>;
}
