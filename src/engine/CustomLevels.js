const STORAGE_KEY = 'sdsim-custom-levels';

export function getCustomLevels() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

export function saveCustomLevel(level) {
  const levels = getCustomLevels();
  const existing = levels.findIndex(l => l.id === level.id);
  if (existing >= 0) {
    levels[existing] = level;
  } else {
    levels.push(level);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
  } catch {}
  return levels;
}

export function deleteCustomLevel(id) {
  const levels = getCustomLevels().filter(l => l.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
  } catch {}
  return levels;
}

export function createCustomLevelId() {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

const ALL_COMPONENTS = ['server', 'database', 'loadBalancer', 'cache', 'cdn', 'region', 'replica', 'healthCheck', 'apiGateway', 'messageQueue', 'worker', 'autoScaler', 'circuitBreaker'];

export function buildLevelConfig(custom) {
  return {
    name: custom.name || 'Custom Level',
    subtitle: 'Custom Level',
    budget: custom.budget || 5000,
    initialTraffic: 0,
    targetTraffic: custom.targetRps || 5000,
    baseLatency: 40,
    congestionFactor: custom.congestion || 0.06,
    sustainSeconds: custom.sustainSeconds || 10,
    latencyTarget: custom.latencyTarget || 100,
    narrative: {
      title: custom.name || 'Custom Level',
      description: custom.description || 'A custom-built challenge.',
      objective: `Handle ${custom.targetRps || 5000} RPS with latency under ${custom.latencyTarget || 100}ms.`,
      hint: custom.hint || 'Design your architecture to handle the traffic requirements.',
    },
    unlockedComponents: custom.components || ALL_COMPONENTS,
    initialNodes: [
      { id: 'traffic-1', type: 'trafficSource', position: { x: 100, y: 250 }, data: { label: 'Users', rps: 0, region: 'default', isInitial: true } },
    ],
    initialEdges: [],
    winCondition: (metrics) => {
      const rpsOk = metrics.rps >= (custom.targetRps || 5000);
      const latOk = !custom.latencyTarget || metrics.avgLatency < custom.latencyTarget;
      const noOverload = metrics.overloadedServers === 0;
      return rpsOk && latOk && noOverload;
    },
    failCondition: (metrics) => {
      if (custom.failOnOverload !== false && metrics.overloadedServers > 0) return true;
      if (custom.failOnDown && metrics.systemDown) return true;
      return false;
    },
    failMessage: custom.failMessage || 'Your system crashed under the load!',
    failExplanation: custom.failExplanation || 'Try adding more capacity and distributing traffic more evenly.',
    winLesson: custom.winLesson || 'You completed a custom challenge!',
    references: [],
    nodeCosts: {
      server: custom.serverCost || 300,
      database: custom.dbCost || 400,
      loadBalancer: 400,
      cache: 500,
      cdn: 600,
      region: 0,
      replica: 700,
      healthCheck: 300,
      apiGateway: 800,
      messageQueue: 600,
      worker: 350,
      autoScaler: 1000,
      circuitBreaker: 800,
    },
    activeSimulators: ['traffic', 'loadBalancer', 'cache'],
  };
}

export { ALL_COMPONENTS };
