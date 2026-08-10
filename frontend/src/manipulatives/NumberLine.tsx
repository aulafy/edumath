export function NumberLine({ start, jumps, maximum }: { start: number; jumps: number[]; maximum: number }) {
  const scale = (value: number) => 30 + (value / maximum) * 300;
  let pos = start;
  return (
    <svg viewBox="0 0 360 150" role="img" aria-label={`Recta numerica que empieza en ${start}`} className="visual">
      <line x1="30" y1="108" x2="330" y2="108" className="axis" />
      {Array.from({ length: maximum + 1 }).map((_, value) => (
        <g key={value}>
          <line x1={scale(value)} y1="100" x2={scale(value)} y2="116" className="tick" />
          <text x={scale(value)} y="136" textAnchor="middle">{value}</text>
        </g>
      ))}
      {jumps.map((jump, index) => {
        const from = pos;
        pos += jump;
        const mid = (scale(from) + scale(pos)) / 2;
        return <path key={index} d={`M ${scale(from)} 92 Q ${mid} ${40 - index * 2} ${scale(pos)} 92`} className="jump" />;
      })}
      <circle cx={scale(start)} cy="108" r="7" className="dot primary" />
    </svg>
  );
}
