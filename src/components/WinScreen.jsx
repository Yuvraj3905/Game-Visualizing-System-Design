import { Trophy, ArrowRight, RotateCcw, ExternalLink, Flame, ArrowLeft } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS, TOTAL_LEVELS } from '../engine/LevelConfigs';
import RadarChart from './RadarChart';

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


export default function WinScreen() {
  const { level, gameStatus, loadLevel, grade, dailyMode, dailyStreak, exitDailyChallenge, interviewMode } = useGameStore();

  if (gameStatus !== 'won' || interviewMode) return null;

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
          {dailyMode ? 'Daily Challenge Complete!' : 'Mission Complete!'}
        </h2>
        <p style={{ margin: '0 0 4px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Level {level} — {config.name}
        </p>
        {dailyMode && dailyStreak > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 12px', background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid var(--color-warning)', borderRadius: 16,
            marginBottom: 12,
          }}>
            <Flame size={13} style={{ color: 'var(--color-warning)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-warning)', fontFamily: "'JetBrains Mono', monospace" }}>
              {dailyStreak} day streak
            </span>
          </div>
        )}
        {!dailyMode && <div style={{ marginBottom: 16 }} />}

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
            <div style={{ flex: 1 }}>
              <RadarChart scores={{
                cost: grade.costScore,
                latency: grade.latencyScore,
                resilience: grade.resilienceScore,
                simplicity: grade.complexityScore,
              }} />
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
          {dailyMode ? (
            <button
              onClick={exitDailyChallenge}
              style={{
                padding: '10px 24px', background: 'var(--text-accent)', color: 'var(--bg-primary)',
                border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <ArrowLeft size={14} /> Back to Menu
            </button>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
