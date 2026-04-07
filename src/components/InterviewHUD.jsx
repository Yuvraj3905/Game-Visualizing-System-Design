import { Clock, Send } from 'lucide-react';
import useGameStore from '../store/useGameStore';

export default function InterviewHUD() {
  const interviewMode = useGameStore((s) => s.interviewMode);
  const interviewTimer = useGameStore((s) => s.interviewTimer);
  const submitSolution = useGameStore((s) => s.submitSolution);
  const gameStatus = useGameStore((s) => s.gameStatus);

  if (!interviewMode || gameStatus !== 'playing') return null;

  const minutes = Math.floor(interviewTimer / 60);
  const seconds = interviewTimer % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isWarning = interviewTimer <= 300 && interviewTimer > 60;
  const isCritical = interviewTimer <= 60;
  const timerColor = isCritical ? 'var(--color-critical)' : isWarning ? 'var(--color-warning)' : 'var(--text-accent)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 8,
        background: isCritical ? 'var(--color-critical-bg)' : isWarning ? 'var(--color-warning-bg)' : 'var(--color-info-bg)',
        border: `1px solid ${timerColor}`,
        animation: isCritical ? 'pulse-border 1s infinite' : 'none',
      }}>
        <Clock size={14} style={{ color: timerColor }} />
        <span style={{
          fontSize: 16, fontWeight: 800,
          fontFamily: "'JetBrains Mono', monospace",
          color: timerColor,
          minWidth: 52,
        }}>
          {timeStr}
        </span>
      </div>
      <button
        onClick={submitSolution}
        style={{
          padding: '6px 14px', background: 'var(--color-healthy)',
          color: 'var(--bg-primary)', border: 'none', borderRadius: 8,
          fontWeight: 700, fontSize: 12, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 5,
        }}
      >
        <Send size={12} /> Submit
      </button>
    </div>
  );
}
