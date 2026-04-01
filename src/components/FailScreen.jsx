import { AlertTriangle, RotateCcw, Lightbulb } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS } from '../engine/LevelConfigs';

export default function FailScreen() {
  const { level, gameStatus, retryLevel, metrics } = useGameStore();

  if (gameStatus !== 'failed') return null;

  const config = LEVEL_CONFIGS[level];
  const isBlackout = metrics.systemDown;

  return (
    <div
      className={isBlackout ? 'animate-screen-flicker' : ''}
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: isBlackout ? 'rgba(0, 0, 0, 0.95)' : 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div className="animate-slide-up" style={{
        background: isBlackout ? 'var(--bg-primary)' : 'var(--bg-secondary)',
        border: '1px solid var(--color-critical)',
        borderRadius: 20,
        padding: 40,
        maxWidth: 520,
        width: '90%',
        textAlign: 'center',
      }}>
        {isBlackout ? (
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 32, fontWeight: 700,
            color: 'var(--color-critical)', marginBottom: 16, letterSpacing: '0.1em',
          }}>
            SYSTEM DOWN
          </div>
        ) : (
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--color-critical-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <AlertTriangle size={32} style={{ color: 'var(--color-critical)' }} />
          </div>
        )}

        <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, color: 'var(--color-critical)' }}>
          {config.failMessage}
        </h2>

        <div style={{
          background: 'var(--bg-primary)', borderRadius: 12, padding: '16px 20px',
          margin: '20px 0', textAlign: 'left',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Lightbulb size={14} style={{ color: 'var(--color-warning)' }} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-warning)', letterSpacing: '0.1em' }}>
              What went wrong
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            {config.failExplanation}
          </p>
        </div>

        <button
          onClick={retryLevel}
          style={{
            padding: '12px 32px', background: 'var(--color-critical)', color: 'white',
            border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
        >
          <RotateCcw size={16} /> Try Again
        </button>
      </div>
    </div>
  );
}
