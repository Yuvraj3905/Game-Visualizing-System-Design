import { useState } from 'react';
import { Target, ChevronDown, ChevronUp, Check } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS } from '../engine/LevelConfigs';
import { LEVEL_OBJECTIVES } from '../engine/ObjectiveChecklist';

export default function ObjectivePanel() {
  const [expanded, setExpanded] = useState(true);
  const { level, gameStatus, metrics, rps, sandboxMode } = useGameStore();

  if (gameStatus !== 'playing') return null;
  if (sandboxMode) return null;

  const config = LEVEL_CONFIGS[level];
  if (!config) return null;
  const objectives = LEVEL_OBJECTIVES[level] || [];
  const enrichedMetrics = { ...metrics, rps };
  const completedCount = objectives.filter(o => o.check(enrichedMetrics)).length;

  return (
    <div
      data-tour="objective-panel"
      className="animate-slide-up"
      style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 15,
        width: 280,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header — always visible */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          background: 'var(--bg-tertiary)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <Target size={14} style={{ color: 'var(--text-accent)' }} />
        <span style={{ flex: 1, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Objective
        </span>
        <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: completedCount === objectives.length ? 'var(--color-healthy)' : 'var(--text-accent)' }}>
          {completedCount}/{objectives.length}
        </span>
        {expanded ? <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />}
      </div>

      {/* Compact objective line — always shown */}
      <div style={{ padding: '10px 16px', borderBottom: expanded ? '1px solid var(--border-primary)' : 'none' }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
          {config.narrative.objective}
        </p>
      </div>

      {/* Expandable checklist + hint */}
      <div style={{
        maxHeight: expanded ? 300 : 0,
        overflow: 'hidden',
        transition: 'max-height 300ms ease',
      }}>
        <div style={{ padding: '12px 16px' }}>
          {/* Hint */}
          <p style={{ margin: '0 0 12px', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, fontStyle: 'italic' }}>
            {config.narrative.hint}
          </p>

          {/* Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {objectives.map((obj, i) => {
              const met = obj.check(enrichedMetrics);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    background: met ? 'var(--color-healthy)' : 'transparent',
                    border: met ? 'none' : '2px solid var(--border-primary)',
                    transition: 'all 300ms',
                  }}>
                    {met && <Check size={12} style={{ color: 'white' }} />}
                  </div>
                  <span style={{
                    fontSize: 12,
                    color: met ? 'var(--color-healthy)' : 'var(--text-secondary)',
                    textDecoration: met ? 'line-through' : 'none',
                    transition: 'color 300ms',
                  }}>
                    {obj.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
