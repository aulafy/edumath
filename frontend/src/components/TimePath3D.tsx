import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

type PathEvent = { id: string; label: string; date_label: string };

function TimeStations({ events, order }: { events: PathEvent[]; order: string[] }) {
  const path = useRef<Group>(null);
  useFrame((state) => {
    if (path.current) path.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.025;
  });
  const positions = new Map(order.map((id, index) => [id, index]));
  return <group ref={path}>
    <mesh position={[0, -0.55, 0]}><boxGeometry args={[6.4, 0.12, 1]} /><meshStandardMaterial color="#c7dcd2" /></mesh>
    {events.map((event, index) => {
      const step = positions.get(event.id);
      const x = -2.55 + index * (5.1 / Math.max(events.length - 1, 1));
      const active = step !== undefined;
      return <group key={event.id} position={[x, active ? 0.05 : -0.08, 0]}>
        <mesh><cylinderGeometry args={[0.34, 0.48, active ? 0.85 : 0.58, 24]} /><meshStandardMaterial color={active ? "#ef7658" : "#91aa9e"} /></mesh>
        {active && <mesh position={[0, 0.62, 0]}><sphereGeometry args={[0.19, 20, 14]} /><meshStandardMaterial color="#ffd166" emissive="#d89b25" emissiveIntensity={0.6} /></mesh>}
      </group>;
    })}
  </group>;
}

export function TimePath3D({ events, order }: { events: PathEvent[]; order: string[] }) {
  return <div className="timePathScene" role="img" aria-label={`Sendero temporal con ${order.length} de ${events.length} estaciones activadas`}>
    <Canvas camera={{ position: [0, 2.5, 7.2], fov: 42 }} dpr={[1, 2]}>
      <color attach="background" args={["#f0f7f3"]} />
      <ambientLight intensity={1.8} />
      <directionalLight position={[4, 6, 5]} intensity={3.2} color="#fff1c5" />
      <TimeStations events={events} order={order} />
    </Canvas>
  </div>;
}
