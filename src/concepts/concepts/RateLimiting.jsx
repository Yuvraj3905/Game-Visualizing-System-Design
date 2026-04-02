import { useState, useRef, useEffect, useCallback } from 'react';

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
});

const ALGOS = ['Token Bucket', 'Sliding Window', 'Fixed Window'];
const LIMIT = 5;
const WINDOW_MS = 2000;
const REFILL_MS = 400;

const DESCRIPTIONS = {
  'Token Bucket': 'Tokens refill at a steady rate. Each request costs 1 token. Allows controlled bursts when bucket is full.',
  'Sliding Window': 'Counts requests in a rolling time window. Smooth rate enforcement with no boundary burst problem.',
  'Fixed Window': 'Counts requests in fixed time intervals. Simple but allows 2x burst at window boundaries.',
};

export default function RateLimiting() {
  const [algo, setAlgo] = useState('Token Bucket');
  const [tokens, setTokens] = useState(LIMIT);
  const [windowCount, setWindowCount] = useState(0);
  const [log, setLog] = useState([]);

  const tokensRef = useRef(LIMIT);
  const windowCountRef = useRef(0);
  const windowStartRef = useRef(0);
  const lastRefill = useRef(0);
  const steadyRef = useRef(null);
  const burstRef = useRef(false);

  useEffect(() => {
    const now = performance.now();
    windowStartRef.current = now;
    lastRefill.current = now;
  }, []);

  // Token refill timer
  useEffect(() => {
    if (algo !== 'Token Bucket') return;
    const interval = setInterval(() => {
      if (tokensRef.current < LIMIT) {
        tokensRef.current++;
        setTokens(tokensRef.current);
      }
    }, REFILL_MS);
    return () => clearInterval(interval);
  }, [algo]);

  // Fixed window reset timer
  useEffect(() => {
    if (algo !== 'Fixed Window') return;
    const interval = setInterval(() => {
      windowCountRef.current = 0;
      setWindowCount(0);
    }, WINDOW_MS);
    return () => clearInterval(interval);
  }, [algo]);

  const tryRequest = useCallback(() => {
    const now = performance.now();
    let allowed = false;

    if (algo === 'Token Bucket') {
      if (tokensRef.current > 0) {
        tokensRef.current--;
        setTokens(tokensRef.current);
        allowed = true;
      }
    } else if (algo === 'Sliding Window') {
      // Count requests in last WINDOW_MS
      const cutoff = now - WINDOW_MS;
      const recent = log.filter(r => r.time > cutoff && r.allowed).length;
      allowed = recent < LIMIT;
    } else {
      // Fixed Window
      allowed = windowCountRef.current < LIMIT;
      if (allowed) {
        windowCountRef.current++;
        setWindowCount(windowCountRef.current);
      }
    }

    const entry = { time: now, allowed, id: now };
    setLog(prev => [...prev.slice(-30), entry]);
    return allowed;
  }, [algo, log]);

  const switchAlgo = useCallback((a) => {
    setAlgo(a);
    setLog([]);
    clearInterval(steadyRef.current);
    burstRef.current = false;
    tokensRef.current = LIMIT; setTokens(LIMIT);
    windowCountRef.current = 0; setWindowCount(0);
    const now = performance.now();
    windowStartRef.current = now;
    lastRefill.current = now;
  }, []);

  const sendBurst = useCallback(() => {
    let count = 0;
    const iv = setInterval(() => {
      tryRequest();
      count++;
      if (count >= 8) clearInterval(iv);
    }, 50);
  }, [tryRequest]);

  const startSteady = useCallback(() => {
    clearInterval(steadyRef.current);
    steadyRef.current = setInterval(() => tryRequest(), 400);
  }, [tryRequest]);

  const stop = useCallback(() => {
    clearInterval(steadyRef.current);
    steadyRef.current = null;
  }, []);

  useEffect(() => {
    return () => { clearInterval(steadyRef.current); };
  }, []);

  const allowed = log.filter(r => r.allowed).length;
  const blocked = log.filter(r => !r.allowed).length;
  const bucketFill = (tokens / LIMIT) * 100;

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: 20, borderRadius: 12, border: '1px solid var(--border-primary)', maxWidth: 500 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 16, color: 'var(--text-accent)' }}>Rate Limiting</h3>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {ALGOS.map(a => (
          <button key={a} style={toggleStyle(algo === a)} onClick={() => switchAlgo(a)}>{a}</button>
        ))}
      </div>

      <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        {DESCRIPTIONS[algo]}
      </p>

      {/* Token Bucket Visual */}
      {algo === 'Token Bucket' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 50, height: 60, border: '2px solid var(--text-accent)', borderRadius: '0 0 8px 8px',
            borderTop: 'none', position: 'relative', overflow: 'hidden', background: 'var(--bg-tertiary)',
          }}>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: `${bucketFill}%`, background: 'var(--text-accent)', opacity: 0.3,
              transition: 'height 200ms',
            }} />
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: 'var(--text-accent)',
            }}>
              {tokens}
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            <div>Capacity: {LIMIT} tokens</div>
            <div>Refill: 1 per {REFILL_MS}ms</div>
          </div>
        </div>
      )}

      {/* Window Counter */}
      {algo !== 'Token Bucket' && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px',
          background: 'var(--bg-tertiary)', borderRadius: 8, marginBottom: 16,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Window:</span>
          <span style={{ color: windowCount >= LIMIT ? 'var(--color-critical)' : 'var(--color-healthy)', fontWeight: 700 }}>
            {windowCount}/{LIMIT}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>({WINDOW_MS}ms)</span>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={sendBurst} style={{
          padding: '6px 14px', background: 'var(--color-warning)', color: 'var(--bg-primary)',
          border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>
          Send Burst (8)
        </button>
        <button onClick={startSteady} style={{
          padding: '6px 14px', background: 'var(--color-info)', color: 'white',
          border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>
          Steady Stream
        </button>
        <button onClick={stop} style={{
          padding: '6px 14px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
          border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>
          Stop
        </button>
      </div>

      {/* Request Log */}
      <div style={{
        display: 'flex', gap: 3, flexWrap: 'wrap', padding: 12,
        background: 'var(--bg-tertiary)', borderRadius: 8, minHeight: 40, alignItems: 'center',
      }}>
        {log.length === 0 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>No requests yet — click Send Burst or Steady Stream</span>}
        {log.map((r, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: r.allowed ? 'var(--color-healthy)' : 'var(--color-critical)',
            opacity: 0.8,
            transition: 'all 150ms',
          }} title={r.allowed ? 'Allowed' : 'Blocked'} />
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
        <span style={{ color: 'var(--color-healthy)' }}>Allowed: {allowed}</span>
        <span style={{ color: 'var(--color-critical)' }}>Blocked: {blocked}</span>
        <span style={{ color: 'var(--text-muted)' }}>Total: {log.length}</span>
      </div>
    </div>
  );
}
