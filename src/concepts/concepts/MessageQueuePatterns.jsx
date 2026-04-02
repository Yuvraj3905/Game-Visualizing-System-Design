import { useState, useRef, useEffect, useCallback } from 'react';

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
});

const PATTERNS = ['Point-to-Point', 'Pub/Sub', 'Fan-Out'];
const GUARANTEES = { 'Point-to-Point': 'At-most-once per consumer', 'Pub/Sub': 'At-least-once to all subscribers', 'Fan-Out': 'At-least-once to all queues' };
const MSG_COLORS = ['#38bdf8', '#22c55e', '#f59e0b', '#a78bfa', '#ec4899', '#14b8a6'];
const SVG_W = 460, SVG_H = 200;
let msgId = 0;

function layoutFor(pattern) {
  if (pattern === 'Point-to-Point') {
    return { producers: [{ id: 'P1', x: 30, y: 100 }], queues: [{ id: 'Q', x: 200, y: 100, label: 'Queue' }], consumers: [{ id: 'C1', x: 380, y: 60 }, { id: 'C2', x: 380, y: 140 }] };
  }
  if (pattern === 'Pub/Sub') {
    return { producers: [{ id: 'P1', x: 30, y: 100 }], queues: [{ id: 'T', x: 200, y: 100, label: 'Topic' }], consumers: [{ id: 'S1', x: 380, y: 40 }, { id: 'S2', x: 380, y: 100 }, { id: 'S3', x: 380, y: 160 }] };
  }
  return { producers: [{ id: 'P1', x: 30, y: 60 }, { id: 'P2', x: 30, y: 140 }], queues: [{ id: 'X', x: 170, y: 100, label: 'Exchange' }, { id: 'Q1', x: 290, y: 60, label: 'Queue 1' }, { id: 'Q2', x: 290, y: 140, label: 'Queue 2' }], consumers: [{ id: 'C1', x: 410, y: 60 }, { id: 'C2', x: 410, y: 140 }] };
}

export default function MessageQueuePatterns() {
  const [pattern, setPattern] = useState('Point-to-Point');
  const [messages, setMessages] = useState([]);
  const [counts, setCounts] = useState({});
  const rafRef = useRef(null);
  const rrRef = useRef(0);
  const layout = layoutFor(pattern);

  const switchPattern = (p) => { setPattern(p); setMessages([]); setCounts({}); rrRef.current = 0; };

  const sendMessage = useCallback(() => {
    const color = MSG_COLORS[msgId % MSG_COLORS.length];
    const pIdx = layout.producers.length > 1 ? msgId % layout.producers.length : 0;
    const producer = layout.producers[pIdx];
    const queue = layout.queues[0];

    if (pattern === 'Point-to-Point') {
      const target = layout.consumers[rrRef.current % layout.consumers.length];
      rrRef.current++;
      msgId++;
      setMessages(prev => [...prev, { id: msgId, phase: 0, x: producer.x + 40, fromX: producer.x + 40, toX: queue.x - 30, toX2: target.x - 20, fromX2: queue.x + 30, y: producer.y, y2: target.y, color, target: target.id, active: true, start: performance.now() }]);
    } else if (pattern === 'Pub/Sub') {
      msgId++;
      layout.consumers.forEach(c => {
        setMessages(prev => [...prev, { id: msgId + c.id, phase: 0, x: producer.x + 40, fromX: producer.x + 40, toX: queue.x - 30, toX2: c.x - 20, fromX2: queue.x + 30, y: producer.y, y2: c.y, color, target: c.id, active: true, start: performance.now() }]);
      });
    } else {
      msgId++;
      const exchange = layout.queues[0];
      const q1 = layout.queues[1];
      const q2 = layout.queues[2];
      [q1, q2].forEach((q, qi) => {
        const consumer = layout.consumers[qi];
        setMessages(prev => [...prev, {
          id: msgId + q.id, phase: 0, x: producer.x + 40,
          fromX: producer.x + 40, toX: exchange.x - 30,
          midX: q.x - 30, fromMidX: exchange.x + 30, midY: q.y,
          toX2: consumer.x - 20, fromX2: q.x + 30,
          y: producer.y, y2: consumer.y, color, target: consumer.id, active: true, start: performance.now(),
          fanout: true,
        }]);
      });
    }
  }, [pattern, layout]);

  useEffect(() => {
    const animate = () => {
      const now = performance.now();
      setMessages(prev => {
        let completedTargets = [];
        const next = prev.map(m => {
          if (!m.active) return m;
          const elapsed = now - m.start;
          const phaseTime = 500;
          if (m.fanout) {
            if (m.phase === 0) {
              const t = Math.min(elapsed / phaseTime, 1);
              const x = m.fromX + (m.toX - m.fromX) * t;
              if (t >= 1) return { ...m, phase: 1, x, start: now };
              return { ...m, x };
            }
            if (m.phase === 1) {
              const t = Math.min(elapsed / phaseTime, 1);
              const x = m.fromMidX + (m.midX - m.fromMidX) * t;
              if (t >= 1) return { ...m, phase: 2, x, start: now };
              return { ...m, x };
            }
            const t = Math.min(elapsed / phaseTime, 1);
            const x = m.fromX2 + (m.toX2 - m.fromX2) * t;
            if (t >= 1) { completedTargets.push(m.target); return { ...m, x, active: false }; }
            return { ...m, x };
          }
          if (m.phase === 0) {
            const t = Math.min(elapsed / phaseTime, 1);
            const x = m.fromX + (m.toX - m.fromX) * t;
            if (t >= 1) return { ...m, phase: 1, x, start: now };
            return { ...m, x };
          }
          const t = Math.min(elapsed / phaseTime, 1);
          const x = m.fromX2 + (m.toX2 - m.fromX2) * t;
          if (t >= 1) { completedTargets.push(m.target); return { ...m, x, active: false }; }
          return { ...m, x };
        });
        if (completedTargets.length > 0) {
          setCounts(c => {
            const nc = { ...c };
            completedTargets.forEach(t => { nc[t] = (nc[t] || 0) + 1; });
            return nc;
          });
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const boxStyle = (fill) => ({ fill: fill || 'var(--bg-secondary)', stroke: 'var(--border-primary)', strokeWidth: 1.5, rx: 6 });

  const getMsgY = (m) => {
    if (m.fanout) {
      if (m.phase === 0) return m.y;
      if (m.phase === 1) { const t = (m.x - m.fromMidX) / (m.midX - m.fromMidX || 1); return m.y + (m.midY - m.y) * t; }
      return m.y2;
    }
    return m.phase === 0 ? m.y : m.y + (m.y2 - m.y) * ((m.x - m.fromX2) / (m.toX2 - m.fromX2 || 1));
  };

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: 20, borderRadius: 12, border: '1px solid var(--border-primary)', maxWidth: 500 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 16, color: 'var(--text-accent)' }}>Message Queue Patterns</h3>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {PATTERNS.map(p => <button key={p} style={toggleStyle(pattern === p)} onClick={() => switchPattern(p)}>{p}</button>)}
      </div>
      <button style={{ ...toggleStyle(false), marginBottom: 12 }} onClick={sendMessage}>Send Message</button>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ maxWidth: SVG_W }}>
        {layout.queues.map(q => layout.consumers.map(c => (
          <line key={`${q.id}-${c.id}`} x1={q.x + 30} y1={q.y} x2={c.x - 20} y2={c.y} stroke="var(--bg-tertiary)" strokeWidth={1} strokeDasharray="4" />
        )))}
        {layout.producers.map(p => (
          <line key={`p-${p.id}`} x1={p.x + 40} y1={p.y} x2={layout.queues[0].x - 30} y2={layout.queues[0].y} stroke="var(--bg-tertiary)" strokeWidth={1} strokeDasharray="4" />
        ))}
        {pattern === 'Fan-Out' && layout.queues.slice(1).map(q => (
          <line key={`x-${q.id}`} x1={layout.queues[0].x + 30} y1={layout.queues[0].y} x2={q.x - 30} y2={q.y} stroke="var(--bg-tertiary)" strokeWidth={1} strokeDasharray="4" />
        ))}
        {layout.producers.map(p => (
          <g key={p.id}>
            <rect x={p.x - 20} y={p.y - 18} width={50} height={36} {...boxStyle()} />
            <text x={p.x + 5} y={p.y + 4} textAnchor="middle" fill="var(--color-info)" fontSize={10} fontWeight={600}>{p.id}</text>
          </g>
        ))}
        {layout.queues.map(q => (
          <g key={q.id}>
            <rect x={q.x - 30} y={q.y - 18} width={60} height={36} {...boxStyle('#1a2744')} />
            <text x={q.x} y={q.y + 4} textAnchor="middle" fill="var(--text-accent)" fontSize={9} fontWeight={600}>{q.label}</text>
          </g>
        ))}
        {layout.consumers.map(c => (
          <g key={c.id}>
            <rect x={c.x - 20} y={c.y - 18} width={55} height={36} {...boxStyle()} />
            <text x={c.x + 7} y={c.y - 2} textAnchor="middle" fill="var(--color-healthy)" fontSize={9} fontWeight={600}>{c.id}</text>
            <text x={c.x + 7} y={c.y + 12} textAnchor="middle" fill="var(--text-muted)" fontSize={8} fontFamily="'JetBrains Mono', monospace">{counts[c.id] || 0}</text>
          </g>
        ))}
        {messages.filter(m => m.active).map(m => (
          <rect key={m.id} x={m.x - 5} y={getMsgY(m) - 4} width={10} height={8} rx={2} fill={m.color} opacity={0.9} />
        ))}
      </svg>
      <div style={{ background: 'var(--bg-secondary)', padding: 8, borderRadius: 6, marginTop: 8, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)' }}>
        Delivery: {GUARANTEES[pattern]}
      </div>
    </div>
  );
}
