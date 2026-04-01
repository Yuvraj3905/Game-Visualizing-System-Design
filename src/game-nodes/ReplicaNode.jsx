import { Handle, Position } from 'reactflow';
import { DatabaseZap } from 'lucide-react';

export default function ReplicaNode({ data }) {
  const load = data.capacity > 0 ? data.rps / data.capacity : 0;
  const status = data.status || 'healthy';
  const loadPercent = Math.min(load * 100, 100);
  const barColor = load > 0.9 ? 'var(--color-critical)' : load > 0.7 ? 'var(--color-warning)' : 'var(--node-replica)';

  return (
    <div className={`game-node ${status}`} style={{ borderColor: status === 'healthy' ? 'var(--node-replica)' : undefined }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <DatabaseZap size={28} style={{ color: 'var(--node-replica)' }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Read Replica
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {data.label}
        </div>
        {status === 'dead' ? (
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-critical)' }}>OFFLINE</div>
        ) : (
          <>
            <div className="load-bar">
              <div className="load-bar-fill" style={{ width: `${loadPercent}%`, background: barColor }} />
            </div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
              <span style={{ color: barColor, fontWeight: 700 }}>{data.rps?.toLocaleString() || 0}</span> / {data.capacity?.toLocaleString()} QPS
            </div>
          </>
        )}
      </div>
    </div>
  );
}
