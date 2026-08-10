export function TenFrame({ filled, added }: { filled: number; added: number }) {
  return (
    <svg viewBox="0 0 260 120" role="img" aria-label={`Marco de diez con ${filled} y ${added}`} className="visual">
      {Array.from({ length: 10 }).map((_, index) => {
        const x = 12 + (index % 5) * 48;
        const y = 14 + Math.floor(index / 5) * 48;
        const active = index < filled + added;
        const first = index < filled;
        return <circle key={index} cx={x + 18} cy={y + 18} r="16" className={active ? (first ? "dot primary" : "dot secondary") : "dot empty"} />;
      })}
      {Array.from({ length: 10 }).map((_, index) => {
        const x = 12 + (index % 5) * 48;
        const y = 14 + Math.floor(index / 5) * 48;
        return <rect key={`cell-${index}`} x={x} y={y} width="36" height="36" rx="4" className="cell" />;
      })}
    </svg>
  );
}
