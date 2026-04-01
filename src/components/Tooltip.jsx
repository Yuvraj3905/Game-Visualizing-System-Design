import { useState } from 'react';

const POSITIONS = {
  bottom: {
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: 6,
  },
  top: {
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: 6,
  },
  right: {
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    marginLeft: 6,
  },
  left: {
    right: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    marginRight: 6,
  },
};

export default function Tooltip({ text, position = 'bottom', children }) {
  const [visible, setVisible] = useState(false);

  if (!text) return children;

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          style={{
            position: 'absolute',
            ...POSITIONS[position],
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            color: 'var(--text-secondary)',
            maxWidth: 220,
            whiteSpace: 'normal',
            zIndex: 100,
            pointerEvents: 'none',
            lineHeight: 1.4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            opacity: 1,
            transition: 'opacity 150ms',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
