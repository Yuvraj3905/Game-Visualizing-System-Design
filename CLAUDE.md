# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Antigravity Sim" — a browser-based game where players design and scale server infrastructure. Players manage a budget, add servers, spike traffic, and observe how capacity and latency respond. Built as a React + Vite SPA using React Flow for the visual node-based canvas.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build locally
- `npm run lint` — run ESLint (flat config, JS/JSX only)

No test framework is configured.

## Architecture

**State management:** Zustand store (`src/store/useGameStore.js`) holds all game state — money, traffic (rps), latency, level, nodes, edges. This is the single source of truth. React Flow's local node/edge state in `App.jsx` syncs from the store via `useEffect`.

**Simulation engine:** Pure functions in `src/engine/SimulationEngine.js` handle the math — capacity aggregation, latency calculation (load-based with congestion factor), and even traffic distribution across nodes. These are called by the store's `updateTraffic` action.

**Level system:** `src/engine/LevelConfigs.js` defines per-level parameters (budget, traffic targets, latency, congestion). Currently levels 1 ("The Monolith") and 2 ("Scaling Out") exist.

**Custom React Flow nodes:** `src/game-nodes/ServerNode.jsx` renders server nodes with a load bar that turns red/pulses when overloaded (rps > capacity).

**Styling:** Utility classes (Tailwind-style) used inline. `src/index.css` imports Inter and JetBrains Mono fonts. `src/App.css` is leftover Vite template CSS (mostly unused).

## Key Design Decisions

- Node positions are randomized on creation — no layout algorithm yet
- Traffic is distributed evenly across all nodes (round-robin), not based on edges/connections
- Edges exist in React Flow UI but don't affect simulation logic
- No TypeScript — plain JS/JSX with `@types/react` for editor support only
- ESLint `no-unused-vars` ignores uppercase/underscore-prefixed variables
