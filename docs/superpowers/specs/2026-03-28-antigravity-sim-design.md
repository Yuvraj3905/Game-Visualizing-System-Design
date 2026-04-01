# Antigravity Sim — System Architect's Journey

A browser-based simulation game that teaches system design through 5 progressive levels. Players start with a single server and scale up to a fault-tolerant, globally distributed architecture. Open-source educational tool.

## Game Loop & Level Progression

**Core loop per level:**
1. Player sees the problem via a narrative intro card
2. Player gets a budget and unlocked components in the component tray
3. Player drags components onto the React Flow canvas and connects them with edges
4. Simulation runs continuously at 500ms ticks — traffic flows through the topology, metrics update live
5. Player ramps traffic toward the target RPS
6. **Win condition:** Sustain target traffic for 10 seconds without any fail state triggering
7. **Fail state:** Theatrical visual disaster + clear explanation of *why* it failed and *what concept* fixes it
8. On win: unlock next level, show educational summary card

**Progression model:** Linear unlock. Complete Level N to unlock Level N+1. Completed levels can be replayed. Level select screen shows lock/unlock/complete states.

**Critical rule:** Edges matter. Traffic flows along the edge graph. Disconnected nodes receive zero traffic. Players must build correct topology, not just add components.

## The 5 Levels

### Level 1: "The Monolith" — Vertical vs. Horizontal Scaling
- **Budget:** $500
- **Unlocked:** Server, SQL Database, Traffic Source
- **Target:** Handle 1,000 RPS
- **Setup:** One server, one DB, one traffic source
- **Win:** Add enough servers to handle 1,000 RPS without any single server exceeding capacity
- **Fail state:** Server catches fire (shake + fire particles) when RPS > capacity
- **Lesson:** "You just learned horizontal scaling — adding more machines instead of upgrading one."

### Level 2: "The Distribution" — Load Balancing
- **Budget:** $2,000
- **Unlocked:** Load Balancer (Round Robin)
- **Target:** Handle 3,000 RPS
- **Setup:** 3 servers pre-placed, but traffic only hits Server 1 (no LB connected)
- **Win:** Connect a Load Balancer so traffic distributes evenly and all servers share load
- **Fail state:** Server 1 crashes while Server 2 and 3 sit at 0% load
- **Lesson:** "Load balancers distribute traffic evenly — this is how every major website works."

### Level 3: "The Speed Demon" — Caching
- **Budget:** $3,000
- **Unlocked:** Cache (Redis)
- **Target:** Handle 5,000 RPS at < 100ms latency
- **Setup:** LB + servers + DB already connected, but DB is the bottleneck
- **Win:** Add a cache layer between servers and DB. Cache warms up over time, reducing DB load and latency
- **Fail state:** Latency bar turns red — DB doing full table scans for every request
- **Lesson:** "Caching stores frequent results in memory — Redis handles millions of reads/sec."

### Level 4: "The Global Expansion" — CDNs & Regions
- **Budget:** $5,000
- **Unlocked:** CDN, Region containers
- **Target:** Handle 8,000 RPS from 3 regions (US, India, Europe) with < 200ms latency per region
- **Setup:** All infrastructure in one region (India). US/Europe users get 300ms+ latency
- **Win:** Deploy CDN and multi-region servers so each region has < 200ms latency
- **Fail state:** High "Bounced Users" counter from distant regions
- **Lesson:** "CDNs and multi-region deployment reduce latency by serving users from nearby locations."

### Level 5: "The Unstoppable App" — Fault Tolerance
- **Budget:** $8,000
- **Unlocked:** Database Replica (Read Replica), Health Check
- **Target:** Survive a data center failure while maintaining > 50% RPS capacity
- **Setup:** Full stack in one region. A timed disaster event kills the primary DB
- **Win:** Set up DB replication and health checks so traffic reroutes when primary fails
- **Fail state:** Total blackout — screen goes dark, "SYSTEM DOWN" overlay
- **Lesson:** "Replication and health checks give you high availability — no single point of failure."

## Node Types

| Node | Icon | Introduced | Behavior |
|------|------|------------|----------|
| Traffic Source | Antenna/broadcast | Level 1 | Emits RPS. In Level 4, splits into regional sources |
| Server | Rack/box | Level 1 | Processes requests up to capacity. Overload = crash |
| SQL Database | Cylinder | Level 1 | Handles queries up to QPS limit. Bottleneck without cache |
| Load Balancer | Split-arrow | Level 2 | Round-robin distributes incoming traffic to connected servers |
| Cache (Redis) | Lightning bolt | Level 3 | Intercepts reads. Hit rate climbs over time, reducing DB load |
| CDN | Globe | Level 4 | Serves static/cached content from edge, reducing origin load |
| Region | Dashed container | Level 4 | Visual grouping. Nodes inside a region inherit its geo-latency |
| Database Replica | Cylinder + copy badge | Level 5 | Read replica offloads read queries from master DB |
| Health Check | Heartbeat/pulse | Level 5 | Monitors connected nodes, detects failures, triggers reroute |

## UI/UX Design

### Visual Identity
- **Theme:** Dark slate background with "mission control" aesthetic
- **Fonts:** Inter (UI), JetBrains Mono (metrics/numbers) — already loaded
- **Color language:**
  - Green: healthy / under capacity
  - Amber: warning / 70%+ load
  - Red: critical / overloaded / fail state
  - Blue: info / traffic flow
  - Colors transition smoothly, never jump

### Animated Traffic Flow
Edges render as custom React Flow edges with animated dots flowing along them. Dot speed and density scale with traffic volume. This is the key visual that makes the system feel alive.

### Node Visuals
- Each node type has a distinct icon, shape, and color accent
- Load bars inside nodes fill with color-coded gradients (green → amber → red)
- Shared effects via NodeWrapper: subtle glow (healthy), shake (warning), fire/smoke particles (overloaded)

### Fail States (Theatrical)
- **Server overload:** Node shakes, turns red, fire/smoke particle effect
- **Latency spike:** Screen edge pulses red, latency counter animates rapidly
- **Bounced users:** User icons visually "leave" with a frustrated animation
- **Total blackout:** Screen flickers dark, "SYSTEM DOWN" overlay with terminal-style text

### Win States (Rewarding)
- All metrics animate to green
- Confetti/particle burst
- Educational card slides in explaining what they learned and real-world examples

### Layout
- **Top:** HUD dashboard — pill-shaped stat cards for Budget, RPS, Latency, System Health with micro-animations on value change
- **Left:** Component Tray — draggable unlocked components. Locked components visible but grayed with lock icon
- **Center:** React Flow canvas — main interaction area
- **Overlays:** Level Intro (narrative card), Win Screen, Fail Screen

## Simulation Engine Architecture

### Modular Simulators
Each system design concept is its own module in `engine/simulators/`:

- **TrafficSimulator** — generates RPS, handles ramp-up curves, regional traffic splits
- **LoadBalancerSimulator** — round-robin distribution across connected servers via edges
- **CacheSimulator** — tracks hit rate over time, calculates DB load reduction
- **GeoLatencySimulator** — distance-based latency penalties, bounce rate for distant users
- **FailoverSimulator** — random failure events, health check detection, rerouting

### Supporting Engine Files
- **LevelOrchestrator** — knows which simulators are active per level, runs the tick loop, checks win/fail conditions
- **LevelConfigs** — all 5 level definitions (budget, targets, unlocked components, win/fail thresholds, narrative text)
- **MetricsCollector** — aggregates outputs from all active simulators into HUD stats
- **TopologyWalker** — walks the edge graph to determine traffic paths through connected nodes

### Tick Loop (500ms)
Each tick:
1. Traffic source emits RPS
2. TopologyWalker resolves traffic paths through the edge graph
3. Active simulators process their nodes and update state
4. MetricsCollector computes aggregate stats (total RPS, avg latency, system health %)
5. Win/fail conditions evaluated against level config thresholds
6. Zustand store updates → React re-renders

### Topology Enforcement
The engine walks the actual React Flow edge graph. Disconnected nodes get zero traffic. Incorrect topology still "runs" but won't meet win conditions — the player must figure out the right architecture.

## File Structure

```
src/
├── App.jsx                     # Main layout — canvas + HUD + sidebar
├── main.jsx
├── index.css                   # Global styles, dark theme, fonts
│
├── store/
│   └── useGameStore.js         # Zustand — game state, level progression, unlocks
│
├── engine/
│   ├── LevelOrchestrator.js    # Composes modules per level, runs tick loop
│   ├── LevelConfigs.js         # All 5 level definitions
│   ├── MetricsCollector.js     # Aggregates stats from all modules
│   ├── TopologyWalker.js       # Walks edge graph to route traffic
│   ├── simulators/
│   │   ├── TrafficSimulator.js
│   │   ├── LoadBalancerSimulator.js
│   │   ├── CacheSimulator.js
│   │   ├── GeoLatencySimulator.js
│   │   └── FailoverSimulator.js
│
├── game-nodes/                 # React Flow custom node components
│   ├── ServerNode.jsx
│   ├── DatabaseNode.jsx
│   ├── LoadBalancerNode.jsx
│   ├── CacheNode.jsx
│   ├── CDNNode.jsx
│   ├── RegionNode.jsx
│   ├── TrafficSourceNode.jsx
│   ├── HealthCheckNode.jsx
│   └── ReplicaNode.jsx
│
├── components/                 # UI components
│   ├── HUD.jsx                 # Top dashboard bar
│   ├── ComponentTray.jsx       # Left sidebar — draggable components
│   ├── LevelSelect.jsx         # Level picker with lock/unlock states
│   ├── LevelIntro.jsx          # Narrative card at level start
│   ├── WinScreen.jsx           # Victory overlay with lesson summary
│   ├── FailScreen.jsx          # Dramatic fail overlay with explanation
│   ├── AnimatedEdge.jsx        # Custom React Flow edge with flowing dots
│   └── NodeWrapper.jsx         # Shared glow, shake, fire effects
│
├── styles/
│   └── theme.css               # Dark theme variables, animations, keyframes
│
├── utils/
│   └── graphUtils.js           # Edge traversal helpers, adjacency list builder
```

### Separation of Concerns
- `engine/` — pure JavaScript logic, no React imports, independently testable
- `game-nodes/` — React Flow custom node rendering components
- `components/` — UI chrome (HUD, overlays, tray)
- `store/` — Zustand state management, wires engine to UI

## Tech Stack
- React 19 + Vite 8 (already configured)
- React Flow 11 (already installed) — canvas, nodes, edges, minimap
- Zustand 5 (already installed) — state management
- Lucide React (already installed) — icons for node types
- CSS custom properties + keyframe animations for theme and effects
- No additional dependencies needed
