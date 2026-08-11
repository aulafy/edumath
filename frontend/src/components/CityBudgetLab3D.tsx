import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

function City({ solar, trees, transit }: { solar: number; trees: number; transit: number }) {
  const bus = useRef<Group>(null);
  useFrame((frame) => { if (bus.current) bus.current.position.x = -3.2 + ((frame.clock.elapsedTime * (0.25 + transit * 0.035)) % 6.4); });
  return <group>
    {[-2.2, 0, 2.2].map((x, index) => <group key={x} position={[x, 0, index % 2 ? -0.8 : 0.2]}><mesh position={[0, 0.8 + index * 0.2, 0]}><boxGeometry args={[1.5, 1.6 + index * 0.4, 1.4]} /><meshStandardMaterial color={index === 1 ? "#e4e8e5" : "#f0d7a4"} /></mesh>{Array.from({ length: Math.min(solar, 4) }, (_, panel) => <mesh key={panel} position={[-0.55 + (panel % 2) * 0.7, 1.68 + index * 0.4, -0.2 + Math.floor(panel / 2) * 0.55]} rotation={[-0.22, 0, 0]}><boxGeometry args={[0.55, 0.05, 0.38]} /><meshStandardMaterial color="#245f91" metalness={0.25} /></mesh>)}</group>)}
    {Array.from({ length: Math.min(trees, 8) }, (_, index) => { const x = -3.1 + (index % 4) * 2; const z = index < 4 ? 2.0 : -2.35; return <group key={index} position={[x, 0, z]}><mesh position={[0, 0.38, 0]}><cylinderGeometry args={[0.09, 0.12, 0.75, 8]} /><meshStandardMaterial color="#79533b" /></mesh><mesh position={[0, 0.95, 0]}><coneGeometry args={[0.52, 1.1, 10]} /><meshStandardMaterial color="#2d7d52" /></mesh></group>; })}
    <group ref={bus} position={[-3.2, 0.35, 3]}><mesh><boxGeometry args={[1.15, 0.55, 0.55]} /><meshStandardMaterial color="#e44c45" /></mesh><mesh position={[-0.36, -0.31, 0.27]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.14, 0.14, 0.12, 12]} /><meshStandardMaterial color="#26333a" /></mesh><mesh position={[0.36, -0.31, 0.27]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.14, 0.14, 0.12, 12]} /><meshStandardMaterial color="#26333a" /></mesh></group>
  </group>;
}

export function CityBudgetLab3D(props: { solar: number; trees: number; transit: number }) {
  return <div className="cityBudgetScene" role="img" aria-label={`Ecociudad con ${props.solar} inversiones solares, ${props.trees} en arbolado y ${props.transit} en transporte público.`}><Canvas shadows camera={{ position: [7.2, 5.6, 9], fov: 40 }} dpr={[1, 2]}><color attach="background" args={["#bfe2ed"]} /><ambientLight intensity={1.15} /><directionalLight position={[-4, 8, 6]} intensity={2.1} /><mesh position={[0, -0.12, 0]}><boxGeometry args={[9, 0.2, 7]} /><meshStandardMaterial color="#8bb08a" /></mesh><mesh position={[0, 0.01, 3]}><boxGeometry args={[9, 0.08, 1]} /><meshStandardMaterial color="#56646a" /></mesh><City {...props} /></Canvas></div>;
}
