import { useState } from 'react';
import { X, ArrowLeft, Check, BookOpen, Briefcase, Play, GraduationCap, Map } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEARNING_PATHS, getPathProgress, markStepComplete } from '../engine/LearningPaths';

const TYPE_BADGE = {
  level: { label: 'Level', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  concept: { label: 'Concept', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)' },
  interview: { label: 'Interview', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)' },
};

const PATH_ICONS = [
  <GraduationCap size={20} />,
  <BookOpen size={20} />,
  <Map size={20} />,
  <Briefcase size={20} />,
  <Play size={20} />,
];

function ProgressBar({ value, total, color }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1, height: 6, borderRadius: 99,
        background: 'var(--bg-primary)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: color,
          borderRadius: 99,
          transition: 'width 400ms ease',
        }} />
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
        color: 'var(--text-muted)',
        minWidth: 36, textAlign: 'right',
      }}>
        {value}/{total}
      </span>
    </div>
  );
}

function PathCard({ path, index, onSelect }) {
  const progress = getPathProgress(path.id);
  const completed = progress.completedSteps.length;
  const total = path.steps.length;

  return (
    <button
      onClick={() => onSelect(index)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        padding: '16px 18px', borderRadius: 14,
        background: 'var(--bg-tertiary)',
        border: `1px solid var(--border-primary)`,
        cursor: 'pointer', textAlign: 'left',
        transition: 'all 150ms', width: '100%',
        color: 'inherit', fontFamily: 'inherit',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = path.color;
        e.currentTarget.style.background = `${path.color}0d`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-primary)';
        e.currentTarget.style.background = 'var(--bg-tertiary)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: `${path.color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: path.color,
        }}>
          {PATH_ICONS[index]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
              {path.name}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
              background: `${path.color}18`, color: path.color,
            }}>
              {path.duration}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {path.target}
          </div>
        </div>
      </div>

      <p style={{
        margin: 0, fontSize: 12, lineHeight: 1.55,
        color: 'var(--text-secondary)',
      }}>
        {path.description}
      </p>

      <ProgressBar value={completed} total={total} color={path.color} />
    </button>
  );
}

function StepRow({ step, index, isComplete, onStepClick }) {
  const badge = TYPE_BADGE[step.type];
  const TypeIcon = step.type === 'level' ? Play
    : step.type === 'concept' ? BookOpen
    : Briefcase;

  return (
    <button
      onClick={() => onStepClick(step, index)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 14px', borderRadius: 10,
        background: isComplete ? 'rgba(34, 197, 94, 0.06)' : 'var(--bg-tertiary)',
        border: `1px solid ${isComplete ? 'rgba(34, 197, 94, 0.25)' : 'var(--border-primary)'}`,
        cursor: 'pointer', textAlign: 'left',
        transition: 'all 150ms', width: '100%',
        color: 'inherit', fontFamily: 'inherit',
      }}
      onMouseEnter={e => {
        if (!isComplete) {
          e.currentTarget.style.borderColor = badge.color;
          e.currentTarget.style.background = badge.bg;
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isComplete ? 'rgba(34, 197, 94, 0.25)' : 'var(--border-primary)';
        e.currentTarget.style.background = isComplete ? 'rgba(34, 197, 94, 0.06)' : 'var(--bg-tertiary)';
      }}
    >
      {/* Step number / check */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isComplete ? '#22c55e' : 'var(--bg-primary)',
        border: `2px solid ${isComplete ? '#22c55e' : 'var(--border-primary)'}`,
      }}>
        {isComplete ? (
          <Check size={14} color="#fff" strokeWidth={3} />
        ) : (
          <span style={{
            fontSize: 11, fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--text-muted)',
          }}>
            {index + 1}
          </span>
        )}
      </div>

      {/* Type badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 8,
        background: badge.bg, flexShrink: 0,
      }}>
        <TypeIcon size={11} color={badge.color} />
        <span style={{ fontSize: 10, fontWeight: 700, color: badge.color }}>
          {badge.label}
        </span>
      </div>

      {/* Label */}
      <span style={{
        flex: 1, fontSize: 13, fontWeight: 600,
        color: isComplete ? 'var(--text-muted)' : 'var(--text-primary)',
        textDecoration: isComplete ? 'line-through' : 'none',
      }}>
        {step.label}
      </span>
    </button>
  );
}

export default function LearningPathsModal() {
  const showLearningPaths = useGameStore((s) => s.showLearningPaths);
  const toggleLearningPaths = useGameStore((s) => s.toggleLearningPaths);
  const loadLevel = useGameStore((s) => s.loadLevel);
  const setActiveConcept = useGameStore((s) => s.setActiveConcept);
  const setShowConceptLibrary = useGameStore((s) => s.setShowConceptLibrary);
  const loadInterview = useGameStore((s) => s.loadInterview);
  const toggleLevelSelect = useGameStore((s) => s.toggleLevelSelect);

  const [selectedPath, setSelectedPath] = useState(null);
  // Force re-render when progress changes
  const [progressKey, setProgressKey] = useState(0);

  if (!showLearningPaths) return null;

  const path = selectedPath !== null ? LEARNING_PATHS[selectedPath] : null;
  const progress = path ? getPathProgress(path.id) : null;

  const handleStepClick = (step, index) => {
    if (path) {
      markStepComplete(path.id, index);
      setProgressKey(k => k + 1);
    }

    toggleLearningPaths();

    if (step.type === 'level') {
      loadLevel(step.id);
    } else if (step.type === 'concept') {
      setShowConceptLibrary(true);
      setActiveConcept(step.id);
    } else if (step.type === 'interview') {
      loadInterview(step.id);
    }
  };

  const completedCount = progress
    ? progress.completedSteps.length
    : 0;
  const totalSteps = path ? path.steps.length : 0;

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
      onClick={toggleLearningPaths}
    >
      <div
        className="animate-slide-up"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 20,
          maxWidth: 540,
          width: '90%',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '22px 28px 16px',
          borderBottom: '1px solid var(--border-primary)',
          flexShrink: 0,
        }}>
          {selectedPath !== null && (
            <button
              onClick={() => setSelectedPath(null)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 4, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div style={{ flex: 1 }}>
            {selectedPath === null ? (
              <>
                <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: 'var(--text-primary)' }}>
                  Learning Paths
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                  Structured journeys from fundamentals to mastery
                </p>
              </>
            ) : (
              <>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: path.color }}>
                  {path.name}
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                  {path.duration} · {path.target}
                </p>
              </>
            )}
          </div>

          <button
            onClick={toggleLearningPaths}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Detail progress bar */}
        {selectedPath !== null && (
          <div style={{ padding: '12px 28px', flexShrink: 0, borderBottom: '1px solid var(--border-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Progress
              </span>
              <span style={{
                fontSize: 12, fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: completedCount === totalSteps ? '#22c55e' : 'var(--text-secondary)',
              }}>
                {completedCount}/{totalSteps} steps complete
              </span>
            </div>
            <ProgressBar value={completedCount} total={totalSteps} color={path.color} />
          </div>
        )}

        {/* Scrollable content */}
        <div
          key={progressKey}
          style={{ overflowY: 'auto', padding: '16px 28px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          {selectedPath === null ? (
            LEARNING_PATHS.map((p, i) => (
              <PathCard
                key={p.id}
                path={p}
                index={i}
                onSelect={setSelectedPath}
              />
            ))
          ) : (
            path.steps.map((step, i) => (
              <StepRow
                key={i}
                step={step}
                index={i}
                isComplete={progress.completedSteps.includes(i)}
                onStepClick={handleStepClick}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
