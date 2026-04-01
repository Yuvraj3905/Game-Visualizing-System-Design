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
  <a href="#getting-started">Getting Started</a> &nbsp;&bull;&nbsp;
  <a href="#how-to-play">How to Play</a> &nbsp;&bull;&nbsp;
  <a href="#levels">Levels</a> &nbsp;&bull;&nbsp;
  <a href="#architecture">Architecture</a> &nbsp;&bull;&nbsp;
  <a href="#contributing">Contributing</a>
</p>

---

## What Is This?

System Design Sim is an interactive, visual system design simulator. Instead of reading about load balancers and caches in a textbook, you **build** them — drag components onto a canvas, wire them together, and see if your architecture survives under real traffic.

Each level introduces a core infrastructure concept:

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

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9

### Installation

```bash
# Clone the repository
git clone https://github.com/Yuvraj3905/Game-Visualizing-System-Design.git
cd Game-Visualizing-System-Design

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other Commands

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
5. **Watch the objective panel** (bottom-right) — goals check off in real-time as you meet them
6. **Sustain** the win conditions for 10 seconds to complete the level

### Tips

- Hover over any UI element for a tooltip explaining what it does
- First-time players get a guided tour (restart it anytime via the **?** button)
- You can **sell back** purchased nodes (click the red X) for a 75% refund
- You can **delete connections** by clicking an edge and pressing `Delete`
- Budget is limited — plan your architecture before spending
- New nodes pulse their handles when unconnected — drag an edge to wire them up
- The sustain bar shows elapsed time so you know how long you need to hold

### Live Demo

**[Play it here](https://yuvraj3905.github.io/Game-Visualizing-System-Design/)**

### Dev Mode

Add `?dev=true` to the URL to access the dev panel with:
- Jump to any level (1-10)
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
| Styling | CSS Variables + Inline Styles (dark theme) |

---

## Architecture

```
src/
├── App.jsx                      # Main app — React Flow canvas, layout, routing
├── store/
│   └── useGameStore.js          # Zustand store — single source of truth for all game state
├── engine/
│   ├── LevelConfigs.js          # Level definitions (budget, nodes, win/fail conditions)
│   ├── LevelOrchestrator.js     # Main simulation loop — runs every 500ms tick
│   ├── MetricsCollector.js      # Calculates capacity, latency, health from game state
│   ├── TopologyWalker.js        # Graph traversal — distributes traffic through edges
│   ├── ObjectiveChecklist.js    # Per-level win condition checklist definitions
│   └── simulators/
│       ├── TrafficSimulator.js        # Traffic ramp-up
│       ├── LoadBalancerSimulator.js   # Round-robin distribution
│       ├── CacheSimulator.js          # Cache hit rate simulation
│       ├── GeoLatencySimulator.js     # Multi-region latency + bounce rate
│       ├── FailoverSimulator.js       # Database failure + replica failover
│       ├── RateLimiterSimulator.js    # API gateway rate limiting
│       ├── QueueSimulator.js          # Message queue depth + drain
│       ├── AutoScalerSimulator.js     # Dynamic capacity scaling
│       ├── ChaosSimulator.js          # Random failure injection
│       └── ServiceMeshSimulator.js    # Inter-service latency
├── game-nodes/                  # Custom React Flow node components
│   ├── ServerNode.jsx           # Web server with load bar
│   ├── DatabaseNode.jsx         # SQL database with QPS meter
│   ├── LoadBalancerNode.jsx     # Traffic distributor
│   ├── CacheNode.jsx            # Redis cache with hit rate bar
│   ├── CDNNode.jsx              # Content delivery network
│   ├── TrafficSourceNode.jsx    # User traffic generator
│   ├── APIGatewayNode.jsx       # Rate limiter / API gateway
│   ├── MessageQueueNode.jsx     # Async message buffer
│   ├── WorkerNode.jsx           # Background job processor
│   ├── AutoScalerNode.jsx       # Dynamic capacity scaler
│   ├── CircuitBreakerNode.jsx   # Failure isolation switch
│   ├── RegionNode.jsx           # Geographic region container
│   ├── ReplicaNode.jsx          # Read replica for failover
│   ├── HealthCheckNode.jsx      # Node health monitor
│   └── DeletableNodeWrapper.jsx # HOC adding sell-back button to user-added nodes
├── components/                  # UI components
│   ├── HUD.jsx                  # Top stats bar (budget, traffic, latency, health)
│   ├── ComponentTray.jsx        # Left sidebar with draggable node palette
│   ├── ObjectivePanel.jsx       # Bottom-right live objective checklist
│   ├── GuidedTour.jsx           # Step-by-step onboarding spotlight tour
│   ├── Tooltip.jsx              # Reusable hover tooltip component
│   ├── SustainBar.jsx           # Win condition sustain progress bar
│   ├── AnimatedEdge.jsx         # Custom edge with flowing dot animation
│   ├── LevelIntro.jsx           # Level start briefing modal
│   ├── WinScreen.jsx            # Victory screen with confetti
│   ├── FailScreen.jsx           # Failure screen with explanation
│   └── LevelSelect.jsx          # Level selection modal
└── styles/
    └── theme.css                # CSS variables, animations, node styles
```

### Key Design Decisions

- **Zustand store is the single source of truth.** React Flow's local state syncs from the store via `useEffect`.
- **Simulation engine is pure functions.** `runTick()` takes state, returns updates — no side effects. Makes it easy to test and extend.
- **Simulators are modular.** Each level activates only the simulators it needs via `activeSimulators`.
- **No external tooltip/tour libraries.** All onboarding UI is custom-built and lightweight.
- **Traffic distribution follows the graph topology.** The `TopologyWalker` does DFS traversal through edges to distribute RPS.

---

## Contributing

Contributions are welcome! Here are great ways to help:

### Contribution Ideas

- Add sound effects / background music
- Add a metrics dashboard / graphs panel
- Mobile responsiveness
- Accessibility improvements
- Add a sandbox/freeplay mode with no win/fail conditions
- Write tests (no test framework configured yet)
- Add more levels beyond 10 (see [`docs/new-levels-plan.md`](docs/new-levels-plan.md) for the pattern)

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
- Keep node components focused — use the `DeletableNodeWrapper` HOC pattern for cross-cutting concerns

---

## License

This project is open source. Feel free to use, modify, and distribute.

---

<p align="center">
  Built with React + Vite + React Flow + Zustand
  <br />
  <sub>Learn system design the fun way.</sub>
</p>
