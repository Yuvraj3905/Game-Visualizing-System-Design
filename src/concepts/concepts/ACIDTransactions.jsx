import { useState, useCallback } from 'react';

const INITIAL_ACCOUNTS = { Alice: 1000, Bob: 500, Charlie: 750 };

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
});

function dirtyReadSteps(isolation) {
  const base = { Alice: 1000, Bob: 500, Charlie: 750 };

  if (isolation === 'readUncommitted') {
    return [
      { tx: '-',  action: 'Begin: T1 will transfer $200 from Alice to Bob. T2 will read Alice\'s balance.', accounts: { ...base } },
      { tx: 'T1', action: 'T1 starts. Deducts $200 from Alice (uncommitted).', accounts: { Alice: 800, Bob: 500, Charlie: 750 } },
      { tx: 'T2', action: 'T2 reads Alice\'s balance → sees $800 (dirty, uncommitted!)', accounts: { Alice: 800, Bob: 500, Charlie: 750 }, anomaly: true },
      { tx: 'T1', action: 'T1 ROLLBACK — error occurred, Alice\'s balance restored to $1000.', accounts: { Alice: 1000, Bob: 500, Charlie: 750 } },
      { tx: 'T2', action: 'T2 proceeds using $800 — but Alice actually has $1000. Dirty read caused wrong logic!', accounts: { Alice: 1000, Bob: 500, Charlie: 750 }, anomaly: true },
    ];
  }

  // Read Committed or Serializable
  return [
    { tx: '-',  action: 'Begin: T1 will transfer $200 from Alice to Bob. T2 will read Alice\'s balance.', accounts: { ...base } },
    { tx: 'T1', action: 'T1 starts. Deducts $200 from Alice (uncommitted, not visible to others).', accounts: { Alice: 1000, Bob: 500, Charlie: 750 } },
    { tx: 'T2', action: 'T2 reads Alice\'s balance → sees $1000 (committed value, blocked from dirty data).', accounts: { Alice: 1000, Bob: 500, Charlie: 750 } },
    { tx: 'T1', action: 'T1 ROLLBACK — error occurred, Alice\'s balance stays $1000.', accounts: { Alice: 1000, Bob: 500, Charlie: 750 } },
    { tx: 'T2', action: 'T2 correctly used $1000. No anomaly — isolation prevented dirty read.', accounts: { Alice: 1000, Bob: 500, Charlie: 750 } },
  ];
}

function lostUpdateSteps(isolation) {
  const base = { Alice: 1000, Bob: 500, Charlie: 750 };

  if (isolation === 'serializable') {
    return [
      { tx: '-',  action: 'Begin: T1 adds $100 bonus to Bob. T2 adds $50 bonus to Bob. Initial Bob=$500.', accounts: { ...base } },
      { tx: 'T1', action: 'T1 acquires lock on Bob\'s account. Reads Bob → $500.', accounts: { ...base } },
      { tx: 'T2', action: 'T2 tries to lock Bob\'s account → BLOCKED, must wait for T1.', accounts: { ...base } },
      { tx: 'T1', action: 'T1 writes Bob = $500 + $100 = $600. Commits and releases lock.', accounts: { Alice: 1000, Bob: 600, Charlie: 750 } },
      { tx: 'T2', action: 'T2 acquires lock. Reads Bob → $600 (fresh, committed). Writes $600 + $50 = $650. Commits.', accounts: { Alice: 1000, Bob: 650, Charlie: 750 } },
      { tx: '-',  action: 'Final Bob = $650. Both updates preserved correctly!', accounts: { Alice: 1000, Bob: 650, Charlie: 750 } },
    ];
  }

  // Read Uncommitted or Read Committed — lost update possible
  return [
    { tx: '-',  action: 'Begin: T1 adds $100 bonus to Bob. T2 adds $50 bonus to Bob. Initial Bob=$500.', accounts: { ...base } },
    { tx: 'T1', action: 'T1 reads Bob → $500.', accounts: { ...base } },
    { tx: 'T2', action: 'T2 reads Bob → $500 (both transactions read the same value!)', accounts: { ...base } },
    { tx: 'T1', action: 'T1 writes Bob = $500 + $100 = $600. Commits.', accounts: { Alice: 1000, Bob: 600, Charlie: 750 } },
    { tx: 'T2', action: 'T2 writes Bob = $500 + $50 = $550. Commits — overwrites T1\'s update!', accounts: { Alice: 1000, Bob: 550, Charlie: 750 }, anomaly: true },
    { tx: '-',  action: 'Final Bob = $550. T1\'s $100 bonus was LOST. Expected $650!', accounts: { Alice: 1000, Bob: 550, Charlie: 750 }, anomaly: true },
  ];
}

const SCENARIOS = ['Dirty Read', 'Lost Update'];
const ISOLATIONS = [
  { key: 'readUncommitted', label: 'Read Uncommitted' },
  { key: 'readCommitted',   label: 'Read Committed' },
  { key: 'serializable',    label: 'Serializable' },
];

function getSteps(scenario, isolation) {
  if (scenario === 'Dirty Read') return dirtyReadSteps(isolation);
  return lostUpdateSteps(isolation);
}

function txColor(tx) {
  if (tx === 'T1') return 'var(--color-info)';
  if (tx === 'T2') return 'var(--color-warning)';
  return 'var(--text-secondary)';
}

export default function ACIDTransactions() {
  const [scenario, setScenario]   = useState('Dirty Read');
  const [isolation, setIsolation] = useState('readUncommitted');
  const [stepIndex, setStepIndex] = useState(-1);

  const steps = getSteps(scenario, isolation);
  const currentStep = stepIndex >= 0 ? steps[stepIndex] : null;
  const log = stepIndex >= 0 ? steps.slice(0, stepIndex + 1) : [];
  const accounts = currentStep ? currentStep.accounts : INITIAL_ACCOUNTS;
  const prevAccounts = stepIndex > 0 ? steps[stepIndex - 1].accounts : INITIAL_ACCOUNTS;

  const handleScenarioChange = useCallback((s) => {
    setScenario(s);
    setStepIndex(-1);
  }, []);

  const handleIsolationChange = useCallback((iso) => {
    setIsolation(iso);
    setStepIndex(-1);
  }, []);

  const handleNext = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [steps.length]);

  const handleReset = useCallback(() => {
    setStepIndex(-1);
  }, []);

  const started = stepIndex >= 0;
  const finished = stepIndex >= steps.length - 1;

  return (
    <div style={{
      maxWidth: 520,
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      {/* Scenario selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {SCENARIOS.map((s) => (
          <button key={s} style={toggleStyle(scenario === s)} onClick={() => handleScenarioChange(s)}>
            {s}
          </button>
        ))}
      </div>

      {/* Isolation level selector */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {ISOLATIONS.map(({ key, label }) => (
          <button
            key={key}
            style={{ ...toggleStyle(isolation === key), padding: '4px 10px', fontSize: 11 }}
            onClick={() => handleIsolationChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Account balance cards */}
      <div style={{ display: 'flex', gap: 10 }}>
        {Object.entries(accounts).map(([name, balance]) => {
          const changed = balance !== prevAccounts[name];
          return (
            <div key={name} style={{
              flex: 1,
              background: 'var(--bg-secondary)',
              border: `1.5px solid ${changed ? 'var(--text-accent)' : 'var(--border-primary)'}`,
              borderRadius: 10,
              padding: '10px 12px',
              transition: 'border-color 200ms',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{name}</div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 18,
                fontWeight: 700,
                color: changed ? 'var(--text-accent)' : 'var(--text-primary)',
                transition: 'color 200ms',
              }}>
                ${balance}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8 }}>
        {!started ? (
          <button
            onClick={handleNext}
            style={{
              flex: 1,
              padding: '8px 0',
              background: 'var(--text-accent)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Start
          </button>
        ) : (
          <>
            <button
              onClick={handleNext}
              disabled={finished}
              style={{
                flex: 1,
                padding: '8px 0',
                background: finished ? 'var(--bg-tertiary)' : 'var(--text-accent)',
                color: finished ? 'var(--text-muted)' : 'var(--bg-primary)',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: finished ? 'default' : 'pointer',
              }}
            >
              Next Step
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: '8px 16px',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                border: `1px solid var(--border-primary)`,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </>
        )}
      </div>

      {/* Transaction log */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 10,
        padding: 12,
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Transaction Log
        </div>
        {log.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Press Start to begin the simulation.
          </div>
        )}
        {log.map((entry, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            padding: '6px 8px',
            background: entry.anomaly ? 'rgba(239,68,68,0.08)' : 'var(--bg-tertiary)',
            border: `1px solid ${entry.anomaly ? 'var(--color-critical)' : 'var(--border-primary)'}`,
            borderRadius: 6,
          }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 700,
              color: entry.anomaly ? 'var(--color-critical)' : txColor(entry.tx),
              minWidth: 22,
              paddingTop: 1,
            }}>
              {entry.tx}
            </span>
            <span style={{ fontSize: 12, color: entry.anomaly ? 'var(--color-critical)' : 'var(--text-secondary)', flex: 1, lineHeight: 1.45 }}>
              {entry.action}
            </span>
            {entry.anomaly && (
              <span style={{
                fontSize: 9,
                fontWeight: 800,
                color: 'var(--color-critical)',
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid var(--color-critical)',
                borderRadius: 4,
                padding: '2px 5px',
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
                alignSelf: 'center',
              }}>
                ANOMALY
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
