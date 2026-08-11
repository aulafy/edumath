import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";

function ClimateWorld({ temperature, rainfall }: { temperature: number; rainfall: number }) {
  const clouds = useRef<Group>(null);
  useFrame((state) => { if (clouds.current) clouds.current.position.x = Math.sin(state.clock.elapsedTime * 0.22) * 0.55; });
  const treeCount = Math.max(0, Math.min(9, Math.round(rainfall / 220)));
  const trees = useMemo(() => Array.from({ length: treeCount }, (_, index) => ({ x: -2.1 + (index % 5) * 1.02, z: -0.9 + Math.floor(index / 5) * 1.35 })), [treeCount]);
  const dry = rainfall < 500; const cold = temperature < 8; const wet = rainfall > 900;
  return <>
    <mesh position={[0, -0.12, 0]}><boxGeometry args={[6, 0.25, 3.7]} /><meshStandardMaterial color={dry ? "#c8ab64" : cold ? "#91a99d" : "#62a66f"} /></mesh>
    <mesh position={[1.8, 0.01, 0.8]} scale={[Math.max(0.25, rainfall / 900), 1, Math.max(0.25, rainfall / 900)]}><cylinderGeometry args={[0.55, 0.62, 0.08, 40]} /><meshStandardMaterial color="#4b9bc1" transparent opacity={0.82} /></mesh>
    {trees.map((tree, index) => <group key={index} position={[tree.x, 0.28, tree.z]}><mesh><cylinderGeometry args={[0.07, 0.09, 0.55, 10]} /><meshStandardMaterial color="#70543a" /></mesh><mesh position={[0, 0.46, 0]}><coneGeometry args={[dry ? 0.2 : 0.32, dry ? 0.45 : 0.72, 16]} /><meshStandardMaterial color={cold ? "#55786a" : "#267a4f"} /></mesh></group>)}
    <group position={[-1.45, 0.25, -0.72]}><mesh rotation={[0, 0, -0.08]}><coneGeometry args={[1.05, 2.15, 4]} /><meshStandardMaterial color="#74847c" /></mesh>{cold && <mesh position={[0, 0.72, 0]} rotation={[0, 0, -0.08]}><coneGeometry args={[0.42, 0.78, 4]} /><meshStandardMaterial color="#edf3f0" /></mesh>}</group>
    <group ref={clouds} position={[0, 2.05, -0.5]}>{wet && [-1.1, 0, 1.1].map((x) => <mesh key={x} position={[x, 0, 0]} scale={[1.1, 0.55, 0.75]}><sphereGeometry args={[0.55, 22, 16]} /><meshStandardMaterial color="#d8e1dd" /></mesh>)}</group>
  </>;
}

export function ClimateLab3D({ temperature, rainfall }: { temperature: number; rainfall: number }) {
  return <div className="climateLabScene" role="img" aria-label={`Paisaje conceptual con ${temperature} grados y ${rainfall} milímetros anuales`}>
    <Canvas camera={{ position: [0, 3.7, 6.2], fov: 43 }} dpr={[1, 2]}><color attach="background" args={[temperature > 20 ? "#f5edcf" : coldSky(temperature)]} /><ambientLight intensity={1.7} /><directionalLight position={[4, 7, 5]} intensity={temperature > 20 ? 3.6 : 2.6} color={temperature > 20 ? "#ffe2a0" : "#e7f1ff"} /><ClimateWorld temperature={temperature} rainfall={rainfall} /></Canvas>
  </div>;
}

function coldSky(temperature: number) { return temperature < 8 ? "#dce8ea" : "#e4f0eb"; }
