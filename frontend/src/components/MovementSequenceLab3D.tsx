import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

type Command = "STEP" | "CLAP" | "TURN_LEFT" | "TURN_RIGHT" | "JUMP";

function Avatar({ command }: { command: Command | null }) {
  const body = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  useFrame((frame) => {
    if (!body.current || !leftArm.current || !rightArm.current) return;
    const pulse = Math.sin(frame.clock.elapsedTime * 6);
    body.current.position.y = command === "JUMP" ? 1.35 + Math.max(0, pulse) * 0.55 : 1.35;
    body.current.rotation.y = command === "TURN_LEFT" ? 0.75 : command === "TURN_RIGHT" ? -0.75 : 0;
    leftArm.current.rotation.z = command === "CLAP" ? -1.2 + pulse * 0.18 : -0.25;
    rightArm.current.rotation.z = command === "CLAP" ? 1.2 - pulse * 0.18 : 0.25;
    body.current.position.x = command === "STEP" ? pulse * 0.18 : 0;
  });
  return <group ref={body} position={[0, 1.35, 0]}><mesh position={[0, 1.35, 0]}><sphereGeometry args={[0.42, 22, 16]} /><meshStandardMaterial color="#f0b56f" /></mesh><mesh position={[0, 0.35, 0]}><capsuleGeometry args={[0.48, 1.15, 8, 16]} /><meshStandardMaterial color="#318d91" /></mesh><group ref={leftArm} position={[-0.55, 0.65, 0]}><mesh position={[0, -0.48, 0]}><capsuleGeometry args={[0.12, 0.72, 6, 10]} /><meshStandardMaterial color="#f0b56f" /></mesh></group><group ref={rightArm} position={[0.55, 0.65, 0]}><mesh position={[0, -0.48, 0]}><capsuleGeometry args={[0.12, 0.72, 6, 10]} /><meshStandardMaterial color="#f0b56f" /></mesh></group><mesh position={[-0.25, -0.85, 0]}><capsuleGeometry args={[0.14, 0.75, 6, 10]} /><meshStandardMaterial color="#334b64" /></mesh><mesh position={[0.25, -0.85, 0]}><capsuleGeometry args={[0.14, 0.75, 6, 10]} /><meshStandardMaterial color="#334b64" /></mesh></group>;
}

export function MovementSequenceLab3D({ command }: { command: Command | null }) {
  return <div className="movementScene" role="img" aria-label={`Avatar demostrando ${command ?? "posición de espera"}.`}><Canvas camera={{ position: [0, 2.2, 7], fov: 42 }} dpr={[1, 2]}><color attach="background" args={["#dceff0"]} /><ambientLight intensity={1.2} /><directionalLight position={[-4, 7, 5]} intensity={2.2} /><mesh position={[0, -0.12, 0]}><cylinderGeometry args={[3.2, 3.4, 0.25, 40]} /><meshStandardMaterial color="#e7c45d" /></mesh><Avatar command={command} /></Canvas></div>;
}
