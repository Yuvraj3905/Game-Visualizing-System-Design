import { Briefcase, RotateCcw, ArrowLeft, Server, Database, Split, Zap, Globe, Layers, Cog, TrendingUp, ShieldOff, Shield, HeartPulse, DatabaseZap, ArrowRight } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { INTERVIEW_SCENARIOS } from '../engine/InterviewConfigs';

const OUTCOME_STYLES = {
  'Strong Hire': { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', label: 'Strong Hire' },
  'Hire': { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', label: 'Hire' },
  'Lean Hire': { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'Lean Hire' },
  'No Hire': { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'No Hire' },
};

const DIMENSION_LABELS = [
  { key: 'scalability', label: 'Scalability' },
  { key: 'reliability', label: 'Reliability' },
  { key: 'latency', label: 'Latency' },
  { key: 'costEfficiency', label: 'Cost Efficiency' },
  { key: 'simplicity', label: 'Simplicity' },
];

const NODE_ICONS = {
  trafficSource: { icon: Globe, color: 'var(--node-traffic)' },
  server: { icon: Server, color: 'var(--node-server)' },
  database: { icon: Database, color: 'var(--node-database)' },
  loadBalancer: { icon: Split, color: 'var(--node-loadbalancer)' },
  cache: { icon: Zap, color: 'var(--node-cache)' },
  cdn: { icon: Globe, color: 'var(--node-cdn)' },
  replica: { icon: DatabaseZap, color: 'var(--node-replica)' },
  healthCheck: { icon: HeartPulse, color: 'var(--node-healthcheck)' },
  apiGateway: { icon: Shield, color: 'var(--node-apigateway)' },
  messageQueue: { icon: Layers, color: 'var(--node-messagequeue)' },
  worker: { icon: Cog, color: 'var(--node-worker)' },
  autoScaler: { icon: TrendingUp, color: 'var(--node-autoscaler)' },
  circuitBreaker: { icon: ShieldOff, color: 'var(--node-circuitbreaker)' },
};

function RubricBar({ label, score, max = 20 }) {
  const pct = (score / max) * 100;
  const color = pct >= 80 ? 'var(--color-healthy)' : pct >= 50 ? 'var(--color-info)' : pct >= 30 ? 'var(--color-warning)' : 'var(--color-critical)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 90, textAlign: 'right', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 600ms ease' }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color, width: 36, fontWeight: 700 }}>{score}/{max}</span>
    </div>
  );
}

export default function InterviewResultScreen() {
  const interviewMode = useGameStore((s) => s.interviewMode);
  const interviewGrade = useGameStore((s) => s.interviewGrade);
  const interviewScenario = useGameStore((s) => s.interviewScenario);
  const interviewTimer = useGameStore((s) => s.interviewTimer);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const exitInterview = useGameStore((s) => s.exitInterview);
  const loadInterview = useGameStore((s) => s.loadInterview);

  if (!interviewMode || gameStatus !== 'won' || !interviewGrade) return null;

  const scenario = INTERVIEW_SCENARIOS[interviewScenario];
  const grade = interviewGrade;
  const outcomeStyle = OUTCOME_STYLES[grade.outcome] || OUTCOME_STYLES['No Hire'];
  const timeLimit = scenario.timeLimit;
  const timeTaken = timeLimit - interviewTimer;
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflowY: 'auto', padding: '20px 0',
    }}>
      <div className="animate-slide-up" style={{
        background: 'var(--bg-secondary)',
        border: `1px solid ${outcomeStyle.color}`,
        borderRadius: 20, padding: '28px 32px',
        maxWidth: 560, width: '90%',
        textAlign: 'center', position: 'relative',
      }}>
        {/* Header */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: outcomeStyle.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 10px',
        }}>
          <Briefcase size={26} style={{ color: outcomeStyle.color }} />
        </div>

        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: outcomeStyle.color }}>
          {grade.outcome}
        </h2>
        <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {scenario.name}
        </p>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-secondary)' }}>
          Time: {minutes}m {String(seconds).padStart(2, '0')}s &middot; Score: {grade.total}/100
        </p>

        {/* Rubric */}
        <div style={{
          background: 'var(--bg-primary)', borderRadius: 12, padding: '14px 18px',
          marginBottom: 16, textAlign: 'left',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: outcomeStyle.color, marginBottom: 10, letterSpacing: '0.08em' }}>
            Interview Rubric
          </div>
          {DIMENSION_LABELS.map(d => (
            <RubricBar key={d.key} label={d.label} score={grade[d.key]} />
          ))}
        </div>

        {/* What a Senior Engineer Would Do */}
        <div style={{
          background: 'var(--bg-primary)', borderRadius: 12, padding: '14px 18px',
          marginBottom: 16, textAlign: 'left',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-accent)', marginBottom: 8, letterSpacing: '0.08em' }}>
            What a Senior Engineer Would Do
          </div>
          <p style={{ margin: '0 0 10px', fontSize: 12, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            {scenario.idealApproach}
          </p>

          {/* Ideal architecture */}
          {scenario.idealSolution && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center',
              padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8,
            }}>
              {scenario.idealSolution.nodes.map((node, i) => {
                const def = NODE_ICONS[node.type] || { icon: Server, color: 'var(--text-muted)' };
                const NodeIcon = def.icon;
                return (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    {i > 0 && <ArrowRight size={9} style={{ color: 'var(--text-muted)' }} />}
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      padding: '3px 6px', background: `${def.color}15`,
                      border: `1px solid ${def.color}30`, borderRadius: 5,
                    }}>
                      <NodeIcon size={10} style={{ color: def.color }} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {node.label}{node.count > 1 ? ` x${node.count}` : ''}
                      </span>
                    </span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => loadInterview(interviewScenario)}
            style={{
              padding: '10px 20px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)', borderRadius: 10, fontWeight: 600, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <RotateCcw size={14} /> Try Again
          </button>
          <button
            onClick={exitInterview}
            style={{
              padding: '10px 24px', background: 'var(--text-accent)', color: 'var(--bg-primary)',
              border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <ArrowLeft size={14} /> Back to Prep
          </button>
        </div>
      </div>
    </div>
  );
}
