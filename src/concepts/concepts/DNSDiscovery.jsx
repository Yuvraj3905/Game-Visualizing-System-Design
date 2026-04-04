import { useState, useCallback, useRef, useEffect } from 'react';

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
});

const DOMAINS = [
  { label: 'api.example.com', ip: '203.0.113.42' },
  { label: 'cdn.static.io', ip: '198.51.100.7' },
  { label: 'db.internal.svc', ip: '10.0.3.15' },
];

const DNS_STEPS = [
  { label: 'Browser Cache', latency: '~0ms', description: 'Check local DNS cache first' },
  { label: 'Recursive Resolver', latency: '~5ms', description: 'ISP resolver handles the query' },
  { label: 'Root Nameserver', latency: '~20ms', description: 'Root zone directs to TLD' },
  { label: 'TLD Nameserver', latency: '~30ms', description: '.com / .io / .svc TLD server' },
  { label: 'Authoritative NS', latency: '~45ms', description: 'Returns the final IP address' },
];

const SD_STEPS = [
  { label: 'Client', latency: '~0ms', description: 'Service requests an endpoint' },
  { label: 'Service Registry', latency: '~2ms', description: 'Consul / etcd / Kubernetes DNS' },
  { label: 'Health Check', latency: '~5ms', description: 'Filter to only healthy instances' },
];

const STEP_DELAY_MS = 700;

export default function DNSDiscovery() {
  const [mode, setMode] = useState('DNS');
  const [domainIdx, setDomainIdx] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  // cache: Set of "mode:domainIdx" strings
  const cacheRef = useRef(new Set());
  const timeoutsRef = useRef([]);

  const steps = mode === 'DNS' ? DNS_STEPS : SD_STEPS;
  const domain = DOMAINS[domainIdx];
  const cacheKey = `${mode}:${domainIdx}`;
  const isCached = cacheRef.current.has(cacheKey);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  const handleResolve = useCallback(() => {
    if (resolving) return;
    setResolving(true);
    setResolved(false);
    setActiveStep(-1);
    clearTimeouts();

    steps.forEach((_, i) => {
      const id = setTimeout(() => {
        setActiveStep(i);
        if (i === steps.length - 1) {
          const doneId = setTimeout(() => {
            setResolved(true);
            setResolving(false);
            cacheRef.current.add(cacheKey);
          }, STEP_DELAY_MS);
          timeoutsRef.current.push(doneId);
        }
      }, i * STEP_DELAY_MS);
      timeoutsRef.current.push(id);
    });
  }, [resolving, steps, cacheKey, clearTimeouts]);

  const handleReset = useCallback(() => {
    clearTimeouts();
    setActiveStep(-1);
    setResolving(false);
    setResolved(false);
  }, [clearTimeouts]);

  const handleModeChange = useCallback((newMode) => {
    clearTimeouts();
    setMode(newMode);
    setActiveStep(-1);
    setResolving(false);
    setResolved(false);
  }, [clearTimeouts]);

  const handleDomainChange = useCallback((idx) => {
    clearTimeouts();
    setDomainIdx(idx);
    setActiveStep(-1);
    setResolving(false);
    setResolved(false);
  }, [clearTimeouts]);

  const totalLatency = isCached
    ? '~0ms (cached)'
    : steps.reduce((acc, s) => {
        const ms = parseInt(s.latency.replace(/[^0-9]/g, ''), 10);
        return acc + ms;
      }, 0) + 'ms';

  return (
    <div style={{
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: 20,
      borderRadius: 12,
      border: '1px solid var(--border-primary)',
      maxWidth: 460,
      fontFamily: "'Inter', sans-serif",
    }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, color: 'var(--text-accent)' }}>
        DNS &amp; Service Discovery
      </h3>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--text-muted)' }}>
        How a domain name gets resolved to an IP address
      </p>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {['DNS', 'Service Discovery'].map(m => (
          <button key={m} style={toggleStyle(mode === m)} onClick={() => handleModeChange(m)}>{m}</button>
        ))}
      </div>

      {/* Domain selector */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>Select domain</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {DOMAINS.map((d, i) => (
            <button key={d.label} style={toggleStyle(domainIdx === i)} onClick={() => handleDomainChange(i)}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Steps chain */}
      <div style={{ marginBottom: 14 }}>
        {steps.map((step, i) => {
          const isActive = i === activeStep;
          const isPast = i < activeStep || resolved;
          const isDimmed = activeStep >= 0 && i > activeStep && !resolved;
          const displayLatency = isCached ? '~0ms (cached)' : step.latency;

          let borderColor = 'var(--border-primary)';
          if (isActive) borderColor = 'var(--color-info)';
          else if (isPast) borderColor = 'var(--color-healthy)';

          return (
            <div key={step.label} style={{ display: 'flex', alignItems: 'stretch', marginBottom: 4 }}>
              {/* Connector line + dot */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
                {i > 0 && (
                  <div style={{
                    width: 2,
                    height: 8,
                    background: isPast || isActive ? 'var(--color-healthy)' : 'var(--bg-tertiary)',
                    marginBottom: 2,
                    transition: 'background 300ms',
                  }} />
                )}
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: isActive ? 'var(--color-info)' : (isPast ? 'var(--color-healthy)' : 'var(--bg-tertiary)'),
                  border: `2px solid ${isActive ? 'var(--color-info)' : (isPast ? 'var(--color-healthy)' : 'var(--border-primary)')}`,
                  transition: 'all 300ms',
                  flexShrink: 0,
                  marginTop: i === 0 ? 8 : 0,
                }} />
                {i < steps.length - 1 && (
                  <div style={{
                    width: 2,
                    flex: 1,
                    background: isPast ? 'var(--color-healthy)' : 'var(--bg-tertiary)',
                    marginTop: 2,
                    transition: 'background 300ms',
                  }} />
                )}
              </div>

              {/* Step card */}
              <div style={{
                flex: 1,
                marginLeft: 8,
                padding: '8px 10px',
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                background: isActive ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                opacity: isDimmed ? 0.4 : 1,
                transition: 'all 300ms',
                marginBottom: 0,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: isActive ? 'var(--color-info)' : (isPast ? 'var(--color-healthy)' : 'var(--text-primary)'),
                    transition: 'color 300ms',
                  }}>
                    {step.label}
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: isCached ? 'var(--color-healthy)' : (isActive ? 'var(--color-info)' : 'var(--text-muted)'),
                  }}>
                    {displayLatency}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolve button */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          style={{
            ...toggleStyle(false),
            background: resolving ? 'var(--bg-tertiary)' : 'var(--text-accent)',
            color: resolving ? 'var(--text-muted)' : 'var(--bg-primary)',
            border: `1px solid ${resolving ? 'var(--border-primary)' : 'var(--text-accent)'}`,
            cursor: resolving ? 'not-allowed' : 'pointer',
          }}
          onClick={handleResolve}
          disabled={resolving}
        >
          {resolving ? 'Resolving...' : isCached ? 'Resolve (cached)' : 'Resolve'}
        </button>
        <button style={toggleStyle(false)} onClick={handleReset}>Reset</button>
      </div>

      {/* Result */}
      {resolved && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--color-healthy)',
          borderRadius: 8,
          padding: '10px 12px',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Resolved</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-accent)' }}>
              {domain.label}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>→</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--color-healthy)' }}>
              {domain.ip}
            </span>
            <span style={{
              marginLeft: 'auto',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: isCached ? 'var(--color-healthy)' : 'var(--text-secondary)',
            }}>
              total: {totalLatency}
            </span>
          </div>
          {isCached && (
            <div style={{ fontSize: 11, color: 'var(--color-healthy)', marginTop: 4 }}>
              Served from cache — no upstream queries needed
            </div>
          )}
        </div>
      )}

      {/* Info footer */}
      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        {mode === 'DNS'
          ? 'DNS resolution walks a hierarchy. After the first lookup the result is cached locally, making subsequent queries nearly instant.'
          : 'Service discovery replaces hard-coded IPs. A registry tracks live instances so clients always reach healthy services.'}
      </div>
    </div>
  );
}
