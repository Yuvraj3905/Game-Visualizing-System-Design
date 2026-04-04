# Phase 1 Polish — Design Spec

## Overview

Complete the remaining Phase 1 gaps: radar chart for grading, ideal solution comparison in failure post-mortem, 7 new concept library entries, and mobile responsive layout.

---

## 1. Radar Chart for Architecture Grading

**File:** `src/components/WinScreen.jsx`

Replace the `GradeBar` horizontal bars with a `RadarChart` SVG component showing 4 axes: Cost, Latency, Resilience, Simplicity.

**Implementation:**
- New component `RadarChart` in `src/components/RadarChart.jsx`
- Pure SVG, no external dependencies
- 4-axis spider chart with labeled vertices
- Filled polygon for the player's scores (semi-transparent accent color)
- Grid lines at 25/50/75/100 for reference
- Score values displayed at each vertex
- Color-coded: green (80+), blue (60-79), yellow (40-59), red (<40)
- Props: `{ costScore, latencyScore, resilienceScore, complexityScore }`
- WinScreen imports RadarChart, passes grade scores, keeps letter grade display

**Removed:** `GradeBar` component and its 4 bar instances.

---

## 2. Ideal Solution Comparison in Failure Post-Mortem

**Files:** `src/engine/LevelConfigs.js`, `src/components/FailurePostMortem.jsx`

Add an expandable "Ideal Solution" section at the bottom of the post-mortem analysis.

**LevelConfigs changes:**
- Add `idealSolution` field to levels 1-15 (not sandbox level 0)
- Structure: `{ description: string, nodes: [{ type: string, label: string, count: number }], explanation: string }`
- Example for Level 1: `{ description: "Horizontal scaling with 3 servers", nodes: [{ type: 'trafficSource', label: 'Users', count: 1 }, { type: 'server', label: 'Web Server', count: 3 }, { type: 'database', label: 'SQL DB', count: 1 }], explanation: "Distribute traffic across multiple servers instead of relying on one." }`

**FailurePostMortem changes:**
- New section "Ideal Architecture" after the Suggestions section
- Collapsible (collapsed by default) — click to expand
- Shows node icons (reuse the same icon mapping from the bottleneck section) with labels and counts
- Arrow flow: left-to-right layout showing the ideal node chain
- Text explanation below the diagram
- Reads `idealSolution` from `LEVEL_CONFIGS[level]`

---

## 3. Seven New Concept Library Entries

**Directory:** `src/concepts/concepts/`

Each concept follows the established pattern: standalone JSX component with `useState`/`useCallback`, inline styles using CSS variables, interactive SVG or DOM visualization, ~150-250 lines.

### 3.1 Event Sourcing (`EventSourcing.jsx`)
- **Difficulty:** Advanced
- **Interactive:** Timeline of events (UserCreated, OrderPlaced, OrderShipped, OrderCancelled)
- Controls: Play forward, play backward, jump to event
- State panel shows current aggregate state at selected event
- Demonstrates rebuild-from-events and temporal queries

### 3.2 TCP vs UDP (`TcpVsUdp.jsx`)
- **Difficulty:** Beginner
- **Interactive:** Two lanes (TCP, UDP) showing packet transmission
- "Send Message" button splits message into 5 packets
- TCP lane: shows handshake, sequential delivery, retransmission on simulated drop
- UDP lane: shows fire-and-forget, some packets lost (random), out-of-order arrival
- Latency counter for each protocol
- Stats: packets sent, received, retransmitted

### 3.3 Circuit Breakers (`CircuitBreakers.jsx`)
- **Difficulty:** Intermediate
- **Interactive:** Service-to-service call visualization
- 3 states: Closed (green), Open (red), Half-Open (yellow)
- "Send Request" button fires requests to a flaky downstream service
- Failure counter triggers state transitions
- Visual state machine diagram with current state highlighted
- Shows failure threshold, timeout period, success threshold

### 3.4 DNS & Service Discovery (`DNSDiscovery.jsx`)
- **Difficulty:** Beginner
- **Interactive:** DNS resolution chain visualization
- Input: domain name to resolve
- Shows: Browser -> Recursive Resolver -> Root NS -> TLD NS -> Authoritative NS -> IP
- Each step animates with latency
- Toggle between DNS and service discovery (Consul/etcd style)
- Shows caching at each level with TTL countdown

### 3.5 ACID Transactions (`ACIDTransactions.jsx`)
- **Difficulty:** Intermediate
- **Interactive:** Two concurrent bank transfers
- Shows a table with account balances
- Run transactions with different isolation levels (Read Uncommitted, Read Committed, Serializable)
- Demonstrates dirty reads, phantom reads, lost updates
- Step-by-step execution with lock visualization

### 3.6 Consensus / Raft (`RaftConsensus.jsx`)
- **Difficulty:** Advanced
- **Interactive:** 5-node cluster visualization
- Leader election: click "Kill Leader" to trigger election
- Log replication: submit a value, watch it replicate to followers
- Shows terms, vote requests, heartbeats
- States: Leader (green), Follower (blue), Candidate (yellow)
- Majority quorum visualization

### 3.7 Back Pressure (`BackPressure.jsx`)
- **Difficulty:** Intermediate
- **Interactive:** Producer -> Queue -> Consumer pipeline
- Slider: producer rate (1-100 msgs/sec)
- Slider: consumer rate (1-50 msgs/sec)
- Queue visualization fills up as producer outpaces consumer
- 3 strategies toggle: Drop Tail, Drop Head, Block Producer
- Shows: messages produced, consumed, dropped, queue depth over time

**Registration:**
- Add all 7 to `CONCEPTS` array in `ConceptLibrary.jsx` with icons from lucide-react
- Add imports and component map entries in `ConceptViewer.jsx`

---

## 4. Mobile Responsive Layout

**Files:** `src/styles/theme.css`, `src/components/ComponentTray.jsx`, `src/components/HUD.jsx`

### Breakpoints
- **Tablet:** `max-width: 768px`
- **Phone:** `max-width: 480px`

### theme.css additions
Media queries for:
- `.game-node` — reduce min-width and padding on mobile
- `.react-flow__minimap` — hide on phone
- `.react-flow__controls` — smaller buttons on tablet

### ComponentTray changes
- **Tablet:** Collapse to a horizontal bottom bar with icon-only buttons, expandable on tap
- **Phone:** Collapse to a floating action button (FAB) in bottom-right, tap opens a radial/grid menu overlay
- Use `window.matchMedia` or CSS-only approach (prefer CSS with a media-query-driven class)

### HUD changes
- **Tablet:** Reduce font sizes, compact layout
- **Phone:** Show only Money, RPS, Latency (hide level timer details), stack vertically if needed

### Modal overlays (WinScreen, FailScreen, ConceptLibrary)
- Already use `width: '90%'` and `maxWidth` — mostly fine
- Reduce padding on phone, smaller font sizes

### General
- Add `<meta name="viewport" content="width=device-width, initial-scale=1">` if not present in `index.html`
- Touch-friendly: minimum 44px tap targets on mobile

---

## Out of Scope

- No new dependencies
- No TypeScript conversion
- No changes to simulation engine logic
- No new levels
- No backend/auth work
