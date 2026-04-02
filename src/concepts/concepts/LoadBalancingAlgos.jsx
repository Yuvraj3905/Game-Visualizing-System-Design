import { useState, useRef, useEffect, useCallback } from 'react';

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
});

const ALGOS = ['Round-Robin', 'Least-Connections', 'Weighted'];
const SERVER_COLORS = ['#38bdf8', '#22c55e', '#f59e0b', '#a78bfa'];
const SVG_W = 400, SVG_H = 260;
const SRC_X = SVG_W / 2, SRC_Y = 30;
const SERVER_Y = 220;
const serverX = (i) => 60 + i * 95;

function initServers() {
  return [0, 1, 2, 3].map(i => ({
    id: i, label: `Server ${i + 1}`, connections: 0, processedCount: 0,
    weight: i === 0 ? 4 : i === 1 ? 2 : 1,
    processTime: i === 2 ? 1200 : 400,
    color: SERVER_COLORS[i],
  }));
}

let reqId = 0;

export default function LoadBalancingAlgos() {
  const [algo, setAlgo] = useState('Round-Robin');
  const [servers, setServers] = useState(initServers);
  const [requests, setRequests] = useState([]);
  const rrIndex = useRef(0);
  const weightedSeq = useRef([]);
  const rafRef = useRef(null);
  const intervalRef = useRef(null);
  const serversRef = useRef(servers);
  serversRef.current = servers;

  const pickServer = useCallback((srvs) => {
    if (algo === 'Round-Robin') {
      const idx = rrIndex.current % 4;
      rrIndex.current++;
      return idx;
    }
    if (algo === 'Least-Connections') {
      let min = Infinity, pick = 0;
      srvs.forEach((s, i) => { if (s.connections < min) { min = s.connections; pick = i; } });
      return pick;
    }
    if (weightedSeq.current.length === 0) {
      srvs.forEach((s, i) => { for (let w = 0; w < s.weight; w++) weightedSeq.current.push(i); });
    }
    return weightedSeq.current.shift();
  }, [algo]);

  const sendOne = useCallback(() => {
    const target = pickServer(serversRef.current);
    const id = ++reqId;
    const processTime = serversRef.current[target].processTime;
    setRequests(prev => [...prev, { id, target, progress: 0, active: true, startTime: performance.now(), processTime }]);
    setServers(prev => prev.map((s, i) => i === target ? { ...s, connections: s.connections + 1 } : s));
  }, [pickServer]);

  const sendBatch = () => {
    let count = 0;
    intervalRef.current = setInterval(() => {
      sendOne();
      count++;
      if (count >= 10) clearInterval(intervalRef.current);
    }, 200);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    cancelAnimationFrame(rafRef.current);
    rrIndex.current = 0;
    weightedSeq.current = [];
    reqId = 0;
    setServers(initServers());
    setRequests([]);
  };

  useEffect(() => {
    const animate = () => {
      const now = performance.now();
      setRequests(prev => {
        let changed = false;
        const next = prev.map(r => {
          if (!r.active) return r;
          const elapsed = now - r.startTime;
          const travelTime = 300;
          const totalTime = travelTime + r.processTime;
          const newProgress = Math.min(elapsed / totalTime, 1);
          if (newProgress !== r.progress) changed = true;
          return { ...r, progress: newProgress };
        });
        if (!changed) return prev;
        const completed = next.filter(r => r.active && r.progress >= 1);
        if (completed.length > 0) {
          setServers(srvs => {
            const updated = [...srvs];
            completed.forEach(r => {
              updated[r.target] = { ...updated[r.target], connections: Math.max(0, updated[r.target].connections - 1), processedCount: updated[r.target].processedCount + 1 };
            });
            return updated;
          });
        }
        return next.map(r => r.progress >= 1 ? { ...r, active: false } : r);
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(rafRef.current); clearInterval(intervalRef.current); };
  }, []);

  const maxProcessed = Math.max(1, ...servers.map(s => s.processedCount));

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: 20, borderRadius: 12, border: '1px solid var(--border-primary)', maxWidth: 440 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 16, color: 'var(--text-accent)' }}>Load Balancing Algorithms</h3>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {ALGOS.map(a => <button key={a} style={toggleStyle(algo === a)} onClick={() => { setAlgo(a); reset(); }}>{a}</button>)}
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button style={toggleStyle(false)} onClick={sendBatch}>Send 10 Requests</button>
        <button style={toggleStyle(false)} onClick={reset}>Reset</button>
      </div>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ maxWidth: SVG_W }}>
        <rect x={SRC_X - 40} y={5} width={80} height={30} rx={6} fill="var(--bg-secondary)" stroke="var(--border-primary)" />
        <text x={SRC_X} y={24} textAnchor="middle" fill="var(--text-secondary)" fontSize={10}>Traffic</text>
        {servers.map((s, i) => {
          const sx = serverX(i);
          return (
            <g key={s.id}>
              <line x1={SRC_X} y1={35} x2={sx} y2={SERVER_Y - 25} stroke="var(--bg-tertiary)" strokeWidth={1} strokeDasharray="4" />
              <rect x={sx - 38} y={SERVER_Y - 25} width={76} height={50} rx={6} fill="var(--bg-secondary)" stroke={s.color} strokeWidth={1.5} />
              <text x={sx} y={SERVER_Y - 6} textAnchor="middle" fill={s.color} fontSize={9} fontWeight={600}>{s.label}</text>
              <text x={sx} y={SERVER_Y + 8} textAnchor="middle" fill="var(--text-muted)" fontSize={8} fontFamily="'JetBrains Mono', monospace">
                conn: {s.connections}
              </text>
              <text x={sx} y={SERVER_Y + 19} textAnchor="middle" fill="var(--text-muted)" fontSize={8} fontFamily="'JetBrains Mono', monospace">
                done: {s.processedCount}
              </text>
            </g>
          );
        })}
        {requests.filter(r => r.active).map(r => {
          const tx = serverX(r.target);
          const x = SRC_X + (tx - SRC_X) * r.progress;
          const y = 35 + (SERVER_Y - 60) * r.progress;
          return <circle key={r.id} cx={x} cy={y} r={4} fill={servers[r.target].color} opacity={0.9} />;
        })}
      </svg>
      <div style={{ background: 'var(--bg-secondary)', padding: 10, borderRadius: 8, marginTop: 8 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Distribution</div>
        {servers.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ width: 60, fontSize: 10, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.label}</span>
            <div style={{ flex: 1, height: 12, background: 'var(--bg-tertiary)', borderRadius: 3 }}>
              <div style={{ width: `${(s.processedCount / maxProcessed) * 100}%`, height: '100%', background: s.color, borderRadius: 3, transition: 'width 200ms' }} />
            </div>
            <span style={{ width: 20, fontSize: 10, color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>{s.processedCount}</span>
          </div>
        ))}
      </div>
      {algo === 'Least-Connections' && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Server 3 is slow (1200ms vs 400ms) -- gets fewer connections</div>
      )}
      {algo === 'Weighted' && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Weights: S1=4, S2=2, S3=1, S4=1</div>
      )}
    </div>
  );
}
