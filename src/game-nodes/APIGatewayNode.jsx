import { Handle, Position } from 'reactflow';
import { Shield } from 'lucide-react';

export default function APIGatewayNode({ data }) {
  const status = data.status || 'healthy';
  const rps = data.rps || 0;
  const blocked = data.blocked || 0;
  const total = rps + blocked;
  const blockPercent = total > 0 ? Math.min((blocked / total) * 100, 100) : 0;
  const barColor = status === 'dead'
    ? 'var(--color-critical)'
    : blockPercent > 50 ? 'var(--color-critical)'
    : blockPercent > 25 ? 'var(--color-warning)'
    : 'var(--node-apigateway)';

  return (
    <div className={`game-node ${status}`} style={{ borderColor: status === 'healthy' ? 'var(--node-apigateway)' : undefined, position: 'relative' }}>
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
        <Shield size={28} style={{ color: 'var(--node-apigateway)' }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Gateway
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {data.label || 'API Gateway'}
        </div>
        {status === 'dead' ? (
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-critical)' }}>OFFLINE</div>
        ) : (
          <>
            <div className="load-bar">
              <div className="load-bar-fill" style={{ width: `${blockPercent}%`, background: barColor }} />
            </div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--node-apigateway)', fontWeight: 700 }}>{rps.toLocaleString()}</span> RPS
            </div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
              Limit: <span style={{ fontWeight: 700 }}>{(data.rateLimit || 0).toLocaleString()}</span>
            </div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
              Blocked: <span style={{ color: barColor, fontWeight: 700 }}>{blocked.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
