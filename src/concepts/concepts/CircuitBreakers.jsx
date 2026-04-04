import { useState, useCallback, useRef, useEffect } from 'react';

const FAILURE_THRESHOLD = 3;
const SUCCESS_THRESHOLD = 2;
const TIMEOUT_MS = 3000;

const STATE_META = {
  Closed: {
    label: 'Closed',
    color: 'var(--color-healthy)',
    bg: 'var(--color-healthy-bg)',
    desc: 'Requests flow normally. Failures are counted.',
  },
  Open: {
    label: 'Open',
    color: 'var(--color-critical)',
    bg: 'var(--color-critical-bg)',
    desc: `Requests are blocked. Resets after ${TIMEOUT_MS / 1000}s timeout.`,
  },
  'Half-Open': {
    label: 'Half-Open',
    color: 'var(--color-warning)',
    bg: 'rgba(234,179,8,0.12)',
    desc: `Probing. ${SUCCESS_THRESHOLD} successes to close, 1 failure to reopen.`,
  },
};

const LOG_RESULT = {
  OK: { label: 'OK', color: 'var(--color-healthy)' },
  FAIL: { label: 'FAIL', color: 'var(--color-critical)' },
  BLOCKED: { label: 'BLOCKED', color: 'var(--color-warning)' },
};

export default function CircuitBreakers() {
  const [cbState, setCbState] = useState('Closed');
  const [downstreamHealthy, setDownstreamHealthy] = useState(true);
  const [failureCount, setFailureCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [log, setLog] = useState([]);

  const cbStateRef = useRef('Closed');
  const failureRef = useRef(0);
  const successRef = useRef(0);
  const openTimerRef = useRef(null);
  const downstreamRef = useRef(true);

  // Keep refs in sync with state
  useEffect(() => { cbStateRef.current = cbState; }, [cbState]);
  useEffect(() => { downstreamRef.current = downstreamHealthy; }, [downstreamHealthy]);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current !== null) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const transitionToOpen = useCallback(() => {
    clearOpenTimer();
    cbStateRef.current = 'Open';
    failureRef.current = 0;
    successRef.current = 0;
    setCbState('Open');
    setFailureCount(0);
    setSuccessCount(0);

    openTimerRef.current = setTimeout(() => {
      cbStateRef.current = 'Half-Open';
      failureRef.current = 0;
      successRef.current = 0;
      setCbState('Half-Open');
      setFailureCount(0);
      setSuccessCount(0);
      openTimerRef.current = null;
    }, TIMEOUT_MS);
  }, [clearOpenTimer]);

  const addLog = useCallback((result, reason) => {
    const entry = {
      id: Date.now() + Math.random(),
      result,
      reason,
      ts: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setLog(prev => [entry, ...prev].slice(0, 12));
  }, []);

  const sendRequest = useCallback(() => {
    const state = cbStateRef.current;
    const healthy = downstreamRef.current;

    if (state === 'Open') {
      addLog('BLOCKED', 'Circuit open — requests blocked');
      return;
    }

    if (state === 'Closed') {
      if (healthy) {
        failureRef.current = 0;
        setFailureCount(0);
        addLog('OK', 'Request succeeded');
      } else {
        failureRef.current += 1;
        setFailureCount(failureRef.current);
        addLog('FAIL', `Failure ${failureRef.current}/${FAILURE_THRESHOLD}`);
        if (failureRef.current >= FAILURE_THRESHOLD) {
          addLog('BLOCKED', `Threshold reached — circuit opened`);
          transitionToOpen();
        }
      }
      return;
    }

    // Half-Open
    if (healthy) {
      successRef.current += 1;
      setSuccessCount(successRef.current);
      addLog('OK', `Probe success ${successRef.current}/${SUCCESS_THRESHOLD}`);
      if (successRef.current >= SUCCESS_THRESHOLD) {
        clearOpenTimer();
        cbStateRef.current = 'Closed';
        failureRef.current = 0;
        successRef.current = 0;
        setCbState('Closed');
        setFailureCount(0);
        setSuccessCount(0);
        addLog('OK', 'Circuit closed — service recovered');
      }
    } else {
      successRef.current = 0;
      setSuccessCount(0);
      addLog('FAIL', 'Probe failed — circuit reopened');
      transitionToOpen();
    }
  }, [addLog, transitionToOpen, clearOpenTimer]);

  const toggleDownstream = useCallback(() => {
    setDownstreamHealthy(prev => !prev);
  }, []);

  const reset = useCallback(() => {
    clearOpenTimer();
    cbStateRef.current = 'Closed';
    failureRef.current = 0;
    successRef.current = 0;
    setCbState('Closed');
    setFailureCount(0);
    setSuccessCount(0);
    setLog([]);
  }, [clearOpenTimer]);

  useEffect(() => {
    return () => { clearOpenTimer(); };
  }, [clearOpenTimer]);

  const meta = STATE_META[cbState];

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
      <h3 style={{ margin: '0 0 4px', fontSize: 16, color: 'var(--text-accent)' }}>Circuit Breakers</h3>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        Automatically stop calling a failing service. Three states control request flow and recovery.
      </p>

      {/* State machine diagram */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, alignItems: 'stretch' }}>
        {Object.entries(STATE_META).map(([key, m]) => {
          const isActive = cbState === key;
          return (
            <div key={key} style={{
              flex: 1,
              padding: '10px 8px',
              borderRadius: 8,
              border: `2px solid ${isActive ? m.color : 'var(--border-primary)'}`,
              background: isActive ? m.bg : 'var(--bg-secondary)',
              transition: 'all 200ms',
              textAlign: 'center',
            }}>
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: isActive ? m.color : 'var(--bg-tertiary)',
                border: `2px solid ${m.color}`,
                margin: '0 auto 6px',
                transition: 'background 200ms',
                boxShadow: isActive ? `0 0 6px ${m.color}` : 'none',
              }} />
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: isActive ? m.color : 'var(--text-muted)',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.02em',
              }}>
                {m.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current state description */}
      <div style={{
        padding: '8px 12px',
        borderRadius: 8,
        background: 'var(--bg-secondary)',
        border: `1px solid ${meta.color}`,
        marginBottom: 14,
        fontSize: 12,
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
      }}>
        <span style={{ color: meta.color, fontWeight: 700 }}>{cbState}: </span>
        {meta.desc}
      </div>

      {/* Counters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, fontFamily: "'JetBrains Mono', monospace" }}>
        <div style={{
          flex: 1,
          padding: '8px 10px',
          background: 'var(--bg-tertiary)',
          borderRadius: 8,
          fontSize: 12,
          textAlign: 'center',
          border: '1px solid var(--border-primary)',
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 10, marginBottom: 2 }}>Failures</div>
          <div style={{
            color: failureCount > 0 ? 'var(--color-critical)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: 15,
          }}>
            {failureCount}/{FAILURE_THRESHOLD}
          </div>
        </div>
        <div style={{
          flex: 1,
          padding: '8px 10px',
          background: 'var(--bg-tertiary)',
          borderRadius: 8,
          fontSize: 12,
          textAlign: 'center',
          border: '1px solid var(--border-primary)',
          opacity: cbState === 'Half-Open' ? 1 : 0.4,
          transition: 'opacity 200ms',
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 10, marginBottom: 2 }}>Half-Open OK</div>
          <div style={{
            color: successCount > 0 ? 'var(--color-healthy)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: 15,
          }}>
            {successCount}/{SUCCESS_THRESHOLD}
          </div>
        </div>
        <div style={{
          flex: 1,
          padding: '8px 10px',
          background: 'var(--bg-tertiary)',
          borderRadius: 8,
          fontSize: 12,
          textAlign: 'center',
          border: '1px solid var(--border-primary)',
          opacity: cbState === 'Open' ? 1 : 0.4,
          transition: 'opacity 200ms',
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 10, marginBottom: 2 }}>Timeout</div>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: 15 }}>
            {TIMEOUT_MS / 1000}s
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <button
          onClick={sendRequest}
          style={{
            padding: '7px 16px',
            background: cbState === 'Open' ? 'var(--bg-tertiary)' : 'var(--text-accent)',
            color: cbState === 'Open' ? 'var(--text-muted)' : 'var(--bg-primary)',
            border: `1px solid ${cbState === 'Open' ? 'var(--border-primary)' : 'var(--text-accent)'}`,
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 150ms',
          }}
        >
          Send Request
        </button>
        <button
          onClick={toggleDownstream}
          style={{
            padding: '7px 16px',
            background: downstreamHealthy ? 'var(--color-healthy-bg)' : 'var(--color-critical-bg)',
            color: downstreamHealthy ? 'var(--color-healthy)' : 'var(--color-critical)',
            border: `1px solid ${downstreamHealthy ? 'var(--color-healthy)' : 'var(--color-critical)'}`,
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 150ms',
          }}
        >
          Downstream: {downstreamHealthy ? 'Healthy' : 'Failing'}
        </button>
        <button
          onClick={reset}
          style={{
            padding: '7px 12px',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      {/* Request log */}
      <div style={{
        background: 'var(--bg-tertiary)',
        borderRadius: 8,
        padding: 10,
        minHeight: 60,
        maxHeight: 220,
        overflowY: 'auto',
        border: '1px solid var(--border-primary)',
      }}>
        {log.length === 0 ? (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            No requests yet — click Send Request to begin
          </span>
        ) : (
          log.map(entry => (
            <div key={entry.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '3px 0',
              borderBottom: '1px solid var(--bg-secondary)',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{entry.ts}</span>
              <span style={{
                color: LOG_RESULT[entry.result].color,
                fontWeight: 700,
                minWidth: 52,
                flexShrink: 0,
              }}>
                {LOG_RESULT[entry.result].label}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 10 }}>{entry.reason}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
