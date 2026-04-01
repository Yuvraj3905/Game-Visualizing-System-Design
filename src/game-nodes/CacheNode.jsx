import { Handle, Position } from 'reactflow';
import { Zap } from 'lucide-react';

export default function CacheNode({ data }) {
  const status = data.status || 'healthy';
  const hitRate = data.hitRate || 0;
  const hitRatePercent = Math.round(hitRate * 100);
  const barColor = hitRatePercent > 60 ? 'var(--color-healthy)' : hitRatePercent > 30 ? 'var(--color-warning)' : 'var(--color-info)';

  return (
    <div className={`game-node ${status}`} style={{ borderColor: status === 'healthy' ? 'var(--node-cache)' : undefined }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Zap size={28} style={{ color: 'var(--node-cache)' }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Cache
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {data.label}
        </div>
        <div className="load-bar">
          <div className="load-bar-fill" style={{ width: `${hitRatePercent}%`, background: barColor }} />
        </div>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: barColor, fontWeight: 700 }}>
          {hitRatePercent}% Hit Rate
        </div>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
          {data.rps?.toLocaleString() || 0} RPS
        </div>
      </div>
    </div>
  );
}
