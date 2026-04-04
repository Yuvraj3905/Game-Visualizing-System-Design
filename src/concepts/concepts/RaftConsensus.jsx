import { useState, useCallback, useRef, useEffect } from 'react';

const INITIAL_NODES = [
  { id: 'N1', role: 'leader',   term: 1, log: 3, dead: false },
  { id: 'N2', role: 'follower', term: 1, log: 3, dead: false },
  { id: 'N3', role: 'follower', term: 1, log: 3, dead: false },
  { id: 'N4', role: 'follower', term: 1, log: 3, dead: false },
  { id: 'N5', role: 'follower', term: 1, log: 3, dead: false },
];

// Positions for 5 nodes: leader top-center, followers in a row below
const NODE_POSITIONS = {
  N1: { x: 200, y: 20  },
  N2: { x: 30,  y: 130 },
  N3: { x: 110, y: 130 },
  N4: { x: 190, y: 130 },
  N5: { x: 270, y: 130 },
};
const NODE_W = 80, NODE_H = 68;

function roleColor(role, dead) {
  if (dead) return 'var(--text-muted)';
  if (role === 'leader')    return 'var(--color-healthy)';
  if (role === 'candidate') return 'var(--color-warning)';
  return 'var(--color-info)';
}

function roleLabel(role) {
  if (role === 'leader')    return 'LEADER';
  if (role === 'candidate') return 'CANDIDATE';
  if (role === 'follower')  return 'FOLLOWER';
  return 'DEAD';
}

function btnStyle(variant = 'default') {
  const base = {
    padding: '6px 14px', borderRadius: 8, fontSize: 12,
    fontWeight: 600, cursor: 'pointer', border: '1px solid',
    transition: 'all 150ms', fontFamily: "'Inter', sans-serif",
  };
  if (variant === 'primary') return {
    ...base,
    background: 'var(--text-accent)', color: 'var(--bg-primary)',
    borderColor: 'var(--text-accent)',
  };
  if (variant === 'danger') return {
    ...base,
    background: 'var(--color-critical)', color: '#fff',
    borderColor: 'var(--color-critical)',
  };
  return {
    ...base,
    background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
    borderColor: 'var(--border-primary)',
  };
}

export default function RaftConsensus() {
  const [nodes, setNodes] = useState(INITIAL_NODES.map(n => ({ ...n })));
  const [busy, setBusy] = useState(false);
  const [replicating, setReplicating] = useState(null); // follower id being replicated to
  const [eventLog, setEventLog] = useState([
    { id: 0, msg: 'Cluster started. N1 is leader (term 1).' },
  ]);
  const timeoutsRef = useRef([]);
  const logCounterRef = useRef(1);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const addLog = useCallback((msg) => {
    logCounterRef.current += 1;
    const id = logCounterRef.current;
    setEventLog(prev => [{ id, msg }, ...prev].slice(0, 10));
  }, []);

  const schedule = useCallback((fn, delay) => {
    const t = setTimeout(fn, delay);
    timeoutsRef.current.push(t);
    return t;
  }, []);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const getLeader = useCallback((ns) => ns.find(n => n.role === 'leader' && !n.dead), []);
  const aliveNodes = useCallback((ns) => ns.filter(n => !n.dead), []);

  const handleNodeClick = useCallback((nodeId) => {
    if (busy) return;

    setNodes(prev => {
      const node = prev.find(n => n.id === nodeId);
      if (!node) return prev;

      if (node.dead) {
        // Revive as follower, catch up log to leader
        const leader = getLeader(prev);
        const leaderLog = leader ? leader.log : node.log;
        const leaderTerm = leader ? leader.term : node.term;
        addLog(`${nodeId} revived as follower (term ${leaderTerm}, log caught up to ${leaderLog} entries).`);
        return prev.map(n => n.id === nodeId
          ? { ...n, dead: false, role: 'follower', term: leaderTerm, log: leaderLog }
          : n
        );
      }

      const wasLeader = node.role === 'leader';
      addLog(`${nodeId} killed.`);

      // Kill the node
      const afterKill = prev.map(n => n.id === nodeId
        ? { ...n, dead: true, role: 'follower' }
        : n
      );

      if (!wasLeader) return afterKill;

      // Leader was killed — start election
      const aliveAfterKill = afterKill.filter(n => !n.dead);
      if (aliveAfterKill.length === 0) return afterKill;

      const candidate = aliveAfterKill[0];
      const currentTerm = node.term;
      const newTerm = currentTerm + 1;

      addLog(`Election started! ${candidate.id} becomes candidate (term ${newTerm}).`);
      setBusy(true);

      const withCandidate = afterKill.map(n =>
        n.id === candidate.id ? { ...n, role: 'candidate', term: newTerm } : n
      );

      // After 800ms elect the candidate as leader
      schedule(() => {
        const aliveCount = withCandidate.filter(n => !n.dead).length;
        addLog(`${candidate.id} wins election with ${aliveCount} votes. Becomes leader (term ${newTerm}).`);
        setNodes(ns => ns.map(n => {
          if (n.id === candidate.id) return { ...n, role: 'leader', term: newTerm };
          if (!n.dead && n.id !== candidate.id) return { ...n, role: 'follower', term: newTerm };
          return n;
        }));
        setBusy(false);
      }, 800);

      return withCandidate;
    });
  }, [busy, addLog, schedule, getLeader]);

  const handleSubmitValue = useCallback(() => {
    if (busy) return;

    setNodes(prev => {
      const leader = getLeader(prev);
      if (!leader) {
        addLog('No leader — cannot submit value.');
        return prev;
      }

      const newLog = leader.log + 1;
      addLog(`Leader ${leader.id} appending entry #${newLog} to its log.`);
      setBusy(true);

      // Update leader log immediately
      const withLeaderUpdated = prev.map(n =>
        n.id === leader.id ? { ...n, log: newLog } : n
      );

      // Replicate to each alive follower one by one
      const followers = withLeaderUpdated.filter(n => n.id !== leader.id && !n.dead);
      followers.forEach((follower, i) => {
        schedule(() => {
          setReplicating(follower.id);
          addLog(`Replicating entry #${newLog} to ${follower.id}.`);
          schedule(() => {
            setNodes(ns => ns.map(n => n.id === follower.id ? { ...n, log: newLog } : n));
            setReplicating(null);
            if (i === followers.length - 1) {
              addLog(`Replication complete. All alive nodes have ${newLog} entries.`);
              setBusy(false);
            }
          }, 300);
        }, i * 400);
      });

      if (followers.length === 0) {
        addLog('No alive followers to replicate to.');
        setBusy(false);
      }

      return withLeaderUpdated;
    });
  }, [busy, addLog, schedule, getLeader]);

  const handleReset = useCallback(() => {
    clearAll();
    setBusy(false);
    setReplicating(null);
    setNodes(INITIAL_NODES.map(n => ({ ...n })));
    setEventLog([{ id: 0, msg: 'Cluster reset. N1 is leader (term 1).' }]);
    logCounterRef.current = 1;
  }, [clearAll]);

  const currentNodes = nodes;
  const alive = aliveNodes(currentNodes);
  const leader = getLeader(currentNodes);
  const quorum = alive.length >= 3;

  // SVG edges: leader to each follower
  const leaderPos = leader ? NODE_POSITIONS[leader.id] : null;

  return (
    <div style={{
      background: 'var(--bg-primary)', color: 'var(--text-primary)',
      fontFamily: "'Inter', sans-serif", padding: 24, borderRadius: 12,
      border: '1px solid var(--border-primary)', maxWidth: 520, margin: '0 auto',
    }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Raft Consensus</h3>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--text-muted)' }}>
        Click a live node to kill it. Click a dead node to revive it. Submit values via the leader.
      </p>

      {/* Node visualization */}
      <svg width={370} height={220} viewBox="0 0 370 220"
        style={{ display: 'block', margin: '0 auto 12px', overflow: 'visible' }}>

        {/* Edges from leader to followers */}
        {leaderPos && currentNodes.filter(n => n.id !== leader.id && !n.dead).map(follower => {
          const fp = NODE_POSITIONS[follower.id];
          const isRepl = replicating === follower.id;
          return (
            <line key={follower.id}
              x1={leaderPos.x + NODE_W / 2} y1={leaderPos.y + NODE_H}
              x2={fp.x + NODE_W / 2} y2={fp.y}
              stroke={isRepl ? 'var(--color-healthy)' : 'var(--border-primary)'}
              strokeWidth={isRepl ? 2.5 : 1}
              strokeDasharray={isRepl ? 'none' : '4 3'}
              style={{ transition: 'stroke 300ms, stroke-width 300ms' }}
            />
          );
        })}

        {/* Nodes */}
        {currentNodes.map(node => {
          const pos = NODE_POSITIONS[node.id];
          const color = roleColor(node.role, node.dead);
          const isRepl = replicating === node.id;
          return (
            <g key={node.id} onClick={() => handleNodeClick(node.id)}
              style={{ cursor: busy && !node.dead ? 'not-allowed' : 'pointer' }}>
              <rect
                x={pos.x} y={pos.y} width={NODE_W} height={NODE_H} rx={8}
                fill={node.dead ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'}
                stroke={isRepl ? 'var(--color-healthy)' : color}
                strokeWidth={node.role === 'leader' ? 2.5 : 1.5}
                opacity={node.dead ? 0.4 : 1}
                style={{ transition: 'stroke 300ms, opacity 400ms, fill 300ms' }}
              />
              {/* Node ID */}
              <text
                x={pos.x + NODE_W / 2} y={pos.y + 14}
                textAnchor="middle" dominantBaseline="central"
                fontSize={13} fontWeight={700}
                fill={node.dead ? 'var(--text-muted)' : 'var(--text-primary)'}
                fontFamily="'JetBrains Mono', monospace"
                style={{ pointerEvents: 'none' }}
              >
                {node.id}
              </text>
              {/* Role */}
              <text
                x={pos.x + NODE_W / 2} y={pos.y + 30}
                textAnchor="middle" dominantBaseline="central"
                fontSize={8} fontWeight={600}
                fill={node.dead ? 'var(--text-muted)' : color}
                style={{ pointerEvents: 'none' }}
              >
                {node.dead ? 'DEAD' : roleLabel(node.role)}
              </text>
              {/* Term */}
              <text
                x={pos.x + NODE_W / 2} y={pos.y + 44}
                textAnchor="middle" dominantBaseline="central"
                fontSize={9}
                fill={node.dead ? 'var(--text-muted)' : 'var(--text-secondary)'}
                style={{ pointerEvents: 'none' }}
              >
                {`term ${node.term}`}
              </text>
              {/* Log count */}
              <text
                x={pos.x + NODE_W / 2} y={pos.y + 57}
                textAnchor="middle" dominantBaseline="central"
                fontSize={9}
                fill={node.dead ? 'var(--text-muted)' : 'var(--text-muted)'}
                style={{ pointerEvents: 'none' }}
              >
                {`log: ${node.log}`}
              </text>
              {/* Dead X overlay */}
              {node.dead && (
                <text
                  x={pos.x + NODE_W / 2} y={pos.y + NODE_H / 2 + 2}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={26} fill="var(--color-critical)"
                  style={{ pointerEvents: 'none', opacity: 0.5 }}
                >
                  ✕
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Quorum status bar */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 14, padding: '10px 14px',
        background: 'var(--bg-secondary)', borderRadius: 8,
        border: `1px solid ${quorum ? 'var(--color-healthy)' : 'var(--color-critical)'}`,
        alignItems: 'center', flexWrap: 'wrap',
        transition: 'border-color 300ms',
      }}>
        <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", display: 'flex', gap: 16, flexWrap: 'wrap', flex: 1 }}>
          <span>
            <span style={{ color: 'var(--text-muted)' }}>Alive: </span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{alive.length}/5</span>
          </span>
          <span>
            <span style={{ color: 'var(--text-muted)' }}>Leader: </span>
            <span style={{ color: leader ? 'var(--color-healthy)' : 'var(--color-critical)', fontWeight: 700 }}>
              {leader ? leader.id : 'none'}
            </span>
          </span>
          <span>
            <span style={{ color: 'var(--text-muted)' }}>Quorum: </span>
            <span style={{ color: quorum ? 'var(--color-healthy)' : 'var(--color-critical)', fontWeight: 700 }}>
              {quorum ? 'YES' : 'NO'}
            </span>
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          style={{ ...btnStyle('primary'), opacity: busy || !leader ? 0.5 : 1 }}
          onClick={handleSubmitValue}
          disabled={busy || !leader}
        >
          Submit Value
        </button>
        <button
          style={{ ...btnStyle('default'), opacity: busy ? 0.5 : 1 }}
          onClick={handleReset}
          disabled={busy}
        >
          Reset
        </button>
      </div>

      {/* Event log */}
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: 8,
        border: '1px solid var(--border-primary)', overflow: 'hidden',
      }}>
        <div style={{
          padding: '6px 12px', borderBottom: '1px solid var(--border-primary)',
          fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em',
        }}>
          EVENT LOG
        </div>
        <div style={{ maxHeight: 140, overflowY: 'auto', padding: '6px 0' }}>
          {eventLog.map((entry, i) => (
            <div key={entry.id} style={{
              padding: '3px 12px',
              fontSize: 11,
              color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontFamily: "'JetBrains Mono', monospace",
              borderLeft: i === 0 ? '2px solid var(--text-accent)' : '2px solid transparent',
              transition: 'color 300ms',
            }}>
              {entry.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
