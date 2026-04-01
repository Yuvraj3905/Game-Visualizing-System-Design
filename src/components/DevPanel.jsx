import { useState } from 'react';
import { Bug, ChevronDown, ChevronUp, Unlock, DollarSign, Play, SkipForward } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS, TOTAL_LEVELS } from '../engine/LevelConfigs';

export default function DevPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    level, unlockedLevel, money, gameStatus, rps, latency,
    loadLevel, setMoney, dismissIntro,
  } = useGameStore();

  const unlockAll = () => {
    useGameStore.setState({ unlockedLevel: TOTAL_LEVELS });
  };

  const jumpToLevel = (lvl) => {
    loadLevel(lvl);
  };

  const addBudget = (amount) => {
    setMoney(money + amount);
  };

  const skipToPlaying = () => {
    if (gameStatus === 'intro') {
      dismissIntro();
    }
  };

  const forceWin = () => {
    useGameStore.getState().onWin();
  };

  const btnStyle = (color = 'var(--color-info)') => ({
    padding: '5px 10px', background: `${color}20`, color,
    border: `1px solid ${color}40`, borderRadius: 6, fontSize: 11,
    cursor: 'pointer', fontWeight: 600, fontFamily: "'Inter', sans-serif",
    transition: 'all 150ms',
  });

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: 20, zIndex: 60,
      width: collapsed ? 'auto' : 260,
      background: 'var(--bg-secondary)',
      border: '1px solid var(--color-warning)',
      borderRadius: 12,
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', background: 'rgba(245,158,11,0.1)',
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        <Bug size={14} style={{ color: 'var(--color-warning)' }} />
        <span style={{ flex: 1, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-warning)', letterSpacing: '0.1em' }}>
          Dev Panel
        </span>
        {collapsed
          ? <ChevronUp size={14} style={{ color: 'var(--color-warning)' }} />
          : <ChevronDown size={14} style={{ color: 'var(--color-warning)' }} />
        }
      </div>

      {/* Body */}
      <div style={{
        maxHeight: collapsed ? 0 : 500,
        overflow: 'hidden',
        transition: 'max-height 300ms ease',
      }}>
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Status */}
          <div style={{
            fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace",
            background: 'var(--bg-primary)', borderRadius: 6, padding: 8, lineHeight: 1.7,
          }}>
            Level: {level}/{TOTAL_LEVELS} &nbsp; Unlocked: {unlockedLevel}<br />
            Status: <span style={{ color: 'var(--text-accent)' }}>{gameStatus}</span><br />
            Budget: ${money.toLocaleString()} &nbsp; RPS: {rps}<br />
            Latency: {latency}ms
          </div>

          {/* Level Navigation */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.08em' }}>
              Jump to Level
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => jumpToLevel(lvl)}
                  style={{
                    width: 32, height: 28, borderRadius: 6, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', border: 'none',
                    background: lvl === level ? 'var(--text-accent)' : 'var(--bg-tertiary)',
                    color: lvl === level ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.08em' }}>
              Actions
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <button onClick={unlockAll} style={btnStyle('var(--color-healthy)')}>
                <Unlock size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
                Unlock All
              </button>
              <button onClick={() => addBudget(5000)} style={btnStyle('var(--color-healthy)')}>
                <DollarSign size={11} style={{ marginRight: 2, verticalAlign: -1 }} />
                +$5k
              </button>
              <button onClick={() => addBudget(50000)} style={btnStyle('var(--color-healthy)')}>
                <DollarSign size={11} style={{ marginRight: 2, verticalAlign: -1 }} />
                +$50k
              </button>
              {gameStatus === 'intro' && (
                <button onClick={skipToPlaying} style={btnStyle('var(--text-accent)')}>
                  <Play size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
                  Skip Intro
                </button>
              )}
              {gameStatus === 'playing' && (
                <button onClick={forceWin} style={btnStyle('var(--color-warning)')}>
                  <SkipForward size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
                  Force Win
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
