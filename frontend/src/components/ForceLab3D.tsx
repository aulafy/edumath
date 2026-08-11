import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

function Cart({ resultant }: { resultant: number }) {
  const cart = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!cart.current) return;
    const target = Math.max(-2.2, Math.min(2.2, resultant * 0.18));
    cart.current.position.x += (target - cart.current.position.x) * Math.min(1, delta * 5);
    const targetTilt = resultant === 0 ? 0 : -Math.sign(resultant) * 0.025;
    cart.current.rotation.z += (targetTilt - cart.current.rotation.z) * Math.min(1, delta * 6);
  });
  return <group ref={cart}>
    <mesh position={[0, 0.48, 0]}><boxGeometry args={[1.45, 0.62, 0.9]} /><meshStandardMaterial color="#e56c50" /></mesh>
    {[-0.5, 0.5].map((x) => <mesh key={x} position={[x, 0.08, 0.48]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.22, 0.22, 0.16, 24]} /><meshStandardMaterial color="#39453f" /></mesh>)}
  </group>;
}

function ForceArrow({ value, index }: { value: number; index: number }) {
  const direction = Math.sign(value);
  const length = 0.65 + Math.abs(value) * 0.07;
  const x = direction * (1.05 + index * 0.2);
  return <group position={[x, 1.1 + index * 0.22, 0]} rotation={[0, 0, direction < 0 ? Math.PI : 0]}>
    <mesh position={[length / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><cylinderGeometry args={[0.055, 0.055, length, 12]} /><meshStandardMaterial color={direction > 0 ? "#297d68" : "#417db3"} /></mesh>
    <mesh position={[length, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.16, 0.34, 18]} /><meshStandardMaterial color={direction > 0 ? "#297d68" : "#417db3"} /></mesh>
  </group>;
}

export function ForceLab3D({ selected, resultant }: { selected: number[]; resultant: number }) {
  return <div className="forceLabScene" role="img" aria-label={`Carro con fuerza resultante ${resultant} newtons`}>
    <Canvas camera={{ position: [0, 3.4, 6.5], fov: 42 }} dpr={[1, 2]}>
      <color attach="background" args={["#eef4ef"]} />
      <ambientLight intensity={1.8} /><directionalLight position={[4, 7, 5]} intensity={3} />
      <mesh position={[0, -0.18, 0]}><boxGeometry args={[6.4, 0.18, 1.8]} /><meshStandardMaterial color="#ccd8d0" /></mesh>
      <Cart resultant={resultant} />
      {selected.map((value, index) => <ForceArrow key={value} value={value} index={index} />)}
    </Canvas>
  </div>;
}
