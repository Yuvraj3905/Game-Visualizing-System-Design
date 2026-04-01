import { Handle, Position } from 'reactflow';
import { TrendingUp } from 'lucide-react';

export default function AutoScalerNode({ data }) {
  const status = data.status || 'healthy';
  const instanceCount = data.instanceCount || 0;
  const scaleUpThreshold = data.scaleUpThreshold || 80;
  const scaleDownThreshold = data.scaleDownThreshold || 30;

  return (
    <div className={`game-node ${status}`} style={{ borderColor: status === 'healthy' ? 'var(--node-autoscaler)' : undefined, position: 'relative' }}>
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
        <TrendingUp size={28} style={{ color: 'var(--node-autoscaler)' }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Auto-Scale
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {data.label || 'Auto Scaler'}
        </div>
        {status === 'dead' ? (
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-critical)' }}>OFFLINE</div>
        ) : (
          <>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
              Instances: <span style={{ color: 'var(--node-autoscaler)', fontWeight: 700 }}>{instanceCount}</span>
            </div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
              Scale up: <span style={{ color: 'var(--color-warning)', fontWeight: 700 }}>{scaleUpThreshold}%</span>
            </div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
              Scale down: <span style={{ color: 'var(--color-healthy)', fontWeight: 700 }}>{scaleDownThreshold}%</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
