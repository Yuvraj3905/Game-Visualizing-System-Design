import { Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS, TOTAL_LEVELS } from '../engine/LevelConfigs';

// Pre-computed confetti positions to avoid Math.random in render
const CONFETTI = Array.from({ length: 30 }, (_, i) => ({
  left: `${(i * 3.33 + (i * 7) % 10)}%`,
  color: ['var(--color-healthy)', 'var(--color-info)', 'var(--text-accent)', 'var(--color-warning)', '#a855f7'][i % 5],
  borderRadius: i % 2 === 0 ? '50%' : '2px',
  duration: 2 + (i % 4),
  delay: (i % 6) * 0.4,
}));

export default function WinScreen() {
  const { level, gameStatus, loadLevel } = useGameStore();

  if (gameStatus !== 'won') return null;

  const config = LEVEL_CONFIGS[level];
  const hasNextLevel = level < TOTAL_LEVELS;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {CONFETTI.map((c, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: c.left,
            top: -10,
            width: 8,
            height: 8,
            borderRadius: c.borderRadius,
            background: c.color,
            animation: `confetti-fall ${c.duration}s linear ${c.delay}s infinite`,
          }} />
        ))}
      </div>

      <div className="animate-slide-up" style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--color-healthy)',
        borderRadius: 20,
        padding: 40,
        maxWidth: 520,
        width: '90%',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--color-healthy-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Trophy size={32} style={{ color: 'var(--color-healthy)' }} />
        </div>

        <h2 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800, color: 'var(--color-healthy)' }}>
          Mission Complete!
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Level {level} — {config.name}
        </p>

        <div style={{
          background: 'var(--bg-primary)', borderRadius: 12, padding: '20px',
          marginBottom: 28, textAlign: 'left',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-healthy)', marginBottom: 8 }}>
            What You Learned
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            {config.winLesson}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => loadLevel(level)}
            style={{
              padding: '10px 20px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)', borderRadius: 10, fontWeight: 600, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <RotateCcw size={14} /> Replay
          </button>
          {hasNextLevel && (
            <button
              onClick={() => loadLevel(level + 1)}
              style={{
                padding: '10px 24px', background: 'var(--text-accent)', color: 'var(--bg-primary)',
                border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              Next Level <ArrowRight size={16} />
            </button>
          )}
          {!hasNextLevel && (
            <div style={{ padding: '10px 24px', background: 'var(--color-healthy-bg)', color: 'var(--color-healthy)', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
              You mastered System Design!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
