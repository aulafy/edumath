import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

function Lever({ leftMass, leftDistance, rightMass, rightDistance }: { leftMass: number; leftDistance: number; rightMass: number; rightDistance: number }) {
  const beam = useRef<Group>(null);
  const difference = leftMass * leftDistance - rightMass * rightDistance;
  const targetTilt = Math.max(-0.22, Math.min(0.22, difference * 0.025));
  useFrame(() => {
    if (beam.current) beam.current.rotation.z += (targetTilt - beam.current.rotation.z) * 0.09;
  });
  return <group>
    <mesh position={[0, -0.55, 0]}><cylinderGeometry args={[0.85, 1.25, 1.6, 3]} /><meshStandardMaterial color="#f2b84b" roughness={0.7} /></mesh>
    <group ref={beam} position={[0, 0.32, 0]}>
      <mesh><boxGeometry args={[8.4, 0.28, 0.72]} /><meshStandardMaterial color="#f3f0df" roughness={0.55} /></mesh>
      {[-4, -3, -2, -1, 1, 2, 3, 4].map((peg) => <mesh key={peg} position={[peg, 0.22, 0.38]}><boxGeometry args={[0.06, 0.18, 0.08]} /><meshStandardMaterial color="#29323a" /></mesh>)}
      <group position={[-leftDistance, 0.72, 0]}>{Array.from({ length: leftMass }, (_, index) => <mesh key={index} position={[0, index * 0.32, 0]}><boxGeometry args={[0.72, 0.28, 0.62]} /><meshStandardMaterial color="#d94f4f" roughness={0.6} /></mesh>)}</group>
      <group position={[rightDistance, 0.72, 0]}>{Array.from({ length: rightMass }, (_, index) => <mesh key={index} position={[0, index * 0.32, 0]}><cylinderGeometry args={[0.34, 0.34, 0.28, 18]} /><meshStandardMaterial color="#287c72" roughness={0.6} /></mesh>)}</group>
    </group>
  </group>;
}

export function LeverLab3D(props: { leftMass: number; leftDistance: number; rightMass: number; rightDistance: number }) {
  const leftMoment = props.leftMass * props.leftDistance;
  const rightMoment = props.rightMass * props.rightDistance;
  const state = leftMoment === rightMoment ? "nivelada" : leftMoment > rightMoment ? "lado izquierdo abajo" : "lado derecho abajo";
  return <div className="leverScene" role="img" aria-label={`Palanca ${state}. Momento izquierdo ${leftMoment}; momento derecho ${rightMoment}.`}>
    <Canvas camera={{ position: [0, 3.2, 10], fov: 42 }} dpr={[1, 2]}><color attach="background" args={["#dceef0"]} /><ambientLight intensity={1.25} /><directionalLight position={[-4, 7, 5]} intensity={2.1} /><Lever {...props} /><mesh position={[0, -1.45, 0]}><boxGeometry args={[11, 0.18, 4]} /><meshStandardMaterial color="#53706d" /></mesh></Canvas>
  </div>;
}
