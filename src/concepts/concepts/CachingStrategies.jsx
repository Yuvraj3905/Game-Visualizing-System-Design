import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
});

const STRATEGIES = {
  'Write-Through': {
    read: (hit) => hit
      ? [{ from: 0, to: 1, label: '1. Check cache', ms: 5 }, { from: 1, to: 0, label: '2. Cache HIT', ms: 2 }]
      : [{ from: 0, to: 1, label: '1. Check cache', ms: 5 }, { from: 1, to: 2, label: '2. Cache MISS → DB', ms: 40 },
         { from: 2, to: 1, label: '3. Store in cache', ms: 5 }, { from: 1, to: 0, label: '4. Return', ms: 2 }],
    write: () => [{ from: 0, to: 1, label: '1. Write to cache', ms: 5 }, { from: 1, to: 2, label: '2. Write to DB (sync)', ms: 40 },
      { from: 2, to: 1, label: '3. DB ack', ms: 2 }, { from: 1, to: 0, label: '4. Ack client', ms: 2 }],
    summary: { consistency: 'Strong', latency: 'Higher writes (sync DB)', risk: 'Write latency bottleneck' },
  },
  'Write-Behind': {
    read: (hit) => hit
      ? [{ from: 0, to: 1, label: '1. Check cache', ms: 5 }, { from: 1, to: 0, label: '2. Cache HIT', ms: 2 }]
      : [{ from: 0, to: 1, label: '1. Check cache', ms: 5 }, { from: 1, to: 2, label: '2. Cache MISS → DB', ms: 40 },
         { from: 2, to: 1, label: '3. Store in cache', ms: 5 }, { from: 1, to: 0, label: '4. Return', ms: 2 }],
    write: () => [{ from: 0, to: 1, label: '1. Write to cache', ms: 5 }, { from: 1, to: 0, label: '2. Ack fast!', ms: 2 },
      { from: 1, to: 2, label: '3. Async flush → DB', ms: 40, async: true }],
    summary: { consistency: 'Eventual', latency: 'Low writes (async)', risk: 'Data loss if cache crashes before flush' },
  },
  'Cache-Aside': {
    read: (hit) => hit
      ? [{ from: 0, to: 1, label: '1. Check cache', ms: 5 }, { from: 1, to: 0, label: '2. Cache HIT', ms: 2 }]
      : [{ from: 0, to: 1, label: '1. Check cache', ms: 5 }, { from: 1, to: 0, label: '2. Cache MISS', ms: 2 },
         { from: 0, to: 2, label: '3. Client reads DB', ms: 40 }, { from: 2, to: 0, label: '4. DB returns', ms: 2 },
         { from: 0, to: 1, label: '5. Client stores cache', ms: 5 }],
    write: () => [{ from: 0, to: 2, label: '1. Write to DB', ms: 40 }, { from: 2, to: 0, label: '2. DB ack', ms: 2 },
      { from: 0, to: 1, label: '3. Invalidate cache', ms: 5 }],
    summary: { consistency: 'Read-your-writes', latency: 'Low reads (after warm)', risk: 'Stale reads if invalidation fails' },
  },
};

const BOXES = [
  { id: 0, label: 'Client', x: 30 },
  { id: 1, label: 'Cache', x: 175 },
  { id: 2, label: 'Database', x: 320 },
];

const BOX_W = 80, BOX_H = 44, BOX_Y = 30;

function arrowCoords(fromId, toId) {
  const f = BOXES[fromId], t = BOXES[toId];
  const fx = f.x + BOX_W / 2, tx = t.x + BOX_W / 2;
  const y = BOX_Y + BOX_H / 2;
  return { x1: fx, y1: y, x2: tx, y2: y };
}

export default function CachingStrategies() {
  const [strategy, setStrategy] = useState('Write-Through');
  const [operation, setOperation] = useState(null);
  const [step, setStep] = useState(-1);
  const [cacheHit, setCacheHit] = useState(false);
  const [totalMs, setTotalMs] = useState(0);
  const timerRef = useRef(null);

  const steps = useMemo(() => operation ? STRATEGIES[strategy][operation](cacheHit) : [], [operation, strategy, cacheHit]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (operation === null || step < 0) return;
    if (step >= steps.length) {
      timerRef.current = setTimeout(() => {
        if (operation === 'read' && !cacheHit) setCacheHit(true);
        setOperation(null);
        setStep(-1);
      }, 600);
      return;
    }
    timerRef.current = setTimeout(() => {
      setTotalMs((p) => p + steps[step].ms);
      setStep((s) => s + 1);
    }, 600);
  }, [step, operation, steps, cacheHit]);

  const startOp = useCallback((op) => {
    if (operation !== null) return;
    setTotalMs(0);
    setOperation(op);
    setStep(0);
  }, [operation]);

  const changeStrategy = useCallback((s) => {
    setStrategy(s);
    setOperation(null);
    setStep(-1);
    setCacheHit(false);
    setTotalMs(0);
  }, []);

  const wrap = {
    background: 'var(--bg-primary)', color: 'var(--text-primary)',
    fontFamily: "'Inter', sans-serif", padding: 24, borderRadius: 12,
    border: '1px solid var(--border-primary)', maxWidth: 480, margin: '0 auto',
  };

  const info = STRATEGIES[strategy].summary;
  const activeStep = step >= 0 && step < steps.length ? steps[step] : null;

  return (
    <div style={wrap}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Caching Strategies</h3>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-muted)' }}>
        Select a strategy, then trigger Read or Write.
        {cacheHit && <span style={{ color: 'var(--color-healthy)', marginLeft: 6 }}>Cache warm — next read is a HIT</span>}
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {Object.keys(STRATEGIES).map((s) => (
          <button key={s} style={toggleStyle(strategy === s)} onClick={() => changeStrategy(s)}>{s}</button>
        ))}
      </div>

      <svg width={430} height={140} viewBox="0 0 430 140" style={{ display: 'block', margin: '0 auto 12px' }}>
        <defs>
          <marker id="ah" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="var(--text-muted)" />
          </marker>
        </defs>

        {BOXES.map((b) => (
          <g key={b.id}>
            <rect x={b.x} y={BOX_Y} width={BOX_W} height={BOX_H} rx={8}
              fill={activeStep && (activeStep.from === b.id || activeStep.to === b.id) ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'}
              stroke={activeStep && activeStep.to === b.id ? 'var(--text-accent)' : 'var(--border-primary)'}
              strokeWidth={activeStep && activeStep.to === b.id ? 2 : 1}
              style={{ transition: 'fill 200ms, stroke 200ms' }}
            />
            <text x={b.x + BOX_W / 2} y={BOX_Y + BOX_H / 2 + 1} textAnchor="middle" dominantBaseline="central"
              fontSize={12} fontWeight={600} fill="var(--text-primary)">{b.label}</text>
          </g>
        ))}

        {step >= 0 && steps.slice(0, step + 1).map((s, i) => {
          const c = arrowCoords(s.from, s.to);
          const yOff = 88 + i * 14;
          const isCurrent = i === step && step < steps.length;
          return (
            <g key={i}>
              <line x1={c.x1} y1={BOX_Y + BOX_H + 4} x2={c.x2} y2={BOX_Y + BOX_H + 4}
                stroke={isCurrent ? 'var(--text-accent)' : 'var(--text-muted)'}
                strokeWidth={isCurrent ? 2 : 1} markerEnd="url(#ah)"
                strokeDasharray={s.async ? '4 3' : 'none'}
                style={{ opacity: isCurrent ? 1 : 0.4, transition: 'opacity 300ms' }}
              />
              <text x={215} y={yOff} textAnchor="middle" fontSize={10}
                fontFamily="'JetBrains Mono', monospace"
                fill={isCurrent ? 'var(--text-accent)' : 'var(--text-muted)'}
              >
                {s.label} ({s.ms}ms){s.async ? ' [async]' : ''}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
        <button style={{ ...toggleStyle(operation === 'read'), opacity: operation !== null ? 0.5 : 1 }}
          onClick={() => startOp('read')} disabled={operation !== null}>
          Read
        </button>
        <button style={{ ...toggleStyle(operation === 'write'), opacity: operation !== null ? 0.5 : 1 }}
          onClick={() => startOp('write')} disabled={operation !== null}>
          Write
        </button>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--text-accent)',
          display: 'flex', alignItems: 'center', marginLeft: 8,
        }}>
          {totalMs}ms total
        </div>
      </div>

      <div style={{
        padding: 14, background: 'var(--bg-secondary)', borderRadius: 8,
        border: '1px solid var(--border-primary)', fontSize: 12, display: 'flex', gap: 16,
      }}>
        {[
          ['Consistency', info.consistency, 'var(--color-info)'],
          ['Latency', info.latency, 'var(--color-warning)'],
          ['Risk', info.risk, 'var(--color-critical)'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color, marginBottom: 2, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>{label}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
