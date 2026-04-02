import { BookOpen, X, Triangle, Circle, Database, Split, Zap, DatabaseZap, Layers, Shield } from 'lucide-react';
import useGameStore from '../store/useGameStore';

const CONCEPTS = [
  { id: 'cap-theorem', title: 'CAP Theorem', icon: Triangle, color: '#f59e0b', difficulty: 'Beginner', description: 'Explore tradeoffs between Consistency, Availability, and Partition Tolerance' },
  { id: 'consistent-hashing', title: 'Consistent Hashing', icon: Circle, color: '#06b6d4', difficulty: 'Intermediate', description: 'See how keys redistribute when servers join or leave a hash ring' },
  { id: 'database-sharding', title: 'Database Sharding', icon: Database, color: '#a855f7', difficulty: 'Intermediate', description: 'Choose sharding keys and watch data distribute across shards' },
  { id: 'load-balancing', title: 'Load Balancing', icon: Split, color: '#f59e0b', difficulty: 'Beginner', description: 'Compare round-robin, least-connections, and weighted algorithms' },
  { id: 'caching', title: 'Caching Strategies', icon: Zap, color: '#22c55e', difficulty: 'Intermediate', description: 'Toggle between Write-Through, Write-Behind, and Cache-Aside' },
  { id: 'replication', title: 'Replication', icon: DatabaseZap, color: '#8b5cf6', difficulty: 'Advanced', description: 'Explore leader-follower, multi-leader, and leaderless replication' },
  { id: 'message-queues', title: 'Message Queues', icon: Layers, color: '#14b8a6', difficulty: 'Intermediate', description: 'See point-to-point, pub/sub, and fan-out patterns in action' },
  { id: 'rate-limiting', title: 'Rate Limiting', icon: Shield, color: '#f43f5e', difficulty: 'Advanced', description: 'Compare Token Bucket, Sliding Window, and Fixed Window algorithms' },
];

const DIFFICULTY_COLORS = {
  Beginner: '#22c55e',
  Intermediate: '#3b82f6',
  Advanced: '#a855f7',
};

export default function ConceptLibrary() {
  const showConceptLibrary = useGameStore((s) => s.showConceptLibrary);
  const activeConceptId = useGameStore((s) => s.activeConceptId);
  const closeConceptLibrary = useGameStore((s) => s.closeConceptLibrary);
  const setActiveConcept = useGameStore((s) => s.setActiveConcept);

  if (!showConceptLibrary || activeConceptId) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
      onClick={closeConceptLibrary}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 720,
          margin: '0 16px',
          backgroundColor: 'var(--color-surface, #1e1e2e)',
          border: '1px solid var(--color-border, #2e2e3e)',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={22} color="var(--color-accent, #60a5fa)" />
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--color-text, #e2e2e8)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Concept Library
            </h2>
          </div>
          <button
            onClick={closeConceptLibrary}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted, #888)',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text, #e2e2e8)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted, #888)'; }}
            aria-label="Close concept library"
          >
            <X size={20} />
          </button>
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 12,
          }}
        >
          {CONCEPTS.map((concept) => {
            const Icon = concept.icon;
            const diffColor = DIFFICULTY_COLORS[concept.difficulty];

            return (
              <button
                key={concept.id}
                onClick={() => setActiveConcept(concept.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: 16,
                  backgroundColor: 'var(--color-surface-raised, #262636)',
                  border: '1px solid var(--color-border, #2e2e3e)',
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, background-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = concept.color;
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-hover, #2e2e42)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border, #2e2e3e)';
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-raised, #262636)';
                }}
              >
                {/* Icon + Title row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: `${concept.color}18`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} color={concept.color} />
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--color-text, #e2e2e8)',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {concept.title}
                  </span>
                </div>

                {/* Difficulty badge */}
                <span
                  style={{
                    alignSelf: 'flex-start',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 999,
                    color: diffColor,
                    backgroundColor: `${diffColor}18`,
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: '0.02em',
                  }}
                >
                  {concept.difficulty}
                </span>

                {/* Description */}
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: 'var(--color-text-muted, #888)',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {concept.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
