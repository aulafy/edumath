import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

type Cube = { x: number; y: number; z: number };
type Orientation = "NORTH" | "EAST" | "SOUTH" | "WEST";
const angles: Record<Orientation, number> = { NORTH: 0, EAST: -Math.PI / 2, SOUTH: Math.PI, WEST: Math.PI / 2 };

function Sculpture({ cubes, orientation }: { cubes: Cube[]; orientation: Orientation }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    if (!group.current) return;
    let difference = angles[orientation] - group.current.rotation.y;
    while (difference > Math.PI) difference -= Math.PI * 2;
    while (difference < -Math.PI) difference += Math.PI * 2;
    group.current.rotation.y += difference * 0.12;
  });
  return <group ref={group}>{cubes.map((cube, index) => <mesh key={`${cube.x}:${cube.y}:${cube.z}`} position={[cube.x, cube.y + 0.55, cube.z]} castShadow receiveShadow><boxGeometry args={[0.94, 0.94, 0.94]} /><meshStandardMaterial color={index % 2 ? "#f0b64d" : "#e85f58"} roughness={0.62} /></mesh>)}</group>;
}

export function ShadowViewLab3D({ cubes, orientation, label }: { cubes: Cube[]; orientation: Orientation; label: string }) {
  const names: Record<Orientation, string> = { NORTH: "norte", EAST: "este", SOUTH: "sur", WEST: "oeste" };
  return <div className="shadowViewScene" role="img" aria-label={`${label}, orientación ${names[orientation]}. Modelo formado por ${cubes.length} cubos.`}>
    <Canvas shadows camera={{ position: [5.8, 4.6, 7.2], fov: 38 }} dpr={[1, 2]}><color attach="background" args={["#dfeff4"]} /><ambientLight intensity={1.25} /><directionalLight castShadow position={[-4, 8, 6]} intensity={2.2} /><Sculpture cubes={cubes} orientation={orientation} /><gridHelper args={[8, 8, "#5f777c", "#9bb3b5"]} position={[0, 0.04, 0]} /></Canvas>
  </div>;
}
