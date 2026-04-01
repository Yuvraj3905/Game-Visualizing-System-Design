import { Play } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS } from '../engine/LevelConfigs';

export default function LevelIntro() {
  const { level, gameStatus, dismissIntro } = useGameStore();

  if (gameStatus !== 'intro') return null;

  const config = LEVEL_CONFIGS[level];
  const { narrative } = config;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="animate-slide-up" style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 20,
        padding: 40,
        maxWidth: 520,
        width: '90%',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-accent)', letterSpacing: '0.2em', marginBottom: 8 }}>
          Level {level}
        </div>
        <h2 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
          {narrative.title}
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {config.subtitle}
        </p>
        <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          {narrative.description}
        </p>

        <div style={{
          background: 'var(--bg-primary)', borderRadius: 12, padding: '16px 20px',
          marginBottom: 24, textAlign: 'left',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-accent)', marginBottom: 8 }}>
            Objective
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>
            {narrative.objective}
          </p>
        </div>

        <div style={{
          background: 'var(--bg-primary)', borderRadius: 12, padding: '12px 20px',
          marginBottom: 28, textAlign: 'left',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-warning)', marginBottom: 6 }}>
            Hint
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            {narrative.hint}
          </p>
        </div>

        <button
          onClick={dismissIntro}
          style={{
            padding: '12px 32px', background: 'var(--text-accent)', color: 'var(--bg-primary)',
            border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
            transition: 'transform 150ms',
          }}
        >
          <Play size={18} /> Start Mission
        </button>
      </div>
    </div>
  );
}
