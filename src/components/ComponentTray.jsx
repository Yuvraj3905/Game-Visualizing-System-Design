import { useState, useEffect } from 'react';
import { Server, Database, Split, Zap, Globe, MapPin, DatabaseZap, HeartPulse, Lock, Shield, Layers, Cog, TrendingUp, ShieldOff } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS } from '../engine/LevelConfigs';
import Tooltip from './Tooltip';

const COMPONENT_DEFS = {
  server: { label: 'Server', icon: Server, color: 'var(--node-server)' },
  database: { label: 'Database', icon: Database, color: 'var(--node-database)' },
  loadBalancer: { label: 'Load Balancer', icon: Split, color: 'var(--node-loadbalancer)' },
  cache: { label: 'Cache', icon: Zap, color: 'var(--node-cache)' },
  cdn: { label: 'CDN', icon: Globe, color: 'var(--node-cdn)' },
  region: { label: 'Region', icon: MapPin, color: 'var(--node-region)' },
  replica: { label: 'Replica', icon: DatabaseZap, color: 'var(--node-replica)' },
  healthCheck: { label: 'Health Check', icon: HeartPulse, color: 'var(--node-healthcheck)' },
  apiGateway: { label: 'API Gateway', icon: Shield, color: 'var(--node-apigateway)' },
  messageQueue: { label: 'Message Queue', icon: Layers, color: 'var(--node-messagequeue)' },
  worker: { label: 'Worker', icon: Cog, color: 'var(--node-worker)' },
  autoScaler: { label: 'Auto-Scaler', icon: TrendingUp, color: 'var(--node-autoscaler)' },
  circuitBreaker: { label: 'Circuit Breaker', icon: ShieldOff, color: 'var(--node-circuitbreaker)' },
};

const COMPONENT_TOOLTIPS = {
  server: 'Handles incoming HTTP requests. Each server has a fixed capacity in RPS.',
  database: 'Persistent storage for your app. Gets overloaded if too many queries hit it.',
  loadBalancer: 'Distributes traffic evenly across connected servers using round-robin.',
  cache: 'Stores frequent query results in memory, dramatically reducing database load.',
  cdn: 'Serves static content from edge locations near your users, reducing latency.',
  region: 'Deploy infrastructure in a specific geographic region to reduce user latency.',
  replica: 'A read-only copy of your database. Enables failover if the primary DB dies.',
  healthCheck: 'Monitors nodes for failures and triggers automatic failover to replicas.',
  apiGateway: 'Filters and rate-limits incoming traffic. Blocks bots and abusive requests before they hit servers.',
  messageQueue: 'Buffers requests between producers and consumers. Decouples fast servers from slow background work.',
  worker: 'Processes jobs from a message queue asynchronously. Scale workers to increase throughput.',
  autoScaler: 'Monitors server load and automatically adds or removes capacity to match demand.',
  circuitBreaker: 'Prevents cascading failures by isolating broken services. Opens circuit when failures exceed threshold.',
};

const ALL_COMPONENTS = ['server', 'database', 'loadBalancer', 'cache', 'cdn', 'region', 'replica', 'healthCheck', 'apiGateway', 'messageQueue', 'worker', 'autoScaler', 'circuitBreaker'];

export default function ComponentTray() {
  const { level, money, addNode, gameStatus, sandboxMode, configOverride } = useGameStore();
  const config = configOverride || LEVEL_CONFIGS[level] || LEVEL_CONFIGS[0];
  const unlocked = sandboxMode ? ALL_COMPONENTS : (config.unlockedComponents || []);
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onDragStart = (event, type) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      role="toolbar"
      aria-label="Infrastructure components"
      data-tour="component-tray"
      style={collapsed ? {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-primary)',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'row',
        gap: 6,
        overflowX: 'auto',
        overflowY: 'hidden',
        flexShrink: 0,
      } : {
        width: 180,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-primary)',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        overflowY: 'auto',
        flexShrink: 0,
        position: 'relative',
        maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
      }}
    >
      {!collapsed && (
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: 4 }}>
          Components
        </div>
      )}

      {ALL_COMPONENTS.map(type => {
        const def = COMPONENT_DEFS[type];
        const isUnlocked = unlocked.includes(type);
        const cost = config.nodeCosts?.[type] || 0;
        const canAfford = money >= cost;
        const Icon = def.icon;
        const isDisabled = !isUnlocked || !canAfford || gameStatus !== 'playing';

        return (
          <Tooltip key={type} text={isUnlocked ? COMPONENT_TOOLTIPS[type] : 'Locked — complete earlier levels to unlock'} position={collapsed ? 'top' : 'right'}>
            <div
              draggable={!isDisabled}
              onDragStart={(e) => !isDisabled && onDragStart(e, type)}
              onClick={() => !isDisabled && addNode(type)}
              style={collapsed ? {
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                padding: '8px 10px', borderRadius: 8, flexShrink: 0,
                background: isUnlocked ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                border: `1px solid ${isUnlocked ? 'var(--border-primary)' : 'transparent'}`,
                cursor: isDisabled ? 'not-allowed' : 'grab',
                opacity: isDisabled ? 0.4 : 1,
                transition: 'all 150ms',
              } : {
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                background: isUnlocked ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                border: `1px solid ${isUnlocked ? 'var(--border-primary)' : 'transparent'}`,
                cursor: isDisabled ? 'not-allowed' : 'grab',
                opacity: isDisabled ? 0.4 : 1,
                transition: 'all 150ms',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isUnlocked ? `${def.color}15` : 'var(--bg-secondary)',
                flexShrink: 0,
              }}>
                {isUnlocked ? (
                  <Icon size={18} style={{ color: def.color }} />
                ) : (
                  <Lock size={14} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>
              {!collapsed && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {def.label}
                  </span>
                  {isUnlocked && cost > 0 && (
                    <span style={{ fontSize: 10, color: canAfford ? 'var(--color-healthy)' : 'var(--color-critical)', fontFamily: "'JetBrains Mono', monospace" }}>
                      ${cost}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}
