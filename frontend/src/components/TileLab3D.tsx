import { Canvas } from "@react-three/fiber";

export type TileCell = { row: number; col: number };

function TileGrid({ rows, cols, cells, onToggle }: { rows: number; cols: number; cells: TileCell[]; onToggle: (cell: TileCell) => void }) {
  const selected = new Set(cells.map((cell) => `${cell.row}:${cell.col}`));
  const offsetX = (cols - 1) / 2;
  const offsetZ = (rows - 1) / 2;
  return <group rotation={[0, -0.12, 0]}>
    {Array.from({ length: rows * cols }, (_, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const active = selected.has(`${row}:${col}`);
      return <mesh key={`${row}:${col}`} position={[col - offsetX, active ? 0.18 : 0, row - offsetZ]} onClick={(event) => { event.stopPropagation(); onToggle({ row, col }); }}>
        <boxGeometry args={[0.88, active ? 0.36 : 0.08, 0.88]} />
        <meshStandardMaterial color={active ? "#ef7658" : "#d6e8df"} roughness={0.48} metalness={0.05} />
      </mesh>;
    })}
  </group>;
}

export function TileLab3D({ rows, cols, cells, onToggle }: { rows: number; cols: number; cells: TileCell[]; onToggle: (cell: TileCell) => void }) {
  const distance = Math.max(rows, cols) * 1.4;
  return <div className="tileLabScene" role="group" aria-label={`Mosaico de ${rows} filas y ${cols} columnas con ${cells.length} casillas seleccionadas`}>
    <Canvas orthographic camera={{ position: [distance * 0.65, distance, distance * 0.8], zoom: Math.max(48, 82 - Math.max(rows, cols) * 5) }} dpr={[1, 2]}>
      <color attach="background" args={["#edf7f2"]} />
      <ambientLight intensity={1.7} />
      <directionalLight position={[4, 7, 5]} intensity={3.2} color="#fff2ca" />
      <TileGrid rows={rows} cols={cols} cells={cells} onToggle={onToggle} />
    </Canvas>
  </div>;
}
