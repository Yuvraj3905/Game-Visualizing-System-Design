import { Lock, Check, ChevronRight, X, Beaker, Briefcase } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS, TOTAL_LEVELS } from '../engine/LevelConfigs';
import { INTERVIEW_SCENARIOS } from '../engine/InterviewConfigs';
import { loadInterviewResult } from '../engine/InterviewGrader';

export default function LevelSelect() {
  const { showLevelSelect, toggleLevelSelect, unlockedLevel, level: currentLevel, loadLevel, stopSimulation, startSandbox, loadInterview } = useGameStore();

  if (!showLevelSelect) return null;

  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

  const handleSelect = (lvl) => {
    if (lvl > unlockedLevel) return;
    stopSimulation();
    loadLevel(lvl);
    toggleLevelSelect();
  };

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
        padding: '32px',
        maxWidth: 480,
        width: '90%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Select Level</h2>
          <button
            onClick={toggleLevelSelect}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {levels.map(lvl => {
            const config = LEVEL_CONFIGS[lvl];
            const isLocked = lvl > unlockedLevel;
            const isCompleted = lvl < unlockedLevel;
            const isCurrent = lvl === currentLevel;

            return (
              <button
                key={lvl}
                onClick={() => handleSelect(lvl)}
                disabled={isLocked}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 12,
                  background: isCurrent ? 'var(--color-info-bg)' : 'var(--bg-tertiary)',
                  border: `1px solid ${isCurrent ? 'var(--color-info)' : 'var(--border-primary)'}`,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.4 : 1,
                  textAlign: 'left',
                  transition: 'all 150ms',
                  width: '100%',
                  color: 'inherit',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isCompleted ? 'var(--color-healthy-bg)' : isLocked ? 'var(--bg-primary)' : 'var(--color-info-bg)',
                  flexShrink: 0,
                }}>
                  {isLocked ? (
                    <Lock size={16} style={{ color: 'var(--text-muted)' }} />
                  ) : isCompleted ? (
                    <Check size={16} style={{ color: 'var(--color-healthy)' }} />
                  ) : (
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-info)' }}>{lvl}</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {config.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {config.subtitle}
                  </div>
                </div>
                {!isLocked && <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
              </button>
            );
          })}

          {/* Sandbox Mode Button */}
          <button
            onClick={() => { toggleLevelSelect(); startSandbox(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderRadius: 12,
              background: 'var(--bg-primary)',
              border: '1px dashed var(--text-accent)',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 150ms', width: '100%',
              color: 'inherit', fontFamily: 'inherit',
              marginTop: 8,
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(56, 189, 248, 0.1)', flexShrink: 0,
            }}>
              <Beaker size={18} style={{ color: 'var(--text-accent)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-accent)' }}>Sandbox Mode</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Unlimited budget, all components, no objectives</div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-accent)' }} />
          </button>

          {/* Interview Prep Section */}
          <div style={{
            marginTop: 16, paddingTop: 16,
            borderTop: '1px solid var(--border-primary)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
            }}>
              <Briefcase size={16} style={{ color: '#a855f7' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#a855f7' }}>Interview Prep</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', padding: '2px 6px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: 8 }}>
                45 min timed
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {INTERVIEW_SCENARIOS.map((scenario, i) => {
                const saved = loadInterviewResult(i);
                const OUTCOME_COLORS = { 'Strong Hire': '#22c55e', 'Hire': '#3b82f6', 'Lean Hire': '#f59e0b', 'No Hire': '#ef4444' };
                return (
                  <button
                    key={i}
                    onClick={() => { toggleLevelSelect(); loadInterview(i); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 14px', borderRadius: 10,
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 150ms', width: '100%',
                      color: 'inherit', fontFamily: 'inherit',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(168, 85, 247, 0.1)', flexShrink: 0,
                    }}>
                      <Briefcase size={14} style={{ color: '#a855f7' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {scenario.name}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {scenario.subtitle}
                      </div>
                    </div>
                    {saved ? (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                        color: OUTCOME_COLORS[saved.bestOutcome] || 'var(--text-muted)',
                        background: `${OUTCOME_COLORS[saved.bestOutcome] || 'var(--text-muted)'}15`,
                      }}>
                        {saved.bestScore}/100
                      </span>
                    ) : (
                      <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
