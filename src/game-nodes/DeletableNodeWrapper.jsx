import { X } from 'lucide-react';
import useGameStore from '../store/useGameStore';

export default function DeletableNodeWrapper({ id, children }) {
  const gameStatus = useGameStore(s => s.gameStatus);
  const removeNode = useGameStore(s => s.removeNode);
  const isInitial = useGameStore(s => {
    const node = s.nodes.find(n => n.id === id);
    return node?.data?.isInitial === true;
  });

  const canDelete = gameStatus === 'playing' && !isInitial;

  return (
    <div style={{ position: 'relative', overflow: 'visible' }}>
      {canDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); removeNode(id); }}
          style={{
            position: 'absolute', top: -10, right: -10, zIndex: 50,
            width: 22, height: 22, borderRadius: '50%',
            background: 'var(--color-critical)', border: '2px solid var(--bg-node)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 0, fontSize: 0,
            transition: 'transform 150ms',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Sell (75% refund)"
        >
          <X size={12} />
        </button>
      )}
      {children}
    </div>
  );
}
