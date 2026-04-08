import { X, Trophy } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS } from '../engine/LevelConfigs';
import {
  getWeeklyRounds,
  getWeekDisplayString,
  loadWeeklyResult,
  getWeeklyHistory,
} from '../engine/WeeklyTournament';

const DIFFICULTY_COLORS = {
  Easy: '#22c55e',
  Medium: '#3b82f6',
  Hard: '#a855f7',
};

const GRADE_COLORS = {
  S: '#fbbf24', A: '#22c55e', B: '#3b82f6', C: '#94a3b8', D: '#f59e0b', F: '#ef4444',
};

export default function WeeklyTournamentModal() {
  const showWeeklyTournament = useGameStore((s) => s.showWeeklyTournament);
  const toggleWeeklyTournament = useGameStore((s) => s.toggleWeeklyTournament);
  const loadLevel = useGameStore((s) => s.loadLevel);

  if (!showWeeklyTournament) return null;

  const rounds = getWeeklyRounds();
  const weekLabel = getWeekDisplayString();
  const weekResult = loadWeeklyResult();
  const history = getWeeklyHistory(4);

  const completedRounds = weekResult?.rounds || [null, null, null];
  const totalScore = weekResult?.totalScore || 0;

  function handlePlay(round) {
    toggleWeeklyTournament();
    loadLevel(round.level);
  }

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
      onClick={toggleWeeklyTournament}
    >
      <div
        className="animate-slide-up"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--text-accent)',
          borderRadius: 20,
          maxWidth: 500, width: '92%',
          maxHeight: '85vh',
          display: 'flex', flexDirection: 'column',
          position: 'relative',
          fontFamily: "'Inter', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned header */}
        <div style={{
          padding: '24px 28px 18px',
          borderBottom: '1px solid var(--border-primary)',
          flexShrink: 0,
        }}>
          {/* Close button */}
          <button
            onClick={toggleWeeklyTournament}
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>

          {/* Trophy icon */}
          <div style={{
            width: 46, height: 46, borderRadius: '50%',
            background: 'rgba(168, 85, 247, 0.12)',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 10px',
          }}>
            <Trophy size={22} style={{ color: '#a855f7' }} />
          </div>

          <h2 style={{
            margin: '0 0 4px', textAlign: 'center',
            fontSize: 21, fontWeight: 800, color: 'var(--text-primary)',
          }}>
            Weekly Tournament
          </h2>
          <p style={{
            margin: 0, textAlign: 'center',
            fontSize: 11, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {weekLabel}
          </p>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', padding: '20px 28px 28px', flex: 1 }}>

          {/* Round cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {rounds.map((round, i) => {
              const config = LEVEL_CONFIGS[round.level];
              const roundResult = completedRounds[i];
              const diffColor = DIFFICULTY_COLORS[round.difficulty];
              const gradeColor = roundResult?.grade
                ? (GRADE_COLORS[roundResult.grade.letter] || 'var(--text-muted)')
                : null;

              return (
                <div
                  key={round.round}
                  style={{
                    background: 'var(--bg-primary)',
                    border: `1px solid ${roundResult ? diffColor + '55' : 'var(--border-primary)'}`,
                    borderRadius: 12, padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}
                >
                  {/* Round badge */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: `${diffColor}18`,
                    border: `2px solid ${diffColor}`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontSize: 15, fontWeight: 900,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: diffColor, lineHeight: 1,
                    }}>
                      {round.round}
                    </span>
                  </div>

                  {/* Level info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.08em', color: diffColor,
                        background: `${diffColor}18`,
                        padding: '2px 7px', borderRadius: 20,
                      }}>
                        {round.difficulty}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        Level {round.level}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 14, fontWeight: 700,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {config?.name || `Level ${round.level}`}
                    </div>
                  </div>

                  {/* Result or play */}
                  {roundResult ? (
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 9,
                        background: `${gradeColor}15`,
                        border: `2px solid ${gradeColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 2,
                      }}>
                        <span style={{
                          fontSize: 20, fontWeight: 900,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: gradeColor,
                        }}>
                          {roundResult.grade?.letter || '?'}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 10, color: 'var(--text-muted)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                      }}>
                        {roundResult.score ?? '—'}/100
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePlay(round)}
                      style={{
                        padding: '8px 18px',
                        background: diffColor,
                        color: '#fff',
                        border: 'none', borderRadius: 9,
                        fontWeight: 700, fontSize: 13,
                        cursor: 'pointer', flexShrink: 0,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Play
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total score */}
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 12, padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 24,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total Score
            </span>
            <span style={{
              fontSize: 18, fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              color: totalScore > 0 ? 'var(--text-accent)' : 'var(--text-muted)',
            }}>
              {totalScore} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>/ 300</span>
            </span>
          </div>

          {/* Past weeks history */}
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              color: 'var(--text-muted)', marginBottom: 10,
            }}>
              Past Weeks
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {history.map((h, i) => {
                const score = h.result?.totalScore ?? null;
                const done = h.result?.completedAt != null;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1, textAlign: 'center',
                      padding: '8px 6px',
                      background: 'var(--bg-primary)',
                      borderRadius: 9,
                      border: `1px solid ${done ? '#a855f755' : 'var(--border-primary)'}`,
                    }}
                  >
                    <div style={{
                      fontSize: 9, color: 'var(--text-muted)',
                      marginBottom: 5, fontFamily: "'JetBrains Mono', monospace",
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {h.week.slice(5)}
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 800,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: score !== null ? (done ? '#a855f7' : 'var(--text-secondary)') : 'var(--text-muted)',
                    }}>
                      {score !== null ? score : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
