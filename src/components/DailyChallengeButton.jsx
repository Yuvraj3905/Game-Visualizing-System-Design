import { CalendarDays } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import Tooltip from './Tooltip';

export default function DailyChallengeButton({ isCompact, isPhone }) {
  const toggleDailyModal = useGameStore((s) => s.toggleDailyModal);
  const dailyStreak = useGameStore((s) => s.dailyStreak);

  return (
    <Tooltip text="Daily Challenge" position="bottom">
      <button
        onClick={toggleDailyModal}
        style={{
          padding: isPhone ? '6px 8px' : '8px 12px',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 10,
          fontSize: isPhone ? 11 : 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: isPhone ? 4 : 6,
          position: 'relative',
        }}
      >
        <CalendarDays size={14} />
        {!isCompact && ' Daily'}
        {dailyStreak > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6,
            width: 18, height: 18, borderRadius: '50%',
            background: 'var(--color-warning)',
            color: 'var(--bg-primary)',
            fontSize: 10, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {dailyStreak}
          </span>
        )}
      </button>
    </Tooltip>
  );
}
