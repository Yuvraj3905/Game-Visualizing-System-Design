export const LEARNING_PATHS = [
  {
    id: 'foundations',
    name: 'Foundations',
    duration: '2 weeks',
    target: 'CS students, junior devs',
    color: '#22c55e',
    description: 'Learn the building blocks of scalable systems — servers, load balancers, caches, and databases.',
    steps: [
      { type: 'level', id: 1, label: 'The Monolith — Horizontal Scaling' },
      { type: 'concept', id: 'cap-theorem', label: 'CAP Theorem' },
      { type: 'level', id: 2, label: 'Load Balancing' },
      { type: 'concept', id: 'load-balancing', label: 'Load Balancing Algorithms' },
      { type: 'level', id: 3, label: 'Caching' },
      { type: 'concept', id: 'caching', label: 'Caching Strategies' },
      { type: 'level', id: 4, label: 'CDNs & Multi-Region' },
      { type: 'concept', id: 'database-sharding', label: 'Database Sharding' },
      { type: 'level', id: 5, label: 'Fault Tolerance' },
      { type: 'concept', id: 'replication', label: 'Replication' },
    ],
  },
  {
    id: 'backend-mastery',
    name: 'Backend Mastery',
    duration: '4 weeks',
    target: 'Mid-level engineers',
    color: '#3b82f6',
    description: 'Master the full backend stack — from API gateways and message queues to microservices and auto-scaling.',
    steps: [
      { type: 'level', id: 1, label: 'Horizontal Scaling' },
      { type: 'level', id: 2, label: 'Load Balancing' },
      { type: 'level', id: 3, label: 'Caching' },
      { type: 'concept', id: 'consistent-hashing', label: 'Consistent Hashing' },
      { type: 'level', id: 4, label: 'CDNs & Multi-Region' },
      { type: 'level', id: 5, label: 'Fault Tolerance' },
      { type: 'concept', id: 'replication', label: 'Replication' },
      { type: 'level', id: 6, label: 'Rate Limiting & API Gateway' },
      { type: 'concept', id: 'rate-limiting', label: 'Rate Limiting Algorithms' },
      { type: 'level', id: 7, label: 'Message Queues' },
      { type: 'concept', id: 'message-queues', label: 'Message Queue Patterns' },
      { type: 'level', id: 8, label: 'Microservices' },
      { type: 'level', id: 9, label: 'Auto-Scaling' },
      { type: 'concept', id: 'back-pressure', label: 'Back Pressure' },
      { type: 'level', id: 10, label: 'Chaos Engineering' },
      { type: 'concept', id: 'circuit-breakers', label: 'Circuit Breakers' },
    ],
  },
  {
    id: 'distributed-systems',
    name: 'Distributed Systems',
    duration: '6 weeks',
    target: 'Senior engineers',
    color: '#a855f7',
    description: 'Deep dive into distributed systems — consensus, ACID, event sourcing, and real-world architectures.',
    steps: [
      { type: 'level', id: 1, label: 'Horizontal Scaling' },
      { type: 'concept', id: 'cap-theorem', label: 'CAP Theorem' },
      { type: 'level', id: 2, label: 'Load Balancing' },
      { type: 'level', id: 3, label: 'Caching' },
      { type: 'concept', id: 'consistent-hashing', label: 'Consistent Hashing' },
      { type: 'level', id: 4, label: 'CDNs & Multi-Region' },
      { type: 'concept', id: 'database-sharding', label: 'Database Sharding' },
      { type: 'level', id: 5, label: 'Fault Tolerance' },
      { type: 'concept', id: 'replication', label: 'Replication' },
      { type: 'level', id: 6, label: 'Rate Limiting' },
      { type: 'level', id: 7, label: 'Message Queues' },
      { type: 'concept', id: 'event-sourcing', label: 'Event Sourcing' },
      { type: 'level', id: 8, label: 'Microservices' },
      { type: 'concept', id: 'raft-consensus', label: 'Raft Consensus' },
      { type: 'level', id: 9, label: 'Auto-Scaling' },
      { type: 'concept', id: 'acid-transactions', label: 'ACID Transactions' },
      { type: 'level', id: 10, label: 'Chaos Engineering' },
      { type: 'concept', id: 'circuit-breakers', label: 'Circuit Breakers' },
      { type: 'level', id: 11, label: "Build Twitter's Feed" },
      { type: 'level', id: 12, label: "Scale Uber's Matching" },
      { type: 'level', id: 13, label: 'Design Netflix Streaming' },
      { type: 'level', id: 14, label: 'WhatsApp Message Delivery' },
      { type: 'level', id: 15, label: "Stripe's Payment Pipeline" },
      { type: 'concept', id: 'tcp-vs-udp', label: 'TCP vs UDP' },
      { type: 'concept', id: 'dns-discovery', label: 'DNS & Service Discovery' },
    ],
  },
  {
    id: 'interview-cracker',
    name: 'Interview Cracker',
    duration: '3 weeks',
    target: 'Job seekers',
    color: '#f59e0b',
    description: 'Targeted prep for system design interviews — fundamentals first, then timed interview scenarios.',
    steps: [
      { type: 'level', id: 1, label: 'Horizontal Scaling' },
      { type: 'level', id: 2, label: 'Load Balancing' },
      { type: 'level', id: 3, label: 'Caching' },
      { type: 'concept', id: 'cap-theorem', label: 'CAP Theorem' },
      { type: 'concept', id: 'consistent-hashing', label: 'Consistent Hashing' },
      { type: 'level', id: 5, label: 'Fault Tolerance' },
      { type: 'concept', id: 'circuit-breakers', label: 'Circuit Breakers' },
      { type: 'concept', id: 'back-pressure', label: 'Back Pressure' },
      { type: 'concept', id: 'raft-consensus', label: 'Raft Consensus' },
      { type: 'interview', id: 0, label: 'Interview: URL Shortener' },
      { type: 'interview', id: 1, label: 'Interview: Chat System' },
      { type: 'interview', id: 2, label: 'Interview: Notification Service' },
      { type: 'interview', id: 3, label: 'Interview: Rate Limiter' },
      { type: 'interview', id: 4, label: 'Interview: File Storage' },
    ],
  },
  {
    id: 'devops-sre',
    name: 'DevOps & SRE',
    duration: '4 weeks',
    target: 'Ops engineers',
    color: '#ef4444',
    description: 'Focus on reliability, observability, and resilience — the skills that keep systems running at 3am.',
    steps: [
      { type: 'level', id: 5, label: 'Fault Tolerance' },
      { type: 'concept', id: 'replication', label: 'Replication' },
      { type: 'level', id: 6, label: 'Rate Limiting & API Gateway' },
      { type: 'concept', id: 'rate-limiting', label: 'Rate Limiting Algorithms' },
      { type: 'level', id: 8, label: 'Microservices' },
      { type: 'concept', id: 'circuit-breakers', label: 'Circuit Breakers' },
      { type: 'level', id: 9, label: 'Auto-Scaling' },
      { type: 'concept', id: 'back-pressure', label: 'Back Pressure' },
      { type: 'level', id: 10, label: 'Chaos Engineering' },
      { type: 'concept', id: 'dns-discovery', label: 'DNS & Service Discovery' },
      { type: 'interview', id: 2, label: 'Interview: Notification Service' },
      { type: 'interview', id: 3, label: 'Interview: Rate Limiter' },
    ],
  },
];

// localStorage helpers
export function getPathProgress(pathId) {
  try {
    const saved = JSON.parse(localStorage.getItem(`sdsim-path-${pathId}`));
    return saved || { completedSteps: [] };
  } catch { return { completedSteps: [] }; }
}

export function markStepComplete(pathId, stepIndex) {
  const progress = getPathProgress(pathId);
  if (!progress.completedSteps.includes(stepIndex)) {
    progress.completedSteps.push(stepIndex);
  }
  try {
    localStorage.setItem(`sdsim-path-${pathId}`, JSON.stringify(progress));
  } catch {}
  return progress;
}
