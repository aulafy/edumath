import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Group } from "three";

type SceneSpec = {
  type: "COIN_VALUE";
  value: string;
  answer: string;
} | {
  type: "FOOD_CHAIN";
  answer: string;
};

function Coin({ active, onSelect }: { active: boolean; onSelect: () => void }) {
  const coin = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  useFrame((state, delta) => {
    if (!coin.current) return;
    coin.current.rotation.y += delta * (hovered ? 0.7 : 0.25);
    coin.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
  });
  return (
    <group ref={coin} rotation={[Math.PI / 2.8, 0, 0]} scale={hovered || active ? 1.08 : 1} onClick={onSelect} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh>
        <cylinderGeometry args={[1.35, 1.35, 0.28, 64]} />
        <meshStandardMaterial color={active ? "#ffd85a" : "#e7b93f"} metalness={0.72} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.98, 0.08, 20, 64]} />
        <meshStandardMaterial color="#fff0a3" metalness={0.65} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.16, 20, 48]} />
        <meshStandardMaterial color="#fff0a3" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function FoodChain({ active, onSelect }: { active: boolean; onSelect: () => void }) {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (group.current) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.08;
  });
  return <group ref={group}>
    <mesh position={[0, -1.1, 0]} receiveShadow><cylinderGeometry args={[4.5, 4.5, 0.35, 48]} /><meshStandardMaterial color="#78ad55" /></mesh>
    <group position={[-1.8, -0.75, 0]} onClick={onSelect} scale={active ? 1.15 : 1}>
      {[0, 0.35, 0.7].map((x) => <mesh key={x} position={[x, 0.5, 0]} rotation={[0, 0, x - 0.35]}><capsuleGeometry args={[0.09, 0.8, 6, 12]} /><meshStandardMaterial color={active ? "#9fe36d" : "#4f963f"} /></mesh>)}
    </group>
    <group position={[0.4, -0.35, 0]}>
      <mesh scale={[1.1, 0.75, 0.72]}><sphereGeometry args={[0.52, 24, 16]} /><meshStandardMaterial color="#c79b72" /></mesh>
      <mesh position={[0.45, 0.28, 0]}><sphereGeometry args={[0.34, 20, 14]} /><meshStandardMaterial color="#d4ad85" /></mesh>
      <mesh position={[0.35, 0.72, 0]} rotation={[0, 0, -0.25]}><capsuleGeometry args={[0.09, 0.55, 6, 12]} /><meshStandardMaterial color="#c79b72" /></mesh>
      <mesh position={[0.58, 0.72, 0]} rotation={[0, 0, 0.25]}><capsuleGeometry args={[0.09, 0.55, 6, 12]} /><meshStandardMaterial color="#c79b72" /></mesh>
    </group>
    <group position={[1.25, 0.65, -0.3]} rotation={[0, 0, -0.12]} scale={0.72}>
      <mesh scale={[1.2, 0.35, 0.7]}><sphereGeometry args={[0.55, 24, 16]} /><meshStandardMaterial color="#765238" /></mesh>
      <mesh position={[-0.65, 0, 0]} rotation={[0, 0, 0.35]}><coneGeometry args={[0.35, 1.2, 16]} /><meshStandardMaterial color="#8b6545" /></mesh>
      <mesh position={[0.62, 0, 0]} rotation={[0, 0, -0.35]}><coneGeometry args={[0.35, 1.2, 16]} /><meshStandardMaterial color="#8b6545" /></mesh>
    </group>
  </group>;
}

export function LearningScene3D({ scene, selected, onSelect }: { scene: SceneSpec; selected: string; onSelect: (answer: string) => void }) {
  const label = scene.type === "COIN_VALUE" ? scene.value : "La hierba";
  return (
    <div className="learningScene" role="group" aria-label={scene.type === "COIN_VALUE" ? `Moneda interactiva de ${scene.value}` : "Cadena alimentaria interactiva"}>
      <Canvas camera={{ position: [0, 0.4, 5.2], fov: 42 }} dpr={[1, 2]}>
        <color attach="background" args={["#dff2e7"]} />
        <ambientLight intensity={1.8} />
        <directionalLight position={[3, 4, 5]} intensity={3.2} color="#fff3c4" />
        <directionalLight position={[-3, -1, 2]} intensity={1.2} color="#7dc5ab" />
        {scene.type === "COIN_VALUE" ? <Coin active={selected === scene.answer} onSelect={() => onSelect(scene.answer)} /> : <FoodChain active={selected === scene.answer} onSelect={() => onSelect(scene.answer)} />}
      </Canvas>
      <button className="sceneHotspot" aria-label={`Seleccionar ${label}`} onClick={() => onSelect(scene.answer)}>{label}</button>
    </div>
  );
}
