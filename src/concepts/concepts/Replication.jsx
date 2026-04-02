import { useState, useEffect, useCallback, useRef } from 'react';

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
});

const MODES = {
  'Leader-Follower': {
    nodes: [
      { id: 0, label: 'Leader', role: 'leader', x: 160, y: 20 },
      { id: 1, label: 'Follower 1', role: 'follower', x: 40, y: 120 },
      { id: 2, label: 'Follower 2', role: 'follower', x: 160, y: 120 },
      { id: 3, label: 'Follower 3', role: 'follower', x: 280, y: 120 },
    ],
    edges: [[0, 1], [0, 2], [0, 3]],
    writeTarget: 0,
    failover: 'One follower promotes to leader after detecting timeout. Brief downtime during election (~1-5s).',
    info: { consistency: 'Strong (reads from leader)', availability: 'Brief downtime on leader failure', conflicts: 'None — single write point' },
  },
  'Multi-Leader': {
    nodes: [
      { id: 0, label: 'Leader A', role: 'leader', x: 80, y: 20 },
      { id: 1, label: 'Leader B', role: 'leader', x: 240, y: 20 },
      { id: 2, label: 'Follower 1', role: 'follower', x: 80, y: 120 },
      { id: 3, label: 'Follower 2', role: 'follower', x: 240, y: 120 },
    ],
    edges: [[0, 1], [0, 2], [1, 3], [1, 0]],
    writeTarget: 0,
    failover: 'Other leader continues accepting writes with zero downtime. Followers re-route to surviving leader.',
    info: { consistency: 'Eventual (async cross-leader sync)', availability: 'High — other leader takes over', conflicts: 'Possible — needs conflict resolution (LWW, merge)' },
  },
  'Leaderless': {
    nodes: [
      { id: 0, label: 'Peer A', role: 'peer', x: 160, y: 20 },
      { id: 1, label: 'Peer B', role: 'peer', x: 40, y: 120 },
      { id: 2, label: 'Peer C', role: 'peer', x: 280, y: 120 },
    ],
    edges: [[0, 1], [0, 2], [1, 2]],
    writeTarget: null,
    failover: 'Quorum still met: 2 of 3 peers ack the write. System continues without any failover needed.',
    info: { consistency: 'Tunable (quorum R+W > N)', availability: 'High — no single point of failure', conflicts: 'Resolved via vector clocks or read-repair' },
  },
};

const NODE_W = 90, NODE_H = 40;

export default function Replication() {
  const [mode, setMode] = useState('Leader-Follower');
  const [leaderDead, setLeaderDead] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [step, setStep] = useState(-1);
  const [promoted, setPromoted] = useState(-1);
  const timerRef = useRef(null);

  const cfg = MODES[mode];

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const resetState = useCallback(() => {
    clearTimeout(timerRef.current);
    setLeaderDead(false);
    setAnimating(false);
    setStep(-1);
    setPromoted(-1);
  }, []);

  const changeMode = useCallback((m) => {
    resetState();
    setMode(m);
  }, [resetState]);

  const handleWrite = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setStep(0);
    timerRef.current = setTimeout(() => {
      setStep(1);
      timerRef.current = setTimeout(() => {
        setStep(2);
        timerRef.current = setTimeout(() => {
          setAnimating(false);
          setStep(-1);
        }, 800);
      }, 600);
    }, 600);
  }, [animating]);

  const handleKill = useCallback(() => {
    if (animating) return;
    setLeaderDead(true);
    setAnimating(true);
    setStep(10);
    timerRef.current = setTimeout(() => {
      setStep(11);
      if (mode === 'Leader-Follower') {
        timerRef.current = setTimeout(() => {
          setPromoted(1);
          setStep(12);
          timerRef.current = setTimeout(() => { setAnimating(false); }, 800);
        }, 1200);
      } else {
        timerRef.current = setTimeout(() => { setAnimating(false); setStep(12); }, 800);
      }
    }, 600);
  }, [animating, mode]);

  const isNodeDead = (node) => {
    if (!leaderDead) return false;
    if (mode === 'Leader-Follower') return node.id === 0;
    if (mode === 'Multi-Leader') return node.id === 0;
    return node.id === 0;
  };

  const isPromoted = (node) => promoted === node.id;

  const nodeColor = (node) => {
    if (isNodeDead(node)) return 'var(--color-critical)';
    if (isPromoted(node)) return 'var(--text-accent)';
    if (node.role === 'leader') return 'var(--text-accent)';
    if (node.role === 'peer') return 'var(--color-info)';
    return 'var(--bg-tertiary)';
  };

  const edgeActive = (fromId, toId) => {
    if (step === 1 || step === 2) {
      if (mode === 'Leaderless') return true;
      return cfg.edges.some(([a, b]) => a === fromId && b === toId);
    }
    return false;
  };

  const wrap = {
    background: 'var(--bg-primary)', color: 'var(--text-primary)',
    fontFamily: "'Inter', sans-serif", padding: 24, borderRadius: 12,
    border: '1px solid var(--border-primary)', maxWidth: 440, margin: '0 auto',
  };

  const statusText = () => {
    if (step === 0) return 'Sending write...';
    if (step === 1) return 'Replicating to nodes...';
    if (step === 2) {
      if (mode === 'Leaderless') return 'Quorum: 3 of 3 acks — success';
      return 'All replicas updated';
    }
    if (step === 10) return 'Leader failure detected!';
    if (step === 11 && mode === 'Leader-Follower') return 'Electing new leader... (downtime)';
    if (step === 11) return mode === 'Multi-Leader' ? 'Other leader continues — no downtime' : 'Quorum check: 2 of 3 alive — OK';
    if (step === 12 && mode === 'Leader-Follower') return 'Follower 1 promoted to leader';
    if (step === 12 && mode === 'Multi-Leader') return 'Writes routed to Leader B';
    if (step === 12 && mode === 'Leaderless') return '2 of 3 peers ack — write succeeds';
    if (leaderDead) return cfg.failover;
    return 'Ready — click Write Data or Kill Leader';
  };

  return (
    <div style={wrap}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Replication Modes</h3>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-muted)' }}>
        Choose a mode. Write data or kill the leader to see behavior.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {Object.keys(MODES).map((m) => (
          <button key={m} style={toggleStyle(mode === m)} onClick={() => changeMode(m)}>{m}</button>
        ))}
      </div>

      <svg width={380} height={180} viewBox="0 0 380 180" style={{ display: 'block', margin: '0 auto 8px' }}>
        {cfg.edges.map(([a, b]) => {
          const fa = cfg.nodes[a], fb = cfg.nodes[b];
          const active = edgeActive(a, b);
          return (
            <line key={`${a}-${b}`}
              x1={fa.x + NODE_W / 2} y1={fa.y + NODE_H}
              x2={fb.x + NODE_W / 2} y2={fb.y}
              stroke={active ? 'var(--text-accent)' : 'var(--border-primary)'}
              strokeWidth={active ? 2.5 : 1}
              strokeDasharray={active ? 'none' : '4 3'}
              style={{ transition: 'stroke 300ms, stroke-width 300ms' }}
            />
          );
        })}

        {cfg.nodes.map((node) => {
          const dead = isNodeDead(node);
          return (
            <g key={node.id}>
              <rect x={node.x} y={node.y} width={NODE_W} height={NODE_H} rx={8}
                fill={dead ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'}
                stroke={nodeColor(node)} strokeWidth={2}
                opacity={dead ? 0.4 : 1}
                style={{ transition: 'stroke 300ms, opacity 300ms, fill 300ms' }}
              />
              <text x={node.x + NODE_W / 2} y={node.y + NODE_H / 2 + 1}
                textAnchor="middle" dominantBaseline="central"
                fontSize={11} fontWeight={600}
                fill={dead ? 'var(--text-muted)' : 'var(--text-primary)'}
                style={{ transition: 'fill 300ms' }}
              >
                {isPromoted(node) ? 'NEW Leader' : node.label}
              </text>
              {dead && (
                <text x={node.x + NODE_W / 2} y={node.y + NODE_H / 2}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={22} fill="var(--color-critical)" style={{ pointerEvents: 'none' }}>
                  X
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div style={{
        textAlign: 'center', fontSize: 12, marginBottom: 12, minHeight: 18,
        fontFamily: "'JetBrains Mono', monospace",
        color: step >= 10 ? 'var(--color-warning)' : step >= 0 ? 'var(--text-accent)' : 'var(--text-muted)',
        transition: 'color 300ms',
      }}>
        {statusText()}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
        <button style={{ ...toggleStyle(false), opacity: animating ? 0.5 : 1 }}
          onClick={handleWrite} disabled={animating}>
          Write Data
        </button>
        <button style={{ ...toggleStyle(false), background: leaderDead ? 'var(--color-critical)' : undefined,
          color: leaderDead ? '#fff' : undefined, opacity: animating || leaderDead ? 0.5 : 1 }}
          onClick={handleKill} disabled={animating || leaderDead}>
          Kill Leader
        </button>
        {leaderDead && (
          <button style={toggleStyle(false)} onClick={resetState}>Reset</button>
        )}
      </div>

      <div style={{
        padding: 14, background: 'var(--bg-secondary)', borderRadius: 8,
        border: '1px solid var(--border-primary)', fontSize: 12, display: 'flex', gap: 16,
      }}>
        {[
          ['Consistency', cfg.info.consistency, 'var(--color-info)'],
          ['Availability', cfg.info.availability, 'var(--color-healthy)'],
          ['Conflicts', cfg.info.conflicts, 'var(--color-warning)'],
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
