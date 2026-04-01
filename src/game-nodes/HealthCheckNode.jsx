import { Handle, Position } from 'reactflow';
import { HeartPulse } from 'lucide-react';

export default function HealthCheckNode({ data }) {
  const status = data.status || 'healthy';

  return (
    <div className={`game-node ${status}`} style={{ borderColor: status === 'healthy' ? 'var(--node-healthcheck)' : undefined }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <HeartPulse size={28} style={{ color: 'var(--node-healthcheck)' }} className="animate-pulse-glow" />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Health Check
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {data.label}
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-healthy)', padding: '2px 8px', background: 'var(--color-healthy-bg)', borderRadius: 4, fontWeight: 600 }}>
          Monitoring
        </div>
      </div>
    </div>
  );
}
