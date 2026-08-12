import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

function Scale({ leftValue, rightValue }: { leftValue: number; rightValue: number }) {
  const beam = useRef<Group>(null);
  const difference = Math.max(-1, Math.min(1, (rightValue - leftValue) / Math.max(leftValue, 1)));
  const targetRotation = difference * 0.22;
  useFrame((_, delta) => {
    if (beam.current) beam.current.rotation.z += (targetRotation - beam.current.rotation.z) * Math.min(1, delta * 5);
  });
  return <group position={[0, -0.65, 0]}>
    <mesh position={[0, -0.65, 0]}><cylinderGeometry args={[0.72, 1.05, 0.35, 32]} /><meshStandardMaterial color="#287b63" /></mesh>
    <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.16, 0.28, 1.6, 24]} /><meshStandardMaterial color="#33564a" /></mesh>
    <group ref={beam} position={[0, 0.85, 0]}>
      <mesh><boxGeometry args={[5.4, 0.18, 0.28]} /><meshStandardMaterial color="#e9b949" metalness={0.25} roughness={0.42} /></mesh>
      <mesh position={[-2.15, -0.55, 0]}><cylinderGeometry args={[0.72, 0.9, 0.18, 32]} /><meshStandardMaterial color="#5ab19a" /></mesh>
      <mesh position={[2.15, -0.55, 0]}><cylinderGeometry args={[0.72, 0.9, 0.18, 32]} /><meshStandardMaterial color="#e86f51" /></mesh>
      {Array.from({ length: Math.min(25, leftValue) }, (_, index) => <mesh key={`left-${index}`} position={[-2.55 + (index % 5) * 0.2, -0.39 + Math.floor(index / 5) * 0.17, 0]}><boxGeometry args={[0.15, 0.15, 0.28]} /><meshStandardMaterial color="#ecf7f1" /></mesh>)}
      {Array.from({ length: Math.min(25, rightValue) }, (_, index) => <mesh key={`right-${index}`} position={[1.75 + (index % 5) * 0.2, -0.39 + Math.floor(index / 5) * 0.17, 0]}><boxGeometry args={[0.15, 0.15, 0.28]} /><meshStandardMaterial color="#ffd166" /></mesh>)}
    </group>
  </group>;
}

export function BalanceLab3D({ leftValue, rightValue }: { leftValue: number; rightValue: number }) {
  return <div className="balanceLabScene" role="img" aria-label={`Balanza: ${leftValue} a la izquierda y ${rightValue} a la derecha`}>
    <Canvas camera={{ position: [0, 1.1, 7], fov: 42 }} dpr={[1, 2]}>
      <color attach="background" args={["#e8f6ef"]} />
      <ambientLight intensity={1.9} />
      <directionalLight position={[4, 6, 5]} intensity={3} color="#fff4cf" />
      <Scale leftValue={leftValue} rightValue={rightValue} />
    </Canvas>
  </div>;
}
