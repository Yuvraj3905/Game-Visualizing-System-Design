import { Beaker, X } from 'lucide-react';
import useGameStore from '../store/useGameStore';

export default function SandboxBanner() {
  const { sandboxMode, exitSandbox } = useGameStore();

  if (!sandboxMode) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 12,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      border: '1px solid var(--border-primary)',
      borderRadius: 12,
      padding: '8px 16px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
    }}>
      <Beaker size={16} style={{ color: 'var(--text-accent)', flexShrink: 0 }} />
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--text-primary)',
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}>
        SANDBOX MODE
        <span style={{
          color: 'var(--text-muted)',
          fontWeight: 400,
          marginLeft: 8,
        }}>
          No objectives, unlimited budget
        </span>
      </span>
      <button
        onClick={exitSandbox}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 8,
          padding: '4px 10px',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background 150ms, color 150ms',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-secondary)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-tertiary)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        <X size={12} />
        Exit Sandbox
      </button>
    </div>
  );
}
