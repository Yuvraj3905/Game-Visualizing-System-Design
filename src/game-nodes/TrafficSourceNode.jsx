import { Handle, Position } from 'reactflow';
import { Radio } from 'lucide-react';

export default function TrafficSourceNode({ data }) {
  return (
    <div className="game-node healthy" style={{ borderColor: 'var(--node-traffic)' }}>
      <Handle type="source" position={Position.Right} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Radio size={28} style={{ color: 'var(--node-traffic)' }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Traffic Source
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
          {data.label}
        </div>
        <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--node-traffic)' }}>
          {data.rps?.toLocaleString() || 0} RPS
        </div>
        {data.region && data.region !== 'default' && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {data.region.replace('region-', '').toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
