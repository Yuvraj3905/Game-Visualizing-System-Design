import { DollarSign, Activity, Clock, Heart, Users, RotateCcw, List, HelpCircle } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS } from '../engine/LevelConfigs';
import Tooltip from './Tooltip';

function StatCard({ icon, label, value, unit, color, animate, tooltip }) {
  const Icon = icon;
  return (
    <Tooltip text={tooltip} position="bottom">
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        background: 'var(--bg-tertiary)', borderRadius: 12, padding: '8px 14px',
        border: '1px solid var(--border-primary)',
        minWidth: 90,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon size={12} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            {label}
          </span>
        </div>
        <span
          className={animate ? 'animate-value-pop' : ''}
          style={{ fontSize: 20, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color }}
        >
          {value}{unit && <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 2 }}>{unit}</span>}
        </span>
      </div>
    </Tooltip>
  );
}

export default function HUD() {
  const { money, rps, latency, metrics, level, gameStatus, toggleLevelSelect, retryLevel, setTargetTraffic, targetRps, setShowTour, budgetShake } = useGameStore();
  const config = LEVEL_CONFIGS[level];

  const latencyColor = latency > 200 ? 'var(--color-critical)' : latency > 100 ? 'var(--color-warning)' : 'var(--color-healthy)';
  const healthColor = metrics.healthPercent > 70 ? 'var(--color-healthy)' : metrics.healthPercent > 30 ? 'var(--color-warning)' : 'var(--color-critical)';

  return (
    <div style={{
      height: 72,
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 10,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          System Design <span style={{ color: 'var(--text-accent)' }}>Sim</span>
        </h1>
        <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
          Level {level} — {config.name}
        </p>
      </div>

      <div data-tour="hud-stats" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <StatCard
          icon={DollarSign} label="Budget" value={`$${money.toLocaleString()}`}
          color={budgetShake ? 'var(--color-critical)' : 'var(--color-healthy)'}
          animate={budgetShake}
          tooltip="Your remaining money to buy infrastructure components"
        />
        <StatCard
          icon={Activity} label="Traffic" value={rps.toLocaleString()} unit="RPS"
          color="var(--color-info)" animate={gameStatus === 'playing'}
          tooltip="Current requests per second hitting your system"
        />
        <StatCard
          icon={Clock} label="Latency" value={latency} unit="ms"
          color={latencyColor}
          tooltip="Average response time — lower is better. Green < 100ms, yellow < 200ms, red ≥ 200ms"
        />
        <StatCard
          icon={Heart} label="Health" value={`${metrics.healthPercent}%`}
          color={healthColor}
          tooltip="Percentage of your infrastructure nodes that are healthy and not overloaded"
        />
        {metrics.bouncedUsers > 0 && (
          <StatCard
            icon={Users} label="Bounced" value={metrics.bouncedUsers}
            color="var(--color-critical)"
            tooltip="Users who left because latency in their region was too high"
          />
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {gameStatus === 'playing' && (
          <Tooltip text="Manually spike traffic by 25% to stress-test your system" position="bottom">
            <button
              data-tour="spike-traffic"
              onClick={() => setTargetTraffic(Math.min(targetRps + Math.round(config.targetTraffic / 4), config.targetTraffic))}
              style={{
                padding: '8px 16px', background: 'var(--bg-primary)', color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)', borderRadius: 10, fontWeight: 700, fontSize: 13,
                cursor: 'pointer', transition: 'all 150ms',
              }}
            >
              Spike Traffic
            </button>
          </Tooltip>
        )}
        {gameStatus === 'failed' && (
          <button
            onClick={retryLevel}
            style={{
              padding: '8px 16px', background: 'var(--color-critical)', color: 'white',
              border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <RotateCcw size={14} /> Retry
          </button>
        )}
        <Tooltip text="Browse and select levels" position="bottom">
          <button
            onClick={toggleLevelSelect}
            style={{
              padding: '8px 12px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)', borderRadius: 10, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <List size={14} /> Levels
          </button>
        </Tooltip>
        <Tooltip text="Take a guided tour of the interface" position="bottom">
          <button
            onClick={() => setShowTour(true)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <HelpCircle size={16} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
