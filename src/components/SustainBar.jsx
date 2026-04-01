import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS } from '../engine/LevelConfigs';

export default function SustainBar() {
  const { sustainedTicks, level, gameStatus } = useGameStore();
  const config = LEVEL_CONFIGS[level];

  if (gameStatus !== 'playing') return null;
  if (sustainedTicks === 0) return null;

  const requiredTicks = config.sustainSeconds * 2;
  const percent = Math.min((sustainedTicks / requiredTicks) * 100, 100);

  return (
    <div style={{
      position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-healthy)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Sustaining... {Math.round(percent)}%
      </span>
      <div style={{
        width: 300, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden',
        border: '1px solid var(--border-primary)',
      }}>
        <div style={{
          height: '100%', width: `${percent}%`,
          background: 'var(--color-healthy)',
          borderRadius: 3,
          transition: 'width 500ms ease',
          boxShadow: '0 0 8px var(--color-healthy-glow)',
        }} />
      </div>
    </div>
  );
}
