import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";

function Segment({ from, to, color, radius = 0.035 }: { from: [number, number, number]; to: [number, number, number]; color: string; radius?: number }) {
  const { midpoint, length, quaternion } = useMemo(() => {
    const start = new Vector3(...from); const end = new Vector3(...to); const direction = end.clone().sub(start);
    return { midpoint: start.clone().add(end).multiplyScalar(0.5), length: direction.length(), quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize()) };
  }, [from, to]);
  return <mesh position={midpoint} quaternion={quaternion}><cylinderGeometry args={[radius, radius, length, 12]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.65} /></mesh>;
}

function rayPoint(angle: number, length: number) {
  const radians = angle * Math.PI / 180;
  return [-Math.cos(2 * radians) * length, 0.42, Math.sin(2 * radians) * length] as [number, number, number];
}

function ReflectionWorld({ angle, targetAngle }: { angle: number; targetAngle: number }) {
  const radians = angle * Math.PI / 180;
  const normalEnd = [-Math.cos(radians) * 1.45, 0.46, Math.sin(radians) * 1.45] as [number, number, number];
  const reflectedEnd = rayPoint(angle, 3.5); const target = rayPoint(targetAngle, 3.5);
  const hit = angle === targetAngle;
  return <>
    <mesh position={[0, -0.04, 0]}><boxGeometry args={[7.6, 0.12, 6.2]} /><meshStandardMaterial color="#dce8e3" /></mesh>
    <Segment from={[-3.55, 0.42, 0]} to={[0, 0.42, 0]} color="#e25545" radius={0.055} />
    <Segment from={[0, 0.42, 0]} to={reflectedEnd} color={hit ? "#39a96b" : "#e25545"} radius={0.055} />
    <Segment from={[0, 0.46, 0]} to={normalEnd} color="#286f9d" radius={0.025} />
    <mesh position={[0, 0.35, 0]} rotation={[0, radians - Math.PI / 2, 0]}><boxGeometry args={[3.1, 0.72, 0.12]} /><meshPhysicalMaterial color="#b8d6df" metalness={0.72} roughness={0.16} /></mesh>
    <group position={target}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.34, 0.1, 16, 30]} /><meshStandardMaterial color={hit ? "#39a96b" : "#e1ad35"} emissive={hit ? "#39a96b" : "#e1ad35"} emissiveIntensity={hit ? 1 : 0.35} /></mesh>
      <mesh position={[0, -0.13, 0]}><cylinderGeometry args={[0.18, 0.3, 0.34, 18]} /><meshStandardMaterial color="#465d57" /></mesh>
    </group>
    <mesh position={[-3.38, 0.42, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.17, 0.34, 16]} /><meshStandardMaterial color="#9d2f2a" /></mesh>
  </>;
}

export function ReflectionLab3D({ angle, targetAngle }: { angle: number; targetAngle: number }) {
  const hit = angle === targetAngle;
  return <div className="reflectionLabScene" role="img" aria-label={`Banco óptico con normal a ${angle} grados. Ángulo de incidencia ${Math.abs(angle)} grados y reflexión ${Math.abs(angle)} grados. ${hit ? "El rayo alcanza el sensor." : "El rayo no alcanza el sensor."}`}>
    <Canvas camera={{ position: [0, 5.8, 7.4], fov: 43 }} dpr={[1, 2]}><color attach="background" args={["#edf4f1"]} /><ambientLight intensity={1.65} /><directionalLight position={[3, 7, 4]} intensity={3.2} /><ReflectionWorld angle={angle} targetAngle={targetAngle} /></Canvas>
  </div>;
}
