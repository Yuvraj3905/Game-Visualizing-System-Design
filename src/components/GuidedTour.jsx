import { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import useGameStore from '../store/useGameStore';

const TOUR_STEPS = [
  {
    target: '[data-tour="hud-stats"]',
    title: 'System Metrics',
    description: 'These stats show your system health in real-time. Watch Budget, Traffic, Latency, and Health as you build your infrastructure.',
    position: 'bottom',
  },
  {
    target: '[data-tour="component-tray"]',
    title: 'Component Tray',
    description: 'Drag or click components to add them to your canvas. Each one costs money from your budget.',
    position: 'right',
  },
  {
    target: '[data-tour="canvas"]',
    title: 'Design Canvas',
    description: 'This is your workspace. Drop components here and connect them by dragging between the blue handles on each node.',
    position: 'left',
  },
  {
    target: '[data-tour="objective-panel"]',
    title: 'Objective Panel',
    description: 'Track your progress here. Each goal checks off in real-time as you meet the win conditions.',
    position: 'left',
  },
  {
    target: '[data-tour="spike-traffic"]',
    title: 'Spike Traffic',
    description: 'Click this to increase incoming traffic by 25%. Reach the target RPS to win the level!',
    position: 'bottom',
  },
];

function getSpotlightRect(target) {
  const el = document.querySelector(target);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const pad = 8;
  return {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };
}

function getTooltipStyle(rect, position) {
  if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  const gap = 12;
  switch (position) {
    case 'bottom':
      return { top: rect.top + rect.height + gap, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' };
    case 'top':
      return { bottom: window.innerHeight - rect.top + gap, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' };
    case 'right':
      return { top: rect.top + rect.height / 2, left: rect.left + rect.width + gap, transform: 'translateY(-50%)' };
    case 'left':
      return { top: rect.top + rect.height / 2, right: window.innerWidth - rect.left + gap, transform: 'translateY(-50%)' };
    default:
      return { top: rect.top + rect.height + gap, left: rect.left };
  }
}

export default function GuidedTour() {
  const showTour = useGameStore(s => s.showTour);
  const setShowTour = useGameStore(s => s.setShowTour);
  const gameStatus = useGameStore(s => s.gameStatus);

  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  // Auto-trigger on first play
  useEffect(() => {
    if (gameStatus === 'playing' && !localStorage.getItem('antigravity-tour-completed')) {
      // Small delay so DOM elements are rendered
      const timer = setTimeout(() => setShowTour(true), 600);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, setShowTour]);

  // Update spotlight position whenever step or visibility changes
  useEffect(() => {
    if (!showTour) return;
    const currentStep = TOUR_STEPS[step];
    if (!currentStep) return;

    const doUpdate = () => setRect(getSpotlightRect(currentStep.target));
    doUpdate();
    window.addEventListener('resize', doUpdate);
    return () => window.removeEventListener('resize', doUpdate);
  }, [showTour, step]);

  if (!showTour || gameStatus !== 'playing') return null;

  const currentStep = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const tooltipPos = getTooltipStyle(rect, currentStep.position);

  const finish = () => {
    setShowTour(false);
    setStep(0);
    localStorage.setItem('antigravity-tour-completed', 'true');
  };

  const next = () => {
    if (isLast) {
      finish();
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 55 }}>
      {/* Dark overlay with spotlight cutout */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }} onClick={finish} />

      {rect && (
        <div
          style={{
            position: 'fixed',
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            borderRadius: 12,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.85)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Step tooltip */}
      <div
        style={{
          position: 'fixed',
          ...tooltipPos,
          zIndex: 2,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 16,
          padding: 20,
          maxWidth: 300,
          minWidth: 240,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {currentStep.title}
          </h3>
          <button
            onClick={finish}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', padding: 0, marginLeft: 8, flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {currentStep.description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {step + 1} of {TOUR_STEPS.length}
          </span>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={finish}
              style={{
                padding: '6px 12px', background: 'transparent', color: 'var(--text-muted)',
                border: '1px solid var(--border-primary)', borderRadius: 8,
                fontSize: 12, cursor: 'pointer',
              }}
            >
              Skip
            </button>
            <button
              onClick={next}
              style={{
                padding: '6px 14px', background: 'var(--text-accent)', color: 'var(--bg-primary)',
                border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {isLast ? 'Finish' : 'Next'}
              {!isLast && <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
