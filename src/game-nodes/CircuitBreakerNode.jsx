import { Handle, Position } from 'reactflow';
import { ShieldOff } from 'lucide-react';

export default function CircuitBreakerNode({ data }) {
  const status = data.status || 'healthy';
  const cbState = data.cbState || 'CLOSED';
  const failureCount = data.failureCount || 0;

  const stateColor = cbState === 'OPEN'
    ? 'var(--color-critical)'
    : cbState === 'HALF-OPEN'
    ? 'var(--color-warning)'
    : 'var(--color-healthy)';

  return (
    <div className={`game-node ${status}`} style={{ borderColor: status === 'healthy' ? 'var(--node-circuitbreaker)' : undefined, position: 'relative' }}>
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
        <ShieldOff size={28} style={{ color: 'var(--node-circuitbreaker)' }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Circuit Breaker
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {data.label || 'Circuit Breaker'}
        </div>
        {status === 'dead' ? (
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-critical)' }}>OFFLINE</div>
        ) : (
          <>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              color: stateColor,
              background: 'var(--bg-tertiary)',
              padding: '2px 8px',
              borderRadius: 4,
              border: `1px solid ${stateColor}`,
            }}>
              {cbState}
            </div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
              Failures: <span style={{ color: failureCount > 0 ? 'var(--color-critical)' : 'var(--text-secondary)', fontWeight: 700 }}>{failureCount}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
