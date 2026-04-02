import { useState, useMemo } from 'react';

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
});

const REGIONS = ['US', 'EU', 'APAC', 'SA'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ROWS = Array.from({ length: 24 }, (_, i) => {
  const id = i + 1;
  const uid = i < 5 ? 1 : i < 9 ? 2 : i < 14 ? 3 : (i % 5) + 1;
  return { id, user_id: uid, region: REGIONS[i % 4], date: DAYS[i % 7] };
});

const SHARD_INFO = {
  user_id: {
    shards: [1, 2, 3, 4, 5],
    label: (v) => `User ${v}`,
    tradeoff: 'Skewed user activity creates hot shards. User 1-3 dominate traffic, overloading one shard while others sit idle. Great for user-scoped queries but terrible for uniform distribution.',
  },
  region: {
    shards: REGIONS,
    label: (v) => v,
    tradeoff: 'Geographic sharding keeps data close to users and aids compliance (GDPR). Distribution depends on your user base — may still be uneven if most users are in one region.',
  },
  date: {
    shards: DAYS,
    label: (v) => v,
    tradeoff: 'Time-based sharding distributes writes evenly across days but makes cross-day range queries expensive. Old shards become cold while the current day is always hot.',
  },
};

function assignShard(row, key) {
  const val = row[key];
  const cfg = SHARD_INFO[key];
  const idx = cfg.shards.indexOf(val);
  return idx === -1 ? 0 : Math.min(idx, 3);
}

function groupLabel(key, shardIdx) {
  const cfg = SHARD_INFO[key];
  if (key === 'user_id') {
    if (shardIdx < 3) return `User ${shardIdx + 1}`;
    return 'Users 4-5';
  }
  if (key === 'date') {
    if (shardIdx < 4) return DAYS[shardIdx];
    return `${DAYS[4]}+`;
  }
  return cfg.shards[shardIdx] || `Shard ${shardIdx}`;
}

function bucketize(key) {
  const buckets = [[], [], [], []];
  ROWS.forEach((row) => {
    let idx = assignShard(row, key);
    if (idx > 3) idx = 3;
    buckets[idx].push(row);
  });
  return buckets;
}

export default function DatabaseSharding() {
  const [shardKey, setShardKey] = useState('user_id');

  const buckets = useMemo(() => bucketize(shardKey), [shardKey]);
  const maxLen = ROWS.length;

  const wrap = {
    background: 'var(--bg-primary)', color: 'var(--text-primary)',
    fontFamily: "'Inter', sans-serif", padding: 24, borderRadius: 12,
    border: '1px solid var(--border-primary)', maxWidth: 520, margin: '0 auto',
  };

  return (
    <div style={wrap}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Database Sharding</h3>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-muted)' }}>
        Choose a shard key and watch data redistribute. 24 rows, skewed user_ids.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['user_id', 'region', 'date'].map((k) => (
          <button key={k} style={toggleStyle(shardKey === k)} onClick={() => setShardKey(k)}>
            {k}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {buckets.map((bucket, si) => {
          const pct = (bucket.length / maxLen) * 100;
          const hot = pct > 70;
          const warm = pct > 50;
          const barColor = hot ? 'var(--color-critical)' : warm ? 'var(--color-warning)' : 'var(--color-healthy)';
          return (
            <div key={si} style={{
              flex: 1, background: 'var(--bg-secondary)', borderRadius: 8, padding: 10,
              border: '1px solid var(--border-primary)', minHeight: 180, display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: 'var(--text-accent)', marginBottom: 6,
                fontFamily: "'JetBrains Mono', monospace", textAlign: 'center',
              }}>
                {groupLabel(shardKey, si)}
              </div>

              <div style={{
                height: 8, borderRadius: 4, background: 'var(--bg-tertiary)', marginBottom: 4, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${pct}%`, background: barColor, borderRadius: 4,
                  transition: 'width 500ms ease, background 300ms',
                }} />
              </div>
              <div style={{
                fontSize: 10, textAlign: 'center', marginBottom: 6,
                fontFamily: "'JetBrains Mono', monospace",
                color: hot ? 'var(--color-critical)' : warm ? 'var(--color-warning)' : 'var(--text-muted)',
                fontWeight: hot ? 700 : 400,
              }}>
                {bucket.length} rows ({Math.round(pct)}%)
                {hot && ' — Hot Shard!'}
              </div>

              <div style={{ flex: 1, overflow: 'hidden' }}>
                {bucket.map((row, ri) => (
                  <div key={row.id} style={{
                    fontSize: 10, padding: '2px 4px', marginBottom: 2, borderRadius: 4,
                    background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                    fontFamily: "'JetBrains Mono', monospace",
                    transform: 'translateY(0)', opacity: 1,
                    transition: `transform 400ms ${ri * 30}ms ease, opacity 400ms ${ri * 30}ms ease`,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    id:{row.id} u:{row.user_id} {row.region} {row.date}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        padding: 14, background: 'var(--bg-secondary)', borderRadius: 8,
        border: '1px solid var(--border-primary)', fontSize: 12, color: 'var(--text-secondary)',
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text-accent)', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
          Shard Key: {shardKey}
        </div>
        {SHARD_INFO[shardKey].tradeoff}
      </div>
    </div>
  );
}
