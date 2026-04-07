import { X, Flame, CalendarDays, Trophy, Clock } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS } from '../engine/LevelConfigs';
import { getDailyLevel, getTodayDateString, getStreak, getRecentHistory, loadDailyResult } from '../engine/DailyChallenge';
import RadarChart from './RadarChart';

const GRADE_COLORS = {
  S: '#fbbf24', A: '#22c55e', B: '#3b82f6', C: '#94a3b8', D: '#f59e0b', F: '#ef4444',
};

export default function DailyChallengeModal() {
  const showDailyModal = useGameStore((s) => s.showDailyModal);
  const toggleDailyModal = useGameStore((s) => s.toggleDailyModal);
  const loadDailyChallenge = useGameStore((s) => s.loadDailyChallenge);
  const dailyCompleted = useGameStore((s) => s.dailyCompleted);
  const dailyGrade = useGameStore((s) => s.dailyGrade);

  if (!showDailyModal) return null;

  const dailyLevel = getDailyLevel();
  const config = LEVEL_CONFIGS[dailyLevel];
  const todayResult = loadDailyResult();
  const streak = getStreak();
  const history = getRecentHistory(7);
  const completed = dailyCompleted || !!todayResult;
  const grade = dailyGrade || todayResult?.grade;
  const letterColor = grade ? (GRADE_COLORS[grade.letter] || 'var(--text-muted)') : null;

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
      onClick={toggleDailyModal}
    >
      <div
        className="animate-slide-up"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--text-accent)',
          borderRadius: 20, padding: '28px 32px',
          maxWidth: 480, width: '90%',
          textAlign: 'center', position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={toggleDailyModal}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4, borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--color-info-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 10px',
        }}>
          <CalendarDays size={24} style={{ color: 'var(--text-accent)' }} />
        </div>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: 'var(--text-accent)' }}>
          Daily Challenge
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {getTodayDateString()}
        </p>

        {/* Streak */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', background: streak.count > 0 ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-tertiary)',
          border: `1px solid ${streak.count > 0 ? 'var(--color-warning)' : 'var(--border-primary)'}`,
          borderRadius: 20, marginBottom: 16,
        }}>
          <Flame size={14} style={{ color: streak.count > 0 ? 'var(--color-warning)' : 'var(--text-muted)' }} />
          <span style={{
            fontSize: 13, fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            color: streak.count > 0 ? 'var(--color-warning)' : 'var(--text-muted)',
          }}>
            {streak.count} day streak
          </span>
        </div>

        {/* Today's Level */}
        <div style={{
          background: 'var(--bg-primary)', borderRadius: 12, padding: '14px 18px',
          marginBottom: 16, textAlign: 'left',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-accent)', marginBottom: 6, letterSpacing: '0.08em' }}>
            Today's Challenge — Level {dailyLevel}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {config.name}
          </div>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            {config.narrative?.description || config.subtitle}
          </p>
        </div>

        {/* Result or Start */}
        {completed && grade ? (
          <div style={{
            background: 'var(--bg-primary)', borderRadius: 12, padding: '14px 18px',
            marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: `${letterColor}15`, border: `2px solid ${letterColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: letterColor, fontFamily: "'JetBrains Mono', monospace" }}>
                  {grade.letter}
                </span>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, fontWeight: 600 }}>
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
        ) : (
          <button
            onClick={loadDailyChallenge}
            style={{
              padding: '12px 32px', background: 'var(--text-accent)', color: 'var(--bg-primary)',
              border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15,
              cursor: 'pointer', marginBottom: 16,
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            <Trophy size={16} /> Start Challenge
          </button>
        )}

        {completed && (
          <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--color-healthy)', fontWeight: 600 }}>
            Challenge complete! Come back tomorrow.
          </p>
        )}

        {/* Recent history */}
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.08em' }}>
            Last 7 Days
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {history.map((h, i) => (
              <div key={i} style={{
                flex: 1, textAlign: 'center', padding: '6px 4px',
                background: 'var(--bg-primary)', borderRadius: 8,
                border: `1px solid ${h.result ? 'var(--color-healthy)' : 'var(--border-primary)'}`,
              }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{h.date}</div>
                {h.result ? (
                  <div style={{
                    fontSize: 14, fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: GRADE_COLORS[h.result.grade?.letter] || 'var(--color-healthy)',
                  }}>
                    {h.result.grade?.letter || '-'}
                  </div>
                ) : (
                  <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>—</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
