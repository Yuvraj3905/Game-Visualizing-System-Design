import { Handle, Position } from 'reactflow';
import { Split } from 'lucide-react';

export default function LoadBalancerNode({ data }) {
  const status = data.status || 'healthy';

  return (
    <div className={`game-node ${status}`} style={{ borderColor: status === 'healthy' ? 'var(--node-loadbalancer)' : undefined }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Split size={28} style={{ color: 'var(--node-loadbalancer)' }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Load Balancer
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {data.label}
        </div>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--node-loadbalancer)' }}>
          {data.rps?.toLocaleString() || 0} RPS
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '2px 8px', background: 'var(--bg-tertiary)', borderRadius: 4 }}>
          {data.algorithm || 'round-robin'}
        </div>
      </div>
    </div>
  );
}
