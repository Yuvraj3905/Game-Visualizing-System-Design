# Phase 1 Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete all Phase 1 gaps — radar chart grading, ideal solution comparison, 7 new concept library entries, and mobile responsive layout.

**Architecture:** All changes are frontend-only React components + CSS. New concepts follow the established pattern (standalone JSX with useState/useCallback, inline styles, interactive SVG/DOM). Mobile responsiveness via CSS media queries in theme.css plus minor component changes. No new dependencies.

**Tech Stack:** React 18, Vite, Zustand, lucide-react, CSS custom properties

---

## File Structure

**New files:**
- `src/components/RadarChart.jsx` — SVG radar/spider chart component
- `src/concepts/concepts/EventSourcing.jsx`
- `src/concepts/concepts/TcpVsUdp.jsx`
- `src/concepts/concepts/CircuitBreakers.jsx`
- `src/concepts/concepts/DNSDiscovery.jsx`
- `src/concepts/concepts/ACIDTransactions.jsx`
- `src/concepts/concepts/RaftConsensus.jsx`
- `src/concepts/concepts/BackPressure.jsx`

**Modified files:**
- `src/components/WinScreen.jsx` — Replace GradeBar with RadarChart
- `src/components/FailurePostMortem.jsx` — Add ideal solution section
- `src/engine/LevelConfigs.js` — Add `idealSolution` to levels 1-15
- `src/concepts/ConceptLibrary.jsx` — Add 7 new entries to CONCEPTS array
- `src/concepts/ConceptViewer.jsx` — Add 7 new imports and mappings
- `src/styles/theme.css` — Add media queries for tablet/phone
- `src/components/ComponentTray.jsx` — Add mobile-responsive classes
- `src/components/HUD.jsx` — Add mobile-responsive classes
- `README.md` — Update features list

---

### Task 1: Radar Chart Component

**Files:**
- Create: `src/components/RadarChart.jsx`
- Modify: `src/components/WinScreen.jsx`

- [ ] **Step 1: Create RadarChart.jsx**

Create `src/components/RadarChart.jsx`:

```jsx
import { useMemo } from 'react';

const AXES = [
  { key: 'cost', label: 'Cost' },
  { key: 'latency', label: 'Latency' },
  { key: 'resilience', label: 'Resilience' },
  { key: 'simplicity', label: 'Simplicity' },
];

const SIZE = 200;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 80;
const LEVELS = [25, 50, 75, 100];

function scoreColor(score) {
  if (score >= 80) return 'var(--color-healthy)';
  if (score >= 60) return 'var(--color-info)';
  if (score >= 40) return 'var(--color-warning)';
  return 'var(--color-critical)';
}

function pointOnAxis(axisIndex, value, total = AXES.length) {
  const angle = (Math.PI * 2 * axisIndex) / total - Math.PI / 2;
  const dist = (value / 100) * R;
  return { x: CX + dist * Math.cos(angle), y: CY + dist * Math.sin(angle) };
}

export default function RadarChart({ scores }) {
  const points = useMemo(() => {
    return AXES.map((axis, i) => {
      const val = Math.min(100, Math.max(0, scores[axis.key] || 0));
      return { ...pointOnAxis(i, val), score: val, label: axis.label };
    });
  }, [scores]);

  const polygon = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" style={{ maxWidth: SIZE }}>
      {/* Grid levels */}
      {LEVELS.map(level => {
        const gridPoints = AXES.map((_, i) => pointOnAxis(i, level));
        const gridPoly = gridPoints.map(p => `${p.x},${p.y}`).join(' ');
        return (
          <polygon key={level} points={gridPoly} fill="none"
            stroke="var(--bg-tertiary)" strokeWidth={1} opacity={0.6} />
        );
      })}

      {/* Axis lines */}
      {AXES.map((_, i) => {
        const end = pointOnAxis(i, 100);
        return (
          <line key={i} x1={CX} y1={CY} x2={end.x} y2={end.y}
            stroke="var(--bg-tertiary)" strokeWidth={1} opacity={0.4} />
        );
      })}

      {/* Score polygon */}
      <polygon points={polygon} fill="var(--text-accent)" fillOpacity={0.2}
        stroke="var(--text-accent)" strokeWidth={2} />

      {/* Score dots and labels */}
      {points.map((p, i) => {
        const labelPos = pointOnAxis(i, 120);
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill={scoreColor(p.score)} />
            <text x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="central"
              fontSize={10} fontWeight={700} fill="var(--text-secondary)"
              fontFamily="'Inter', sans-serif">
              {p.label}
            </text>
            <text x={p.x} y={p.y - 10} textAnchor="middle"
              fontSize={9} fontWeight={700} fill={scoreColor(p.score)}
              fontFamily="'JetBrains Mono', monospace">
              {p.score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2: Replace GradeBar with RadarChart in WinScreen**

In `src/components/WinScreen.jsx`:

1. Replace import line: remove nothing, add `import RadarChart from './RadarChart';`
2. Delete the `GradeBar` function (lines 17-28)
3. Replace the grade card body (lines 103-108) — the 4 GradeBar instances — with:

```jsx
<div style={{ flex: 1 }}>
  <RadarChart scores={{
    cost: grade.costScore,
    latency: grade.latencyScore,
    resilience: grade.resilienceScore,
    simplicity: grade.complexityScore,
  }} />
</div>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/RadarChart.jsx src/components/WinScreen.jsx
git commit -m "feat: replace grade bars with radar chart on win screen"
```

---

### Task 2: Ideal Solution in Failure Post-Mortem

**Files:**
- Modify: `src/engine/LevelConfigs.js`
- Modify: `src/components/FailurePostMortem.jsx`

- [ ] **Step 1: Add idealSolution to all levels in LevelConfigs.js**

Add an `idealSolution` field to each level (1-15) in `src/engine/LevelConfigs.js`. Add it after the `activeSimulators` field for each level. Here are all 15:

**Level 1** (after `activeSimulators: ['traffic'],`):
```js
idealSolution: {
  description: 'Horizontal scaling with multiple servers',
  nodes: [
    { type: 'trafficSource', label: 'Users', count: 1 },
    { type: 'server', label: 'Web Server', count: 3 },
    { type: 'database', label: 'SQL Database', count: 1 },
  ],
  explanation: 'Distribute traffic across 3 servers (500 RPS each) instead of overloading one. Total capacity: 1,500 RPS > 1,000 RPS target.',
},
```

**Level 2** (after its `activeSimulators`):
```js
idealSolution: {
  description: 'Load balancer distributing to all servers',
  nodes: [
    { type: 'trafficSource', label: 'Users', count: 1 },
    { type: 'loadBalancer', label: 'Load Balancer', count: 1 },
    { type: 'server', label: 'Web Server', count: 3 },
    { type: 'database', label: 'SQL Database', count: 1 },
  ],
  explanation: 'A load balancer routes traffic evenly across all 3 servers. Without it, only the directly-connected server gets traffic.',
},
```

**Level 3**:
```js
idealSolution: {
  description: 'Cache layer between servers and database',
  nodes: [
    { type: 'trafficSource', label: 'Users', count: 1 },
    { type: 'loadBalancer', label: 'Load Balancer', count: 1 },
    { type: 'server', label: 'Web Server', count: 3 },
    { type: 'cache', label: 'Redis Cache', count: 1 },
    { type: 'database', label: 'SQL Database', count: 1 },
  ],
  explanation: 'A cache absorbs ~80% of read traffic, keeping the database under its 3,000 QPS limit and reducing latency from ~40ms to ~5ms for cached queries.',
},
```

**Level 4**:
```js
idealSolution: {
  description: 'Multi-region with CDN edge caching',
  nodes: [
    { type: 'trafficSource', label: 'Users', count: 3 },
    { type: 'cdn', label: 'CDN', count: 1 },
    { type: 'loadBalancer', label: 'Load Balancer', count: 1 },
    { type: 'server', label: 'Server', count: 4 },
    { type: 'cache', label: 'Cache', count: 1 },
    { type: 'database', label: 'Database', count: 1 },
  ],
  explanation: 'CDN serves static content from edge locations close to each region, reducing cross-region latency. Servers and cache handle dynamic requests.',
},
```

**Level 5**:
```js
idealSolution: {
  description: 'Replicas and health checks for fault tolerance',
  nodes: [
    { type: 'trafficSource', label: 'Users', count: 1 },
    { type: 'loadBalancer', label: 'Load Balancer', count: 1 },
    { type: 'server', label: 'Server', count: 3 },
    { type: 'cache', label: 'Cache', count: 1 },
    { type: 'database', label: 'Primary DB', count: 1 },
    { type: 'replica', label: 'Replica DB', count: 1 },
    { type: 'healthCheck', label: 'Health Check', count: 1 },
  ],
  explanation: 'A replica takes over when the primary DB fails. Health checks detect the failure and trigger automatic failover, preventing system-wide outage.',
},
```

**Level 6**:
```js
idealSolution: {
  description: 'API Gateway for rate limiting and traffic filtering',
  nodes: [
    { type: 'trafficSource', label: 'Users', count: 1 },
    { type: 'apiGateway', label: 'API Gateway', count: 1 },
    { type: 'loadBalancer', label: 'Load Balancer', count: 1 },
    { type: 'server', label: 'Server', count: 4 },
    { type: 'cache', label: 'Cache', count: 1 },
    { type: 'database', label: 'Database', count: 1 },
  ],
  explanation: 'The API Gateway filters malicious traffic and rate-limits requests before they reach your servers, preventing overload from bots and abuse.',
},
```

**Level 7**:
```js
idealSolution: {
  description: 'Message queue with workers for async processing',
  nodes: [
    { type: 'trafficSource', label: 'Users', count: 1 },
    { type: 'loadBalancer', label: 'Load Balancer', count: 1 },
    { type: 'server', label: 'Server', count: 3 },
    { type: 'messageQueue', label: 'Message Queue', count: 1 },
    { type: 'worker', label: 'Worker', count: 3 },
    { type: 'database', label: 'Database', count: 1 },
  ],
  explanation: 'Servers push heavy tasks to the message queue. Workers process them asynchronously, decoupling request handling from background work.',
},
```

**Level 8**:
```js
idealSolution: {
  description: 'Microservices with dedicated databases',
  nodes: [
    { type: 'trafficSource', label: 'Users', count: 1 },
    { type: 'apiGateway', label: 'API Gateway', count: 1 },
    { type: 'loadBalancer', label: 'Load Balancer', count: 2 },
    { type: 'server', label: 'Service', count: 6 },
    { type: 'messageQueue', label: 'Message Queue', count: 1 },
    { type: 'database', label: 'Database', count: 2 },
    { type: 'cache', label: 'Cache', count: 1 },
  ],
  explanation: 'Each microservice owns its data and scales independently. API Gateway routes to the right service. Message queue handles inter-service communication.',
},
```

**Level 9**:
```js
idealSolution: {
  description: 'Auto-scaler responding to traffic spikes',
  nodes: [
    { type: 'trafficSource', label: 'Users', count: 1 },
    { type: 'loadBalancer', label: 'Load Balancer', count: 1 },
    { type: 'server', label: 'Server', count: 3 },
    { type: 'autoScaler', label: 'Auto-Scaler', count: 1 },
    { type: 'cache', label: 'Cache', count: 1 },
    { type: 'database', label: 'Database', count: 1 },
    { type: 'replica', label: 'Replica', count: 1 },
  ],
  explanation: 'The auto-scaler monitors load and spins up new servers automatically when traffic exceeds capacity, then scales down when traffic drops.',
},
```

**Level 10**:
```js
idealSolution: {
  description: 'Circuit breakers isolating failing services',
  nodes: [
    { type: 'trafficSource', label: 'Users', count: 1 },
    { type: 'loadBalancer', label: 'Load Balancer', count: 1 },
    { type: 'server', label: 'Server', count: 3 },
    { type: 'circuitBreaker', label: 'Circuit Breaker', count: 1 },
    { type: 'database', label: 'Database', count: 1 },
    { type: 'replica', label: 'Replica', count: 1 },
    { type: 'healthCheck', label: 'Health Check', count: 1 },
  ],
  explanation: 'Circuit breakers detect when a downstream service fails and stop sending it traffic, preventing cascading failures across the entire system.',
},
```

**Level 11**:
```js
idealSolution: {
  description: 'Fan-out with timeline caching',
  nodes: [
    { type: 'trafficSource', label: 'Users', count: 2 },
    { type: 'loadBalancer', label: 'Load Balancer', count: 1 },
    { type: 'server', label: 'Read Server', count: 3 },
    { type: 'server', label: 'Write Server', count: 1 },
    { type: 'cache', label: 'Timeline Cache', count: 1 },
    { type: 'messageQueue', label: 'Fan-Out Queue', count: 1 },
    { type: 'worker', label: 'Fan-Out Worker', count: 2 },
    { type: 'database', label: 'Database', count: 1 },
  ],
  explanation: 'Pre-compute timelines on write (fan-out-on-write). Cache serves reads instantly. Message queue + workers handle the fan-out asynchronously.',
},
```

**Level 12**:
```js
idealSolution: {
  description: 'Geo-indexed matching with regional processing',
  nodes: [
    { type: 'trafficSource', label: 'Riders', count: 1 },
    { type: 'trafficSource', label: 'Drivers', count: 1 },
    { type: 'loadBalancer', label: 'Load Balancer', count: 1 },
    { type: 'server', label: 'Matching Server', count: 3 },
    { type: 'cache', label: 'Location Cache', count: 1 },
    { type: 'messageQueue', label: 'Match Queue', count: 1 },
    { type: 'database', label: 'Database', count: 1 },
  ],
  explanation: 'Cache stores real-time driver locations. Matching servers use geo-indexing to find nearby drivers. Message queue ensures reliable match delivery.',
},
```

**Level 13**:
```js
idealSolution: {
  description: 'Global CDN with edge computing',
  nodes: [
    { type: 'trafficSource', label: 'Viewers', count: 3 },
    { type: 'cdn', label: 'CDN Edge', count: 3 },
    { type: 'loadBalancer', label: 'Origin LB', count: 1 },
    { type: 'server', label: 'Origin Server', count: 2 },
    { type: 'cache', label: 'Metadata Cache', count: 1 },
    { type: 'database', label: 'Content DB', count: 1 },
  ],
  explanation: 'CDN edges cache video segments close to viewers in each region. Origin servers only handle cache misses and metadata. This reduces cross-continent latency.',
},
```

**Level 14**:
```js
idealSolution: {
  description: 'Guaranteed delivery with persistent queues',
  nodes: [
    { type: 'trafficSource', label: 'Senders', count: 2 },
    { type: 'loadBalancer', label: 'Load Balancer', count: 1 },
    { type: 'server', label: 'Connection Server', count: 3 },
    { type: 'messageQueue', label: 'Delivery Queue', count: 1 },
    { type: 'worker', label: 'Delivery Worker', count: 2 },
    { type: 'database', label: 'Message Store', count: 1 },
    { type: 'cache', label: 'Presence Cache', count: 1 },
  ],
  explanation: 'Messages persist in the queue until acknowledged. If recipient is offline, delivery workers retry from the queue. Presence cache tracks who is online.',
},
```

**Level 15**:
```js
idealSolution: {
  description: 'Idempotent processing with exactly-once semantics',
  nodes: [
    { type: 'trafficSource', label: 'Merchants', count: 1 },
    { type: 'apiGateway', label: 'API Gateway', count: 1 },
    { type: 'server', label: 'Payment Server', count: 3 },
    { type: 'messageQueue', label: 'Transaction Queue', count: 1 },
    { type: 'worker', label: 'Settlement Worker', count: 2 },
    { type: 'database', label: 'Ledger DB', count: 1 },
    { type: 'cache', label: 'Idempotency Cache', count: 1 },
  ],
  explanation: 'API Gateway assigns idempotency keys. Payment servers check the cache before processing. Queue ensures settlement happens exactly once, even on retries.',
},
```

- [ ] **Step 2: Add ideal solution section to FailurePostMortem.jsx**

In `src/components/FailurePostMortem.jsx`:

1. Add imports at top:
```js
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LEVEL_CONFIGS } from '../engine/LevelConfigs';
```

2. Add `useState` to the react import (it currently has none):
```js
import { useState } from 'react';
```

3. Inside the component, after the existing destructuring line, add:
```js
const [showIdeal, setShowIdeal] = useState(false);
const level = useGameStore((s) => s.level);
const idealSolution = LEVEL_CONFIGS[level]?.idealSolution;
```

4. Add an icon map for the ideal solution nodes (after the existing style constants):
```js
const IDEAL_ICONS = {
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
```

5. Add new imports to the lucide-react import line:
```js
import { AlertTriangle, TrendingDown, Server, Zap, ArrowRight, Shield, Database, Globe, Layers, ChevronDown, ChevronUp, Split, DatabaseZap, HeartPulse, Cog, TrendingUp, ShieldOff } from 'lucide-react';
```

6. Add the ideal solution JSX section after the Suggestions section (before the closing `</div>` of the component return). Insert right after the suggestions `</div>` (the one at line 415):

```jsx
{/* Ideal Solution */}
{idealSolution && (
  <div style={sectionStyle}>
    <button
      onClick={() => setShowIdeal(prev => !prev)}
      style={{
        ...sectionTitleStyle,
        background: 'none', border: 'none', cursor: 'pointer',
        padding: 0, width: '100%', justifyContent: 'space-between',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Lightbulb size={13} style={{ color: 'var(--text-accent)' }} />
        <span>Ideal Architecture</span>
      </span>
      {showIdeal ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>

    {showIdeal && (
      <div style={{ marginTop: 8 }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: 'var(--text-accent)',
          marginBottom: 10, fontFamily: "'JetBrains Mono', monospace",
        }}>
          {idealSolution.description}
        </div>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
          padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 8,
          marginBottom: 10,
        }}>
          {idealSolution.nodes.map((node, i) => {
            const def = IDEAL_ICONS[node.type] || { icon: Server, color: 'var(--text-muted)' };
            const NodeIcon = def.icon;
            return (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {i > 0 && <ArrowRight size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 8px', background: `${def.color}15`,
                  border: `1px solid ${def.color}30`, borderRadius: 6,
                }}>
                  <NodeIcon size={12} style={{ color: def.color }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {node.label}{node.count > 1 ? ` x${node.count}` : ''}
                  </span>
                </span>
              </span>
            );
          })}
        </div>

        <p style={{
          margin: 0, fontSize: 12, lineHeight: 1.6,
          color: 'var(--text-secondary)',
        }}>
          {idealSolution.explanation}
        </p>
      </div>
    )}
  </div>
)}
```

7. Also add `Lightbulb` to the lucide-react imports.

Final import line:
```js
import { AlertTriangle, TrendingDown, Server, Zap, ArrowRight, Shield, Database, Globe, Layers, ChevronDown, ChevronUp, Split, DatabaseZap, HeartPulse, Cog, TrendingUp, ShieldOff, Lightbulb } from 'lucide-react';
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/engine/LevelConfigs.js src/components/FailurePostMortem.jsx
git commit -m "feat: ideal solution comparison in failure post-mortem for all 15 levels"
```

---

### Task 3: Concept — Event Sourcing

**Files:**
- Create: `src/concepts/concepts/EventSourcing.jsx`

- [ ] **Step 1: Create EventSourcing.jsx**

Create `src/concepts/concepts/EventSourcing.jsx`:

```jsx
import { useState, useCallback } from 'react';

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
});

const EVENTS = [
  { id: 1, type: 'UserCreated', data: { name: 'Alice', email: 'alice@example.com' }, color: 'var(--color-healthy)' },
  { id: 2, type: 'OrderPlaced', data: { orderId: 'ORD-001', amount: 49.99 }, color: 'var(--color-info)' },
  { id: 3, type: 'PaymentProcessed', data: { orderId: 'ORD-001', status: 'paid' }, color: 'var(--text-accent)' },
  { id: 4, type: 'OrderShipped', data: { orderId: 'ORD-001', tracking: 'TRK-789' }, color: 'var(--color-warning)' },
  { id: 5, type: 'OrderPlaced', data: { orderId: 'ORD-002', amount: 129.00 }, color: 'var(--color-info)' },
  { id: 6, type: 'OrderCancelled', data: { orderId: 'ORD-002', reason: 'Customer request' }, color: 'var(--color-critical)' },
  { id: 7, type: 'RefundIssued', data: { orderId: 'ORD-002', amount: 129.00 }, color: '#a855f7' },
];

function replayTo(index) {
  const state = { user: null, orders: {}, balance: 0 };
  for (let i = 0; i <= index; i++) {
    const evt = EVENTS[i];
    switch (evt.type) {
      case 'UserCreated':
        state.user = evt.data.name;
        break;
      case 'OrderPlaced':
        state.orders[evt.data.orderId] = { status: 'placed', amount: evt.data.amount };
        state.balance += evt.data.amount;
        break;
      case 'PaymentProcessed':
        if (state.orders[evt.data.orderId]) state.orders[evt.data.orderId].status = 'paid';
        break;
      case 'OrderShipped':
        if (state.orders[evt.data.orderId]) state.orders[evt.data.orderId].status = 'shipped';
        break;
      case 'OrderCancelled':
        if (state.orders[evt.data.orderId]) state.orders[evt.data.orderId].status = 'cancelled';
        break;
      case 'RefundIssued':
        state.balance -= evt.data.amount;
        break;
    }
  }
  return state;
}

export default function EventSourcing() {
  const [cursor, setCursor] = useState(EVENTS.length - 1);
  const state = replayTo(cursor);

  const stepBack = useCallback(() => setCursor(c => Math.max(0, c - 1)), []);
  const stepForward = useCallback(() => setCursor(c => Math.min(EVENTS.length - 1, c + 1)), []);

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: 20, borderRadius: 12, border: '1px solid var(--border-primary)', maxWidth: 500 }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Event Sourcing</h3>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-muted)' }}>
        Step through events to see how aggregate state is rebuilt. Click any event or use controls.
      </p>

      {/* Event timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
        {EVENTS.map((evt, i) => (
          <button key={evt.id} onClick={() => setCursor(i)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
            background: i <= cursor ? 'var(--bg-secondary)' : 'var(--bg-primary)',
            border: `1px solid ${i === cursor ? evt.color : i <= cursor ? 'var(--border-primary)' : 'transparent'}`,
            borderRadius: 8, cursor: 'pointer', opacity: i <= cursor ? 1 : 0.35,
            transition: 'all 200ms', textAlign: 'left',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: evt.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                {evt.type}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {Object.entries(evt.data).map(([k, v]) => `${k}: ${v}`).join(', ')}
              </div>
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>#{i + 1}</span>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
        <button style={toggleStyle(false)} onClick={() => setCursor(0)}>First</button>
        <button style={toggleStyle(false)} onClick={stepBack}>Back</button>
        <button style={toggleStyle(false)} onClick={stepForward}>Forward</button>
        <button style={toggleStyle(false)} onClick={() => setCursor(EVENTS.length - 1)}>Last</button>
      </div>

      {/* Current state */}
      <div style={{ background: 'var(--bg-secondary)', padding: 14, borderRadius: 8, border: '1px solid var(--border-primary)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-accent)', marginBottom: 8, letterSpacing: '0.08em' }}>
          Aggregate State at Event #{cursor + 1}
        </div>
        <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <div>User: <span style={{ color: 'var(--text-primary)' }}>{state.user || '—'}</span></div>
          <div>Balance: <span style={{ color: state.balance >= 0 ? 'var(--color-healthy)' : 'var(--color-critical)' }}>${state.balance.toFixed(2)}</span></div>
          {Object.entries(state.orders).map(([id, o]) => (
            <div key={id}>
              {id}: <span style={{ color: o.status === 'cancelled' ? 'var(--color-critical)' : o.status === 'shipped' ? 'var(--color-healthy)' : 'var(--text-primary)' }}>
                {o.status}
              </span> (${o.amount})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/concepts/concepts/EventSourcing.jsx
git commit -m "feat: add Event Sourcing concept playground"
```

---

### Task 4: Concept — TCP vs UDP

**Files:**
- Create: `src/concepts/concepts/TcpVsUdp.jsx`

- [ ] **Step 1: Create TcpVsUdp.jsx**

Create `src/concepts/concepts/TcpVsUdp.jsx`:

```jsx
import { useState, useCallback, useRef, useEffect } from 'react';

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
});

const PACKET_COUNT = 6;

function createPackets(protocol) {
  return Array.from({ length: PACKET_COUNT }, (_, i) => {
    const dropped = protocol === 'udp' && Math.random() < 0.25;
    const delay = protocol === 'tcp' ? (i * 200 + 100) : (Math.random() * 300 + 50);
    return { id: i + 1, dropped, delay, delivered: false, retransmitted: false };
  });
}

export default function TcpVsUdp() {
  const [tcpPackets, setTcpPackets] = useState([]);
  const [udpPackets, setUdpPackets] = useState([]);
  const [running, setRunning] = useState(false);
  const [tcpTime, setTcpTime] = useState(null);
  const [udpTime, setUdpTime] = useState(null);
  const timerRef = useRef(null);

  const send = useCallback(() => {
    const tcp = createPackets('tcp');
    const udp = createPackets('udp');
    setTcpPackets(tcp.map(p => ({ ...p, delivered: false })));
    setUdpPackets(udp.map(p => ({ ...p, delivered: false })));
    setTcpTime(null);
    setUdpTime(null);
    setRunning(true);

    // Simulate TCP delivery (in-order, retransmit dropped)
    let tcpDelay = 300; // handshake
    const tcpTimers = [];
    tcp.forEach((p) => {
      tcpDelay += 200;
      tcpTimers.push(setTimeout(() => {
        setTcpPackets(prev => prev.map(pk => pk.id === p.id ? { ...pk, delivered: true } : pk));
      }, tcpDelay));
    });
    tcpTimers.push(setTimeout(() => setTcpTime(tcpDelay), tcpDelay + 50));

    // Simulate UDP delivery (fire-and-forget)
    let maxUdpDelay = 0;
    udp.forEach((p) => {
      if (!p.dropped) {
        const d = Math.round(p.delay);
        if (d > maxUdpDelay) maxUdpDelay = d;
        setTimeout(() => {
          setUdpPackets(prev => prev.map(pk => pk.id === p.id ? { ...pk, delivered: true } : pk));
        }, d);
      }
    });
    setTimeout(() => {
      setUdpTime(maxUdpDelay || 100);
      setRunning(false);
    }, Math.max(tcpDelay, maxUdpDelay) + 100);

    timerRef.current = tcpTimers;
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) timerRef.current.forEach(clearTimeout);
    };
  }, []);

  const renderLane = (label, packets, time, color) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
        {label} {time !== null && <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>— {time}ms</span>}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {packets.map(p => (
          <div key={p.id} style={{
            width: 36, height: 36, borderRadius: 6, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
            background: p.dropped ? 'var(--color-critical-bg)' : p.delivered ? `${color}15` : 'var(--bg-tertiary)',
            border: `1px solid ${p.dropped ? 'var(--color-critical)' : p.delivered ? color : 'var(--border-primary)'}`,
            color: p.dropped ? 'var(--color-critical)' : p.delivered ? color : 'var(--text-muted)',
            transition: 'all 300ms',
            textDecoration: p.dropped ? 'line-through' : 'none',
          }}>
            P{p.id}
          </div>
        ))}
      </div>
    </div>
  );

  const tcpDelivered = tcpPackets.filter(p => p.delivered).length;
  const udpDelivered = udpPackets.filter(p => p.delivered).length;
  const udpDropped = udpPackets.filter(p => p.dropped).length;

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: 20, borderRadius: 12, border: '1px solid var(--border-primary)', maxWidth: 420 }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>TCP vs UDP</h3>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-muted)' }}>
        Send {PACKET_COUNT} packets over each protocol and compare delivery.
      </p>

      <button style={toggleStyle(running)} onClick={send} disabled={running}>
        {running ? 'Sending...' : 'Send Packets'}
      </button>

      <div style={{ marginTop: 16 }}>
        {renderLane('TCP (Reliable)', tcpPackets, tcpTime, 'var(--color-info)')}
        {renderLane('UDP (Fast)', udpPackets, udpTime, 'var(--color-healthy)')}
      </div>

      {tcpPackets.length > 0 && !running && (
        <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8, border: '1px solid var(--border-primary)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-accent)', marginBottom: 8 }}>Results</div>
          <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <div>TCP: <span style={{ color: 'var(--color-info)' }}>{tcpDelivered}/{PACKET_COUNT} delivered</span>, 0 lost, {tcpTime}ms</div>
            <div>UDP: <span style={{ color: udpDropped > 0 ? 'var(--color-warning)' : 'var(--color-healthy)' }}>{udpDelivered}/{PACKET_COUNT} delivered</span>, {udpDropped} lost, {udpTime}ms</div>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            TCP guarantees delivery via acknowledgments and retransmission but adds latency.
            UDP is faster but packets may be lost — ideal for video streaming and gaming.
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/concepts/concepts/TcpVsUdp.jsx
git commit -m "feat: add TCP vs UDP concept playground"
```

---

### Task 5: Concept — Circuit Breakers

**Files:**
- Create: `src/concepts/concepts/CircuitBreakers.jsx`

- [ ] **Step 1: Create CircuitBreakers.jsx**

Create `src/concepts/concepts/CircuitBreakers.jsx`:

```jsx
import { useState, useCallback, useRef, useEffect } from 'react';

const STATES = {
  closed: { label: 'Closed', color: 'var(--color-healthy)', desc: 'Requests flow normally' },
  open: { label: 'Open', color: 'var(--color-critical)', desc: 'Requests blocked — downstream is failing' },
  halfOpen: { label: 'Half-Open', color: 'var(--color-warning)', desc: 'Testing with limited requests' },
};

const FAILURE_THRESHOLD = 3;
const SUCCESS_THRESHOLD = 2;
const TIMEOUT_MS = 3000;

export default function CircuitBreakers() {
  const [cbState, setCbState] = useState('closed');
  const [failures, setFailures] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const [requests, setRequests] = useState([]);
  const [downstreamHealthy, setDownstreamHealthy] = useState(true);
  const timeoutRef = useRef(null);

  const addRequest = useCallback((status, reason) => {
    setRequests(prev => [...prev.slice(-11), { id: Date.now(), status, reason }]);
  }, []);

  const sendRequest = useCallback(() => {
    if (cbState === 'open') {
      addRequest('blocked', 'Circuit is OPEN');
      return;
    }

    const willFail = !downstreamHealthy;

    if (willFail) {
      addRequest('failed', 'Downstream error');
      if (cbState === 'closed') {
        setFailures(prev => {
          const next = prev + 1;
          if (next >= FAILURE_THRESHOLD) {
            setCbState('open');
            setFailures(0);
            setSuccesses(0);
            // Auto-transition to half-open after timeout
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              setCbState('halfOpen');
              setSuccesses(0);
            }, TIMEOUT_MS);
          }
          return next;
        });
      } else if (cbState === 'halfOpen') {
        setCbState('open');
        setSuccesses(0);
        setFailures(0);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setCbState('halfOpen');
          setSuccesses(0);
        }, TIMEOUT_MS);
      }
    } else {
      addRequest('success', 'OK 200');
      if (cbState === 'halfOpen') {
        setSuccesses(prev => {
          const next = prev + 1;
          if (next >= SUCCESS_THRESHOLD) {
            setCbState('closed');
            setFailures(0);
            setSuccesses(0);
          }
          return next;
        });
      } else {
        setFailures(0);
      }
    }
  }, [cbState, downstreamHealthy, addRequest]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const stateInfo = STATES[cbState];

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: 20, borderRadius: 12, border: '1px solid var(--border-primary)', maxWidth: 460 }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Circuit Breaker</h3>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-muted)' }}>
        Toggle downstream health and send requests. Watch the breaker trip after {FAILURE_THRESHOLD} failures.
      </p>

      {/* State machine visualization */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
        {Object.entries(STATES).map(([key, s]) => (
          <div key={key} style={{
            padding: '10px 16px', borderRadius: 10, textAlign: 'center',
            background: key === cbState ? `${s.color}15` : 'var(--bg-secondary)',
            border: `2px solid ${key === cbState ? s.color : 'transparent'}`,
            transition: 'all 300ms', flex: 1,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: key === cbState ? s.color : 'var(--text-muted)' }}>
              {s.label}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Counters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Failures</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: failures > 0 ? 'var(--color-critical)' : 'var(--text-primary)' }}>
            {failures}/{FAILURE_THRESHOLD}
          </div>
        </div>
        <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Half-Open OK</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: successes > 0 ? 'var(--color-healthy)' : 'var(--text-primary)' }}>
            {successes}/{SUCCESS_THRESHOLD}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={sendRequest}
          style={{
            padding: '8px 16px', background: 'var(--text-accent)', color: 'var(--bg-primary)',
            border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer',
          }}
        >
          Send Request
        </button>
        <button
          onClick={() => setDownstreamHealthy(h => !h)}
          style={{
            padding: '8px 16px',
            background: downstreamHealthy ? 'var(--color-healthy-bg)' : 'var(--color-critical-bg)',
            color: downstreamHealthy ? 'var(--color-healthy)' : 'var(--color-critical)',
            border: `1px solid ${downstreamHealthy ? 'var(--color-healthy)' : 'var(--color-critical)'}`,
            borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer',
          }}
        >
          Downstream: {downstreamHealthy ? 'Healthy' : 'Failing'}
        </button>
      </div>

      {/* Request log */}
      {requests.length > 0 && (
        <div style={{ background: 'var(--bg-secondary)', padding: 10, borderRadius: 8, maxHeight: 160, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Request Log</div>
          {requests.map(r => (
            <div key={r.id} style={{
              fontSize: 11, fontFamily: "'JetBrains Mono', monospace", padding: '2px 0',
              color: r.status === 'success' ? 'var(--color-healthy)' : r.status === 'blocked' ? 'var(--color-warning)' : 'var(--color-critical)',
            }}>
              {r.status === 'success' ? 'OK' : r.status === 'blocked' ? 'BLOCKED' : 'FAIL'} — {r.reason}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/concepts/concepts/CircuitBreakers.jsx
git commit -m "feat: add Circuit Breaker concept playground"
```

---

### Task 6: Concept — DNS & Service Discovery

**Files:**
- Create: `src/concepts/concepts/DNSDiscovery.jsx`

- [ ] **Step 1: Create DNSDiscovery.jsx**

Create `src/concepts/concepts/DNSDiscovery.jsx`:

```jsx
import { useState, useCallback, useRef, useEffect } from 'react';

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
});

const DNS_STEPS = [
  { label: 'Browser Cache', latency: 0, color: 'var(--text-muted)' },
  { label: 'Recursive Resolver', latency: 5, color: 'var(--color-info)' },
  { label: 'Root Nameserver', latency: 20, color: 'var(--color-warning)' },
  { label: 'TLD Nameserver', latency: 15, color: 'var(--color-warning)' },
  { label: 'Authoritative NS', latency: 10, color: 'var(--color-healthy)' },
];

const DOMAINS = [
  { domain: 'api.example.com', ip: '203.0.113.42' },
  { domain: 'cdn.static.io', ip: '198.51.100.7' },
  { domain: 'db.internal.svc', ip: '10.0.3.15' },
];

export default function DNSDiscovery() {
  const [mode, setMode] = useState('dns');
  const [selectedDomain, setSelectedDomain] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [cachedSteps, setCachedSteps] = useState(new Set());
  const timerRef = useRef([]);

  const domain = DOMAINS[selectedDomain];

  const resolve = useCallback(() => {
    setResolving(true);
    setResolved(false);
    setActiveStep(-1);
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];

    const steps = mode === 'dns' ? DNS_STEPS : [
      { label: 'Client', latency: 0, color: 'var(--text-muted)' },
      { label: 'Service Registry', latency: 8, color: 'var(--color-info)' },
      { label: 'Health Check', latency: 5, color: 'var(--color-healthy)' },
    ];

    let delay = 0;
    steps.forEach((step, i) => {
      const isCached = cachedSteps.has(step.label);
      const stepDelay = isCached ? 1 : step.latency;
      delay += stepDelay * 20 + 200;
      const t = setTimeout(() => setActiveStep(i), delay);
      timerRef.current.push(t);
    });

    delay += 300;
    const t = setTimeout(() => {
      setResolved(true);
      setResolving(false);
      // Cache all steps after first resolve
      setCachedSteps(new Set(steps.map(s => s.label)));
    }, delay);
    timerRef.current.push(t);
  }, [mode, cachedSteps]);

  useEffect(() => {
    return () => timerRef.current.forEach(clearTimeout);
  }, []);

  const steps = mode === 'dns' ? DNS_STEPS : [
    { label: 'Client', latency: 0, color: 'var(--text-muted)' },
    { label: 'Service Registry', latency: 8, color: 'var(--color-info)' },
    { label: 'Health Check', latency: 5, color: 'var(--color-healthy)' },
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: 20, borderRadius: 12, border: '1px solid var(--border-primary)', maxWidth: 460 }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>DNS & Service Discovery</h3>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-muted)' }}>
        Watch how a domain name resolves to an IP address through the DNS chain.
      </p>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button style={toggleStyle(mode === 'dns')} onClick={() => { setMode('dns'); setActiveStep(-1); setResolved(false); setCachedSteps(new Set()); }}>DNS</button>
        <button style={toggleStyle(mode === 'discovery')} onClick={() => { setMode('discovery'); setActiveStep(-1); setResolved(false); setCachedSteps(new Set()); }}>Service Discovery</button>
      </div>

      {/* Domain selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {DOMAINS.map((d, i) => (
          <button key={i} style={{
            padding: '6px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
            background: i === selectedDomain ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
            border: `1px solid ${i === selectedDomain ? 'var(--text-accent)' : 'var(--border-primary)'}`,
            color: i === selectedDomain ? 'var(--text-accent)' : 'var(--text-muted)',
          }} onClick={() => { setSelectedDomain(i); setActiveStep(-1); setResolved(false); }}>
            {d.domain}
          </button>
        ))}
      </div>

      {/* Resolution chain */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
        {steps.map((step, i) => {
          const isActive = i <= activeStep;
          const isCurrent = i === activeStep;
          const isCached = cachedSteps.has(step.label);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              background: isActive ? 'var(--bg-secondary)' : 'var(--bg-primary)',
              border: `1px solid ${isCurrent ? step.color : isActive ? 'var(--border-primary)' : 'transparent'}`,
              borderRadius: 8, opacity: isActive ? 1 : 0.35, transition: 'all 300ms',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? step.color : 'var(--bg-tertiary)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{step.label}</span>
              <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)' }}>
                {isCached ? '~0ms (cached)' : `~${step.latency}ms`}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <button onClick={resolve} disabled={resolving} style={{
          padding: '8px 16px', background: 'var(--text-accent)', color: 'var(--bg-primary)',
          border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: resolving ? 'wait' : 'pointer',
          opacity: resolving ? 0.6 : 1,
        }}>
          {resolving ? 'Resolving...' : 'Resolve'}
        </button>
        {resolved && (
          <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-healthy)' }}>
            {domain.domain} &#8594; {domain.ip}
          </span>
        )}
      </div>

      {cachedSteps.size > 0 && (
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
          Resolve again to see cached lookups (near-instant). TTL expires to force fresh lookups.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/concepts/concepts/DNSDiscovery.jsx
git commit -m "feat: add DNS & Service Discovery concept playground"
```

---

### Task 7: Concept — ACID Transactions

**Files:**
- Create: `src/concepts/concepts/ACIDTransactions.jsx`

- [ ] **Step 1: Create ACIDTransactions.jsx**

Create `src/concepts/concepts/ACIDTransactions.jsx`:

```jsx
import { useState, useCallback } from 'react';

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
});

const INITIAL_ACCOUNTS = { Alice: 1000, Bob: 500, Charlie: 750 };

const ISOLATION_LEVELS = {
  readUncommitted: { label: 'Read Uncommitted', color: 'var(--color-critical)', risk: 'Dirty reads, phantom reads, lost updates' },
  readCommitted: { label: 'Read Committed', color: 'var(--color-warning)', risk: 'Phantom reads, non-repeatable reads' },
  serializable: { label: 'Serializable', color: 'var(--color-healthy)', risk: 'None — full isolation (slowest)' },
};

const SCENARIOS = [
  {
    name: 'Dirty Read',
    desc: 'T1 reads data T2 wrote but has not committed. T2 rolls back — T1 read phantom data.',
    steps: (isolation) => {
      const accounts = { ...INITIAL_ACCOUNTS };
      const log = [];
      if (isolation === 'readUncommitted') {
        log.push({ tx: 'T2', action: 'BEGIN', accounts: { ...accounts } });
        accounts.Alice -= 200;
        log.push({ tx: 'T2', action: 'UPDATE Alice -= 200 (uncommitted)', accounts: { ...accounts } });
        log.push({ tx: 'T1', action: `READ Alice = $${accounts.Alice} (dirty!)`, accounts: { ...accounts }, anomaly: true });
        accounts.Alice += 200;
        log.push({ tx: 'T2', action: 'ROLLBACK', accounts: { ...accounts } });
        log.push({ tx: 'T1', action: `Alice was actually $${accounts.Alice}`, accounts: { ...accounts }, anomaly: true });
      } else {
        log.push({ tx: 'T2', action: 'BEGIN', accounts: { ...accounts } });
        log.push({ tx: 'T2', action: 'UPDATE Alice -= 200 (uncommitted)', accounts: { ...accounts } });
        log.push({ tx: 'T1', action: `READ Alice = $${INITIAL_ACCOUNTS.Alice} (correct — reads committed only)`, accounts: { ...accounts } });
        log.push({ tx: 'T2', action: 'ROLLBACK', accounts: { ...accounts } });
      }
      return log;
    },
  },
  {
    name: 'Lost Update',
    desc: 'Both T1 and T2 read the same value, then both write — one update is silently lost.',
    steps: (isolation) => {
      const accounts = { ...INITIAL_ACCOUNTS };
      const log = [];
      if (isolation === 'serializable') {
        log.push({ tx: 'T1', action: 'BEGIN + LOCK Alice', accounts: { ...accounts } });
        log.push({ tx: 'T1', action: `READ Alice = $${accounts.Alice}`, accounts: { ...accounts } });
        accounts.Alice += 100;
        log.push({ tx: 'T1', action: 'UPDATE Alice += 100, COMMIT', accounts: { ...accounts } });
        log.push({ tx: 'T2', action: 'BEGIN — waits for lock', accounts: { ...accounts } });
        log.push({ tx: 'T2', action: `READ Alice = $${accounts.Alice} (sees T1 commit)`, accounts: { ...accounts } });
        accounts.Alice += 50;
        log.push({ tx: 'T2', action: 'UPDATE Alice += 50, COMMIT', accounts: { ...accounts } });
        log.push({ tx: '-', action: `Final: Alice = $${accounts.Alice} (correct: +150)`, accounts: { ...accounts } });
      } else {
        log.push({ tx: 'T1', action: `READ Alice = $${accounts.Alice}`, accounts: { ...accounts } });
        log.push({ tx: 'T2', action: `READ Alice = $${accounts.Alice}`, accounts: { ...accounts } });
        const base = accounts.Alice;
        accounts.Alice = base + 100;
        log.push({ tx: 'T1', action: `UPDATE Alice = ${base} + 100 = $${accounts.Alice}`, accounts: { ...accounts } });
        accounts.Alice = base + 50;
        log.push({ tx: 'T2', action: `UPDATE Alice = ${base} + 50 = $${accounts.Alice}`, accounts: { ...accounts }, anomaly: true });
        log.push({ tx: '-', action: `Final: Alice = $${accounts.Alice} — T1's +100 was LOST`, accounts: { ...accounts }, anomaly: true });
      }
      return log;
    },
  },
];

export default function ACIDTransactions() {
  const [isolation, setIsolation] = useState('readUncommitted');
  const [scenario, setScenario] = useState(0);
  const [stepIndex, setStepIndex] = useState(-1);

  const currentScenario = SCENARIOS[scenario];
  const log = currentScenario.steps(isolation);

  const runStep = useCallback(() => {
    setStepIndex(prev => Math.min(prev + 1, log.length - 1));
  }, [log.length]);

  const reset = useCallback(() => setStepIndex(-1), []);

  const currentAccounts = stepIndex >= 0 ? log[stepIndex].accounts : INITIAL_ACCOUNTS;

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: 20, borderRadius: 12, border: '1px solid var(--border-primary)', maxWidth: 520 }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>ACID Transactions</h3>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-muted)' }}>
        Run concurrent transactions at different isolation levels. Watch for anomalies.
      </p>

      {/* Scenario selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {SCENARIOS.map((s, i) => (
          <button key={i} style={toggleStyle(scenario === i)} onClick={() => { setScenario(i); setStepIndex(-1); }}>
            {s.name}
          </button>
        ))}
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 11, color: 'var(--text-muted)' }}>{currentScenario.desc}</p>

      {/* Isolation level */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {Object.entries(ISOLATION_LEVELS).map(([key, lvl]) => (
          <button key={key} style={{
            ...toggleStyle(isolation === key),
            fontSize: 10, padding: '4px 10px',
          }} onClick={() => { setIsolation(key); setStepIndex(-1); }}>
            {lvl.label}
          </button>
        ))}
      </div>

      {/* Account balances */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {Object.entries(currentAccounts).map(([name, balance]) => {
          const changed = balance !== INITIAL_ACCOUNTS[name];
          return (
            <div key={name} style={{
              flex: 1, background: 'var(--bg-secondary)', borderRadius: 8, padding: '8px 12px', textAlign: 'center',
              border: `1px solid ${changed ? 'var(--text-accent)' : 'var(--border-primary)'}`,
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{name}</div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: changed ? 'var(--text-accent)' : 'var(--text-primary)' }}>
                ${balance}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={runStep} disabled={stepIndex >= log.length - 1} style={{
          padding: '8px 16px', background: 'var(--text-accent)', color: 'var(--bg-primary)',
          border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer',
          opacity: stepIndex >= log.length - 1 ? 0.5 : 1,
        }}>
          {stepIndex < 0 ? 'Start' : 'Next Step'}
        </button>
        <button onClick={reset} style={toggleStyle(false)}>Reset</button>
      </div>

      {/* Transaction log */}
      {stepIndex >= 0 && (
        <div style={{ background: 'var(--bg-secondary)', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Transaction Log</div>
          {log.slice(0, stepIndex + 1).map((entry, i) => (
            <div key={i} style={{
              fontSize: 11, fontFamily: "'JetBrains Mono', monospace", padding: '3px 0',
              color: entry.anomaly ? 'var(--color-critical)' : entry.tx === 'T1' ? 'var(--color-info)' : entry.tx === 'T2' ? 'var(--color-warning)' : 'var(--text-secondary)',
            }}>
              <span style={{ fontWeight: 700, marginRight: 6 }}>{entry.tx}</span>
              {entry.action}
              {entry.anomaly && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--color-critical)' }}>ANOMALY</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/concepts/concepts/ACIDTransactions.jsx
git commit -m "feat: add ACID Transactions concept playground"
```

---

### Task 8: Concept — Raft Consensus

**Files:**
- Create: `src/concepts/concepts/RaftConsensus.jsx`

- [ ] **Step 1: Create RaftConsensus.jsx**

Create `src/concepts/concepts/RaftConsensus.jsx`:

```jsx
import { useState, useCallback, useRef, useEffect } from 'react';

const ROLES = {
  leader: { color: 'var(--color-healthy)', label: 'Leader' },
  follower: { color: 'var(--color-info)', label: 'Follower' },
  candidate: { color: 'var(--color-warning)', label: 'Candidate' },
  dead: { color: 'var(--text-muted)', label: 'Dead' },
};

function initNodes() {
  return [
    { id: 1, role: 'leader', term: 1, log: ['v=1'], votes: 0 },
    { id: 2, role: 'follower', term: 1, log: ['v=1'], votes: 0 },
    { id: 3, role: 'follower', term: 1, log: ['v=1'], votes: 0 },
    { id: 4, role: 'follower', term: 1, log: ['v=1'], votes: 0 },
    { id: 5, role: 'follower', term: 1, log: ['v=1'], votes: 0 },
  ];
}

export default function RaftConsensus() {
  const [nodes, setNodes] = useState(initNodes);
  const [events, setEvents] = useState([]);
  const [replicating, setReplicating] = useState(false);
  const timerRef = useRef([]);
  let nextVal = useRef(2);

  const addEvent = useCallback((msg) => {
    setEvents(prev => [...prev.slice(-9), { id: Date.now() + Math.random(), msg }]);
  }, []);

  const killNode = useCallback((id) => {
    setNodes(prev => {
      const node = prev.find(n => n.id === id);
      if (!node || node.role === 'dead') return prev;
      addEvent(`Node ${id} (${node.role}) killed`);
      const updated = prev.map(n => n.id === id ? { ...n, role: 'dead' } : n);

      // If leader was killed, trigger election
      if (node.role === 'leader') {
        const alive = updated.filter(n => n.role !== 'dead');
        if (alive.length > 0) {
          const candidate = alive[0];
          const newTerm = node.term + 1;
          addEvent(`Node ${candidate.id} starts election (term ${newTerm})`);

          // Simulate election after short delay
          setTimeout(() => {
            setNodes(curr => {
              const aliveNow = curr.filter(n => n.role !== 'dead');
              const majority = Math.floor(curr.filter(n => n.role !== 'dead').length / 2) + 1;
              const votesGot = aliveNow.length; // all alive nodes vote yes in this sim
              if (votesGot >= majority) {
                addEvent(`Node ${candidate.id} elected leader with ${votesGot} votes (majority: ${majority})`);
                return curr.map(n => {
                  if (n.role === 'dead') return n;
                  if (n.id === candidate.id) return { ...n, role: 'leader', term: newTerm, votes: votesGot };
                  return { ...n, role: 'follower', term: newTerm, votes: 0 };
                });
              }
              return curr;
            });
          }, 800);

          return updated.map(n => {
            if (n.id === id) return n;
            if (n.role === 'dead') return n;
            if (n.id === candidate.id) return { ...n, role: 'candidate' };
            return n;
          });
        }
      }
      return updated;
    });
  }, [addEvent]);

  const reviveNode = useCallback((id) => {
    setNodes(prev => {
      const node = prev.find(n => n.id === id);
      if (!node || node.role !== 'dead') return prev;
      const leader = prev.find(n => n.role === 'leader');
      addEvent(`Node ${id} revived as follower`);
      return prev.map(n => n.id === id ? { ...n, role: 'follower', term: leader ? leader.term : n.term, log: leader ? [...leader.log] : n.log } : n);
    });
  }, [addEvent]);

  const submitValue = useCallback(() => {
    const val = `v=${nextVal.current++}`;
    setReplicating(true);
    addEvent(`Client submits "${val}" to leader`);

    setNodes(prev => {
      const leader = prev.find(n => n.role === 'leader');
      if (!leader) { addEvent('No leader — submit failed'); setReplicating(false); return prev; }
      return prev.map(n => n.id === leader.id ? { ...n, log: [...n.log, val] } : n);
    });

    // Replicate to followers one by one
    const alive = nodes.filter(n => n.role === 'follower');
    alive.forEach((follower, i) => {
      const t = setTimeout(() => {
        setNodes(prev => {
          const leader = prev.find(n => n.role === 'leader');
          if (!leader) return prev;
          return prev.map(n => n.id === follower.id && n.role !== 'dead' ? { ...n, log: [...leader.log] } : n);
        });
        addEvent(`Replicated "${val}" to Node ${follower.id}`);
        if (i === alive.length - 1) setReplicating(false);
      }, (i + 1) * 400);
      timerRef.current.push(t);
    });

    if (alive.length === 0) setReplicating(false);
  }, [nodes, addEvent]);

  useEffect(() => {
    return () => timerRef.current.forEach(clearTimeout);
  }, []);

  const leader = nodes.find(n => n.role === 'leader');
  const aliveCount = nodes.filter(n => n.role !== 'dead').length;
  const majority = Math.floor(nodes.length / 2) + 1;

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: 20, borderRadius: 12, border: '1px solid var(--border-primary)', maxWidth: 520 }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Raft Consensus</h3>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-muted)' }}>
        Click nodes to kill them. Watch leader election and log replication. Majority needed: {majority}/{nodes.length}.
      </p>

      {/* Node visualization */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {nodes.map(n => {
          const info = ROLES[n.role];
          return (
            <div key={n.id}
              onClick={() => n.role === 'dead' ? reviveNode(n.id) : killNode(n.id)}
              style={{
                width: 80, padding: '10px 8px', borderRadius: 10, textAlign: 'center',
                cursor: 'pointer', transition: 'all 300ms',
                background: n.role === 'dead' ? 'var(--bg-secondary)' : `${info.color}10`,
                border: `2px solid ${n.role === 'dead' ? 'var(--border-primary)' : info.color}`,
                opacity: n.role === 'dead' ? 0.4 : 1,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: info.color, fontFamily: "'JetBrains Mono', monospace" }}>
                N{n.id}
              </div>
              <div style={{ fontSize: 9, fontWeight: 600, color: info.color, textTransform: 'uppercase', marginTop: 2 }}>
                {info.label}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
                T{n.term} | {n.log.length} entries
              </div>
            </div>
          );
        })}
      </div>

      {/* Quorum status */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 16, padding: '8px 12px',
        background: 'var(--bg-secondary)', borderRadius: 8,
      }}>
        <div style={{ flex: 1, fontSize: 11 }}>
          <span style={{ color: 'var(--text-muted)' }}>Alive: </span>
          <span style={{ color: aliveCount >= majority ? 'var(--color-healthy)' : 'var(--color-critical)', fontWeight: 700 }}>
            {aliveCount}/{nodes.length}
          </span>
        </div>
        <div style={{ flex: 1, fontSize: 11 }}>
          <span style={{ color: 'var(--text-muted)' }}>Leader: </span>
          <span style={{ color: leader ? 'var(--color-healthy)' : 'var(--color-critical)', fontWeight: 700 }}>
            {leader ? `N${leader.id}` : 'None'}
          </span>
        </div>
        <div style={{ flex: 1, fontSize: 11 }}>
          <span style={{ color: 'var(--text-muted)' }}>Quorum: </span>
          <span style={{ color: aliveCount >= majority ? 'var(--color-healthy)' : 'var(--color-critical)', fontWeight: 700 }}>
            {aliveCount >= majority ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      {/* Submit value */}
      <button onClick={submitValue} disabled={replicating || !leader} style={{
        padding: '8px 16px', background: 'var(--text-accent)', color: 'var(--bg-primary)',
        border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer',
        opacity: replicating || !leader ? 0.5 : 1, marginBottom: 12,
      }}>
        {replicating ? 'Replicating...' : 'Submit Value'}
      </button>

      {/* Event log */}
      {events.length > 0 && (
        <div style={{ background: 'var(--bg-secondary)', padding: 10, borderRadius: 8, maxHeight: 140, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Event Log</div>
          {events.map(e => (
            <div key={e.id} style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)', padding: '2px 0' }}>
              {e.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/concepts/concepts/RaftConsensus.jsx
git commit -m "feat: add Raft Consensus concept playground"
```

---

### Task 9: Concept — Back Pressure

**Files:**
- Create: `src/concepts/concepts/BackPressure.jsx`

- [ ] **Step 1: Create BackPressure.jsx**

Create `src/concepts/concepts/BackPressure.jsx`:

```jsx
import { useState, useRef, useEffect, useCallback } from 'react';

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
});

const STRATEGIES = {
  dropTail: { label: 'Drop Tail', color: 'var(--color-critical)', desc: 'New messages dropped when queue is full' },
  dropHead: { label: 'Drop Head', color: 'var(--color-warning)', desc: 'Oldest messages dropped to make room' },
  blockProducer: { label: 'Block Producer', color: 'var(--color-info)', desc: 'Producer paused until queue has space' },
};

const QUEUE_MAX = 20;

export default function BackPressure() {
  const [strategy, setStrategy] = useState('dropTail');
  const [producerRate, setProducerRate] = useState(10);
  const [consumerRate, setConsumerRate] = useState(5);
  const [queue, setQueue] = useState([]);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ produced: 0, consumed: 0, dropped: 0 });
  const intervalRef = useRef(null);
  const msgIdRef = useRef(1);

  const tick = useCallback(() => {
    setQueue(prev => {
      let q = [...prev];
      const newStats = { produced: 0, consumed: 0, dropped: 0 };

      // Consumer eats from front
      const toConsume = Math.min(consumerRate, q.length);
      q = q.slice(toConsume);
      newStats.consumed = toConsume;

      // Producer adds to back
      for (let i = 0; i < producerRate; i++) {
        if (q.length >= QUEUE_MAX) {
          if (strategy === 'dropTail') {
            newStats.dropped++;
          } else if (strategy === 'dropHead') {
            q.shift();
            q.push(msgIdRef.current++);
            newStats.dropped++;
          } else {
            // blockProducer — stop producing
            newStats.dropped++;
            break;
          }
        } else {
          q.push(msgIdRef.current++);
          newStats.produced++;
        }
      }

      setStats(s => ({
        produced: s.produced + (strategy === 'blockProducer' && q.length >= QUEUE_MAX ? 0 : newStats.produced),
        consumed: s.consumed + newStats.consumed,
        dropped: s.dropped + newStats.dropped,
      }));

      return q;
    });
  }, [producerRate, consumerRate, strategy]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 500);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, tick]);

  const toggleRun = () => {
    if (!running) {
      setQueue([]);
      setStats({ produced: 0, consumed: 0, dropped: 0 });
      msgIdRef.current = 1;
    }
    setRunning(r => !r);
  };

  const fillPercent = (queue.length / QUEUE_MAX) * 100;
  const fillColor = fillPercent > 80 ? 'var(--color-critical)' : fillPercent > 50 ? 'var(--color-warning)' : 'var(--color-healthy)';

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: 20, borderRadius: 12, border: '1px solid var(--border-primary)', maxWidth: 480 }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Back Pressure</h3>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-muted)' }}>
        Adjust producer/consumer rates. Watch the queue fill. Compare overflow strategies.
      </p>

      {/* Strategy selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {Object.entries(STRATEGIES).map(([key, s]) => (
          <button key={key} style={toggleStyle(strategy === key)} onClick={() => setStrategy(key)}>
            {s.label}
          </button>
        ))}
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 11, color: STRATEGIES[strategy].color }}>
        {STRATEGIES[strategy].desc}
      </p>

      {/* Sliders */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Producer: {producerRate} msg/tick
          </label>
          <input type="range" min={1} max={20} value={producerRate}
            onChange={e => setProducerRate(Number(e.target.value))}
            style={{ width: '100%', marginTop: 4, accentColor: 'var(--text-accent)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Consumer: {consumerRate} msg/tick
          </label>
          <input type="range" min={1} max={20} value={consumerRate}
            onChange={e => setConsumerRate(Number(e.target.value))}
            style={{ width: '100%', marginTop: 4, accentColor: 'var(--text-accent)' }} />
        </div>
      </div>

      {/* Queue visualization */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>Queue Depth</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{queue.length}/{QUEUE_MAX}</span>
        </div>
        <div style={{ height: 24, background: 'var(--bg-tertiary)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            height: '100%', width: `${fillPercent}%`, background: fillColor,
            borderRadius: 6, transition: 'width 300ms, background 300ms',
          }} />
        </div>
      </div>

      {/* Pipeline visual */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
        <div style={{ padding: '8px 14px', background: 'var(--color-info-bg)', border: '1px solid var(--color-info)', borderRadius: 8, fontSize: 11, fontWeight: 600, color: 'var(--color-info)' }}>
          Producer
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>&#8594;</span>
        <div style={{
          padding: '8px 14px', border: `1px solid ${fillColor}`, borderRadius: 8, fontSize: 11, fontWeight: 600,
          background: `${fillColor}10`, color: fillColor,
        }}>
          Queue [{queue.length}]
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>&#8594;</span>
        <div style={{ padding: '8px 14px', background: 'var(--color-healthy-bg)', border: '1px solid var(--color-healthy)', borderRadius: 8, fontSize: 11, fontWeight: 600, color: 'var(--color-healthy)' }}>
          Consumer
        </div>
      </div>

      {/* Controls */}
      <button onClick={toggleRun} style={{
        padding: '8px 20px', background: running ? 'var(--color-critical)' : 'var(--text-accent)',
        color: 'var(--bg-primary)', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12,
        cursor: 'pointer', marginBottom: 12,
      }}>
        {running ? 'Stop' : 'Start'}
      </button>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Produced</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-info)' }}>{stats.produced}</div>
        </div>
        <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Consumed</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-healthy)' }}>{stats.consumed}</div>
        </div>
        <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dropped</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: stats.dropped > 0 ? 'var(--color-critical)' : 'var(--text-primary)' }}>{stats.dropped}</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/concepts/concepts/BackPressure.jsx
git commit -m "feat: add Back Pressure concept playground"
```

---

### Task 10: Register All 7 New Concepts

**Files:**
- Modify: `src/concepts/ConceptLibrary.jsx`
- Modify: `src/concepts/ConceptViewer.jsx`

- [ ] **Step 1: Update ConceptLibrary.jsx**

In `src/concepts/ConceptLibrary.jsx`, add to the imports at line 1:

```js
import { BookOpen, X, Triangle, Circle, Database, Split, Zap, DatabaseZap, Layers, Shield, Rewind, Wifi, ShieldOff, Search, Lock, GitBranch, Gauge } from 'lucide-react';
```

Then add 7 entries to the end of the `CONCEPTS` array (after the rate-limiting entry):

```js
  { id: 'event-sourcing', title: 'Event Sourcing', icon: Rewind, color: '#f97316', difficulty: 'Advanced', description: 'Replay events forward and backward to rebuild aggregate state from an event log' },
  { id: 'tcp-vs-udp', title: 'TCP vs UDP', icon: Wifi, color: '#06b6d4', difficulty: 'Beginner', description: 'Send packets over TCP and UDP — compare reliability, speed, and packet loss' },
  { id: 'circuit-breakers', title: 'Circuit Breakers', icon: ShieldOff, color: '#ef4444', difficulty: 'Intermediate', description: 'Trip the breaker on failures and watch requests get blocked to prevent cascading outages' },
  { id: 'dns-discovery', title: 'DNS & Service Discovery', icon: Search, color: '#3b82f6', difficulty: 'Beginner', description: 'Trace the DNS resolution chain from browser to authoritative nameserver' },
  { id: 'acid-transactions', title: 'ACID Transactions', icon: Lock, color: '#a855f7', difficulty: 'Intermediate', description: 'Run concurrent transactions at different isolation levels and spot anomalies' },
  { id: 'raft-consensus', title: 'Raft Consensus', icon: GitBranch, color: '#22c55e', difficulty: 'Advanced', description: 'Kill the leader, watch elections, and replicate log entries across a 5-node cluster' },
  { id: 'back-pressure', title: 'Back Pressure', icon: Gauge, color: '#f59e0b', difficulty: 'Intermediate', description: 'Adjust producer and consumer rates — compare drop-tail, drop-head, and block strategies' },
```

- [ ] **Step 2: Update ConceptViewer.jsx**

In `src/concepts/ConceptViewer.jsx`, add imports after line 8:

```js
import EventSourcing from './concepts/EventSourcing';
import TcpVsUdp from './concepts/TcpVsUdp';
import CircuitBreakers from './concepts/CircuitBreakers';
import DNSDiscovery from './concepts/DNSDiscovery';
import ACIDTransactions from './concepts/ACIDTransactions';
import RaftConsensus from './concepts/RaftConsensus';
import BackPressure from './concepts/BackPressure';
```

Add entries to the `COMPONENTS` object:

```js
  'event-sourcing': EventSourcing,
  'tcp-vs-udp': TcpVsUdp,
  'circuit-breakers': CircuitBreakers,
  'dns-discovery': DNSDiscovery,
  'acid-transactions': ACIDTransactions,
  'raft-consensus': RaftConsensus,
  'back-pressure': BackPressure,
```

Add entries to the `TITLES` object:

```js
  'event-sourcing': 'Event Sourcing',
  'tcp-vs-udp': 'TCP vs UDP',
  'circuit-breakers': 'Circuit Breakers',
  'dns-discovery': 'DNS & Service Discovery',
  'acid-transactions': 'ACID Transactions',
  'raft-consensus': 'Raft Consensus',
  'back-pressure': 'Back Pressure',
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/concepts/ConceptLibrary.jsx src/concepts/ConceptViewer.jsx
git commit -m "feat: register all 7 new concepts in library and viewer"
```

---

### Task 11: Mobile Responsive CSS

**Files:**
- Modify: `src/styles/theme.css`
- Modify: `src/components/ComponentTray.jsx`
- Modify: `src/components/HUD.jsx`

- [ ] **Step 1: Add media queries to theme.css**

Append to the end of `src/styles/theme.css`:

```css
/* --- Mobile Responsive --- */

@media (max-width: 768px) {
  .game-node {
    min-width: 120px;
    padding: 12px;
  }

  .react-flow__controls {
    transform: scale(0.85);
    transform-origin: bottom left;
  }
}

@media (max-width: 480px) {
  .game-node {
    min-width: 100px;
    padding: 10px;
    font-size: 12px;
  }

  .react-flow__minimap {
    display: none !important;
  }

  .react-flow__controls {
    transform: scale(0.75);
    transform-origin: bottom left;
  }
}
```

- [ ] **Step 2: Make ComponentTray responsive**

In `src/components/ComponentTray.jsx`, replace the outer container div's style object (lines 53-66) with responsive behavior. The component needs to detect screen width and render differently.

Add at the top of the `ComponentTray` function (after line 43):

```js
const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);
const isMobile = window.innerWidth <= 480;

useEffect(() => {
  const handleResize = () => {
    setCollapsed(window.innerWidth <= 768);
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

Add `useState, useEffect` to the imports. At the top of the file add:

```js
import { useState, useEffect } from 'react';
```

Replace the outer container div style (lines 53-66) with:

```jsx
style={{
  ...(collapsed ? {
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
  }),
}}
```

For the collapsed (mobile) view, each component item should be compact. Replace the inner component item rendering (the `return` inside the `.map`, lines 80-121) to handle collapsed mode:

Wrap the existing content. When collapsed, render icon-only items:

Replace lines 80-121 with:

```jsx
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
```

Also hide the "Components" header label when collapsed. Replace the header div (line 68-70) with:

```jsx
{!collapsed && (
  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: 4 }}>
    Components
  </div>
)}
```

- [ ] **Step 3: Make HUD responsive**

In `src/components/HUD.jsx`, the main changes:
- On phone (<=480px), hide the "Spike Traffic" text (show icon only), hide "Levels" text, hide "Learn" text
- On tablet (<=768px), reduce stat card min-width and font size

Add state for responsive detection at the top of the HUD function (after line 36):

```js
const isCompact = window.innerWidth <= 768;
const isPhone = window.innerWidth <= 480;
```

In the StatCard component, make `minWidth` responsive. Replace `minWidth: 90` (line 16) with:

Actually, it's simpler to pass a prop. Instead, just change the StatCard style inline. Replace the StatCard `minWidth: 90` with `minWidth: 72` and reduce `padding: '8px 14px'` to `padding: '6px 10px'` when we detect compact mode.

Simpler approach: Use CSS for this. At the **HUD container level**, add responsive styles. Replace the height/padding in the HUD container style (lines 43-53):

```jsx
style={{
  height: isPhone ? 56 : 72,
  background: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border-primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: isPhone ? '0 8px' : isCompact ? '0 12px' : '0 24px',
  zIndex: 10,
  flexShrink: 0,
  gap: 8,
}}
```

Hide the title on phone. Replace lines 54-61:

```jsx
{!isPhone && (
  <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
    <h1 style={{ margin: 0, fontSize: isCompact ? 14 : 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
      System Design <span style={{ color: 'var(--text-accent)' }}>Sim</span>
    </h1>
    <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
      {sandboxMode ? 'Sandbox — Freeplay' : `Level ${level} — ${config.name}`}
    </p>
  </div>
)}
```

On phone, hide the "Bounced" stat card and reduce stat font size. In the StatCard component, reduce sizes. Replace the StatCard component (lines 8-33) with a version that accepts a `compact` prop:

```jsx
function StatCard({ icon, label, value, unit, color, animate, tooltip, compact }) {
  const Icon = icon;
  return (
    <Tooltip text={tooltip} position="bottom">
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: compact ? 2 : 4,
        background: 'var(--bg-tertiary)', borderRadius: compact ? 8 : 12,
        padding: compact ? '4px 8px' : '8px 14px',
        border: '1px solid var(--border-primary)',
        minWidth: compact ? 60 : 90,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon size={compact ? 10 : 12} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: compact ? 8 : 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            {label}
          </span>
        </div>
        <span
          className={animate ? 'animate-value-pop' : ''}
          style={{ fontSize: compact ? 14 : 20, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color }}
        >
          {value}{unit && <span style={{ fontSize: compact ? 9 : 12, fontWeight: 500, marginLeft: 2 }}>{unit}</span>}
        </span>
      </div>
    </Tooltip>
  );
}
```

Then add `compact={isPhone}` to each StatCard usage. For the `metrics.bouncedUsers` stat, wrap it to hide on phone:

Replace line 85-91:
```jsx
{metrics.bouncedUsers > 0 && !isPhone && (
  <StatCard
    icon={Users} label="Bounced" value={metrics.bouncedUsers}
    color="var(--color-critical)"
    tooltip="Users who left because latency in their region was too high"
    compact={isPhone}
  />
)}
```

And add `compact={isPhone}` to the other 4 StatCard instances.

For the right buttons section, on phone show only icons (hide text). Replace button labels to be conditional:

For "Spike Traffic" button (line 106), replace the text:
```jsx
{!isCompact && 'Spike Traffic'}
{isCompact && <Activity size={14} />}
```

Wait — simpler. Just conditionally hide text in the buttons. For the Levels and Learn buttons, on compact mode just show the icon. Replace the button content for Levels (line 131):
```jsx
<List size={14} /> {!isCompact && 'Levels'}
```

And for Learn (line 143):
```jsx
<BookOpen size={14} /> {!isCompact && 'Learn'}
```

For the Spike Traffic button (line 106), replace text with:
```jsx
{isCompact ? <Activity size={16} /> : 'Spike Traffic'}
```

And import `Activity` is already imported.

- [ ] **Step 4: Add padding-bottom for bottom tray on mobile**

In `src/App.jsx`, the ReactFlow canvas area needs bottom padding when on mobile to account for the fixed bottom component tray. This is CSS-only — add to `theme.css`:

```css
@media (max-width: 768px) {
  .react-flow {
    padding-bottom: 60px !important;
  }
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/styles/theme.css src/components/ComponentTray.jsx src/components/HUD.jsx
git commit -m "feat: mobile responsive layout for tablet and phone breakpoints"
```

---

### Task 12: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update features in README**

Add/update the following in the features section of `README.md`:
- Concept Library: "15 interactive concept playgrounds" (was 8)
- Radar chart grading on win screen
- Ideal solution comparison in failure post-mortem
- Mobile responsive layout (tablet + phone)

Also update the architecture tree to include the 7 new concept files.

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README with Phase 1 polish — 15 concepts, radar chart, mobile responsive"
```

---

## Summary

| Task | Description | Files Changed |
|------|-------------|---------------|
| 1 | Radar chart component | RadarChart.jsx (new), WinScreen.jsx |
| 2 | Ideal solution in post-mortem | LevelConfigs.js, FailurePostMortem.jsx |
| 3 | Event Sourcing concept | EventSourcing.jsx (new) |
| 4 | TCP vs UDP concept | TcpVsUdp.jsx (new) |
| 5 | Circuit Breakers concept | CircuitBreakers.jsx (new) |
| 6 | DNS & Service Discovery concept | DNSDiscovery.jsx (new) |
| 7 | ACID Transactions concept | ACIDTransactions.jsx (new) |
| 8 | Raft Consensus concept | RaftConsensus.jsx (new) |
| 9 | Back Pressure concept | BackPressure.jsx (new) |
| 10 | Register all 7 concepts | ConceptLibrary.jsx, ConceptViewer.jsx |
| 11 | Mobile responsive CSS | theme.css, ComponentTray.jsx, HUD.jsx |
| 12 | Update README | README.md |
