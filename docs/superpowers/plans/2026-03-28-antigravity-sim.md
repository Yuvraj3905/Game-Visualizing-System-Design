# System Design Sim Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 5-level browser game that teaches system design through interactive server architecture simulation.

**Architecture:** Modular engine with one simulator per system design concept (traffic, load balancing, caching, geo-latency, failover). A LevelOrchestrator composes active simulators per level and runs a 500ms tick loop. React Flow canvas renders the architecture diagram with custom node components. Zustand store bridges engine state to React UI.

**Tech Stack:** React 19, Vite 8, React Flow 11, Zustand 5, Lucide React, CSS custom properties + keyframe animations. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-03-28-antigravity-sim-design.md` (file kept for history)

---

### Task 1: Dark Theme Foundation

**Files:**
- Create: `src/styles/theme.css`
- Modify: `src/index.css`

- [ ] **Step 1: Create theme.css with CSS custom properties and keyframe animations**

```css
/* src/styles/theme.css */

:root {
  /* Background */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --bg-card: #1e293b;
  --bg-node: #1e293b;

  /* Text */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-accent: #38bdf8;

  /* Status colors */
  --color-healthy: #22c55e;
  --color-healthy-bg: rgba(34, 197, 94, 0.1);
  --color-healthy-glow: rgba(34, 197, 94, 0.3);
  --color-warning: #f59e0b;
  --color-warning-bg: rgba(245, 158, 11, 0.1);
  --color-warning-glow: rgba(245, 158, 11, 0.3);
  --color-critical: #ef4444;
  --color-critical-bg: rgba(239, 68, 68, 0.1);
  --color-critical-glow: rgba(239, 68, 68, 0.4);
  --color-info: #3b82f6;
  --color-info-bg: rgba(59, 130, 246, 0.1);
  --color-info-glow: rgba(59, 130, 246, 0.3);

  /* Node accent colors */
  --node-server: #3b82f6;
  --node-database: #a855f7;
  --node-loadbalancer: #f59e0b;
  --node-cache: #22c55e;
  --node-cdn: #06b6d4;
  --node-region: #64748b;
  --node-traffic: #f97316;
  --node-healthcheck: #ec4899;
  --node-replica: #8b5cf6;

  /* Borders */
  --border-primary: #334155;
  --border-node: #475569;

  /* Shadows */
  --shadow-node: 0 4px 24px rgba(0, 0, 0, 0.3);
  --shadow-glow-healthy: 0 0 20px var(--color-healthy-glow);
  --shadow-glow-warning: 0 0 20px var(--color-warning-glow);
  --shadow-glow-critical: 0 0 24px var(--color-critical-glow);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}

/* Keyframe animations */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

@keyframes pulse-red {
  0%, 100% { box-shadow: 0 0 8px var(--color-critical-glow); }
  50% { box-shadow: 0 0 24px var(--color-critical-glow); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes float-up {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-40px) scale(0.5); opacity: 0; }
}

@keyframes fire-particle {
  0% { transform: translateY(0) scale(1); opacity: 0.9; }
  50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
  100% { transform: translateY(-40px) scale(0.3); opacity: 0; }
}

@keyframes screen-flicker {
  0% { opacity: 1; }
  5% { opacity: 0.1; }
  10% { opacity: 0.8; }
  15% { opacity: 0.2; }
  20% { opacity: 1; }
  100% { opacity: 1; }
}

@keyframes confetti-fall {
  0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

@keyframes slide-up {
  0% { transform: translateY(40px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes dot-flow {
  0% { offset-distance: 0%; }
  100% { offset-distance: 100%; }
}

@keyframes pulse-border {
  0%, 100% { border-color: var(--color-critical); }
  50% { border-color: transparent; }
}

@keyframes value-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

/* Utility classes */
.animate-shake { animation: shake 0.5s ease-in-out; }
.animate-pulse-red { animation: pulse-red 1.5s ease-in-out infinite; }
.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
.animate-slide-up { animation: slide-up 0.4s ease-out; }
.animate-value-pop { animation: value-pop 0.3s ease-out; }
.animate-screen-flicker { animation: screen-flicker 1s ease-in-out; }

/* Node base styles */
.game-node {
  background: var(--bg-node);
  border: 2px solid var(--border-node);
  border-radius: 12px;
  padding: 16px;
  min-width: 160px;
  box-shadow: var(--shadow-node);
  transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, sans-serif;
}

.game-node.healthy {
  border-color: var(--color-healthy);
  box-shadow: var(--shadow-glow-healthy);
}

.game-node.warning {
  border-color: var(--color-warning);
  box-shadow: var(--shadow-glow-warning);
}

.game-node.critical {
  border-color: var(--color-critical);
  box-shadow: var(--shadow-glow-critical);
  animation: shake 0.5s ease-in-out infinite;
}

.game-node.dead {
  border-color: var(--color-critical);
  opacity: 0.5;
  filter: grayscale(0.5);
}

/* Load bar */
.load-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
}

.load-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width var(--transition-slow), background-color var(--transition-normal);
}

/* Fire particles container */
.fire-particles {
  position: absolute;
  top: -10px;
  left: 0;
  right: 0;
  pointer-events: none;
  overflow: visible;
}

.fire-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-critical);
  animation: fire-particle 1s ease-out infinite;
}

.fire-particle:nth-child(2) {
  left: 30%;
  animation-delay: 0.2s;
  background: var(--color-warning);
}

.fire-particle:nth-child(3) {
  left: 60%;
  animation-delay: 0.5s;
}

.fire-particle:nth-child(4) {
  left: 80%;
  animation-delay: 0.3s;
  background: var(--color-warning);
}

/* React Flow overrides for dark theme */
.react-flow__background {
  background-color: var(--bg-primary) !important;
}

.react-flow__minimap {
  background-color: var(--bg-secondary) !important;
  border: 1px solid var(--border-primary) !important;
  border-radius: 8px !important;
}

.react-flow__controls {
  border: 1px solid var(--border-primary) !important;
  border-radius: 8px !important;
  overflow: hidden;
}

.react-flow__controls-button {
  background: var(--bg-secondary) !important;
  border-bottom: 1px solid var(--border-primary) !important;
  fill: var(--text-secondary) !important;
}

.react-flow__controls-button:hover {
  background: var(--bg-tertiary) !important;
}

.react-flow__handle {
  width: 10px !important;
  height: 10px !important;
  border: 2px solid var(--bg-secondary) !important;
  background: var(--color-info) !important;
}
```

- [ ] **Step 2: Update index.css for dark theme globals**

Replace the entire content of `src/index.css` with:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
@import './styles/theme.css';

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, sans-serif;
  min-width: 320px;
  min-height: 100vh;
  overflow: hidden;
}

#root {
  width: 100%;
  height: 100vh;
}

.font-mono {
  font-family: 'JetBrains Mono', monospace;
}
```

- [ ] **Step 3: Verify dev server runs with new theme**

Run: `cd "/home/13843K/Desktop/Game:SystemDesign" && npm run dev`

Expected: App loads with dark background. No CSS errors in console.

- [ ] **Step 4: Commit**

```bash
git add src/styles/theme.css src/index.css
git commit -m "feat: add dark theme foundation with CSS variables and keyframe animations"
```

---

### Task 2: Graph Utilities

**Files:**
- Create: `src/utils/graphUtils.js`

- [ ] **Step 1: Create graphUtils.js with adjacency list builder and path finder**

```js
// src/utils/graphUtils.js

/**
 * Build an adjacency list from React Flow edges.
 * Returns { [sourceId]: [targetId, ...], ... }
 */
export function buildAdjacencyList(edges) {
  const adj = {};
  for (const edge of edges) {
    if (!adj[edge.source]) adj[edge.source] = [];
    adj[edge.source].push(edge.target);
  }
  return adj;
}

/**
 * Find all nodes reachable from a given source node via BFS.
 * Returns Set of reachable node IDs.
 */
export function findReachable(startId, adjacencyList) {
  const visited = new Set();
  const queue = [startId];
  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    const neighbors = adjacencyList[current] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) queue.push(neighbor);
    }
  }
  return visited;
}

/**
 * Find all downstream nodes of a specific type reachable from source.
 * nodesMap: { [nodeId]: nodeObject }
 */
export function findDownstreamByType(startId, type, adjacencyList, nodesMap) {
  const reachable = findReachable(startId, adjacencyList);
  const result = [];
  for (const nodeId of reachable) {
    if (nodeId !== startId && nodesMap[nodeId]?.type === type) {
      result.push(nodesMap[nodeId]);
    }
  }
  return result;
}

/**
 * Build a map from node ID to node object for quick lookup.
 */
export function buildNodeMap(nodes) {
  const map = {};
  for (const node of nodes) {
    map[node.id] = node;
  }
  return map;
}

/**
 * Get immediate children of a node (one edge away).
 */
export function getChildren(nodeId, adjacencyList) {
  return adjacencyList[nodeId] || [];
}

/**
 * Get immediate parents of a node (nodes that have edges pointing to it).
 */
export function getParents(nodeId, edges) {
  return edges.filter(e => e.target === nodeId).map(e => e.source);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/graphUtils.js
git commit -m "feat: add graph utility functions for topology traversal"
```

---

### Task 3: Topology Walker

**Files:**
- Create: `src/engine/TopologyWalker.js`

- [ ] **Step 1: Create TopologyWalker.js**

```js
// src/engine/TopologyWalker.js

import { buildAdjacencyList, buildNodeMap, getChildren } from '../utils/graphUtils.js';

/**
 * TopologyWalker resolves how traffic flows through the node graph.
 * It walks edges from traffic sources and builds a traffic flow map
 * that simulators consume.
 *
 * Returns a TrafficFlow object:
 * {
 *   paths: [{ from, to, type }],          // ordered path segments
 *   nodeTraffic: { [nodeId]: rps },         // traffic arriving at each node
 *   connectedNodes: Set<nodeId>,            // all nodes receiving traffic
 *   disconnectedNodes: [nodeObject],        // nodes with zero traffic
 * }
 */
export function walkTopology(nodes, edges, totalRps) {
  const adj = buildAdjacencyList(edges);
  const nodeMap = buildNodeMap(nodes);
  const nodeTraffic = {};
  const paths = [];
  const connectedNodes = new Set();

  // Initialize all nodes to 0 traffic
  for (const node of nodes) {
    nodeTraffic[node.id] = 0;
  }

  // Find traffic source nodes
  const trafficSources = nodes.filter(n => n.type === 'trafficSource');

  if (trafficSources.length === 0) {
    return {
      paths,
      nodeTraffic,
      connectedNodes,
      disconnectedNodes: [...nodes],
    };
  }

  // Split total RPS across traffic sources
  const rpsPerSource = totalRps / trafficSources.length;

  for (const source of trafficSources) {
    nodeTraffic[source.id] = rpsPerSource;
    connectedNodes.add(source.id);
    distributeFromNode(source.id, rpsPerSource, adj, nodeMap, nodeTraffic, paths, connectedNodes);
  }

  const disconnectedNodes = nodes.filter(n => !connectedNodes.has(n.id));

  return { paths, nodeTraffic, connectedNodes, disconnectedNodes };
}

/**
 * Recursively distribute traffic from a node to its children.
 * Load balancers split evenly; other nodes pass through.
 */
function distributeFromNode(nodeId, rps, adj, nodeMap, nodeTraffic, paths, connectedNodes) {
  const children = getChildren(nodeId, adj);
  if (children.length === 0 || rps === 0) return;

  const node = nodeMap[nodeId];

  // Load balancers distribute evenly across children
  // All other nodes pass traffic to all children (split evenly if multiple)
  const rpsPerChild = rps / children.length;

  for (const childId of children) {
    const child = nodeMap[childId];
    if (!child) continue;

    paths.push({ from: nodeId, to: childId, rps: rpsPerChild });
    nodeTraffic[childId] += rpsPerChild;
    connectedNodes.add(childId);

    // Continue distributing downstream (servers pass to caches/DBs, etc.)
    distributeFromNode(childId, rpsPerChild, adj, nodeMap, nodeTraffic, paths, connectedNodes);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/TopologyWalker.js
git commit -m "feat: add TopologyWalker for edge-based traffic routing"
```

---

### Task 4: Level Configs (All 5 Levels)

**Files:**
- Modify: `src/engine/LevelConfigs.js`

- [ ] **Step 1: Rewrite LevelConfigs.js with all 5 levels**

Replace the entire content of `src/engine/LevelConfigs.js`:

```js
// src/engine/LevelConfigs.js

export const LEVEL_CONFIGS = {
  1: {
    name: 'The Monolith',
    subtitle: 'Vertical vs. Horizontal Scaling',
    budget: 500,
    initialTraffic: 0,
    targetTraffic: 1000,
    baseLatency: 50,
    congestionFactor: 0.1,
    sustainSeconds: 10,
    narrative: {
      title: 'Chapter 1: Humble Beginnings',
      description: "You're a solo developer who just launched a product. It's running on a single server — your \"monolith.\" Traffic is starting to pick up, but your server can only handle so much. When it gets overloaded, it crashes.",
      objective: 'Handle 1,000 requests per second without any server crashing.',
      hint: 'Try adding more servers and connecting them to the traffic source.',
    },
    unlockedComponents: ['trafficSource', 'server', 'database'],
    initialNodes: [
      { id: 'traffic-1', type: 'trafficSource', position: { x: 100, y: 200 }, data: { label: 'Users', rps: 0, region: 'default' } },
      { id: 'server-1', type: 'server', position: { x: 400, y: 200 }, data: { label: 'Web Server', rps: 0, capacity: 500, status: 'healthy' } },
      { id: 'db-1', type: 'database', position: { x: 700, y: 200 }, data: { label: 'SQL Database', rps: 0, capacity: 2000, status: 'healthy' } },
    ],
    initialEdges: [
      { id: 'e-traffic-server', source: 'traffic-1', target: 'server-1', animated: true },
      { id: 'e-server-db', source: 'server-1', target: 'db-1', animated: true },
    ],
    winCondition: (metrics) => {
      return metrics.rps >= 1000 && metrics.overloadedServers === 0;
    },
    failCondition: (metrics) => {
      return metrics.overloadedServers > 0;
    },
    failMessage: "Your server caught fire! It can't handle all that traffic alone.",
    failExplanation: 'A single server has limited capacity. When traffic exceeds that limit, it crashes. You need to scale horizontally — add more servers to share the load.',
    winLesson: "You just learned horizontal scaling — adding more machines instead of upgrading one. This is how Netflix, Google, and Amazon handle billions of requests. It's cheaper and more resilient than buying one giant server.",
    nodeCosts: { server: 200, database: 300 },
    activeSimulators: ['traffic'],
  },

  2: {
    name: 'The Distribution',
    subtitle: 'Load Balancing',
    budget: 2000,
    initialTraffic: 0,
    targetTraffic: 3000,
    baseLatency: 40,
    congestionFactor: 0.08,
    sustainSeconds: 10,
    narrative: {
      title: 'Chapter 2: The Distribution',
      description: "Your app is growing! You now have 3 servers, but there's a problem — all traffic is going to Server 1 while Servers 2 and 3 sit idle. You need something to distribute the load evenly.",
      objective: 'Handle 3,000 RPS by distributing traffic evenly across all servers.',
      hint: 'Place a Load Balancer between the traffic source and your servers.',
    },
    unlockedComponents: ['trafficSource', 'server', 'database', 'loadBalancer'],
    initialNodes: [
      { id: 'traffic-1', type: 'trafficSource', position: { x: 50, y: 250 }, data: { label: 'Users', rps: 0, region: 'default' } },
      { id: 'server-1', type: 'server', position: { x: 500, y: 100 }, data: { label: 'Server 1', rps: 0, capacity: 1200, status: 'healthy' } },
      { id: 'server-2', type: 'server', position: { x: 500, y: 280 }, data: { label: 'Server 2', rps: 0, capacity: 1200, status: 'healthy' } },
      { id: 'server-3', type: 'server', position: { x: 500, y: 460 }, data: { label: 'Server 3', rps: 0, capacity: 1200, status: 'healthy' } },
      { id: 'db-1', type: 'database', position: { x: 800, y: 250 }, data: { label: 'SQL Database', rps: 0, capacity: 5000, status: 'healthy' } },
    ],
    initialEdges: [
      { id: 'e-traffic-s1', source: 'traffic-1', target: 'server-1', animated: true },
      { id: 'e-s1-db', source: 'server-1', target: 'db-1', animated: true },
      { id: 'e-s2-db', source: 'server-2', target: 'db-1', animated: true },
      { id: 'e-s3-db', source: 'server-3', target: 'db-1', animated: true },
    ],
    winCondition: (metrics) => {
      return metrics.rps >= 3000 && metrics.overloadedServers === 0;
    },
    failCondition: (metrics) => {
      return metrics.overloadedServers > 0;
    },
    failMessage: 'Server 1 is overwhelmed while other servers sit idle!',
    failExplanation: "Without a load balancer, all traffic hits a single server. The others can't help because nothing is routing requests to them. A load balancer acts as a traffic cop, distributing requests evenly.",
    winLesson: "Load balancers distribute traffic evenly — this is how every major website works. Even the simplest algorithm (round-robin) is a massive improvement over sending everything to one server.",
    nodeCosts: { server: 300, loadBalancer: 400, database: 300 },
    activeSimulators: ['traffic', 'loadBalancer'],
  },

  3: {
    name: 'The Speed Demon',
    subtitle: 'Caching',
    budget: 3000,
    initialTraffic: 0,
    targetTraffic: 5000,
    baseLatency: 40,
    congestionFactor: 0.06,
    sustainSeconds: 10,
    latencyTarget: 100,
    narrative: {
      title: 'Chapter 3: The Speed Demon',
      description: "Traffic keeps growing. Your load-balanced servers handle the throughput fine, but the database is becoming a bottleneck. Every request hits the database, and response times are creeping up. Users are starting to notice the lag.",
      objective: 'Handle 5,000 RPS while keeping latency below 100ms.',
      hint: 'Add a Cache between your servers and the database to serve repeated queries from memory.',
    },
    unlockedComponents: ['trafficSource', 'server', 'database', 'loadBalancer', 'cache'],
    initialNodes: [
      { id: 'traffic-1', type: 'trafficSource', position: { x: 50, y: 250 }, data: { label: 'Users', rps: 0, region: 'default' } },
      { id: 'lb-1', type: 'loadBalancer', position: { x: 250, y: 250 }, data: { label: 'Load Balancer', rps: 0, algorithm: 'round-robin', status: 'healthy' } },
      { id: 'server-1', type: 'server', position: { x: 480, y: 100 }, data: { label: 'Server 1', rps: 0, capacity: 2000, status: 'healthy' } },
      { id: 'server-2', type: 'server', position: { x: 480, y: 280 }, data: { label: 'Server 2', rps: 0, capacity: 2000, status: 'healthy' } },
      { id: 'server-3', type: 'server', position: { x: 480, y: 460 }, data: { label: 'Server 3', rps: 0, capacity: 2000, status: 'healthy' } },
      { id: 'db-1', type: 'database', position: { x: 800, y: 250 }, data: { label: 'SQL Database', rps: 0, capacity: 3000, status: 'healthy' } },
    ],
    initialEdges: [
      { id: 'e-traffic-lb', source: 'traffic-1', target: 'lb-1', animated: true },
      { id: 'e-lb-s1', source: 'lb-1', target: 'server-1', animated: true },
      { id: 'e-lb-s2', source: 'lb-1', target: 'server-2', animated: true },
      { id: 'e-lb-s3', source: 'lb-1', target: 'server-3', animated: true },
      { id: 'e-s1-db', source: 'server-1', target: 'db-1', animated: true },
      { id: 'e-s2-db', source: 'server-2', target: 'db-1', animated: true },
      { id: 'e-s3-db', source: 'server-3', target: 'db-1', animated: true },
    ],
    winCondition: (metrics) => {
      return metrics.rps >= 5000 && metrics.avgLatency < 100 && metrics.overloadedServers === 0;
    },
    failCondition: (metrics) => {
      return metrics.avgLatency >= 200;
    },
    failMessage: 'Latency is through the roof! Your database is doing a full table scan for every single request.',
    failExplanation: 'Without caching, every request goes to the database. Databases are great for storage but slow for repeated reads. A cache stores frequent results in memory, dramatically reducing response times.',
    winLesson: "Caching stores frequent results in memory — Redis handles millions of reads per second. Most real applications cache 80-95% of their reads. This is why Twitter, Instagram, and Facebook feel instant.",
    nodeCosts: { server: 300, loadBalancer: 400, database: 300, cache: 500 },
    activeSimulators: ['traffic', 'loadBalancer', 'cache'],
  },

  4: {
    name: 'The Global Expansion',
    subtitle: 'CDNs & Regions',
    budget: 5000,
    initialTraffic: 0,
    targetTraffic: 8000,
    baseLatency: 30,
    congestionFactor: 0.04,
    sustainSeconds: 10,
    latencyTarget: 200,
    narrative: {
      title: 'Chapter 4: The Global Expansion',
      description: "Your app has gone viral internationally! But there's a problem — all your infrastructure is in India. Users in the US and Europe are experiencing 300ms+ latency, and they're bouncing off your site.",
      objective: 'Handle 8,000 RPS from 3 regions with under 200ms latency everywhere.',
      hint: 'Deploy a CDN and consider adding servers in regions closer to your users.',
    },
    unlockedComponents: ['trafficSource', 'server', 'database', 'loadBalancer', 'cache', 'cdn', 'region'],
    regions: [
      { id: 'region-india', name: 'India', latencyFromOthers: { 'region-us': 250, 'region-europe': 180 } },
      { id: 'region-us', name: 'US', latencyFromOthers: { 'region-india': 250, 'region-europe': 120 } },
      { id: 'region-europe', name: 'Europe', latencyFromOthers: { 'region-india': 180, 'region-us': 120 } },
    ],
    initialNodes: [
      { id: 'traffic-india', type: 'trafficSource', position: { x: 50, y: 150 }, data: { label: 'India Users', rps: 0, region: 'region-india' } },
      { id: 'traffic-us', type: 'trafficSource', position: { x: 50, y: 350 }, data: { label: 'US Users', rps: 0, region: 'region-us' } },
      { id: 'traffic-europe', type: 'trafficSource', position: { x: 50, y: 550 }, data: { label: 'Europe Users', rps: 0, region: 'region-europe' } },
      { id: 'region-india', type: 'region', position: { x: 300, y: 50 }, data: { label: 'India Region', region: 'region-india' }, style: { width: 500, height: 300 } },
      { id: 'lb-1', type: 'loadBalancer', position: { x: 350, y: 120 }, data: { label: 'Load Balancer', rps: 0, algorithm: 'round-robin', status: 'healthy' }, parentNode: 'region-india', extent: 'parent' },
      { id: 'server-1', type: 'server', position: { x: 550, y: 80 }, data: { label: 'Server 1', rps: 0, capacity: 3000, status: 'healthy' }, parentNode: 'region-india', extent: 'parent' },
      { id: 'server-2', type: 'server', position: { x: 550, y: 200 }, data: { label: 'Server 2', rps: 0, capacity: 3000, status: 'healthy' }, parentNode: 'region-india', extent: 'parent' },
      { id: 'cache-1', type: 'cache', position: { x: 700, y: 140 }, data: { label: 'Redis Cache', rps: 0, hitRate: 0, status: 'healthy' }, parentNode: 'region-india', extent: 'parent' },
      { id: 'db-1', type: 'database', position: { x: 850, y: 140 }, data: { label: 'SQL Database', rps: 0, capacity: 5000, status: 'healthy' }, parentNode: 'region-india', extent: 'parent' },
    ],
    initialEdges: [
      { id: 'e-ti-lb', source: 'traffic-india', target: 'lb-1', animated: true },
      { id: 'e-tu-lb', source: 'traffic-us', target: 'lb-1', animated: true },
      { id: 'e-te-lb', source: 'traffic-europe', target: 'lb-1', animated: true },
      { id: 'e-lb-s1', source: 'lb-1', target: 'server-1', animated: true },
      { id: 'e-lb-s2', source: 'lb-1', target: 'server-2', animated: true },
      { id: 'e-s1-cache', source: 'server-1', target: 'cache-1', animated: true },
      { id: 'e-s2-cache', source: 'server-2', target: 'cache-1', animated: true },
      { id: 'e-cache-db', source: 'cache-1', target: 'db-1', animated: true },
    ],
    winCondition: (metrics) => {
      return metrics.rps >= 8000 && metrics.maxRegionLatency < 200 && metrics.bouncedUsers === 0;
    },
    failCondition: (metrics) => {
      return metrics.bouncedUsers > 100;
    },
    failMessage: "Users are leaving! Visitors from distant regions can't stand the lag.",
    failExplanation: "When all your servers are in one location, distant users experience high latency due to the physical distance data must travel. CDNs cache content at edge locations worldwide, and multi-region deployment puts your servers closer to users.",
    winLesson: "CDNs and multi-region deployment reduce latency by serving users from nearby locations. This is how Cloudflare, AWS CloudFront, and Akamai make the web fast — by putting copies of your content everywhere.",
    nodeCosts: { server: 400, loadBalancer: 400, database: 500, cache: 500, cdn: 600, region: 0 },
    activeSimulators: ['traffic', 'loadBalancer', 'cache', 'geoLatency'],
  },

  5: {
    name: 'The Unstoppable App',
    subtitle: 'Fault Tolerance',
    budget: 8000,
    initialTraffic: 0,
    targetTraffic: 10000,
    baseLatency: 30,
    congestionFactor: 0.03,
    sustainSeconds: 10,
    disasterTime: 15,
    narrative: {
      title: 'Chapter 5: The Unstoppable App',
      description: "You're now running a global platform. Everything seems perfect until — disaster strikes. A data center goes offline. Your primary database fails. Can your system survive?",
      objective: 'Survive a data center failure while maintaining over 50% RPS capacity.',
      hint: 'Set up database replicas for redundancy and health checks to detect failures automatically.',
    },
    unlockedComponents: ['trafficSource', 'server', 'database', 'loadBalancer', 'cache', 'cdn', 'region', 'replica', 'healthCheck'],
    initialNodes: [
      { id: 'traffic-1', type: 'trafficSource', position: { x: 50, y: 300 }, data: { label: 'Users', rps: 0, region: 'default' } },
      { id: 'cdn-1', type: 'cdn', position: { x: 220, y: 300 }, data: { label: 'CDN', rps: 0, cacheRate: 0.3, status: 'healthy' } },
      { id: 'lb-1', type: 'loadBalancer', position: { x: 420, y: 300 }, data: { label: 'Load Balancer', rps: 0, algorithm: 'round-robin', status: 'healthy' } },
      { id: 'server-1', type: 'server', position: { x: 640, y: 150 }, data: { label: 'Server 1', rps: 0, capacity: 4000, status: 'healthy' } },
      { id: 'server-2', type: 'server', position: { x: 640, y: 320 }, data: { label: 'Server 2', rps: 0, capacity: 4000, status: 'healthy' } },
      { id: 'server-3', type: 'server', position: { x: 640, y: 490 }, data: { label: 'Server 3', rps: 0, capacity: 4000, status: 'healthy' } },
      { id: 'cache-1', type: 'cache', position: { x: 860, y: 230 }, data: { label: 'Redis Cache', rps: 0, hitRate: 0, status: 'healthy' } },
      { id: 'db-1', type: 'database', position: { x: 1060, y: 300 }, data: { label: 'Primary DB', rps: 0, capacity: 5000, status: 'healthy', isPrimary: true } },
    ],
    initialEdges: [
      { id: 'e-traffic-cdn', source: 'traffic-1', target: 'cdn-1', animated: true },
      { id: 'e-cdn-lb', source: 'cdn-1', target: 'lb-1', animated: true },
      { id: 'e-lb-s1', source: 'lb-1', target: 'server-1', animated: true },
      { id: 'e-lb-s2', source: 'lb-1', target: 'server-2', animated: true },
      { id: 'e-lb-s3', source: 'lb-1', target: 'server-3', animated: true },
      { id: 'e-s1-cache', source: 'server-1', target: 'cache-1', animated: true },
      { id: 'e-s2-cache', source: 'server-2', target: 'cache-1', animated: true },
      { id: 'e-s3-cache', source: 'server-3', target: 'cache-1', animated: true },
      { id: 'e-cache-db', source: 'cache-1', target: 'db-1', animated: true },
    ],
    winCondition: (metrics) => {
      return metrics.survivedDisaster && metrics.rps >= 5000;
    },
    failCondition: (metrics) => {
      return metrics.systemDown;
    },
    failMessage: 'SYSTEM DOWN. Total blackout.',
    failExplanation: 'When your primary database fails and there are no replicas, everything stops. Database replication creates copies that can take over instantly. Health checks detect failures so traffic can be rerouted automatically.',
    winLesson: "Replication and health checks give you high availability — no single point of failure. This is how AWS achieves 99.99% uptime. Every production system at scale uses redundancy and automated failover.",
    nodeCosts: { server: 400, loadBalancer: 400, database: 500, cache: 500, cdn: 600, replica: 700, healthCheck: 300, region: 0 },
    activeSimulators: ['traffic', 'loadBalancer', 'cache', 'failover'],
  },
};

export const TOTAL_LEVELS = Object.keys(LEVEL_CONFIGS).length;
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/LevelConfigs.js
git commit -m "feat: add complete level configs for all 5 levels with narrative, win/fail conditions"
```

---

### Task 5: Simulation Engine — TrafficSimulator

**Files:**
- Create: `src/engine/simulators/TrafficSimulator.js`

- [ ] **Step 1: Create TrafficSimulator.js**

```js
// src/engine/simulators/TrafficSimulator.js

/**
 * TrafficSimulator generates and ramps up RPS from traffic source nodes.
 * It handles gradual traffic increase and regional traffic splits.
 */

/**
 * Process one tick of traffic simulation.
 * @param {object} state - { nodes, edges, rps, targetRps, tickCount }
 * @returns {object} - updated traffic-related state
 */
export function simulateTraffic(state) {
  const { nodes, rps, targetRps } = state;
  const trafficSources = nodes.filter(n => n.type === 'trafficSource');

  if (trafficSources.length === 0) {
    return { rps: 0, trafficPerSource: {} };
  }

  // Split total RPS across traffic sources evenly
  const rpsPerSource = rps / trafficSources.length;
  const trafficPerSource = {};
  for (const source of trafficSources) {
    trafficPerSource[source.id] = {
      rps: rpsPerSource,
      region: source.data.region || 'default',
    };
  }

  return { rps, trafficPerSource };
}

/**
 * Calculate a smooth ramp-up from current to target RPS.
 * Returns the new RPS value for this tick.
 * Ramps by 10% of remaining distance each tick for smooth feel.
 */
export function rampTraffic(currentRps, targetRps) {
  if (currentRps >= targetRps) return targetRps;
  const diff = targetRps - currentRps;
  const step = Math.max(diff * 0.1, 50); // At least 50 RPS per tick
  return Math.min(currentRps + step, targetRps);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/simulators/TrafficSimulator.js
git commit -m "feat: add TrafficSimulator with ramp-up and regional splits"
```

---

### Task 6: Simulation Engine — LoadBalancerSimulator

**Files:**
- Create: `src/engine/simulators/LoadBalancerSimulator.js`

- [ ] **Step 1: Create LoadBalancerSimulator.js**

```js
// src/engine/simulators/LoadBalancerSimulator.js

import { buildAdjacencyList, getChildren, buildNodeMap } from '../../utils/graphUtils.js';

/**
 * Simulates load balancer behavior.
 * Load balancers distribute incoming traffic evenly (round-robin) across connected server children.
 *
 * @param {object} state - { nodes, edges, nodeTraffic }
 * @returns {object} - { nodeTraffic } with updated traffic distribution
 */
export function simulateLoadBalancing(state) {
  const { nodes, edges, nodeTraffic } = state;
  const adj = buildAdjacencyList(edges);
  const nodeMap = buildNodeMap(nodes);
  const updatedTraffic = { ...nodeTraffic };

  const loadBalancers = nodes.filter(n => n.type === 'loadBalancer');

  for (const lb of loadBalancers) {
    const incomingRps = updatedTraffic[lb.id] || 0;
    if (incomingRps === 0) continue;

    const children = getChildren(lb.id, adj);
    const serverChildren = children.filter(id => {
      const node = nodeMap[id];
      return node && node.type === 'server' && node.data.status !== 'dead';
    });

    if (serverChildren.length === 0) continue;

    // Round-robin: split evenly across healthy server children
    const rpsPerServer = incomingRps / serverChildren.length;

    for (const serverId of serverChildren) {
      updatedTraffic[serverId] = rpsPerServer;
    }

    // Zero out dead or non-server children
    for (const childId of children) {
      if (!serverChildren.includes(childId)) {
        updatedTraffic[childId] = (updatedTraffic[childId] || 0);
      }
    }
  }

  return { nodeTraffic: updatedTraffic };
}

/**
 * Check which servers are overloaded (RPS > capacity).
 * Returns array of overloaded node IDs.
 */
export function findOverloadedServers(nodes, nodeTraffic) {
  return nodes
    .filter(n => n.type === 'server' && n.data.status !== 'dead')
    .filter(n => (nodeTraffic[n.id] || 0) > n.data.capacity)
    .map(n => n.id);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/simulators/LoadBalancerSimulator.js
git commit -m "feat: add LoadBalancerSimulator with round-robin distribution"
```

---

### Task 7: Simulation Engine — CacheSimulator

**Files:**
- Create: `src/engine/simulators/CacheSimulator.js`

- [ ] **Step 1: Create CacheSimulator.js**

```js
// src/engine/simulators/CacheSimulator.js

import { buildAdjacencyList, getChildren, buildNodeMap } from '../../utils/graphUtils.js';

/**
 * Simulates cache behavior.
 * Cache nodes intercept traffic between servers and databases.
 * Hit rate starts at 0 and climbs over time (simulating cache warm-up).
 * Cache hits skip the DB; cache misses pass through.
 *
 * @param {object} state - { nodes, edges, nodeTraffic, cacheState }
 * @returns {object} - { nodeTraffic, cacheState, dbLoad }
 */
export function simulateCache(state) {
  const { nodes, edges, nodeTraffic, cacheState = {} } = state;
  const adj = buildAdjacencyList(edges);
  const nodeMap = buildNodeMap(nodes);
  const updatedTraffic = { ...nodeTraffic };
  const updatedCacheState = { ...cacheState };

  const caches = nodes.filter(n => n.type === 'cache');

  for (const cache of caches) {
    const incomingRps = updatedTraffic[cache.id] || 0;

    // Warm up: hit rate increases by 3% per tick, max 85%
    const prevHitRate = updatedCacheState[cache.id]?.hitRate || 0;
    const hitRate = incomingRps > 0
      ? Math.min(prevHitRate + 0.03, 0.85)
      : Math.max(prevHitRate - 0.05, 0); // Cool down when no traffic

    updatedCacheState[cache.id] = { hitRate };

    // Calculate what passes through to downstream (DB)
    const cacheHits = incomingRps * hitRate;
    const cacheMisses = incomingRps - cacheHits;

    // Pass only cache misses to children (databases)
    const children = getChildren(cache.id, adj);
    for (const childId of children) {
      const child = nodeMap[childId];
      if (child && (child.type === 'database' || child.type === 'replica')) {
        updatedTraffic[childId] = cacheMisses;
      }
    }
  }

  return { nodeTraffic: updatedTraffic, cacheState: updatedCacheState };
}

/**
 * Calculate latency contribution from cache layer.
 * Cache hits are ~1ms, cache misses go to DB (~20-50ms).
 */
export function calculateCacheLatency(cacheState, baseDbLatency) {
  const cacheEntries = Object.values(cacheState);
  if (cacheEntries.length === 0) return baseDbLatency;

  const avgHitRate = cacheEntries.reduce((sum, c) => sum + c.hitRate, 0) / cacheEntries.length;
  const cacheHitLatency = 1;
  return (avgHitRate * cacheHitLatency) + ((1 - avgHitRate) * baseDbLatency);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/simulators/CacheSimulator.js
git commit -m "feat: add CacheSimulator with warm-up hit rate and DB load reduction"
```

---

### Task 8: Simulation Engine — GeoLatencySimulator

**Files:**
- Create: `src/engine/simulators/GeoLatencySimulator.js`

- [ ] **Step 1: Create GeoLatencySimulator.js**

```js
// src/engine/simulators/GeoLatencySimulator.js

/**
 * Simulates geographic latency.
 * Users connecting from distant regions experience higher latency.
 * CDN nodes reduce latency by serving cached content from edge.
 *
 * Region latency matrix (ms):
 * India <-> US: 250ms
 * India <-> Europe: 180ms
 * US <-> Europe: 120ms
 * Same region: 10ms
 */

const REGION_LATENCY = {
  'region-india': { 'region-us': 250, 'region-europe': 180 },
  'region-us': { 'region-india': 250, 'region-europe': 120 },
  'region-europe': { 'region-india': 180, 'region-us': 120 },
};

/**
 * Calculate per-region latency and bounce rates.
 *
 * @param {object} state - { nodes, edges, nodeTraffic, trafficPerSource }
 * @returns {object} - { regionMetrics, bouncedUsers, maxRegionLatency }
 */
export function simulateGeoLatency(state) {
  const { nodes, trafficPerSource = {} } = state;

  const cdnNodes = nodes.filter(n => n.type === 'cdn' && n.data.status !== 'dead');
  const hasCDN = cdnNodes.length > 0;
  const cdnReduction = hasCDN ? 0.6 : 1.0; // CDN reduces latency by 40%

  // Find which regions have local servers
  const serverRegions = new Set();
  for (const node of nodes) {
    if (node.type === 'server' && node.parentNode) {
      serverRegions.add(node.parentNode);
    }
  }

  const regionMetrics = {};
  let totalBounced = 0;
  let maxLatency = 0;

  for (const [sourceId, sourceData] of Object.entries(trafficPerSource)) {
    const userRegion = sourceData.region;
    if (userRegion === 'default') {
      regionMetrics[sourceId] = { latency: 10, bounced: 0, region: 'default' };
      continue;
    }

    // Find closest server region
    let minLatency = Infinity;

    if (serverRegions.size === 0) {
      // No region-assigned servers — use base high latency
      minLatency = 200;
    } else {
      for (const serverRegion of serverRegions) {
        if (serverRegion === userRegion) {
          minLatency = 10; // Same region
          break;
        }
        const latency = REGION_LATENCY[userRegion]?.[serverRegion] || 300;
        minLatency = Math.min(minLatency, latency);
      }
    }

    // CDN reduces the effective latency
    const effectiveLatency = Math.round(minLatency * cdnReduction);

    // Bounce rate: users leave if latency > 250ms
    const bounceRate = effectiveLatency > 250 ? 0.4 : effectiveLatency > 150 ? 0.1 : 0;
    const bounced = Math.round(sourceData.rps * bounceRate);

    regionMetrics[sourceId] = {
      latency: effectiveLatency,
      bounced,
      region: userRegion,
    };

    totalBounced += bounced;
    maxLatency = Math.max(maxLatency, effectiveLatency);
  }

  return { regionMetrics, bouncedUsers: totalBounced, maxRegionLatency: maxLatency };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/simulators/GeoLatencySimulator.js
git commit -m "feat: add GeoLatencySimulator with region latency matrix and bounce rates"
```

---

### Task 9: Simulation Engine — FailoverSimulator

**Files:**
- Create: `src/engine/simulators/FailoverSimulator.js`

- [ ] **Step 1: Create FailoverSimulator.js**

```js
// src/engine/simulators/FailoverSimulator.js

import { buildAdjacencyList, getChildren, buildNodeMap } from '../../utils/graphUtils.js';

/**
 * Simulates failures and failover behavior.
 * - Triggers a disaster event after N seconds (kills primary DB)
 * - Health checks detect dead nodes and reroute traffic to replicas
 * - Without health checks + replicas, system goes down completely
 *
 * @param {object} state - { nodes, edges, nodeTraffic, tickCount, disasterTime, failoverState }
 * @returns {object} - { nodes, systemDown, survivedDisaster, failoverState }
 */
export function simulateFailover(state) {
  const { nodes, edges, tickCount, disasterTime = 30, failoverState = {} } = state;
  const adj = buildAdjacencyList(edges);
  const nodeMap = buildNodeMap(nodes);

  const ticksPerSecond = 2; // 500ms tick
  const disasterTick = disasterTime * ticksPerSecond;

  let updatedNodes = [...nodes];
  let systemDown = false;
  let survivedDisaster = failoverState.survivedDisaster || false;
  const disasterTriggered = failoverState.disasterTriggered || false;

  // Trigger disaster at the right time
  if (tickCount >= disasterTick && !disasterTriggered) {
    // Kill the primary database
    updatedNodes = updatedNodes.map(node => {
      if (node.type === 'database' && node.data.isPrimary) {
        return {
          ...node,
          data: { ...node.data, status: 'dead', rps: 0 },
        };
      }
      return node;
    });

    // Check if health checks exist and are connected to replicas
    const healthChecks = updatedNodes.filter(n => n.type === 'healthCheck');
    const replicas = updatedNodes.filter(n => n.type === 'replica');

    if (healthChecks.length === 0 || replicas.length === 0) {
      // No failover capability — system goes down
      systemDown = true;
    } else {
      // Check if health checks are connected to the dead DB
      let healthCheckConnected = false;
      for (const hc of healthChecks) {
        const children = getChildren(hc.id, adj);
        const monitoredDead = children.some(childId => {
          const child = nodeMap[childId];
          return child && child.type === 'database' && child.data.isPrimary;
        });
        if (monitoredDead) {
          healthCheckConnected = true;
          break;
        }
      }

      if (!healthCheckConnected) {
        systemDown = true;
      }
      // If connected, replicas take over — handled by topology walker routing around dead nodes
    }

    return {
      nodes: updatedNodes,
      systemDown,
      survivedDisaster: !systemDown,
      failoverState: { disasterTriggered: true, survivedDisaster: !systemDown },
    };
  }

  // Post-disaster: if disaster was triggered and system didn't go down, count survival ticks
  if (disasterTriggered && !failoverState.survivedDisaster) {
    // Check if all primary DBs are dead and no replicas are handling traffic
    const aliveDBs = updatedNodes.filter(n =>
      (n.type === 'database' || n.type === 'replica') && n.data.status !== 'dead'
    );
    systemDown = aliveDBs.length === 0;
    survivedDisaster = !systemDown;
  }

  return {
    nodes: updatedNodes,
    systemDown,
    survivedDisaster: failoverState.survivedDisaster || survivedDisaster,
    failoverState: { ...failoverState, disasterTriggered },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/simulators/FailoverSimulator.js
git commit -m "feat: add FailoverSimulator with disaster events and health check detection"
```

---

### Task 10: Metrics Collector

**Files:**
- Create: `src/engine/MetricsCollector.js`

- [ ] **Step 1: Create MetricsCollector.js**

```js
// src/engine/MetricsCollector.js

/**
 * MetricsCollector aggregates outputs from all simulators into HUD-ready stats.
 *
 * @param {object} state - full game state after all simulators have run
 * @returns {object} - aggregated metrics for HUD and win/fail evaluation
 */
export function collectMetrics(state) {
  const {
    nodes,
    nodeTraffic = {},
    rps = 0,
    cacheState = {},
    regionMetrics = {},
    systemDown = false,
    survivedDisaster = false,
    baseLatency = 50,
    congestionFactor = 0.1,
  } = state;

  // Server metrics
  const servers = nodes.filter(n => n.type === 'server' && n.data.status !== 'dead');
  const totalCapacity = servers.reduce((sum, s) => sum + (s.data.capacity || 0), 0);

  const overloadedServers = servers.filter(
    s => (nodeTraffic[s.id] || 0) > s.data.capacity
  ).length;

  // Database metrics
  const databases = nodes.filter(n => n.type === 'database' && n.data.status !== 'dead');
  const dbLoad = databases.reduce((sum, db) => sum + (nodeTraffic[db.id] || 0), 0);
  const dbCapacity = databases.reduce((sum, db) => sum + (db.data.capacity || 0), 0);

  // Cache metrics
  const cacheEntries = Object.values(cacheState);
  const avgCacheHitRate = cacheEntries.length > 0
    ? cacheEntries.reduce((sum, c) => sum + c.hitRate, 0) / cacheEntries.length
    : 0;

  // Latency calculation
  const load = totalCapacity > 0 ? rps / totalCapacity : 999;
  const serverLatency = baseLatency + (load * congestionFactor * 1000);

  // Cache reduces effective latency
  const dbLatency = 30;
  const cacheLatencyFactor = cacheEntries.length > 0
    ? (avgCacheHitRate * 1) + ((1 - avgCacheHitRate) * dbLatency)
    : dbLatency;

  // Geo latency (worst region)
  const regionValues = Object.values(regionMetrics);
  const maxRegionLatency = regionValues.length > 0
    ? Math.max(...regionValues.map(r => r.latency))
    : 0;
  const geoLatencyPenalty = maxRegionLatency;

  // Total average latency
  const avgLatency = Math.round(
    serverLatency + cacheLatencyFactor + (geoLatencyPenalty > 0 ? geoLatencyPenalty : 0)
  );

  // Bounced users
  const bouncedUsers = regionValues.reduce((sum, r) => sum + (r.bounced || 0), 0);

  // System health: 100% = everything healthy, 0% = system down
  let healthPercent = 100;
  if (systemDown) {
    healthPercent = 0;
  } else {
    const totalNodes = nodes.filter(n => n.type !== 'trafficSource' && n.type !== 'region');
    const deadNodes = totalNodes.filter(n => n.data.status === 'dead');
    const overloadPenalty = overloadedServers * 15;
    healthPercent = Math.max(
      0,
      Math.round(((totalNodes.length - deadNodes.length) / Math.max(totalNodes.length, 1)) * 100 - overloadPenalty)
    );
  }

  return {
    rps,
    totalCapacity,
    overloadedServers,
    dbLoad,
    dbCapacity,
    avgCacheHitRate: Math.round(avgCacheHitRate * 100),
    avgLatency,
    maxRegionLatency,
    bouncedUsers,
    healthPercent,
    systemDown,
    survivedDisaster,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/MetricsCollector.js
git commit -m "feat: add MetricsCollector for aggregating simulation stats"
```

---

### Task 11: Level Orchestrator

**Files:**
- Create: `src/engine/LevelOrchestrator.js`
- Modify: `src/engine/SimulationEngine.js` (delete — replaced by orchestrator)

- [ ] **Step 1: Create LevelOrchestrator.js**

```js
// src/engine/LevelOrchestrator.js

import { walkTopology } from './TopologyWalker.js';
import { simulateTraffic, rampTraffic } from './simulators/TrafficSimulator.js';
import { simulateLoadBalancing, findOverloadedServers } from './simulators/LoadBalancerSimulator.js';
import { simulateCache } from './simulators/CacheSimulator.js';
import { simulateGeoLatency } from './simulators/GeoLatencySimulator.js';
import { simulateFailover } from './simulators/FailoverSimulator.js';
import { collectMetrics } from './MetricsCollector.js';
import { LEVEL_CONFIGS } from './LevelConfigs.js';

/**
 * LevelOrchestrator runs the simulation tick loop.
 * It knows which simulators are active per level and chains them together.
 */

const SIMULATOR_MAP = {
  traffic: simulateTraffic,
  loadBalancer: simulateLoadBalancing,
  cache: simulateCache,
  geoLatency: simulateGeoLatency,
  failover: simulateFailover,
};

/**
 * Run a single simulation tick.
 * Called every 500ms by the game loop in the store.
 *
 * @param {object} gameState - current full game state from Zustand store
 * @returns {object} - updated state to merge into store
 */
export function runTick(gameState) {
  const {
    level,
    nodes,
    edges,
    rps,
    targetRps,
    tickCount = 0,
    cacheState = {},
    failoverState = {},
    sustainedTicks = 0,
    simulationRunning,
  } = gameState;

  if (!simulationRunning) return {};

  const config = LEVEL_CONFIGS[level];
  if (!config) return {};

  // 1. Ramp traffic
  const currentRps = rampTraffic(rps, targetRps);

  // 2. Walk topology to get base traffic distribution
  const topology = walkTopology(nodes, edges, currentRps);

  // 3. Build state for simulators
  let simState = {
    nodes,
    edges,
    rps: currentRps,
    targetRps,
    nodeTraffic: topology.nodeTraffic,
    cacheState,
    failoverState,
    tickCount: tickCount + 1,
    disasterTime: config.disasterTime,
    trafficPerSource: {},
    baseLatency: config.baseLatency,
    congestionFactor: config.congestionFactor,
  };

  // 4. Run traffic simulator first (always active)
  const trafficResult = simulateTraffic(simState);
  simState = { ...simState, ...trafficResult };

  // 5. Run active simulators in order
  for (const simName of config.activeSimulators) {
    const simulator = SIMULATOR_MAP[simName];
    if (!simulator || simName === 'traffic') continue; // traffic already ran

    const result = simulator(simState);
    simState = { ...simState, ...result };
  }

  // 6. Update node data with traffic info
  const updatedNodes = (simState.nodes || nodes).map(node => {
    const traffic = simState.nodeTraffic[node.id] || 0;
    const isServer = node.type === 'server';
    const isOverloaded = isServer && traffic > node.data.capacity;

    let status = node.data.status;
    if (status !== 'dead') {
      if (isOverloaded) status = 'critical';
      else if (isServer && traffic > node.data.capacity * 0.7) status = 'warning';
      else status = 'healthy';
    }

    // Update cache hit rate display
    let hitRate = node.data.hitRate;
    if (node.type === 'cache' && simState.cacheState?.[node.id]) {
      hitRate = simState.cacheState[node.id].hitRate;
    }

    return {
      ...node,
      data: { ...node.data, rps: Math.round(traffic), status, hitRate },
    };
  });

  // 7. Collect metrics
  const metrics = collectMetrics({
    ...simState,
    nodes: updatedNodes,
    rps: currentRps,
  });

  // 8. Check win/fail conditions
  const newTickCount = tickCount + 1;
  let gameStatus = 'playing';
  let newSustainedTicks = sustainedTicks;

  // Check fail first
  if (config.failCondition(metrics)) {
    gameStatus = 'failed';
    newSustainedTicks = 0;
  }
  // Then check win (must sustain for N seconds = N*2 ticks at 500ms)
  else if (config.winCondition(metrics)) {
    newSustainedTicks += 1;
    const requiredTicks = config.sustainSeconds * 2;
    if (newSustainedTicks >= requiredTicks) {
      gameStatus = 'won';
    }
  } else {
    newSustainedTicks = 0;
  }

  return {
    nodes: updatedNodes,
    rps: currentRps,
    latency: metrics.avgLatency,
    tickCount: newTickCount,
    cacheState: simState.cacheState || cacheState,
    failoverState: simState.failoverState || failoverState,
    metrics,
    gameStatus,
    sustainedTicks: newSustainedTicks,
  };
}
```

- [ ] **Step 2: Delete old SimulationEngine.js**

Delete `src/engine/SimulationEngine.js` — its logic is now split across the modular simulators.

- [ ] **Step 3: Commit**

```bash
git rm src/engine/SimulationEngine.js
git add src/engine/LevelOrchestrator.js
git commit -m "feat: add LevelOrchestrator, replace monolithic SimulationEngine"
```

---

### Task 12: Zustand Store Rewrite

**Files:**
- Modify: `src/store/useGameStore.js`

- [ ] **Step 1: Rewrite useGameStore.js**

Replace the entire content of `src/store/useGameStore.js`:

```js
// src/store/useGameStore.js

import { create } from 'zustand';
import { LEVEL_CONFIGS, TOTAL_LEVELS } from '../engine/LevelConfigs.js';
import { runTick } from '../engine/LevelOrchestrator.js';

const useGameStore = create((set, get) => ({
  // Level progression
  level: 1,
  unlockedLevel: 1,
  gameStatus: 'intro', // 'intro' | 'playing' | 'failed' | 'won'
  showLevelSelect: false,

  // Game state
  money: LEVEL_CONFIGS[1].budget,
  rps: 0,
  targetRps: 0,
  latency: LEVEL_CONFIGS[1].baseLatency,
  nodes: [],
  edges: [],

  // Simulation state
  simulationRunning: false,
  tickCount: 0,
  sustainedTicks: 0,
  cacheState: {},
  failoverState: {},
  tickInterval: null,

  // Metrics (from MetricsCollector)
  metrics: {
    rps: 0,
    totalCapacity: 0,
    overloadedServers: 0,
    dbLoad: 0,
    dbCapacity: 0,
    avgCacheHitRate: 0,
    avgLatency: 0,
    maxRegionLatency: 0,
    bouncedUsers: 0,
    healthPercent: 100,
    systemDown: false,
    survivedDisaster: false,
  },

  // --- Actions ---

  // Load a level (sets up initial state)
  loadLevel: (levelNum) => {
    const config = LEVEL_CONFIGS[levelNum];
    if (!config) return;

    // Stop any running simulation
    const { tickInterval } = get();
    if (tickInterval) clearInterval(tickInterval);

    set({
      level: levelNum,
      gameStatus: 'intro',
      money: config.budget,
      rps: 0,
      targetRps: 0,
      latency: config.baseLatency,
      nodes: config.initialNodes.map(n => ({ ...n, data: { ...n.data } })),
      edges: config.initialEdges.map(e => ({ ...e })),
      simulationRunning: false,
      tickCount: 0,
      sustainedTicks: 0,
      cacheState: {},
      failoverState: {},
      tickInterval: null,
      metrics: {
        rps: 0,
        totalCapacity: 0,
        overloadedServers: 0,
        dbLoad: 0,
        dbCapacity: 0,
        avgCacheHitRate: 0,
        avgLatency: 0,
        maxRegionLatency: 0,
        bouncedUsers: 0,
        healthPercent: 100,
        systemDown: false,
        survivedDisaster: false,
      },
    });
  },

  // Start simulation (begin gameplay after intro)
  startSimulation: () => {
    const { level, tickInterval: existingInterval } = get();
    const config = LEVEL_CONFIGS[level];
    if (existingInterval) clearInterval(existingInterval);

    set({ gameStatus: 'playing', simulationRunning: true });

    const interval = setInterval(() => {
      const state = get();
      if (!state.simulationRunning) return;

      const updates = runTick(state);
      if (Object.keys(updates).length > 0) {
        set(updates);

        // Handle game status changes
        if (updates.gameStatus === 'won') {
          get().onWin();
        } else if (updates.gameStatus === 'failed') {
          get().onFail();
        }
      }
    }, 500);

    set({ tickInterval: interval });
  },

  // Stop simulation
  stopSimulation: () => {
    const { tickInterval } = get();
    if (tickInterval) clearInterval(tickInterval);
    set({ simulationRunning: false, tickInterval: null });
  },

  // Set target traffic (player clicks "Spike Traffic")
  setTargetTraffic: (target) => {
    set({ targetRps: target });
  },

  // Add a node from the component tray
  addNode: (type, position) => {
    const { money, nodes, level } = get();
    const config = LEVEL_CONFIGS[level];
    const cost = config.nodeCosts[type] || 0;

    if (money < cost) return false;

    const defaults = {
      server: { label: 'Web Server', rps: 0, capacity: 1000, status: 'healthy' },
      database: { label: 'SQL Database', rps: 0, capacity: 2000, status: 'healthy' },
      loadBalancer: { label: 'Load Balancer', rps: 0, algorithm: 'round-robin', status: 'healthy' },
      cache: { label: 'Redis Cache', rps: 0, hitRate: 0, status: 'healthy' },
      cdn: { label: 'CDN', rps: 0, cacheRate: 0.3, status: 'healthy' },
      region: { label: 'Region', region: 'custom' },
      replica: { label: 'Read Replica', rps: 0, capacity: 3000, status: 'healthy' },
      healthCheck: { label: 'Health Check', rps: 0, status: 'healthy' },
    };

    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: position || { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 },
      data: { ...defaults[type] },
    };

    set({
      money: money - cost,
      nodes: [...nodes, newNode],
    });
    return true;
  },

  // React Flow callbacks
  setNodes: (nodesOrUpdater) => {
    if (typeof nodesOrUpdater === 'function') {
      set(state => ({ nodes: nodesOrUpdater(state.nodes) }));
    } else {
      set({ nodes: nodesOrUpdater });
    }
  },

  setEdges: (edgesOrUpdater) => {
    if (typeof edgesOrUpdater === 'function') {
      set(state => ({ edges: edgesOrUpdater(state.edges) }));
    } else {
      set({ edges: edgesOrUpdater });
    }
  },

  // Win handler
  onWin: () => {
    const { level, tickInterval } = get();
    if (tickInterval) clearInterval(tickInterval);
    const newUnlocked = Math.min(level + 1, TOTAL_LEVELS);
    set({
      simulationRunning: false,
      tickInterval: null,
      gameStatus: 'won',
      unlockedLevel: Math.max(get().unlockedLevel, newUnlocked),
    });
  },

  // Fail handler
  onFail: () => {
    const { tickInterval } = get();
    if (tickInterval) clearInterval(tickInterval);
    set({
      simulationRunning: false,
      tickInterval: null,
      gameStatus: 'failed',
    });
  },

  // Retry current level
  retryLevel: () => {
    const { level } = get();
    get().loadLevel(level);
  },

  // Toggle level select
  toggleLevelSelect: () => {
    set(state => ({ showLevelSelect: !state.showLevelSelect }));
  },

  // Dismiss intro, begin play
  dismissIntro: () => {
    set({ gameStatus: 'playing' });
    get().startSimulation();
  },
}));

export default useGameStore;
```

- [ ] **Step 2: Commit**

```bash
git add src/store/useGameStore.js
git commit -m "feat: rewrite Zustand store with level progression, tick loop, and full game lifecycle"
```

---

### Task 13: Node Components — TrafficSourceNode, DatabaseNode

**Files:**
- Create: `src/game-nodes/TrafficSourceNode.jsx`
- Create: `src/game-nodes/DatabaseNode.jsx`

- [ ] **Step 1: Create TrafficSourceNode.jsx**

```jsx
// src/game-nodes/TrafficSourceNode.jsx

import { Handle, Position } from 'reactflow';
import { Radio } from 'lucide-react';

export default function TrafficSourceNode({ data }) {
  return (
    <div className="game-node healthy" style={{ borderColor: 'var(--node-traffic)' }}>
      <Handle type="source" position={Position.Right} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Radio size={28} style={{ color: 'var(--node-traffic)' }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Traffic Source
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
          {data.label}
        </div>
        <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--node-traffic)' }}>
          {data.rps?.toLocaleString() || 0} RPS
        </div>
        {data.region && data.region !== 'default' && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {data.region.replace('region-', '').toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create DatabaseNode.jsx**

```jsx
// src/game-nodes/DatabaseNode.jsx

import { Handle, Position } from 'reactflow';
import { Database } from 'lucide-react';

export default function DatabaseNode({ data }) {
  const load = data.capacity > 0 ? data.rps / data.capacity : 0;
  const status = data.status || 'healthy';
  const loadPercent = Math.min(load * 100, 100);
  const barColor = status === 'dead'
    ? 'var(--color-critical)'
    : load > 0.9 ? 'var(--color-critical)'
    : load > 0.7 ? 'var(--color-warning)'
    : 'var(--node-database)';

  return (
    <div className={`game-node ${status}`} style={{ borderColor: status === 'healthy' ? 'var(--node-database)' : undefined }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Database size={28} style={{ color: 'var(--node-database)' }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Database
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {data.label}
        </div>
        {status === 'dead' ? (
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-critical)' }}>OFFLINE</div>
        ) : (
          <>
            <div className="load-bar">
              <div className="load-bar-fill" style={{ width: `${loadPercent}%`, background: barColor }} />
            </div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
              <span style={{ color: barColor, fontWeight: 700 }}>{data.rps?.toLocaleString() || 0}</span> / {data.capacity?.toLocaleString()} QPS
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/game-nodes/TrafficSourceNode.jsx src/game-nodes/DatabaseNode.jsx
git commit -m "feat: add TrafficSourceNode and DatabaseNode components"
```

---

### Task 14: Node Components — LoadBalancerNode, CacheNode

**Files:**
- Create: `src/game-nodes/LoadBalancerNode.jsx`
- Create: `src/game-nodes/CacheNode.jsx`

- [ ] **Step 1: Create LoadBalancerNode.jsx**

```jsx
// src/game-nodes/LoadBalancerNode.jsx

import { Handle, Position } from 'reactflow';
import { Split } from 'lucide-react';

export default function LoadBalancerNode({ data }) {
  const status = data.status || 'healthy';

  return (
    <div className={`game-node ${status}`} style={{ borderColor: status === 'healthy' ? 'var(--node-loadbalancer)' : undefined }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Split size={28} style={{ color: 'var(--node-loadbalancer)' }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Load Balancer
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {data.label}
        </div>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--node-loadbalancer)' }}>
          {data.rps?.toLocaleString() || 0} RPS
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '2px 8px', background: 'var(--bg-tertiary)', borderRadius: 4 }}>
          {data.algorithm || 'round-robin'}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create CacheNode.jsx**

```jsx
// src/game-nodes/CacheNode.jsx

import { Handle, Position } from 'reactflow';
import { Zap } from 'lucide-react';

export default function CacheNode({ data }) {
  const status = data.status || 'healthy';
  const hitRate = data.hitRate || 0;
  const hitRatePercent = Math.round(hitRate * 100);
  const barColor = hitRatePercent > 60 ? 'var(--color-healthy)' : hitRatePercent > 30 ? 'var(--color-warning)' : 'var(--color-info)';

  return (
    <div className={`game-node ${status}`} style={{ borderColor: status === 'healthy' ? 'var(--node-cache)' : undefined }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Zap size={28} style={{ color: 'var(--node-cache)' }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Cache
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {data.label}
        </div>
        <div className="load-bar">
          <div className="load-bar-fill" style={{ width: `${hitRatePercent}%`, background: barColor }} />
        </div>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: barColor, fontWeight: 700 }}>
          {hitRatePercent}% Hit Rate
        </div>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
          {data.rps?.toLocaleString() || 0} RPS
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/game-nodes/LoadBalancerNode.jsx src/game-nodes/CacheNode.jsx
git commit -m "feat: add LoadBalancerNode and CacheNode components"
```

---

### Task 15: Node Components — CDNNode, RegionNode, ReplicaNode, HealthCheckNode

**Files:**
- Create: `src/game-nodes/CDNNode.jsx`
- Create: `src/game-nodes/RegionNode.jsx`
- Create: `src/game-nodes/ReplicaNode.jsx`
- Create: `src/game-nodes/HealthCheckNode.jsx`

- [ ] **Step 1: Create CDNNode.jsx**

```jsx
// src/game-nodes/CDNNode.jsx

import { Handle, Position } from 'reactflow';
import { Globe } from 'lucide-react';

export default function CDNNode({ data }) {
  const status = data.status || 'healthy';

  return (
    <div className={`game-node ${status}`} style={{ borderColor: status === 'healthy' ? 'var(--node-cdn)' : undefined }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Globe size={28} style={{ color: 'var(--node-cdn)' }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          CDN
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {data.label}
        </div>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--node-cdn)' }}>
          {data.rps?.toLocaleString() || 0} RPS
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '2px 8px', background: 'var(--bg-tertiary)', borderRadius: 4 }}>
          {Math.round((data.cacheRate || 0) * 100)}% cached
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create RegionNode.jsx**

```jsx
// src/game-nodes/RegionNode.jsx

import { MapPin } from 'lucide-react';

export default function RegionNode({ data }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      border: '2px dashed var(--node-region)',
      borderRadius: 16,
      background: 'rgba(100, 116, 139, 0.05)',
      padding: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <MapPin size={14} style={{ color: 'var(--node-region)' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--node-region)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {data.label}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create ReplicaNode.jsx**

```jsx
// src/game-nodes/ReplicaNode.jsx

import { Handle, Position } from 'reactflow';
import { DatabaseZap } from 'lucide-react';

export default function ReplicaNode({ data }) {
  const load = data.capacity > 0 ? data.rps / data.capacity : 0;
  const status = data.status || 'healthy';
  const loadPercent = Math.min(load * 100, 100);
  const barColor = load > 0.9 ? 'var(--color-critical)' : load > 0.7 ? 'var(--color-warning)' : 'var(--node-replica)';

  return (
    <div className={`game-node ${status}`} style={{ borderColor: status === 'healthy' ? 'var(--node-replica)' : undefined }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <DatabaseZap size={28} style={{ color: 'var(--node-replica)' }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Read Replica
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {data.label}
        </div>
        {status === 'dead' ? (
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-critical)' }}>OFFLINE</div>
        ) : (
          <>
            <div className="load-bar">
              <div className="load-bar-fill" style={{ width: `${loadPercent}%`, background: barColor }} />
            </div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
              <span style={{ color: barColor, fontWeight: 700 }}>{data.rps?.toLocaleString() || 0}</span> / {data.capacity?.toLocaleString()} QPS
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create HealthCheckNode.jsx**

```jsx
// src/game-nodes/HealthCheckNode.jsx

import { Handle, Position } from 'reactflow';
import { HeartPulse } from 'lucide-react';

export default function HealthCheckNode({ data }) {
  const status = data.status || 'healthy';

  return (
    <div className={`game-node ${status}`} style={{ borderColor: status === 'healthy' ? 'var(--node-healthcheck)' : undefined }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <HeartPulse size={28} style={{ color: 'var(--node-healthcheck)' }} className="animate-pulse-glow" />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Health Check
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {data.label}
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-healthy)', padding: '2px 8px', background: 'var(--color-healthy-bg)', borderRadius: 4, fontWeight: 600 }}>
          Monitoring
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/game-nodes/CDNNode.jsx src/game-nodes/RegionNode.jsx src/game-nodes/ReplicaNode.jsx src/game-nodes/HealthCheckNode.jsx
git commit -m "feat: add CDN, Region, Replica, and HealthCheck node components"
```

---

### Task 16: Rewrite ServerNode with Dark Theme

**Files:**
- Modify: `src/game-nodes/ServerNode.jsx`

- [ ] **Step 1: Rewrite ServerNode.jsx**

Replace entire content of `src/game-nodes/ServerNode.jsx`:

```jsx
// src/game-nodes/ServerNode.jsx

import { Handle, Position } from 'reactflow';
import { Server } from 'lucide-react';

export default function ServerNode({ data }) {
  const load = data.capacity > 0 ? data.rps / data.capacity : 0;
  const status = data.status || 'healthy';
  const loadPercent = Math.min(load * 100, 100);
  const barColor = status === 'dead'
    ? 'var(--color-critical)'
    : load > 0.9 ? 'var(--color-critical)'
    : load > 0.7 ? 'var(--color-warning)'
    : 'var(--node-server)';

  return (
    <div className={`game-node ${status}`} style={{ borderColor: status === 'healthy' ? 'var(--node-server)' : undefined, position: 'relative' }}>
      {status === 'critical' && (
        <div className="fire-particles">
          <div className="fire-particle" style={{ left: '10%' }} />
          <div className="fire-particle" style={{ left: '30%' }} />
          <div className="fire-particle" style={{ left: '60%' }} />
          <div className="fire-particle" style={{ left: '80%' }} />
        </div>
      )}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Server size={28} style={{ color: 'var(--node-server)' }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Compute
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {data.label || 'Web Server'}
        </div>
        {status === 'dead' ? (
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-critical)' }}>OFFLINE</div>
        ) : (
          <>
            <div className="load-bar">
              <div className="load-bar-fill" style={{ width: `${loadPercent}%`, background: barColor }} />
            </div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
              <span style={{ color: barColor, fontWeight: 700 }}>{data.rps?.toLocaleString() || 0}</span> / {data.capacity?.toLocaleString()} RPS
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/game-nodes/ServerNode.jsx
git commit -m "feat: rewrite ServerNode with dark theme, fire particles, status states"
```

---

### Task 17: AnimatedEdge Component

**Files:**
- Create: `src/components/AnimatedEdge.jsx`

- [ ] **Step 1: Create AnimatedEdge.jsx**

```jsx
// src/components/AnimatedEdge.jsx

import { getBezierPath } from 'reactflow';

/**
 * Custom edge that shows animated dots flowing along the connection.
 * Dot speed and count scale with traffic volume.
 */
export default function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
}) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const rps = data?.rps || 0;
  // Scale number of dots: 1 at low traffic, up to 6 at high traffic
  const dotCount = rps === 0 ? 0 : Math.min(Math.max(Math.ceil(rps / 500), 1), 6);
  // Scale animation speed: faster at higher traffic
  const duration = rps === 0 ? 3 : Math.max(3 - (rps / 2000), 0.8);

  return (
    <g>
      {/* Base path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke="var(--border-primary)"
        strokeWidth={2}
        style={style}
      />
      {/* Glow path */}
      {rps > 0 && (
        <path
          d={edgePath}
          fill="none"
          stroke="var(--color-info)"
          strokeWidth={1}
          strokeOpacity={0.4}
        />
      )}
      {/* Animated dots */}
      {Array.from({ length: dotCount }).map((_, i) => (
        <circle
          key={i}
          r={3}
          fill="var(--color-info)"
          style={{
            offsetPath: `path("${edgePath}")`,
            animation: `dot-flow ${duration}s linear infinite`,
            animationDelay: `${(i / dotCount) * duration}s`,
            filter: 'drop-shadow(0 0 3px var(--color-info-glow))',
          }}
        />
      ))}
    </g>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AnimatedEdge.jsx
git commit -m "feat: add AnimatedEdge with flowing dots scaled by traffic volume"
```

---

### Task 18: HUD Component

**Files:**
- Create: `src/components/HUD.jsx`

- [ ] **Step 1: Create HUD.jsx**

```jsx
// src/components/HUD.jsx

import { DollarSign, Activity, Clock, Heart, Users, RotateCcw, List } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS } from '../engine/LevelConfigs';

function StatCard({ icon: Icon, label, value, unit, color, animate }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      background: 'var(--bg-tertiary)', borderRadius: 12, padding: '10px 20px',
      border: '1px solid var(--border-primary)',
      minWidth: 110,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon size={12} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          {label}
        </span>
      </div>
      <span
        className={animate ? 'animate-value-pop' : ''}
        style={{ fontSize: 20, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color }}
      >
        {value}{unit && <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 2 }}>{unit}</span>}
      </span>
    </div>
  );
}

export default function HUD() {
  const { money, rps, latency, metrics, level, gameStatus, toggleLevelSelect, retryLevel, setTargetTraffic, targetRps } = useGameStore();
  const config = LEVEL_CONFIGS[level];

  const latencyColor = latency > 200 ? 'var(--color-critical)' : latency > 100 ? 'var(--color-warning)' : 'var(--color-healthy)';
  const healthColor = metrics.healthPercent > 70 ? 'var(--color-healthy)' : metrics.healthPercent > 30 ? 'var(--color-warning)' : 'var(--color-critical)';

  return (
    <div style={{
      height: 72,
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 10,
      flexShrink: 0,
    }}>
      {/* Left: Title + Level */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          System Design <span style={{ color: 'var(--text-accent)' }}>Sim</span>
        </h1>
        <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
          Level {level} — {config.name}
        </p>
      </div>

      {/* Center: Stats */}
      <div style={{ display: 'flex', gap: 12 }}>
        <StatCard icon={DollarSign} label="Budget" value={`$${money.toLocaleString()}`} color="var(--color-healthy)" />
        <StatCard icon={Activity} label="Traffic" value={rps.toLocaleString()} unit="RPS" color="var(--color-info)" animate={gameStatus === 'playing'} />
        <StatCard icon={Clock} label="Latency" value={latency} unit="ms" color={latencyColor} />
        <StatCard icon={Heart} label="Health" value={`${metrics.healthPercent}%`} color={healthColor} />
        {metrics.bouncedUsers > 0 && (
          <StatCard icon={Users} label="Bounced" value={metrics.bouncedUsers} color="var(--color-critical)" />
        )}
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        {gameStatus === 'playing' && (
          <button
            onClick={() => setTargetTraffic(Math.min(targetRps + Math.round(config.targetTraffic / 4), config.targetTraffic))}
            style={{
              padding: '8px 16px', background: 'var(--bg-primary)', color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)', borderRadius: 10, fontWeight: 700, fontSize: 13,
              cursor: 'pointer', transition: 'all 150ms',
            }}
            onMouseEnter={e => e.target.style.borderColor = 'var(--text-accent)'}
            onMouseLeave={e => e.target.style.borderColor = 'var(--border-primary)'}
          >
            Spike Traffic
          </button>
        )}
        {gameStatus === 'failed' && (
          <button
            onClick={retryLevel}
            style={{
              padding: '8px 16px', background: 'var(--color-critical)', color: 'white',
              border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <RotateCcw size={14} /> Retry
          </button>
        )}
        <button
          onClick={toggleLevelSelect}
          style={{
            padding: '8px 12px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
            border: '1px solid var(--border-primary)', borderRadius: 10, fontSize: 13,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <List size={14} /> Levels
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/HUD.jsx
git commit -m "feat: add HUD dashboard with stat cards and game actions"
```

---

### Task 19: ComponentTray (Left Sidebar)

**Files:**
- Create: `src/components/ComponentTray.jsx`

- [ ] **Step 1: Create ComponentTray.jsx**

```jsx
// src/components/ComponentTray.jsx

import { Server, Database, Split, Zap, Globe, MapPin, DatabaseZap, HeartPulse, Lock } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS } from '../engine/LevelConfigs';

const COMPONENT_DEFS = {
  server: { label: 'Server', icon: Server, color: 'var(--node-server)', description: 'Processes requests' },
  database: { label: 'Database', icon: Database, color: 'var(--node-database)', description: 'Stores data' },
  loadBalancer: { label: 'Load Balancer', icon: Split, color: 'var(--node-loadbalancer)', description: 'Distributes traffic' },
  cache: { label: 'Cache', icon: Zap, color: 'var(--node-cache)', description: 'Speeds up reads' },
  cdn: { label: 'CDN', icon: Globe, color: 'var(--node-cdn)', description: 'Edge caching' },
  region: { label: 'Region', icon: MapPin, color: 'var(--node-region)', description: 'Geographic zone' },
  replica: { label: 'Replica', icon: DatabaseZap, color: 'var(--node-replica)', description: 'Read replica' },
  healthCheck: { label: 'Health Check', icon: HeartPulse, color: 'var(--node-healthcheck)', description: 'Monitors nodes' },
};

const ALL_COMPONENTS = ['server', 'database', 'loadBalancer', 'cache', 'cdn', 'region', 'replica', 'healthCheck'];

export default function ComponentTray() {
  const { level, money, addNode, gameStatus } = useGameStore();
  const config = LEVEL_CONFIGS[level];
  const unlocked = config.unlockedComponents || [];

  const onDragStart = (event, type) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div style={{
      width: 180,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-primary)',
      padding: '16px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      overflowY: 'auto',
      flexShrink: 0,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: 4 }}>
        Components
      </div>

      {ALL_COMPONENTS.map(type => {
        const def = COMPONENT_DEFS[type];
        const isUnlocked = unlocked.includes(type);
        const cost = config.nodeCosts?.[type] || 0;
        const canAfford = money >= cost;
        const Icon = def.icon;
        const isDisabled = !isUnlocked || !canAfford || gameStatus !== 'playing';

        return (
          <div
            key={type}
            draggable={!isDisabled}
            onDragStart={(e) => !isDisabled && onDragStart(e, type)}
            onClick={() => !isDisabled && addNode(type)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              background: isUnlocked ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
              border: `1px solid ${isUnlocked ? 'var(--border-primary)' : 'transparent'}`,
              cursor: isDisabled ? 'not-allowed' : 'grab',
              opacity: isDisabled ? 0.4 : 1,
              transition: 'all 150ms',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isUnlocked ? `${def.color}15` : 'var(--bg-secondary)',
            }}>
              {isUnlocked ? (
                <Icon size={18} style={{ color: def.color }} />
              ) : (
                <Lock size={14} style={{ color: 'var(--text-muted)' }} />
              )}
            </div>
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
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ComponentTray.jsx
git commit -m "feat: add ComponentTray sidebar with drag-to-add and lock states"
```

---

### Task 20: LevelIntro Overlay

**Files:**
- Create: `src/components/LevelIntro.jsx`

- [ ] **Step 1: Create LevelIntro.jsx**

```jsx
// src/components/LevelIntro.jsx

import { Play } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS } from '../engine/LevelConfigs';

export default function LevelIntro() {
  const { level, gameStatus, dismissIntro } = useGameStore();

  if (gameStatus !== 'intro') return null;

  const config = LEVEL_CONFIGS[level];
  const { narrative } = config;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="animate-slide-up" style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 20,
        padding: 40,
        maxWidth: 520,
        width: '90%',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-accent)', letterSpacing: '0.2em', marginBottom: 8 }}>
          Level {level}
        </div>
        <h2 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
          {narrative.title}
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {config.subtitle}
        </p>
        <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          {narrative.description}
        </p>

        <div style={{
          background: 'var(--bg-primary)', borderRadius: 12, padding: '16px 20px',
          marginBottom: 24, textAlign: 'left',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-accent)', marginBottom: 8 }}>
            Objective
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>
            {narrative.objective}
          </p>
        </div>

        <div style={{
          background: 'var(--bg-primary)', borderRadius: 12, padding: '12px 20px',
          marginBottom: 28, textAlign: 'left',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-warning)', marginBottom: 6 }}>
            Hint
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            {narrative.hint}
          </p>
        </div>

        <button
          onClick={dismissIntro}
          style={{
            padding: '12px 32px', background: 'var(--text-accent)', color: 'var(--bg-primary)',
            border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
            transition: 'transform 150ms',
          }}
          onMouseDown={e => e.target.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.target.style.transform = 'scale(1)'}
        >
          <Play size={18} /> Start Mission
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LevelIntro.jsx
git commit -m "feat: add LevelIntro overlay with narrative, objective, and hint"
```

---

### Task 21: WinScreen and FailScreen Overlays

**Files:**
- Create: `src/components/WinScreen.jsx`
- Create: `src/components/FailScreen.jsx`

- [ ] **Step 1: Create WinScreen.jsx**

```jsx
// src/components/WinScreen.jsx

import { Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS, TOTAL_LEVELS } from '../engine/LevelConfigs';

export default function WinScreen() {
  const { level, gameStatus, loadLevel } = useGameStore();

  if (gameStatus !== 'won') return null;

  const config = LEVEL_CONFIGS[level];
  const hasNextLevel = level < TOTAL_LEVELS;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Confetti particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: -10,
            width: 8,
            height: 8,
            borderRadius: i % 2 === 0 ? '50%' : '2px',
            background: ['var(--color-healthy)', 'var(--color-info)', 'var(--text-accent)', 'var(--color-warning)', '#a855f7'][i % 5],
            animation: `confetti-fall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite`,
          }} />
        ))}
      </div>

      <div className="animate-slide-up" style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--color-healthy)',
        borderRadius: 20,
        padding: 40,
        maxWidth: 520,
        width: '90%',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--color-healthy-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Trophy size={32} style={{ color: 'var(--color-healthy)' }} />
        </div>

        <h2 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800, color: 'var(--color-healthy)' }}>
          Mission Complete!
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Level {level} — {config.name}
        </p>

        <div style={{
          background: 'var(--bg-primary)', borderRadius: 12, padding: '20px',
          marginBottom: 28, textAlign: 'left',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-healthy)', marginBottom: 8 }}>
            What You Learned
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            {config.winLesson}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => loadLevel(level)}
            style={{
              padding: '10px 20px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)', borderRadius: 10, fontWeight: 600, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <RotateCcw size={14} /> Replay
          </button>
          {hasNextLevel && (
            <button
              onClick={() => loadLevel(level + 1)}
              style={{
                padding: '10px 24px', background: 'var(--text-accent)', color: 'var(--bg-primary)',
                border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              Next Level <ArrowRight size={16} />
            </button>
          )}
          {!hasNextLevel && (
            <div style={{ padding: '10px 24px', background: 'var(--color-healthy-bg)', color: 'var(--color-healthy)', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
              You mastered System Design!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create FailScreen.jsx**

```jsx
// src/components/FailScreen.jsx

import { AlertTriangle, RotateCcw, Lightbulb } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS } from '../engine/LevelConfigs';

export default function FailScreen() {
  const { level, gameStatus, retryLevel, metrics } = useGameStore();

  if (gameStatus !== 'failed') return null;

  const config = LEVEL_CONFIGS[level];
  const isBlackout = metrics.systemDown;

  return (
    <div
      className={isBlackout ? 'animate-screen-flicker' : ''}
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: isBlackout ? 'rgba(0, 0, 0, 0.95)' : 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div className="animate-slide-up" style={{
        background: isBlackout ? 'var(--bg-primary)' : 'var(--bg-secondary)',
        border: `1px solid var(--color-critical)`,
        borderRadius: 20,
        padding: 40,
        maxWidth: 520,
        width: '90%',
        textAlign: 'center',
      }}>
        {isBlackout ? (
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 32, fontWeight: 700,
            color: 'var(--color-critical)', marginBottom: 16, letterSpacing: '0.1em',
          }}>
            SYSTEM DOWN
          </div>
        ) : (
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--color-critical-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <AlertTriangle size={32} style={{ color: 'var(--color-critical)' }} />
          </div>
        )}

        <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, color: 'var(--color-critical)' }}>
          {config.failMessage}
        </h2>

        <div style={{
          background: 'var(--bg-primary)', borderRadius: 12, padding: '16px 20px',
          margin: '20px 0', textAlign: 'left',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Lightbulb size={14} style={{ color: 'var(--color-warning)' }} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-warning)', letterSpacing: '0.1em' }}>
              What went wrong
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            {config.failExplanation}
          </p>
        </div>

        <button
          onClick={retryLevel}
          style={{
            padding: '12px 32px', background: 'var(--color-critical)', color: 'white',
            border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
        >
          <RotateCcw size={16} /> Try Again
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/WinScreen.jsx src/components/FailScreen.jsx
git commit -m "feat: add WinScreen with confetti and FailScreen with blackout mode"
```

---

### Task 22: LevelSelect Overlay

**Files:**
- Create: `src/components/LevelSelect.jsx`

- [ ] **Step 1: Create LevelSelect.jsx**

```jsx
// src/components/LevelSelect.jsx

import { Lock, Check, ChevronRight, X } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS, TOTAL_LEVELS } from '../engine/LevelConfigs';

export default function LevelSelect() {
  const { showLevelSelect, toggleLevelSelect, unlockedLevel, level: currentLevel, loadLevel, stopSimulation } = useGameStore();

  if (!showLevelSelect) return null;

  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

  const handleSelect = (lvl) => {
    if (lvl > unlockedLevel) return;
    stopSimulation();
    loadLevel(lvl);
    toggleLevelSelect();
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="animate-slide-up" style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 20,
        padding: '32px',
        maxWidth: 480,
        width: '90%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Select Level</h2>
          <button
            onClick={toggleLevelSelect}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {levels.map(lvl => {
            const config = LEVEL_CONFIGS[lvl];
            const isLocked = lvl > unlockedLevel;
            const isCompleted = lvl < unlockedLevel;
            const isCurrent = lvl === currentLevel;

            return (
              <button
                key={lvl}
                onClick={() => handleSelect(lvl)}
                disabled={isLocked}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 12,
                  background: isCurrent ? 'var(--color-info-bg)' : 'var(--bg-tertiary)',
                  border: `1px solid ${isCurrent ? 'var(--color-info)' : 'var(--border-primary)'}`,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.4 : 1,
                  textAlign: 'left',
                  transition: 'all 150ms',
                  width: '100%',
                  color: 'inherit',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isCompleted ? 'var(--color-healthy-bg)' : isLocked ? 'var(--bg-primary)' : 'var(--color-info-bg)',
                  flexShrink: 0,
                }}>
                  {isLocked ? (
                    <Lock size={16} style={{ color: 'var(--text-muted)' }} />
                  ) : isCompleted ? (
                    <Check size={16} style={{ color: 'var(--color-healthy)' }} />
                  ) : (
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-info)' }}>{lvl}</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {config.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {config.subtitle}
                  </div>
                </div>
                {!isLocked && <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LevelSelect.jsx
git commit -m "feat: add LevelSelect overlay with lock/complete/current states"
```

---

### Task 23: Rewrite App.jsx — Wire Everything Together

**Files:**
- Modify: `src/App.jsx`
- Delete: `src/App.css`

- [ ] **Step 1: Rewrite App.jsx**

Replace entire content of `src/App.jsx`:

```jsx
// src/App.jsx

import React, { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import useGameStore from './store/useGameStore';

// Node types
import ServerNode from './game-nodes/ServerNode';
import DatabaseNode from './game-nodes/DatabaseNode';
import TrafficSourceNode from './game-nodes/TrafficSourceNode';
import LoadBalancerNode from './game-nodes/LoadBalancerNode';
import CacheNode from './game-nodes/CacheNode';
import CDNNode from './game-nodes/CDNNode';
import RegionNode from './game-nodes/RegionNode';
import ReplicaNode from './game-nodes/ReplicaNode';
import HealthCheckNode from './game-nodes/HealthCheckNode';

// UI components
import HUD from './components/HUD';
import ComponentTray from './components/ComponentTray';
import LevelIntro from './components/LevelIntro';
import WinScreen from './components/WinScreen';
import FailScreen from './components/FailScreen';
import LevelSelect from './components/LevelSelect';
import AnimatedEdge from './components/AnimatedEdge';

const nodeTypes = {
  server: ServerNode,
  database: DatabaseNode,
  trafficSource: TrafficSourceNode,
  loadBalancer: LoadBalancerNode,
  cache: CacheNode,
  cdn: CDNNode,
  region: RegionNode,
  replica: ReplicaNode,
  healthCheck: HealthCheckNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

export default function App() {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: storeSetNodes,
    setEdges: storeSetEdges,
    loadLevel,
    level,
    addNode,
    gameStatus,
  } = useGameStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef(null);
  const initialized = useRef(false);

  // Load level 1 on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      loadLevel(1);
    }
  }, [loadLevel]);

  // Sync store nodes → local React Flow nodes
  useEffect(() => {
    setNodes(storeNodes);
  }, [storeNodes, setNodes]);

  // Sync store edges → local React Flow edges
  useEffect(() => {
    setEdges(storeEdges);
  }, [storeEdges, setEdges]);

  // Sync local node changes back to store
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    // Update store with position changes
    const positionChanges = changes.filter(c => c.type === 'position' && c.position);
    if (positionChanges.length > 0) {
      storeSetNodes(nds =>
        nds.map(n => {
          const change = positionChanges.find(c => c.id === n.id);
          return change ? { ...n, position: change.position } : n;
        })
      );
    }
  }, [onNodesChange, storeSetNodes]);

  // On connect: add edge to both local and store
  const onConnect = useCallback((params) => {
    const newEdge = { ...params, id: `e-${params.source}-${params.target}`, animated: true };
    setEdges(eds => addEdge(newEdge, eds));
    storeSetEdges(eds => [...eds, newEdge]);
  }, [setEdges, storeSetEdges]);

  // Handle drop from component tray
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds) return;

    const position = {
      x: event.clientX - bounds.left - 180, // offset for tray width
      y: event.clientY - bounds.top - 72,     // offset for HUD height
    };

    addNode(type, position);
  }, [addNode]);

  // Sustain progress bar (how close to winning)
  const { sustainedTicks, metrics } = useGameStore();
  const config = useGameStore(s => s.level);

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <HUD />

      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        <ComponentTray />

        <div ref={reactFlowWrapper} style={{ flex: 1 }} onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{ type: 'animated', animated: true }}
            fitView
          >
            <Background color="var(--border-primary)" gap={24} size={1} />
            <Controls />
            <MiniMap
              nodeStrokeWidth={3}
              nodeColor={(node) => {
                const colorMap = {
                  server: 'var(--node-server)',
                  database: 'var(--node-database)',
                  loadBalancer: 'var(--node-loadbalancer)',
                  cache: 'var(--node-cache)',
                  cdn: 'var(--node-cdn)',
                  trafficSource: 'var(--node-traffic)',
                  region: 'var(--node-region)',
                  replica: 'var(--node-replica)',
                  healthCheck: 'var(--node-healthcheck)',
                };
                return colorMap[node.type] || '#666';
              }}
            />
          </ReactFlow>
        </div>
      </div>

      {/* Overlays */}
      <LevelIntro />
      <WinScreen />
      <FailScreen />
      <LevelSelect />
    </div>
  );
}
```

- [ ] **Step 2: Delete src/App.css**

Delete `src/App.css` — no longer used, all styles are in theme.css and inline.

- [ ] **Step 3: Commit**

```bash
git rm src/App.css
git add src/App.jsx
git commit -m "feat: rewrite App.jsx wiring all nodes, engine, overlays, and drag-to-add"
```

---

### Task 24: Sustain Progress Indicator

**Files:**
- Create: `src/components/SustainBar.jsx`
- Modify: `src/App.jsx` (add SustainBar import and render)

- [ ] **Step 1: Create SustainBar.jsx**

A bar at the bottom of the canvas showing how close the player is to sustaining the win condition.

```jsx
// src/components/SustainBar.jsx

import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS } from '../engine/LevelConfigs';

export default function SustainBar() {
  const { sustainedTicks, level, gameStatus } = useGameStore();
  const config = LEVEL_CONFIGS[level];

  if (gameStatus !== 'playing') return null;
  if (sustainedTicks === 0) return null;

  const requiredTicks = config.sustainSeconds * 2;
  const percent = Math.min((sustainedTicks / requiredTicks) * 100, 100);

  return (
    <div style={{
      position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-healthy)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Sustaining... {Math.round(percent)}%
      </span>
      <div style={{
        width: 300, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden',
        border: '1px solid var(--border-primary)',
      }}>
        <div style={{
          height: '100%', width: `${percent}%`,
          background: 'var(--color-healthy)',
          borderRadius: 3,
          transition: 'width 500ms ease',
          boxShadow: '0 0 8px var(--color-healthy-glow)',
        }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add SustainBar to App.jsx**

In `src/App.jsx`, add after the `<ComponentTray />` import:

```jsx
import SustainBar from './components/SustainBar';
```

And render it inside the canvas area, after `</ReactFlow>` closing tag and before the closing `</div>` of the canvas wrapper:

Add `<SustainBar />` right after the `</ReactFlow>` tag, inside the `ref={reactFlowWrapper}` div. The updated section becomes:

```jsx
        <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative' }} onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{ type: 'animated', animated: true }}
            fitView
          >
            <Background color="var(--border-primary)" gap={24} size={1} />
            <Controls />
            <MiniMap
              nodeStrokeWidth={3}
              nodeColor={(node) => {
                const colorMap = {
                  server: 'var(--node-server)',
                  database: 'var(--node-database)',
                  loadBalancer: 'var(--node-loadbalancer)',
                  cache: 'var(--node-cache)',
                  cdn: 'var(--node-cdn)',
                  trafficSource: 'var(--node-traffic)',
                  region: 'var(--node-region)',
                  replica: 'var(--node-replica)',
                  healthCheck: 'var(--node-healthcheck)',
                };
                return colorMap[node.type] || '#666';
              }}
            />
          </ReactFlow>
          <SustainBar />
        </div>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SustainBar.jsx src/App.jsx
git commit -m "feat: add SustainBar progress indicator for win condition"
```

---

### Task 25: Final Verification

- [ ] **Step 1: Run lint**

Run: `cd "/home/13843K/Desktop/Game:SystemDesign" && npm run lint`

Expected: No errors (warnings on unused vars with uppercase are OK).

- [ ] **Step 2: Run dev server and verify**

Run: `cd "/home/13843K/Desktop/Game:SystemDesign" && npm run dev`

Expected: App loads at localhost with dark theme. Level 1 intro overlay appears. Clicking "Start Mission" begins simulation. Component tray shows unlocked components. Nodes are draggable and connectable.

- [ ] **Step 3: Run build**

Run: `cd "/home/13843K/Desktop/Game:SystemDesign" && npm run build`

Expected: Build succeeds with no errors.

- [ ] **Step 4: Fix any issues found in steps 1-3**

Address lint errors, import issues, or build failures.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve lint and build issues from integration"
```
