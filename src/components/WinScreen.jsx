import { Trophy, ArrowRight, RotateCcw, ExternalLink } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS, TOTAL_LEVELS } from '../engine/LevelConfigs';

const CONFETTI = Array.from({ length: 30 }, (_, i) => ({
  left: `${(i * 3.33 + (i * 7) % 10)}%`,
  color: ['var(--color-healthy)', 'var(--color-info)', 'var(--text-accent)', 'var(--color-warning)', '#a855f7'][i % 5],
  borderRadius: i % 2 === 0 ? '50%' : '2px',
  duration: 2 + (i % 4),
  delay: (i % 6) * 0.4,
}));

const GRADE_COLORS = {
  S: '#fbbf24', A: '#22c55e', B: '#3b82f6', C: '#94a3b8', D: '#f59e0b', F: '#ef4444',
};

function GradeBar({ label, score }) {
  const color = score >= 80 ? 'var(--color-healthy)' : score >= 60 ? 'var(--color-info)' : score >= 40 ? 'var(--color-warning)' : 'var(--color-critical)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 70, textAlign: 'right', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 3, transition: 'width 600ms ease' }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color, width: 28, fontWeight: 700 }}>{score}</span>
    </div>
  );
}

export default function WinScreen() {
  const { level, gameStatus, loadLevel, grade } = useGameStore();

  if (gameStatus !== 'won') return null;

  const config = LEVEL_CONFIGS[level];
  const hasNextLevel = level < TOTAL_LEVELS;
  const letterColor = GRADE_COLORS[grade?.letter] || 'var(--text-muted)';

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflowY: 'auto', padding: '20px 0',
    }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {CONFETTI.map((c, i) => (
          <div key={i} style={{
            position: 'absolute', left: c.left, top: -10, width: 8, height: 8,
            borderRadius: c.borderRadius, background: c.color,
            animation: `confetti-fall ${c.duration}s linear ${c.delay}s infinite`,
          }} />
        ))}
      </div>

      <div className="animate-slide-up" style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--color-healthy)',
        borderRadius: 20,
        padding: '32px 36px',
        maxWidth: 540,
        width: '90%',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--color-healthy-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <Trophy size={28} style={{ color: 'var(--color-healthy)' }} />
        </div>

        <h2 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: 'var(--color-healthy)' }}>
          Mission Complete!
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Level {level} — {config.name}
        </p>

        {/* Grade Card */}
        {grade && (
          <div style={{
            background: 'var(--bg-primary)', borderRadius: 12, padding: '16px 20px',
            marginBottom: 16, display: 'flex', gap: 20, alignItems: 'center',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                background: `${letterColor}15`, border: `2px solid ${letterColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: letterColor, fontFamily: "'JetBrains Mono', monospace" }}>
                  {grade.letter}
                </span>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>
                {grade.overall}/100
              </span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <GradeBar label="Cost" score={grade.costScore} />
              <GradeBar label="Latency" score={grade.latencyScore} />
              <GradeBar label="Resilience" score={grade.resilienceScore} />
              <GradeBar label="Simplicity" score={grade.complexityScore} />
            </div>
          </div>
        )}

        {/* What You Learned */}
        <div style={{
          background: 'var(--bg-primary)', borderRadius: 12, padding: '16px 20px',
          marginBottom: 16, textAlign: 'left',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-healthy)', marginBottom: 6 }}>
            What You Learned
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            {config.winLesson}
          </p>
          {config.references && config.references.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                Deep Dive
              </div>
              {config.references.map((ref, i) => (
                <a
                  key={i}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12, color: 'var(--text-accent)', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <ExternalLink size={11} /> {ref.title}
                </a>
              ))}
            </div>
          )}
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
