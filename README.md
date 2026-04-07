<p align="center">
  <img src="public/favicon.svg" width="80" alt="System Design Sim Logo" />
</p>

<h1 align="center">System Design Sim</h1>

<p align="center">
  <strong>Learn System Design by Building Infrastructure</strong>
</p>

<p align="center">
  A browser-based game where you design, scale, and stress-test server infrastructure.
  <br />
  Drag servers, wire up load balancers, add caches — then spike traffic and watch what happens.
</p>

<p align="center">
  <a href="https://yuvraj3905.github.io/Game-Visualizing-System-Design/">Play Now</a> &nbsp;&bull;&nbsp;
  <a href="#features">Features</a> &nbsp;&bull;&nbsp;
  <a href="#levels">Levels</a> &nbsp;&bull;&nbsp;
  <a href="#concept-library">Concept Library</a> &nbsp;&bull;&nbsp;
  <a href="#architecture">Architecture</a> &nbsp;&bull;&nbsp;
  <a href="#contributing">Contributing</a>
</p>

---

## What Is This?

System Design Sim is an interactive, visual system design simulator. Instead of reading about load balancers and caches in a textbook, you **build** them — drag components onto a canvas, wire them together, and see if your architecture survives under real traffic.

**[Play it here](https://yuvraj3905.github.io/Game-Visualizing-System-Design/)**

---

## Features

- **15 levels** — from "what's a server?" to designing Netflix's CDN
- **5 real-world scenarios** — modeled after Twitter, Uber, Netflix, WhatsApp, Stripe
- **15 interactive concept playgrounds** — CAP theorem, consistent hashing, Raft consensus, ACID transactions, and more
- **Architecture grading** — S/A/B/C/D/F scores with radar chart visualization on cost, latency, resilience, simplicity
- **Failure post-mortems** — bottleneck analysis, cascade visualization, smart fix suggestions, ideal solution comparison
- **Mobile responsive** — adapts layout for tablet and phone with collapsible component tray
- **Daily Challenge** — same level for all players each day, streak tracking, 7-day history
- **Sandbox mode** — unlimited budget, all components, no objectives
- **Export as PNG** — download your architecture diagram as a shareable image
- **Synthesized sound effects & music** — all generated via Web Audio API, zero audio files
- **Guided tour & tooltips** — onboarding for new players, hover tooltips on everything
- **Live objective panel** — real-time checklist with completion counter
- **Sell-back & delete** — undo purchases (75% refund), delete edges with Delete key
- **Session persistence** — progress saved to localStorage, resume where you left off
- **Deep-dive references** — curated links to real-world engineering blogs on every win screen
- **Dev mode** — `?dev=true` for jump-to-level, unlock all, add budget, force win

---

## Levels

### Tutorial Levels (1-10)

| Level | Name | Concept |
|:-----:|------|---------|
| 1 | The Monolith | Horizontal scaling |
| 2 | The Distribution | Load balancing |
| 3 | The Speed Demon | Caching |
| 4 | The Global Expansion | CDNs & multi-region |
| 5 | The Unstoppable App | Fault tolerance & failover |
| 6 | The Gatekeeper | Rate limiting & API gateway |
| 7 | The Decoupler | Message queues & async processing |
| 8 | The Split | Microservices |
| 9 | The Elastic Cloud | Auto-scaling |
| 10 | Chaos Engineering | Fault injection & circuit breakers |

### Real-World Scenarios (11-15)

| Level | Name | Based On |
|:-----:|------|----------|
| 11 | Build Twitter's Feed | Fan-out, timeline caching |
| 12 | Scale Uber's Matching | Real-time geo matching, queues |
| 13 | Design Netflix Streaming | Global CDN, edge computing |
| 14 | WhatsApp Message Delivery | Guaranteed delivery, async |
| 15 | Stripe's Payment Pipeline | Exactly-once processing, failover |

---

## Concept Library

Click the **"Learn"** button in the toolbar to access 15 interactive system design playgrounds:

| Concept | What You Can Do |
|---------|----------------|
| **CAP Theorem** | Click vertices on a triangle to pick 2-of-3, see which databases fit each combination |
| **Consistent Hashing** | Add/remove servers on a hash ring, watch keys redistribute with minimal movement |
| **Database Sharding** | Toggle shard keys, see data distribute across shards, detect hot shards |
| **Load Balancing** | Fire requests through round-robin / least-connections / weighted, watch animated distribution |
| **Caching Strategies** | Step-by-step animation of write-through / write-behind / cache-aside with latency counter |
| **Replication** | Toggle leader-follower / multi-leader / leaderless, kill the leader, watch failover |
| **Message Queues** | Send messages through point-to-point / pub-sub / fan-out, watch delivery patterns |
| **Rate Limiting** | Test token bucket / sliding window / fixed window with burst and steady stream |
| **Event Sourcing** | Replay events forward/backward on a timeline, watch aggregate state rebuild |
| **TCP vs UDP** | Send packets over both protocols — compare reliability, speed, and packet loss |
| **Circuit Breakers** | Trip the breaker on failures, watch requests get blocked to prevent cascading outages |
| **DNS & Service Discovery** | Trace the DNS resolution chain from browser to authoritative nameserver with caching |
| **ACID Transactions** | Run concurrent transactions at different isolation levels, spot dirty reads and lost updates |
| **Raft Consensus** | Kill the leader, watch elections, replicate log entries across a 5-node cluster |
| **Back Pressure** | Adjust producer/consumer rates, compare drop-tail, drop-head, and block-producer strategies |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9

### Installation

```bash
git clone https://github.com/Yuvraj3905/Game-Visualizing-System-Design.git
cd Game-Visualizing-System-Design
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## How to Play

1. **Read the mission briefing** — each level tells you what problem you're solving
2. **Drag components** from the left tray onto the canvas (or click to add)
3. **Connect nodes** by dragging between the blue handles on each node
4. **Click "Spike Traffic"** to increase load and test your architecture
5. **Watch the objective panel** (bottom-right) — goals check off in real-time
6. **Sustain** the win conditions to complete the level
7. **Review your grade** — optimize for cost, latency, resilience, and simplicity

### Tips

- Hover over any UI element for a tooltip explaining what it does
- First-time players get a guided tour (restart anytime via the **?** button)
- **Sell back** purchased nodes (click the red X) for a 75% refund
- **Delete connections** by clicking an edge and pressing `Delete`
- New nodes pulse their handles when unconnected — drag an edge to wire them up
- The sustain bar shows elapsed time (e.g. "4.5s / 10s")
- Click **"Learn"** to explore interactive concept playgrounds anytime
- Use **Sandbox Mode** (from Level Select) to experiment with no restrictions
- **Export** your architecture as a PNG to share with others

### Dev Mode

Add `?dev=true` to the URL for:
- Jump to any level (1-15)
- Unlock all levels
- Add budget (+$5k / +$50k)
- Skip intro, force win

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [React 19](https://react.dev/) |
| Build Tool | [Vite 8](https://vite.dev/) |
| Graph Canvas | [React Flow 11](https://reactflow.dev/) |
| State Management | [Zustand 5](https://zustand.docs.pmnd.rs/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Audio | Web Audio API (synthesized, zero audio files) |
| Styling | CSS Variables + Inline Styles (dark theme) |

---

## Architecture

```
src/
├── App.jsx                      # Main app — React Flow canvas, layout, routing
├── store/
│   └── useGameStore.js          # Zustand store — single source of truth
├── audio/
│   └── SoundEngine.js           # Synthesized sound effects & background music
├── engine/
│   ├── LevelConfigs.js          # 15 level definitions + sandbox config
│   ├── LevelOrchestrator.js     # Main simulation loop (500ms ticks)
│   ├── MetricsCollector.js      # Capacity, latency, health calculations
│   ├── TopologyWalker.js        # Graph traversal for traffic distribution
│   ├── ObjectiveChecklist.js    # Per-level win condition checklists
│   ├── ArchitectureGrader.js    # Post-win grading (cost/latency/resilience/simplicity)
│   ├── DailyChallenge.js       # Daily challenge logic, localStorage, streak tracking
│   └── simulators/
│       ├── TrafficSimulator.js
│       ├── LoadBalancerSimulator.js
│       ├── CacheSimulator.js
│       ├── GeoLatencySimulator.js
│       ├── FailoverSimulator.js
│       ├── RateLimiterSimulator.js
│       ├── QueueSimulator.js
│       ├── AutoScalerSimulator.js
│       ├── ChaosSimulator.js
│       └── ServiceMeshSimulator.js
├── game-nodes/                  # 14 custom React Flow node components
│   ├── ServerNode.jsx
│   ├── DatabaseNode.jsx
│   ├── LoadBalancerNode.jsx
│   ├── CacheNode.jsx
│   ├── CDNNode.jsx
│   ├── TrafficSourceNode.jsx
│   ├── APIGatewayNode.jsx
│   ├── MessageQueueNode.jsx
│   ├── WorkerNode.jsx
│   ├── AutoScalerNode.jsx
│   ├── CircuitBreakerNode.jsx
│   ├── RegionNode.jsx
│   ├── ReplicaNode.jsx
│   ├── HealthCheckNode.jsx
│   └── DeletableNodeWrapper.jsx
├── components/
│   ├── HUD.jsx                  # Top stats bar + toolbar buttons
│   ├── ComponentTray.jsx        # Left sidebar with draggable components
│   ├── ObjectivePanel.jsx       # Live objective checklist (bottom-right)
│   ├── GuidedTour.jsx           # Step-by-step onboarding tour
│   ├── Tooltip.jsx              # Reusable hover tooltip
│   ├── SustainBar.jsx           # Win condition progress bar
│   ├── AnimatedEdge.jsx         # Flowing dot edge animation
│   ├── LevelIntro.jsx           # Level briefing modal
│   ├── DailyChallengeButton.jsx  # HUD button with streak badge
│   ├── DailyChallengeModal.jsx  # Daily challenge info, start, results, history
│   ├── RadarChart.jsx            # SVG radar chart for architecture grading
│   ├── WinScreen.jsx            # Victory screen + radar grade card + references
│   ├── FailScreen.jsx           # Failure screen + post-mortem analysis
│   ├── FailurePostMortem.jsx    # Bottleneck analysis, failure chain, suggestions
│   ├── LevelSelect.jsx          # Level selection + sandbox mode
│   ├── ExportButton.jsx         # Export architecture as PNG
│   ├── SandboxMode.jsx          # Sandbox mode banner
│   └── DevPanel.jsx             # Dev tools (?dev=true)
├── concepts/
│   ├── ConceptLibrary.jsx       # Concept card grid modal
│   ├── ConceptViewer.jsx        # Concept viewer shell + routing
│   └── concepts/
│       ├── CAPTheorem.jsx
│       ├── ConsistentHashing.jsx
│       ├── DatabaseSharding.jsx
│       ├── LoadBalancingAlgos.jsx
│       ├── CachingStrategies.jsx
│       ├── Replication.jsx
│       ├── MessageQueuePatterns.jsx
│       ├── RateLimiting.jsx
│       ├── EventSourcing.jsx
│       ├── TcpVsUdp.jsx
│       ├── CircuitBreakers.jsx
│       ├── DNSDiscovery.jsx
│       ├── ACIDTransactions.jsx
│       ├── RaftConsensus.jsx
│       └── BackPressure.jsx
└── styles/
    └── theme.css                # CSS variables, animations, node styles
```

### Key Design Decisions

- **Zustand store is the single source of truth.** React Flow's local state syncs from the store via `useEffect`.
- **Simulation engine is pure functions.** `runTick()` takes state, returns updates — no side effects.
- **Simulators are modular.** Each level activates only the simulators it needs via `activeSimulators`.
- **Zero external UI/audio libraries.** Tooltips, tour, sound effects, and concept visualizations are all custom-built.
- **All sounds synthesized.** Web Audio API oscillators generate every click, alarm, and music note — no audio files.
- **Traffic follows the graph topology.** `TopologyWalker` does DFS through edges to distribute RPS.
- **Concept playgrounds are self-contained.** Each uses SVG + requestAnimationFrame with proper cleanup.

---

## Contributing

Contributions are welcome! Here are some ideas:

- Accessibility improvements (screen reader labels, keyboard navigation, high contrast)
- Write tests (no test framework configured yet)
- Add more levels beyond 15
- Metrics dashboard with live charts (RPS/latency over time)
- Multiplayer co-op mode
- Custom level editor
- Localization / i18n

### How to Contribute

```bash
# 1. Fork the repo
# 2. Create your branch
git checkout -b feature/my-feature

# 3. Make your changes
# 4. Lint before committing
npm run lint

# 5. Build to verify
npm run build

# 6. Commit and push
git add .
git commit -m "feat: description of your change"
git push origin feature/my-feature

# 7. Open a Pull Request
```

### Code Style

- Plain JavaScript/JSX (no TypeScript)
- Inline styles using CSS variables from `theme.css`
- Functional components with hooks
- State changes go through the Zustand store
- Simulation logic stays in `src/engine/` as pure functions
- SVG for concept visualizations, Canvas API for export

---

## Vision

See [`docs/VISION.md`](docs/VISION.md) for the full product roadmap — from daily challenges and leaderboards to an AI architecture reviewer and multiplayer mode.

---

## License

This project is open source. Feel free to use, modify, and distribute.

---

<p align="center">
  Built with React + Vite + React Flow + Zustand + Web Audio API
  <br />
  <sub>Learn system design the fun way.</sub>
</p>
