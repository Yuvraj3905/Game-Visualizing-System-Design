import { useState } from 'react';
import { Target, ChevronDown, ChevronUp, Check } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS } from '../engine/LevelConfigs';
import { LEVEL_OBJECTIVES } from '../engine/ObjectiveChecklist';

export default function ObjectivePanel() {
  const [collapsed, setCollapsed] = useState(false);
  const { level, gameStatus, metrics, rps } = useGameStore();

  if (gameStatus !== 'playing') return null;

  const config = LEVEL_CONFIGS[level];
  const objectives = LEVEL_OBJECTIVES[level] || [];
  const enrichedMetrics = { ...metrics, rps };

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
      {/* Header */}
      <div
        onClick={() => setCollapsed(c => !c)}
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
        {collapsed ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
      </div>

      {/* Body */}
      <div style={{
        maxHeight: collapsed ? 0 : 300,
        overflow: 'hidden',
        transition: 'max-height 300ms ease',
      }}>
        <div style={{ padding: 16 }}>
          {/* Objective text */}
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            {config.narrative.objective}
          </p>

          {/* Hint */}
          <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, fontStyle: 'italic' }}>
            {config.narrative.hint}
          </p>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border-primary)', margin: '12px 0' }} />

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
