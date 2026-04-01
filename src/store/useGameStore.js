import { create } from 'zustand';
import { LEVEL_CONFIGS, TOTAL_LEVELS } from '../engine/LevelConfigs.js';
import { runTick } from '../engine/LevelOrchestrator.js';

const useGameStore = create((set, get) => ({
  // Level progression
  level: 1,
  unlockedLevel: 1,
  gameStatus: 'intro',
  showLevelSelect: false,
  showTour: false,
  budgetShake: false,

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
  queueState: {},
  rateLimiterState: {},
  autoScalerState: {},
  chaosState: {},
  tickInterval: null,

  // Metrics
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

  // Load a level
  loadLevel: (levelNum) => {
    const config = LEVEL_CONFIGS[levelNum];
    if (!config) return;

    const { tickInterval } = get();
    if (tickInterval) clearInterval(tickInterval);

    set({
      level: levelNum,
      gameStatus: 'intro',
      showLevelSelect: false,
      money: config.budget,
      rps: 0,
      targetRps: 0,
      latency: config.baseLatency,
      nodes: config.initialNodes.map(n => ({ ...n, data: { ...n.data, isInitial: true } })),
      edges: config.initialEdges.map(e => ({ ...e, isInitial: true })),
      simulationRunning: false,
      tickCount: 0,
      sustainedTicks: 0,
      cacheState: {},
      failoverState: {},
      queueState: {},
      rateLimiterState: {},
      autoScalerState: {},
      chaosState: {},
      tickInterval: null,
      metrics: {
        rps: 0, totalCapacity: 0, overloadedServers: 0,
        dbLoad: 0, dbCapacity: 0, avgCacheHitRate: 0,
        avgLatency: 0, maxRegionLatency: 0, bouncedUsers: 0,
        healthPercent: 100, systemDown: false, survivedDisaster: false,
      },
    });
  },

  startSimulation: () => {
    const { tickInterval: existingInterval } = get();
    if (existingInterval) clearInterval(existingInterval);

    set({ gameStatus: 'playing', simulationRunning: true });

    const interval = setInterval(() => {
      const state = get();
      if (!state.simulationRunning) return;

      const updates = runTick(state);
      if (Object.keys(updates).length > 0) {
        set(updates);

        if (updates.gameStatus === 'won') {
          get().onWin();
        } else if (updates.gameStatus === 'failed') {
          get().onFail();
        }
      }
    }, 500);

    set({ tickInterval: interval });
  },

  stopSimulation: () => {
    const { tickInterval } = get();
    if (tickInterval) clearInterval(tickInterval);
    set({ simulationRunning: false, tickInterval: null });
  },

  setTargetTraffic: (target) => {
    set({ targetRps: target });
  },

  setMoney: (amount) => {
    set({ money: amount });
  },

  addNode: (type, position) => {
    const { money, nodes, level } = get();
    const config = LEVEL_CONFIGS[level];
    const cost = config.nodeCosts[type] || 0;

    if (money < cost) {
      set({ budgetShake: true });
      setTimeout(() => set({ budgetShake: false }), 500);
      return false;
    }

    const defaults = {
      server: { label: 'Web Server', rps: 0, capacity: 1000, status: 'healthy' },
      database: { label: 'SQL Database', rps: 0, capacity: 2000, status: 'healthy' },
      loadBalancer: { label: 'Load Balancer', rps: 0, algorithm: 'round-robin', status: 'healthy' },
      cache: { label: 'Redis Cache', rps: 0, hitRate: 0, status: 'healthy' },
      cdn: { label: 'CDN', rps: 0, cacheRate: 0.3, status: 'healthy' },
      region: { label: 'Region', region: 'custom' },
      replica: { label: 'Read Replica', rps: 0, capacity: 3000, status: 'healthy' },
      healthCheck: { label: 'Health Check', rps: 0, status: 'healthy' },
      apiGateway: { label: 'API Gateway', rps: 0, rateLimit: 10000, blocked: 0, status: 'healthy' },
      messageQueue: { label: 'Message Queue', rps: 0, depth: 0, maxDepth: 5000, status: 'healthy' },
      worker: { label: 'Worker', rps: 0, capacity: 2000, status: 'healthy' },
      autoScaler: { label: 'Auto-Scaler', rps: 0, instanceCount: 0, scaleUpThreshold: 0.7, scaleDownThreshold: 0.3, cooldown: 3, status: 'healthy' },
      circuitBreaker: { label: 'Circuit Breaker', rps: 0, cbState: 'closed', failures: 0, status: 'healthy' },
    };

    // Smart placement: find rightmost node and place to its right, staggered vertically
    let pos = position;
    if (!pos) {
      const maxX = nodes.reduce((max, n) => Math.max(max, (n.position?.x || 0) + 180), 200);
      const yPositions = nodes.map(n => n.position?.y || 0);
      let y = 150;
      while (yPositions.some(ny => Math.abs(ny - y) < 80)) {
        y += 100;
      }
      pos = { x: maxX + 40, y };
    }

    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: pos,
      data: { ...defaults[type] },
    };

    set({
      money: money - cost,
      nodes: [...nodes, newNode],
    });
    return true;
  },

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

  onFail: () => {
    const { tickInterval } = get();
    if (tickInterval) clearInterval(tickInterval);
    set({
      simulationRunning: false,
      tickInterval: null,
      gameStatus: 'failed',
    });
  },

  retryLevel: () => {
    const { level } = get();
    get().loadLevel(level);
  },

  setShowTour: (val) => set({ showTour: val }),

  removeNode: (nodeId) => {
    const { nodes, edges, money, level, gameStatus } = get();
    if (gameStatus !== 'playing') return false;

    const node = nodes.find(n => n.id === nodeId);
    if (!node || node.data.isInitial) return false;

    const config = LEVEL_CONFIGS[level];
    const cost = config.nodeCosts[node.type] || 0;
    const refund = Math.floor(cost * 0.75);

    set({
      money: money + refund,
      nodes: nodes.filter(n => n.id !== nodeId),
      edges: edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    });
    return true;
  },

  removeEdge: (edgeId) => {
    const { edges, gameStatus } = get();
    if (gameStatus !== 'playing') return false;
    set({ edges: edges.filter(e => e.id !== edgeId) });
    return true;
  },

  toggleLevelSelect: () => {
    set(state => ({ showLevelSelect: !state.showLevelSelect }));
  },

  dismissIntro: () => {
    set({ gameStatus: 'playing' });
    get().startSimulation();
  },
}));

export default useGameStore;
