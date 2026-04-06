import { useEffect, useCallback } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import useGameStore from '../store/useGameStore';

import CAPTheorem from './concepts/CAPTheorem';
import ConsistentHashing from './concepts/ConsistentHashing';
import DatabaseSharding from './concepts/DatabaseSharding';
import LoadBalancingAlgos from './concepts/LoadBalancingAlgos';
import CachingStrategies from './concepts/CachingStrategies';
import Replication from './concepts/Replication';
import MessageQueuePatterns from './concepts/MessageQueuePatterns';
import RateLimiting from './concepts/RateLimiting';
import EventSourcing from './concepts/EventSourcing';
import TcpVsUdp from './concepts/TcpVsUdp';
import CircuitBreakers from './concepts/CircuitBreakers';
import DNSDiscovery from './concepts/DNSDiscovery';
import ACIDTransactions from './concepts/ACIDTransactions';
import RaftConsensus from './concepts/RaftConsensus';
import BackPressure from './concepts/BackPressure';

const COMPONENTS = {
  'cap-theorem': CAPTheorem,
  'consistent-hashing': ConsistentHashing,
  'database-sharding': DatabaseSharding,
  'load-balancing': LoadBalancingAlgos,
  'caching': CachingStrategies,
  'replication': Replication,
  'message-queues': MessageQueuePatterns,
  'rate-limiting': RateLimiting,
  'event-sourcing': EventSourcing,
  'tcp-vs-udp': TcpVsUdp,
  'circuit-breakers': CircuitBreakers,
  'dns-discovery': DNSDiscovery,
  'acid-transactions': ACIDTransactions,
  'raft-consensus': RaftConsensus,
  'back-pressure': BackPressure,
};

const TITLES = {
  'cap-theorem': 'CAP Theorem',
  'consistent-hashing': 'Consistent Hashing',
  'database-sharding': 'Database Sharding',
  'load-balancing': 'Load Balancing',
  'caching': 'Caching Strategies',
  'replication': 'Replication',
  'message-queues': 'Message Queues',
  'rate-limiting': 'Rate Limiting',
  'event-sourcing': 'Event Sourcing',
  'tcp-vs-udp': 'TCP vs UDP',
  'circuit-breakers': 'Circuit Breakers',
  'dns-discovery': 'DNS & Service Discovery',
  'acid-transactions': 'ACID Transactions',
  'raft-consensus': 'Raft Consensus',
  'back-pressure': 'Back Pressure',
};

export default function ConceptViewer() {
  const showConceptLibrary = useGameStore((s) => s.showConceptLibrary);
  const activeConceptId = useGameStore((s) => s.activeConceptId);
  const setActiveConcept = useGameStore((s) => s.setActiveConcept);
  const closeConceptLibrary = useGameStore((s) => s.closeConceptLibrary);

  const handleBack = useCallback(() => {
    setActiveConcept(null);
  }, [setActiveConcept]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeConceptLibrary();
      }
    };
    if (showConceptLibrary && activeConceptId) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showConceptLibrary, activeConceptId, closeConceptLibrary]);

  if (!showConceptLibrary || !activeConceptId) return null;

  const ActiveComponent = COMPONENTS[activeConceptId];
  const title = TITLES[activeConceptId] || activeConceptId;

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
          maxWidth: 960,
          maxHeight: '90vh',
          margin: '0 16px',
          backgroundColor: 'var(--color-surface, #1e1e2e)',
          border: '1px solid var(--color-border, #2e2e3e)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid var(--color-border, #2e2e3e)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={handleBack}
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
              aria-label="Back to concept library"
            >
              <ArrowLeft size={20} />
            </button>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--color-text, #e2e2e8)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {title}
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
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 24,
          }}
        >
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <p
              style={{
                color: 'var(--color-text-muted, #888)',
                fontFamily: "'Inter', sans-serif",
                textAlign: 'center',
                padding: 40,
              }}
            >
              Concept not found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
