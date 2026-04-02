import { useState, useCallback } from 'react';

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
});

const COLORS = ['#38bdf8', '#22c55e', '#f59e0b', '#ef4444', '#a78bfa', '#ec4899', '#14b8a6', '#f97316'];
const R = 120, CX = 180, CY = 180;

function angleToXY(deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

function assignKeys(keys, servers) {
  if (servers.length === 0) return keys.map(k => ({ ...k, assignedTo: null }));
  const sorted = [...servers].sort((a, b) => a.angle - b.angle);
  return keys.map(k => {
    let assigned = sorted[0];
    for (const s of sorted) {
      if (s.angle >= k.hash) { assigned = s; break; }
    }
    return { ...k, assignedTo: assigned.id };
  });
}

function naiveMoves(keyCount, oldCount, newCount) {
  if (oldCount === 0 || newCount === 0) return keyCount;
  let moved = 0;
  for (let i = 0; i < keyCount; i++) {
    if (i % oldCount !== i % newCount) moved++;
  }
  return moved;
}

let nextServerId = 4;
let nextKeyId = 13;

function initServers() {
  return [0, 1, 2].map(i => ({ id: i + 1, angle: i * 120 + 30, label: `S${i + 1}`, color: COLORS[i] }));
}

function initKeys() {
  return Array.from({ length: 12 }, (_, i) => ({ id: i + 1, hash: Math.round(Math.random() * 359) }));
}

export default function ConsistentHashing() {
  const [servers, setServers] = useState(initServers);
  const [rawKeys, setRawKeys] = useState(initKeys);
  const [moveInfo, setMoveInfo] = useState(null);

  const keys = assignKeys(rawKeys, servers);

  const getServerColor = useCallback((sid) => {
    const s = servers.find(sv => sv.id === sid);
    return s ? s.color : 'var(--text-muted)';
  }, [servers]);

  const addServer = () => {
    const angle = Math.round(Math.random() * 359);
    const color = COLORS[(nextServerId - 1) % COLORS.length];
    const newServer = { id: nextServerId, angle, label: `S${nextServerId}`, color };
    nextServerId++;
    const oldKeys = assignKeys(rawKeys, servers);
    const newServers = [...servers, newServer];
    const newKeys = assignKeys(rawKeys, newServers);
    const moved = oldKeys.filter((k, i) => k.assignedTo !== newKeys[i].assignedTo).length;
    const naive = naiveMoves(rawKeys.length, servers.length, newServers.length);
    setServers(newServers);
    setMoveInfo({ consistent: moved, naive, total: rawKeys.length });
  };

  const removeServer = (sid) => {
    if (servers.length <= 1) return;
    const oldKeys = assignKeys(rawKeys, servers);
    const newServers = servers.filter(s => s.id !== sid);
    const newKeys = assignKeys(rawKeys, newServers);
    const moved = oldKeys.filter((k, i) => k.assignedTo !== newKeys[i].assignedTo).length;
    const naive = naiveMoves(rawKeys.length, servers.length, newServers.length);
    setServers(newServers);
    setMoveInfo({ consistent: moved, naive, total: rawKeys.length });
  };

  const addKey = () => {
    const nk = { id: nextKeyId++, hash: Math.round(Math.random() * 359) };
    setRawKeys(prev => [...prev, nk]);
  };

  const bar = (label, value, max, color) => (
    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
      <span style={{ width: 90, fontSize: 11, color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
      <div style={{ flex: 1, height: 16, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${max ? (value / max) * 100 : 0}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 300ms' }} />
      </div>
      <span style={{ width: 30, fontSize: 11, textAlign: 'right', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: 20, borderRadius: 12, border: '1px solid var(--border-primary)', maxWidth: 420 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 16, color: 'var(--text-accent)' }}>Consistent Hashing Ring</h3>
      <svg viewBox="0 0 360 360" width="100%" style={{ maxWidth: 360 }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--bg-tertiary)" strokeWidth={2} />
        {keys.map(k => {
          const pos = angleToXY(k.hash);
          return (
            <circle key={`k-${k.id}`} cx={pos.x} cy={pos.y} r={4} fill={getServerColor(k.assignedTo)}
              style={{ transition: 'cx 400ms, cy 400ms, fill 400ms' }} />
          );
        })}
        {servers.map(s => {
          const pos = angleToXY(s.angle);
          return (
            <g key={`s-${s.id}`} onClick={() => removeServer(s.id)} style={{ cursor: 'pointer' }}>
              <circle cx={pos.x} cy={pos.y} r={12} fill={s.color} stroke="var(--bg-primary)" strokeWidth={2} />
              <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central"
                fill="var(--bg-primary)" fontSize={8} fontWeight={700}>{s.label}</text>
            </g>
          );
        })}
        <text x={CX} y={CY - 8} textAnchor="middle" fill="var(--text-muted)" fontSize={11}>
          {servers.length} servers
        </text>
        <text x={CX} y={CY + 8} textAnchor="middle" fill="var(--text-muted)" fontSize={11}>
          {keys.length} keys
        </text>
      </svg>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <button style={toggleStyle(false)} onClick={addServer}>Add Server</button>
        <button style={toggleStyle(false)} onClick={addKey}>Add Key</button>
      </div>
      {moveInfo && (
        <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
            Key redistribution ({moveInfo.total} keys)
          </div>
          {bar('Consistent', moveInfo.consistent, moveInfo.total, 'var(--color-healthy)')}
          {bar('Naive mod-N', moveInfo.naive, moveInfo.total, 'var(--color-critical)')}
        </div>
      )}
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click a server node to remove it</div>
    </div>
  );
}
