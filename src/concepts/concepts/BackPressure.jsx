import { useState, useRef, useEffect, useCallback } from 'react';

const QUEUE_MAX = 20;

const STRATEGIES = [
  {
    key: 'drop-tail',
    label: 'Drop Tail',
    color: 'var(--color-warning)',
    description: 'New messages are dropped when the queue is full.',
  },
  {
    key: 'drop-head',
    label: 'Drop Head',
    color: 'var(--color-critical)',
    description: 'Oldest messages are removed to make room for new ones.',
  },
  {
    key: 'block-producer',
    label: 'Block Producer',
    color: 'var(--color-info)',
    description: 'Producer stops sending when the queue is full.',
  },
];

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 150ms',
});

function queueBarColor(depth) {
  const pct = depth / QUEUE_MAX;
  if (pct > 0.8) return 'var(--color-critical)';
  if (pct >= 0.5) return 'var(--color-warning)';
  return 'var(--color-healthy)';
}

export default function BackPressure() {
  const [strategy, setStrategy] = useState('drop-tail');
  const [producerRate, setProducerRate] = useState(8);
  const [consumerRate, setConsumerRate] = useState(5);
  const [running, setRunning] = useState(false);

  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({ produced: 0, consumed: 0, dropped: 0 });

  const intervalRef = useRef(null);
  const stateRef = useRef({ queue: [], stats: { produced: 0, consumed: 0, dropped: 0 } });

  const tick = useCallback(() => {
    const { queue: q, stats: s } = stateRef.current;
    const strat = stateRef.current.strategy;
    const pRate = stateRef.current.producerRate;
    const cRate = stateRef.current.consumerRate;

    // Consumer eats from front
    const consumed = Math.min(cRate, q.length);
    const afterConsume = q.slice(consumed);

    // Producer adds to back
    let newQueue = [...afterConsume];
    let dropped = 0;
    let produced = 0;

    if (strat === 'block-producer') {
      if (newQueue.length < QUEUE_MAX) {
        const canAdd = Math.min(pRate, QUEUE_MAX - newQueue.length);
        for (let i = 0; i < canAdd; i++) newQueue.push(1);
        produced = canAdd;
      }
      // else: blocked, produce nothing
    } else if (strat === 'drop-tail') {
      for (let i = 0; i < pRate; i++) {
        if (newQueue.length < QUEUE_MAX) {
          newQueue.push(1);
          produced++;
        } else {
          dropped++;
        }
      }
    } else if (strat === 'drop-head') {
      for (let i = 0; i < pRate; i++) {
        produced++;
        if (newQueue.length >= QUEUE_MAX) {
          newQueue.shift();
          dropped++;
        }
        newQueue.push(1);
      }
    }

    const newStats = {
      produced: s.produced + produced,
      consumed: s.consumed + consumed,
      dropped: s.dropped + dropped,
    };

    stateRef.current = {
      ...stateRef.current,
      queue: newQueue,
      stats: newStats,
    };

    setQueue([...newQueue]);
    setStats({ ...newStats });
  }, []);

  // Keep stateRef in sync with slider/strategy changes
  useEffect(() => {
    stateRef.current.strategy = strategy;
  }, [strategy]);

  useEffect(() => {
    stateRef.current.producerRate = producerRate;
  }, [producerRate]);

  useEffect(() => {
    stateRef.current.consumerRate = consumerRate;
  }, [consumerRate]);

  const handleToggle = useCallback(() => {
    if (running) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setRunning(false);
    } else {
      // Reset on start
      const fresh = { queue: [], stats: { produced: 0, consumed: 0, dropped: 0 } };
      stateRef.current = {
        ...stateRef.current,
        queue: fresh.queue,
        stats: fresh.stats,
      };
      setQueue([]);
      setStats({ produced: 0, consumed: 0, dropped: 0 });

      intervalRef.current = setInterval(tick, 500);
      setRunning(true);
    }
  }, [running, tick]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const activeStrategy = STRATEGIES.find((s) => s.key === strategy);
  const queueDepth = queue.length;
  const queuePct = queueDepth / QUEUE_MAX;

  return (
    <div
      style={{
        maxWidth: 480,
        fontFamily: "'Inter', sans-serif",
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* Strategy selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Overflow Strategy
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STRATEGIES.map((s) => (
            <button
              key={s.key}
              style={toggleStyle(strategy === s.key)}
              onClick={() => setStrategy(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            padding: '8px 12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 8,
            borderLeft: `3px solid ${activeStrategy.color}`,
          }}
        >
          {activeStrategy.description}
        </div>
      </div>

      {/* Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Producer Rate
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: 'var(--text-accent)',
                background: 'var(--bg-tertiary)',
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              {producerRate} msg/tick
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            value={producerRate}
            onChange={(e) => setProducerRate(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--text-accent)', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Consumer Rate
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: 'var(--color-healthy)',
                background: 'var(--bg-tertiary)',
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              {consumerRate} msg/tick
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={consumerRate}
            onChange={(e) => setConsumerRate(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-healthy)', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Pipeline visual */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '14px 16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 10,
        }}
      >
        {/* Producer box */}
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '10px 6px',
            background: 'var(--bg-tertiary)',
            border: `1px solid ${running && strategy === 'block-producer' && queueDepth >= QUEUE_MAX ? 'var(--color-critical)' : 'var(--border-primary)'}`,
            borderRadius: 8,
            transition: 'border-color 300ms',
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Producer</div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              color:
                running && strategy === 'block-producer' && queueDepth >= QUEUE_MAX
                  ? 'var(--color-critical)'
                  : 'var(--text-accent)',
            }}
          >
            {running && strategy === 'block-producer' && queueDepth >= QUEUE_MAX
              ? 'BLOCKED'
              : `+${producerRate}`}
          </div>
        </div>

        {/* Arrow */}
        <div style={{ color: 'var(--text-muted)', fontSize: 16, flexShrink: 0 }}>→</div>

        {/* Queue box */}
        <div
          style={{
            flex: 2,
            padding: '10px 8px',
            background: 'var(--bg-tertiary)',
            border: `1px solid ${queueDepth >= QUEUE_MAX ? 'var(--color-critical)' : 'var(--border-primary)'}`,
            borderRadius: 8,
            transition: 'border-color 300ms',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Queue</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                color: queueBarColor(queueDepth),
              }}
            >
              {queueDepth}/{QUEUE_MAX}
            </span>
          </div>
          {/* Depth bar */}
          <div
            style={{
              width: '100%',
              height: 24,
              background: 'var(--bg-primary)',
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid var(--border-primary)',
            }}
          >
            <div
              style={{
                width: `${queuePct * 100}%`,
                height: '100%',
                background: queueBarColor(queueDepth),
                transition: 'width 400ms ease, background 400ms ease',
                borderRadius: 3,
              }}
            />
          </div>
        </div>

        {/* Arrow */}
        <div style={{ color: 'var(--text-muted)', fontSize: 16, flexShrink: 0 }}>→</div>

        {/* Consumer box */}
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '10px 6px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 8,
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Consumer</div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--color-healthy)',
            }}
          >
            -{consumerRate}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
        }}
      >
        {[
          { label: 'Produced', value: stats.produced, color: 'var(--color-info)' },
          { label: 'Consumed', value: stats.consumed, color: 'var(--color-healthy)' },
          { label: 'Dropped', value: stats.dropped, color: 'var(--color-critical)' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 8,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 18,
                fontWeight: 700,
                color,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Start / Stop */}
      <button
        onClick={handleToggle}
        style={{
          padding: '10px 0',
          background: running ? 'var(--color-critical-bg)' : 'var(--text-accent)',
          color: running ? 'var(--color-critical)' : 'var(--bg-primary)',
          border: `1px solid ${running ? 'var(--color-critical)' : 'var(--text-accent)'}`,
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 150ms',
          letterSpacing: '0.03em',
        }}
      >
        {running ? 'Stop' : 'Start'}
      </button>
    </div>
  );
}
