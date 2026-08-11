import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

type Cell = { row: number; col: number };

function Explorer({ cell, rows, cols }: { cell: Cell; rows: number; cols: number }) {
  const explorer = useRef<Group>(null);
  const targetX = cell.col - (cols - 1) / 2;
  const targetZ = cell.row - (rows - 1) / 2;
  useFrame((state, delta) => {
    if (!explorer.current) return;
    explorer.current.position.x += (targetX - explorer.current.position.x) * Math.min(1, delta * 8);
    explorer.current.position.z += (targetZ - explorer.current.position.z) * Math.min(1, delta * 8);
    explorer.current.position.y = 0.42 + Math.sin(state.clock.elapsedTime * 3) * 0.035;
  });
  return <group ref={explorer} position={[targetX, 0.42, targetZ]}>
    <mesh><boxGeometry args={[0.55, 0.38, 0.55]} /><meshStandardMaterial color="#e76d50" /></mesh>
    <mesh position={[0, 0.32, 0]}><sphereGeometry args={[0.19, 22, 16]} /><meshStandardMaterial color="#f0c34a" /></mesh>
    <mesh position={[0, 0.56, 0]}><cylinderGeometry args={[0.025, 0.025, 0.28, 10]} /><meshStandardMaterial color="#39453f" /></mesh>
  </group>;
}

export function RouteLab3D({ rows, cols, blocked, target, position }: { rows: number; cols: number; blocked: Cell[]; target: Cell; position: Cell }) {
  const blockedKeys = new Set(blocked.map((cell) => `${cell.row}:${cell.col}`));
  return <div className="routeLabScene" role="img" aria-label={`Explorador en fila ${position.row + 1}, columna ${position.col + 1}`}>
    <Canvas camera={{ position: [0, 6.4, 6.1], fov: 42 }} dpr={[1, 2]}>
      <color attach="background" args={["#eef4ef"]} /><ambientLight intensity={1.8} /><directionalLight position={[4, 8, 5]} intensity={3} />
      {Array.from({ length: rows * cols }, (_, index) => {
        const row = Math.floor(index / cols); const col = index % cols; const key = `${row}:${col}`;
        const isTarget = row === target.row && col === target.col; const isBlocked = blockedKeys.has(key);
        return <mesh key={key} position={[col - (cols - 1) / 2, isBlocked ? 0.3 : 0, row - (rows - 1) / 2]}>
          <boxGeometry args={[0.88, isBlocked ? 0.62 : 0.12, 0.88]} />
          <meshStandardMaterial color={isBlocked ? "#65746c" : isTarget ? "#52aa83" : "#d8e2dc"} emissive={isTarget ? "#1d6f50" : "#000000"} emissiveIntensity={isTarget ? 0.18 : 0} />
        </mesh>;
      })}
      <Explorer cell={position} rows={rows} cols={cols} />
    </Canvas>
  </div>;
}
