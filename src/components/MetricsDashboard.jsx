import { X, TrendingUp } from 'lucide-react';
import useGameStore from '../store/useGameStore';

const CHARTS = [
  { key: 'rps', label: 'RPS', color: '#3b82f6', unit: '' },
  { key: 'latency', label: 'Latency', color: '#f59e0b', unit: 'ms' },
  { key: 'health', label: 'Health', color: '#22c55e', unit: '%' },
];

const W = 280;
const H = 80;
const PAD = 4;

function MiniChart({ data, dataKey, color, label, unit }) {
  if (data.length < 2) return null;

  const values = data.map(d => d[dataKey]);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const current = values[values.length - 1];

  const points = values.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return `${x},${y}`;
  }).join(' ');

  // Fill area
  const firstX = PAD;
  const lastX = PAD + ((data.length - 1) / (data.length - 1)) * (W - PAD * 2);
  const fillPoints = `${firstX},${H - PAD} ${points} ${lastX},${H - PAD}`;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          {label}
        </span>
        <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color }}>
          {current.toLocaleString()}{unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', borderRadius: 6, background: 'var(--bg-primary)' }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1={PAD} y1={PAD + f * (H - PAD * 2)} x2={W - PAD} y2={PAD + f * (H - PAD * 2)}
            stroke="var(--border-primary)" strokeWidth={0.5} />
        ))}
        {/* Fill */}
        <polygon points={fillPoints} fill={color} fillOpacity={0.08} />
        {/* Line */}
        <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        {/* Current dot */}
        {values.length > 0 && (() => {
          const lastVal = values[values.length - 1];
          const cx = PAD + ((values.length - 1) / (data.length - 1)) * (W - PAD * 2);
          const cy = H - PAD - ((lastVal - min) / range) * (H - PAD * 2);
          return <circle cx={cx} cy={cy} r={3} fill={color} />;
        })()}
        {/* Min/Max labels */}
        <text x={W - PAD} y={PAD + 8} textAnchor="end" fontSize={8} fill="var(--text-muted)" fontFamily="'JetBrains Mono', monospace">
          {Math.round(max)}{unit}
        </text>
        <text x={W - PAD} y={H - PAD - 2} textAnchor="end" fontSize={8} fill="var(--text-muted)" fontFamily="'JetBrains Mono', monospace">
          {Math.round(min)}{unit}
        </text>
      </svg>
    </div>
  );
}

export default function MetricsDashboard() {
  const showMetricsDashboard = useGameStore(s => s.showMetricsDashboard);
  const toggleMetricsDashboard = useGameStore(s => s.toggleMetricsDashboard);
  const metricsHistory = useGameStore(s => s.metricsHistory);
  const gameStatus = useGameStore(s => s.gameStatus);

  if (!showMetricsDashboard) return null;

  const elapsed = metricsHistory.length > 0 ? Math.round(metricsHistory.length * 0.5) : 0;

  return (
    <div style={{
      position: 'absolute',
      top: 80,
      right: 12,
      zIndex: 15,
      width: 300,
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-primary)',
      borderRadius: 14,
      padding: '14px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={14} style={{ color: 'var(--text-accent)' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Live Metrics</span>
          {gameStatus === 'playing' && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: 'var(--color-healthy)',
              animation: 'pulse-glow 2s ease-in-out infinite',
            }} />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
            {elapsed}s
          </span>
          <button
            onClick={toggleMetricsDashboard}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, display: 'flex' }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Charts */}
      {metricsHistory.length < 2 ? (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
          Waiting for data...
        </p>
      ) : (
        CHARTS.map(c => (
          <MiniChart key={c.key} data={metricsHistory} dataKey={c.key} color={c.color} label={c.label} unit={c.unit} />
        ))
      )}
    </div>
  );
}
