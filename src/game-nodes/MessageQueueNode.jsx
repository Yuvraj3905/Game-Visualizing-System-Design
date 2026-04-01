import { Handle, Position } from 'reactflow';
import { Layers } from 'lucide-react';

export default function MessageQueueNode({ data }) {
  const status = data.status || 'healthy';
  const depth = data.depth || 0;
  const maxDepth = data.maxDepth || 1;
  const depthPercent = Math.min((depth / maxDepth) * 100, 100);
  const barColor = status === 'dead'
    ? 'var(--color-critical)'
    : depthPercent > 90 ? 'var(--color-critical)'
    : depthPercent > 70 ? 'var(--color-warning)'
    : 'var(--node-messagequeue)';

  return (
    <div className={`game-node ${status}`} style={{ borderColor: status === 'healthy' ? 'var(--node-messagequeue)' : undefined, position: 'relative' }}>
      {status === 'critical' && (
        <div className="fire-particles">
          <div className="fire-particle" style={{ left: '10%' }} />
          <div className="fire-particle" style={{ left: '30%' }} />
          <div className="fire-particle" style={{ left: '60%' }} />
          <div className="fire-particle" style={{ left: '80%' }} />
        </div>
      )}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Layers size={28} style={{ color: 'var(--node-messagequeue)' }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Queue
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {data.label || 'Message Queue'}
        </div>
        {status === 'dead' ? (
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-critical)' }}>OFFLINE</div>
        ) : (
          <>
            <div className="load-bar">
              <div className="load-bar-fill" style={{ width: `${depthPercent}%`, background: barColor }} />
            </div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
              <span style={{ color: barColor, fontWeight: 700 }}>{depth.toLocaleString()}</span> / {maxDepth.toLocaleString()} msgs
            </div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
              Drain: <span style={{ fontWeight: 700 }}>{(data.drainRate || 0).toLocaleString()}</span>/s
            </div>
          </>
        )}
      </div>
    </div>
  );
}
