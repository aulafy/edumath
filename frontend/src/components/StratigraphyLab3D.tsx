import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

type Artifact = { id: string; label: string; depth_rank: number; shape: "STONE" | "POTTERY" | "METAL" | "GLASS" | "BONE" | "WOOD" };

function ArtifactMesh({ artifact, selected }: { artifact: Artifact; selected: boolean }) {
  const color = { STONE: "#4f6662", POTTERY: "#bb6048", METAL: "#d4aa3f", GLASS: "#3b94a2", BONE: "#eee2bf", WOOD: "#76553f" }[artifact.shape];
  const material = <meshStandardMaterial color={color} emissive={selected ? "#42c58a" : "#000000"} emissiveIntensity={selected ? 0.8 : 0} roughness={0.42} />;
  if (artifact.shape === "POTTERY") return <mesh rotation={[0.2, 0.3, 0]}><torusGeometry args={[0.22, 0.1, 12, 18, Math.PI * 1.35]} />{material}</mesh>;
  if (artifact.shape === "METAL") return <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.22, 0.065, 12, 24]} />{material}</mesh>;
  if (artifact.shape === "GLASS") return <mesh rotation={[0, 0, 0.35]}><octahedronGeometry args={[0.25]} />{material}</mesh>;
  if (artifact.shape === "BONE") return <mesh rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.08, 0.42, 8, 12]} />{material}</mesh>;
  if (artifact.shape === "WOOD") return <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.1, 0.13, 0.58, 12]} />{material}</mesh>;
  return <mesh rotation={[0.15, 0.25, 0.1]}><dodecahedronGeometry args={[0.27]} />{material}</mesh>;
}

function Trench({ artifacts, selectedIds }: { artifacts: Artifact[]; selectedIds: string[] }) {
  const scanner = useRef<Group>(null);
  useFrame((state) => { if (scanner.current) scanner.current.position.y = 0.45 + Math.sin(state.clock.elapsedTime * 0.45) * 1.0; });
  const layers = ["#9caa8d", "#c4a267", "#8e8172", "#627a75"];
  return <>
    {layers.map((color, index) => <mesh key={color} position={[0, 1.25 - index * 0.65, 0]}><boxGeometry args={[5.5, 0.58, 3.4]} /><meshStandardMaterial color={color} roughness={0.92} /></mesh>)}
    {artifacts.map((artifact, index) => {
      const y = 1.25 - (artifact.depth_rank - 1) * 0.65 + 0.08; const x = index % 2 ? 1.25 : -1.15; const z = index < 2 ? 1.5 : 1.15;
      return <group key={artifact.id} position={[x, y, z]} scale={selectedIds.includes(artifact.id) ? 1.35 : 1}><ArtifactMesh artifact={artifact} selected={selectedIds.includes(artifact.id)} /></group>;
    })}
    <group ref={scanner}><mesh position={[0, 0, 1.82]}><boxGeometry args={[5.8, 0.025, 0.025]} /><meshStandardMaterial color="#45c69a" emissive="#45c69a" emissiveIntensity={1} /></mesh></group>
    <mesh position={[0, -1.22, 0]}><boxGeometry args={[6.1, 0.18, 3.9]} /><meshStandardMaterial color="#35534c" /></mesh>
  </>;
}

export function StratigraphyLab3D({ artifacts, selectedIds }: { artifacts: Artifact[]; selectedIds: string[] }) {
  return <div className="stratigraphyLabScene" role="img" aria-label={`Corte de una trinchera con ${artifacts.length} capas intactas. ${selectedIds.length} objetos añadidos a la cronología relativa.`}>
    <Canvas camera={{ position: [5.2, 3.8, 7.2], fov: 42 }} dpr={[1, 2]}><color attach="background" args={["#edf3ef"]} /><ambientLight intensity={1.7} /><directionalLight position={[4, 7, 5]} intensity={3.3} /><Trench artifacts={artifacts} selectedIds={selectedIds} /></Canvas>
  </div>;
}
