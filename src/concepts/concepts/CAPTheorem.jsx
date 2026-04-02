import { useState, useCallback } from 'react';

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
});

const INFO = {
  CP: {
    name: 'CP — Consistency + Partition Tolerance',
    sacrificed: 'Availability',
    explanation: 'The system refuses to respond rather than risk returning stale data during a network partition. Reads may block or fail until the partition heals.',
    examples: 'MongoDB (with majority write concern), HBase, Redis Cluster',
  },
  AP: {
    name: 'AP — Availability + Partition Tolerance',
    sacrificed: 'Consistency',
    explanation: 'The system always responds, even during partitions, but different nodes may return different (stale) values until they reconcile.',
    examples: 'Cassandra, DynamoDB, CouchDB',
  },
  CA: {
    name: 'CA — Consistency + Availability',
    sacrificed: 'Partition Tolerance',
    explanation: 'The system provides strong consistency and full availability but cannot survive a network partition. Only realistic for single-node or same-rack deployments.',
    examples: 'PostgreSQL (single node), MySQL (single node), SQLite',
  },
};

const LABELS = { C: 'Consistency', A: 'Availability', P: 'Partition\nTolerance' };

const cx = 160, cy = 50, r = 120;
const VERTICES = {
  C: { x: cx, y: cy },
  A: { x: cx - r * Math.sin(Math.PI / 3), y: cy + r + r * Math.cos(Math.PI / 3) - 20 },
  P: { x: cx + r * Math.sin(Math.PI / 3), y: cy + r + r * Math.cos(Math.PI / 3) - 20 },
};

const EDGES = [['C', 'A'], ['A', 'P'], ['C', 'P']];

function comboKey(sel) {
  const s = [...sel].sort().join('');
  if (s === 'AC') return 'CA';
  if (s === 'AP') return 'AP';
  if (s === 'CP') return 'CP';
  return null;
}

export default function CAPTheorem() {
  const [selected, setSelected] = useState([]);

  const handleClick = useCallback((letter) => {
    setSelected((prev) => {
      if (prev.includes(letter)) return prev.filter((l) => l !== letter);
      if (prev.length < 2) return [...prev, letter];
      return [prev[1], letter];
    });
  }, []);

  const selSet = new Set(selected);
  const key = selected.length === 2 ? comboKey(selSet) : null;
  const sacrificed = key ? ['C', 'A', 'P'].find((l) => !selSet.has(l)) : null;

  const isEdgeActive = (a, b) => selSet.has(a) && selSet.has(b);

  const wrap = {
    background: 'var(--bg-primary)', color: 'var(--text-primary)',
    fontFamily: "'Inter', sans-serif", padding: 24, borderRadius: 12,
    border: '1px solid var(--border-primary)', maxWidth: 420, margin: '0 auto',
  };

  return (
    <div style={wrap}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>CAP Theorem</h3>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-muted)' }}>
        Pick any two. Click vertices to select.
      </p>

      <svg width={320} height={240} viewBox="0 0 320 240" style={{ display: 'block', margin: '0 auto' }}>
        {EDGES.map(([a, b]) => {
          const active = isEdgeActive(a, b);
          return (
            <line key={a + b}
              x1={VERTICES[a].x} y1={VERTICES[a].y}
              x2={VERTICES[b].x} y2={VERTICES[b].y}
              stroke={active ? 'var(--text-accent)' : 'var(--bg-tertiary)'}
              strokeWidth={active ? 3 : 2}
              style={{ transition: 'stroke 300ms, stroke-width 300ms' }}
            />
          );
        })}

        {Object.entries(VERTICES).map(([letter, pos]) => {
          const isSelected = selSet.has(letter);
          const isDimmed = sacrificed === letter;
          const fill = isDimmed ? 'var(--color-critical)' : isSelected ? 'var(--text-accent)' : 'var(--bg-tertiary)';
          const textColor = isSelected || isDimmed ? 'var(--bg-primary)' : 'var(--text-secondary)';
          return (
            <g key={letter} onClick={() => handleClick(letter)} style={{ cursor: 'pointer' }}>
              <circle cx={pos.x} cy={pos.y} r={28} fill={fill}
                stroke={isSelected ? 'var(--text-accent)' : 'var(--border-primary)'}
                strokeWidth={2} style={{ transition: 'fill 300ms, stroke 300ms' }}
              />
              <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central"
                fontSize={16} fontWeight={700} fill={textColor}
                style={{ transition: 'fill 300ms', pointerEvents: 'none' }}
              >
                {letter}
              </text>
              {isDimmed && (
                <text x={pos.x + 20} y={pos.y - 18} fontSize={14} fill="var(--color-critical)"
                  fontWeight={700} style={{ pointerEvents: 'none' }}>
                  ✕
                </text>
              )}
              <text x={pos.x} y={pos.y + 44} textAnchor="middle" fontSize={10}
                fill={isDimmed ? 'var(--color-critical)' : 'var(--text-muted)'}
                style={{ transition: 'fill 300ms', pointerEvents: 'none' }}
              >
                {LABELS[letter].split('\n').map((line, i) => (
                  <tspan key={i} x={pos.x} dy={i === 0 ? 0 : 13}>{line}</tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>

      {key && INFO[key] && (
        <div style={{
          marginTop: 16, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8,
          border: '1px solid var(--border-primary)', transition: 'opacity 300ms', fontSize: 13,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-accent)', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
            {INFO[key].name}
          </div>
          <div style={{ color: 'var(--color-critical)', marginBottom: 6, fontSize: 12 }}>
            <strong>Sacrificed:</strong> {INFO[key].sacrificed} &mdash; {INFO[key].explanation}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Examples:</strong> {INFO[key].examples}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
        {['C', 'A', 'P'].map((l) => (
          <button key={l} style={toggleStyle(selSet.has(l))} onClick={() => handleClick(l)}>
            {LABELS[l].replace('\n', ' ')}
          </button>
        ))}
      </div>
    </div>
  );
}
