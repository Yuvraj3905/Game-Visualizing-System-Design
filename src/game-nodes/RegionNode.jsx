import { MapPin } from 'lucide-react';

export default function RegionNode({ data }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      border: '2px dashed var(--node-region)',
      borderRadius: 16,
      background: 'rgba(100, 116, 139, 0.05)',
      padding: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <MapPin size={14} style={{ color: 'var(--node-region)' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--node-region)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {data.label}
        </span>
      </div>
    </div>
  );
}
