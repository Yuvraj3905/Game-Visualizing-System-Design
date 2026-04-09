import { create } from 'zustand';
import { LEVEL_CONFIGS, TOTAL_LEVELS } from '../engine/LevelConfigs.js';
import { runTick } from '../engine/LevelOrchestrator.js';
import * as Sound from '../audio/SoundEngine.js';
import { gradeArchitecture } from '../engine/ArchitectureGrader.js';
import { getDailyLevel, loadDailyResult, saveDailyResult as saveDailyToStorage, getStreak } from '../engine/DailyChallenge.js';
import { INTERVIEW_SCENARIOS } from '../engine/InterviewConfigs.js';
import { gradeInterview, saveInterviewResult } from '../engine/InterviewGrader.js';
import { buildLevelConfig } from '../engine/CustomLevels.js';

// Restore saved progress from localStorage
function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem('sdsim-progress'));
    if (saved && saved.level && saved.unlockedLevel) {
      return {
        level: Math.min(saved.level, TOTAL_LEVELS),
        unlockedLevel: Math.min(saved.unlockedLevel, TOTAL_LEVELS),
      };
    }
  } catch { /* ignore corrupt data */ }
  return { level: 1, unlockedLevel: 1 };
}

function saveProgress(level, unlockedLevel) {
  try {
    localStorage.setItem('sdsim-progress', JSON.stringify({ level, unlockedLevel }));
  } catch { /* quota exceeded, ignore */ }
}

function announce(message) {
  try {
    const el = document.getElementById('game-announcer');
    if (el) { el.textContent = ''; setTimeout(() => { el.textContent = message; }, 50); }
  } catch {}
}

const savedProgress = loadProgress();

const useGameStore = create((set, get) => ({
  // Level progression
  level: savedProgress.level,
  unlockedLevel: savedProgress.unlockedLevel,
  gameStatus: 'intro',
  showLevelSelect: false,
  showTour: false,
  budgetShake: false,
  audioMuted: false,
  grade: null,
  sandboxMode: false,
  showConceptLibrary: false,
  activeConceptId: null,
  showLearningPaths: false,
  showWeeklyTournament: false,
  showLevelEditor: false,
  highContrast: false,

  // Daily challenge
  dailyMode: false,
  dailyCompleted: false,
  dailyGrade: null,
  dailyStreak: getStreak().count,
  showDailyModal: false,

  // Interview prep
  interviewMode: false,
  interviewScenario: null,
  interviewTimer: 0,
  interviewTimerInterval: null,
  interviewGrade: null,
  configOverride: null, // Used by interview mode to override LEVEL_CONFIGS
  metricsHistory: [], // Array of { tick, rps, latency, health } for dashboard
  showMetricsDashboard: false,

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

    Sound.stopMusic();
    saveProgress(levelNum, get().unlockedLevel);
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
      metricsHistory: [],
      cacheState: {},
      failoverState: {},
      queueState: {},
      rateLimiterState: {},
      autoScalerState: {},
      chaosState: {},
      tickInterval: null,
      grade: null,
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
        // Capture metrics snapshot for dashboard
        const newRps = updates.rps ?? state.rps;
        const newLatency = updates.latency ?? state.latency;
        const newHealth = updates.metrics?.healthPercent ?? state.metrics.healthPercent;
        const tick = (updates.tickCount ?? state.tickCount);
        const history = state.metricsHistory;
        const snapshot = { tick, rps: Math.round(newRps), latency: Math.round(newLatency), health: Math.round(newHealth) };
        updates.metricsHistory = [...history.slice(-119), snapshot]; // keep last 120 points (60 seconds)
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
      Sound.playFail();
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
    Sound.playClick();
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
    const { level, tickInterval, dailyMode, interviewMode, interviewScenario, interviewTimer, interviewTimerInterval } = get();
    if (tickInterval) clearInterval(tickInterval);

    if (interviewMode) {
      if (interviewTimerInterval) clearInterval(interviewTimerInterval);
      const scenario = INTERVIEW_SCENARIOS[interviewScenario];
      const iGrade = gradeInterview(get(), scenario);
      const timeTaken = scenario.timeLimit - interviewTimer;
      saveInterviewResult(interviewScenario, iGrade, timeTaken);
      set({
        simulationRunning: false,
        tickInterval: null,
        interviewTimerInterval: null,
        gameStatus: 'won',
        interviewGrade: iGrade,
      });
      Sound.stopMusic();
      Sound.playSuccess();
      return;
    }

    const grade = gradeArchitecture(get());

    if (dailyMode) {
      saveDailyToStorage(level, grade);
      const streak = getStreak();
      set({
        simulationRunning: false,
        tickInterval: null,
        gameStatus: 'won',
        grade,
        dailyCompleted: true,
        dailyGrade: grade,
        dailyStreak: streak.count,
      });
    } else {
      const newUnlocked = Math.min(level + 1, TOTAL_LEVELS);
      const finalUnlocked = Math.max(get().unlockedLevel, newUnlocked);
      saveProgress(level, finalUnlocked);
      set({
        simulationRunning: false,
        tickInterval: null,
        gameStatus: 'won',
        unlockedLevel: finalUnlocked,
        grade,
      });
    }
    Sound.stopMusic();
    Sound.playSuccess();
    announce('Level complete! Your architecture survived.');
  },

  onFail: () => {
    const { tickInterval, interviewTimerInterval } = get();
    if (tickInterval) clearInterval(tickInterval);
    if (interviewTimerInterval) clearInterval(interviewTimerInterval);
    set({
      simulationRunning: false,
      tickInterval: null,
      interviewTimerInterval: null,
      gameStatus: 'failed',
    });
    Sound.stopMusic();
    Sound.playFail();
    announce('System failure! Check the post-mortem for details.');
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
    Sound.playSell();
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
    if (get().interviewMode) get().startInterviewTimer();
    Sound.startMusic();
  },

  toggleLearningPaths: () => set(state => ({ showLearningPaths: !state.showLearningPaths })),
  toggleWeeklyTournament: () => set(state => ({ showWeeklyTournament: !state.showWeeklyTournament })),
  toggleMetricsDashboard: () => set(state => ({ showMetricsDashboard: !state.showMetricsDashboard })),
  toggleLevelEditor: () => set(state => ({ showLevelEditor: !state.showLevelEditor })),
  toggleHighContrast: () => {
    const next = !get().highContrast;
    document.documentElement.setAttribute('data-high-contrast', String(next));
    set({ highContrast: next });
  },

  loadCustomLevel: (customData) => {
    const { tickInterval, interviewTimerInterval } = get();
    if (tickInterval) clearInterval(tickInterval);
    if (interviewTimerInterval) clearInterval(interviewTimerInterval);

    const config = buildLevelConfig(customData);
    const nodesWithInitial = config.initialNodes.map(n => ({
      ...n, data: { ...n.data, isInitial: true },
    }));

    set({
      configOverride: config,
      interviewMode: false,
      dailyMode: false,
      sandboxMode: false,
      level: 0,
      gameStatus: 'intro',
      showLevelSelect: false,
      showLevelEditor: false,
      money: config.budget,
      rps: 0,
      targetRps: 0,
      latency: config.baseLatency,
      nodes: nodesWithInitial,
      edges: [...config.initialEdges],
      simulationRunning: false,
      tickInterval: null,
      tickCount: 0,
      sustainedTicks: 0,
      metricsHistory: [],
      cacheState: {},
      failoverState: {},
      queueState: {},
      rateLimiterState: {},
      autoScalerState: {},
      chaosState: {},
      grade: null,
      metrics: {
        rps: 0, totalCapacity: 0, overloadedServers: 0,
        dbLoad: 0, dbCapacity: 0, avgCacheHitRate: 0,
        avgLatency: 0, maxRegionLatency: 0, bouncedUsers: 0,
        healthPercent: 100, systemDown: false, survivedDisaster: false,
      },
    });
  },
  setShowConceptLibrary: (val) => set({ showConceptLibrary: val, activeConceptId: null }),
  setActiveConcept: (id) => set({ activeConceptId: id }),
  closeConceptLibrary: () => set({ showConceptLibrary: false, activeConceptId: null }),

  // Daily challenge actions
  toggleDailyModal: () => set(state => ({ showDailyModal: !state.showDailyModal })),

  loadDailyChallenge: () => {
    const existing = loadDailyResult();
    if (existing) {
      set({ dailyCompleted: true, dailyGrade: existing.grade, dailyStreak: getStreak().count, showDailyModal: false });
      return;
    }
    const dailyLevel = getDailyLevel();
    get().loadLevel(dailyLevel);
    set({ dailyMode: true, dailyCompleted: false, dailyGrade: null, showDailyModal: false });
  },

  exitDailyChallenge: () => {
    const { unlockedLevel } = get();
    set({ dailyMode: false, dailyCompleted: false, dailyGrade: null });
    get().loadLevel(unlockedLevel);
  },

  // Interview prep actions
  loadInterview: (scenarioIndex) => {
    const { tickInterval, interviewTimerInterval } = get();
    if (tickInterval) clearInterval(tickInterval);
    if (interviewTimerInterval) clearInterval(interviewTimerInterval);
    Sound.stopMusic();

    const scenario = INTERVIEW_SCENARIOS[scenarioIndex];
    const config = {
      ...scenario,
      winLesson: '',
      references: [],
    };

    const nodesWithInitial = scenario.initialNodes.map(n => ({
      ...n,
      data: { ...n.data, isInitial: true },
    }));

    set({
      interviewMode: true,
      interviewScenario: scenarioIndex,
      interviewTimer: scenario.timeLimit,
      interviewTimerInterval: null,
      interviewGrade: null,
      configOverride: { ...scenario, winLesson: '', references: [] },
      dailyMode: false,
      sandboxMode: false,
      level: 0,
      gameStatus: 'intro',
      showLevelSelect: false,
      money: scenario.budget,
      rps: 0,
      targetRps: 0,
      latency: scenario.baseLatency,
      nodes: nodesWithInitial,
      edges: [...scenario.initialEdges],
      simulationRunning: false,
      tickInterval: null,
      tickCount: 0,
      sustainedTicks: 0,
      grade: null,
      metrics: {
        rps: 0, totalCapacity: 0, overloadedServers: 0,
        dbLoad: 0, dbCapacity: 0, avgCacheHitRate: 0,
        avgLatency: 0, maxRegionLatency: 0, bouncedUsers: 0,
        healthPercent: 100, systemDown: false, survivedDisaster: false,
      },
      cacheState: {},
      failoverState: {},
      queueState: {},
      rateLimiterState: {},
      autoScalerState: {},
      chaosState: {},
    });
  },

  startInterviewTimer: () => {
    const interval = setInterval(() => {
      const timer = get().interviewTimer;
      if (timer <= 1) {
        clearInterval(interval);
        set({ interviewTimer: 0, interviewTimerInterval: null });
        get().onFail();
      } else {
        set({ interviewTimer: timer - 1 });
      }
    }, 1000);
    set({ interviewTimerInterval: interval });
  },

  submitSolution: () => {
    const { interviewMode, gameStatus } = get();
    if (!interviewMode || gameStatus !== 'playing') return;
    get().onWin();
  },

  exitInterview: () => {
    const { interviewTimerInterval, unlockedLevel } = get();
    if (interviewTimerInterval) clearInterval(interviewTimerInterval);
    set({
      interviewMode: false,
      interviewScenario: null,
      interviewTimer: 0,
      interviewTimerInterval: null,
      interviewGrade: null,
      configOverride: null,
    });
    get().loadLevel(unlockedLevel);
  },

  toggleAudioMute: () => {
    const muted = Sound.toggleMute();
    set({ audioMuted: muted });
    if (!muted && get().gameStatus === 'playing') Sound.startMusic();
  },

  startSandbox: () => {
    const { tickInterval } = get();
    if (tickInterval) clearInterval(tickInterval);
    Sound.stopMusic();

    set({
      sandboxMode: true,
      level: 0,
      gameStatus: 'playing',
      showLevelSelect: false,
      money: 999999,
      rps: 0,
      targetRps: 0,
      latency: 20,
      nodes: [
        { id: 'traffic-1', type: 'trafficSource', position: { x: 100, y: 300 }, data: { label: 'Users', rps: 0, region: 'default', isInitial: true } },
      ],
      edges: [],
      simulationRunning: false,
      tickCount: 0,
      sustainedTicks: 0,
      metricsHistory: [],
      cacheState: {},
      failoverState: {},
      queueState: {},
      rateLimiterState: {},
      autoScalerState: {},
      chaosState: {},
      tickInterval: null,
      grade: null,
      metrics: {
        rps: 0, totalCapacity: 0, overloadedServers: 0,
        dbLoad: 0, dbCapacity: 0, avgCacheHitRate: 0,
        avgLatency: 0, maxRegionLatency: 0, bouncedUsers: 0,
        healthPercent: 100, systemDown: false, survivedDisaster: false,
      },
    });

    get().startSimulation();
    Sound.startMusic();
  },

  exitSandbox: () => {
    const { tickInterval } = get();
    if (tickInterval) clearInterval(tickInterval);
    Sound.stopMusic();
    const savedLevel = loadProgress().level || 1;
    set({ sandboxMode: false, simulationRunning: false, tickInterval: null });
    get().loadLevel(savedLevel);
  },
}));

export default useGameStore;
