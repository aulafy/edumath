export function PartPartWhole({ partA, partB }: { partA: number; partB: number }) {
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label={`Parte parte todo con ${partA} y ${partB}`} className="visual">
      <circle cx="160" cy="50" r="36" className="whole" />
      <text x="160" y="58" textAnchor="middle">?</text>
      <line x1="140" y1="82" x2="96" y2="126" className="axis" />
      <line x1="180" y1="82" x2="224" y2="126" className="axis" />
      <circle cx="86" cy="150" r="34" className="part" />
      <circle cx="234" cy="150" r="34" className="part" />
      <text x="86" y="158" textAnchor="middle">{partA}</text>
      <text x="234" y="158" textAnchor="middle">{partB}</text>
    </svg>
  );
}
