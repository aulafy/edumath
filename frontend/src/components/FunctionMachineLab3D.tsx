import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

function ConveyorBall({ index, active }: { index: number; active: boolean }) {
  const group = useRef<Group>(null);
  useFrame((frame) => {
    if (!group.current) return;
    const travel = active ? ((frame.clock.elapsedTime * 0.48 + index / 3) % 1) : index / 3 * 0.38;
    group.current.position.x = -3.25 + travel * 6.5;
    group.current.position.y = 0.45 + Math.sin(travel * Math.PI * 6) * 0.04;
    group.current.rotation.z = -travel * Math.PI * 8;
  });
  return <group ref={group} position={[-3.25 + index * 0.4, 0.45, 0]}><mesh><sphereGeometry args={[0.22, 20, 14]} /><meshStandardMaterial color={["#e9b949", "#4f91c6", "#d65e56"][index]} roughness={0.42} /></mesh></group>;
}

function Gear({ x, active, color }: { x: number; active: boolean; color: string }) {
  const gear = useRef<Group>(null);
  useFrame((_, delta) => { if (gear.current && active) gear.current.rotation.z -= delta * 1.8; });
  return <group ref={gear} position={[x, 1.25, 0]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.54, 0.16, 12, 24]} /><meshStandardMaterial color={color} metalness={0.12} roughness={0.58} /></mesh>
    {[0, 1, 2, 3].map((index) => <mesh key={index} rotation={[0, 0, index * Math.PI / 2]} position={[Math.cos(index * Math.PI / 2) * 0.68, Math.sin(index * Math.PI / 2) * 0.68, 0]}><boxGeometry args={[0.24, 0.22, 0.22]} /><meshStandardMaterial color={color} /></mesh>)}
  </group>;
}

export function FunctionMachineLab3D({ slots }: { slots: number }) {
  return <div className="functionMachineScene" role="img" aria-label={`Máquina de funciones con ${slots} de 2 operaciones instaladas. Tres valores recorren la cinta de izquierda a derecha.`}>
    <Canvas camera={{ position: [0, 3.4, 7.4], fov: 41 }} dpr={[1, 2]}><color attach="background" args={["#edf3ef"]} /><ambientLight intensity={1.8} /><directionalLight position={[4, 7, 5]} intensity={3.2} />
      <mesh position={[0, 0.08, 0]}><boxGeometry args={[7.2, 0.28, 1.55]} /><meshStandardMaterial color="#455a60" /></mesh>
      {[-2.6, -1.3, 0, 1.3, 2.6].map((x) => <mesh key={x} position={[x, -0.1, 0.7]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.24, 0.24, 0.18, 20]} /><meshStandardMaterial color="#26383e" /></mesh>)}
      <Gear x={-0.95} active={slots >= 1} color={slots >= 1 ? "#497c91" : "#aeb9b7"} /><Gear x={0.95} active={slots >= 2} color={slots >= 2 ? "#9268a3" : "#aeb9b7"} />
      {[0, 1, 2].map((index) => <ConveyorBall key={index} index={index} active={slots === 2} />)}
    </Canvas>
  </div>;
}
