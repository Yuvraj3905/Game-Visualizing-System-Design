import { walkTopology } from './TopologyWalker.js';
import { simulateTraffic, rampTraffic } from './simulators/TrafficSimulator.js';
import { simulateLoadBalancing } from './simulators/LoadBalancerSimulator.js';
import { simulateCache } from './simulators/CacheSimulator.js';
import { simulateGeoLatency } from './simulators/GeoLatencySimulator.js';
import { simulateFailover } from './simulators/FailoverSimulator.js';
import { simulateRateLimiter } from './simulators/RateLimiterSimulator.js';
import { simulateQueue } from './simulators/QueueSimulator.js';
import { simulateAutoScaler } from './simulators/AutoScalerSimulator.js';
import { simulateChaos } from './simulators/ChaosSimulator.js';
import { simulateServiceMesh } from './simulators/ServiceMeshSimulator.js';
import { collectMetrics } from './MetricsCollector.js';
import { LEVEL_CONFIGS } from './LevelConfigs.js';

const SIMULATOR_MAP = {
  traffic: simulateTraffic,
  loadBalancer: simulateLoadBalancing,
  cache: simulateCache,
  geoLatency: simulateGeoLatency,
  failover: simulateFailover,
  rateLimiter: simulateRateLimiter,
  queue: simulateQueue,
  autoScaler: simulateAutoScaler,
  chaos: simulateChaos,
  serviceMesh: simulateServiceMesh,
};

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
    queueState: gameState.queueState || {},
    rateLimiterState: gameState.rateLimiterState || {},
    autoScalerState: gameState.autoScalerState || {},
    chaosState: gameState.chaosState || {},
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
    if (!simulator || simName === 'traffic') continue;

    const result = simulator(simState);
    simState = { ...simState, ...result };
  }

  // 6. Update node data with traffic info
  const updatedNodes = (simState.nodes || nodes).map(node => {
    const traffic = simState.nodeTraffic[node.id] || 0;
    const hasCapacity = node.type === 'server' || node.type === 'worker' || node.type === 'replica';
    const isOverloaded = hasCapacity && traffic > node.data.capacity;

    let status = node.data.status;
    if (status !== 'dead') {
      if (isOverloaded) status = 'critical';
      else if (hasCapacity && traffic > node.data.capacity * 0.7) status = 'warning';
      else status = 'healthy';
    }

    let hitRate = node.data.hitRate;
    if (node.type === 'cache' && simState.cacheState?.[node.id]) {
      hitRate = simState.cacheState[node.id].hitRate;
    }

    // Update queue depth
    let depth = node.data.depth;
    if (node.type === 'messageQueue' && simState.queueState?.[node.id]) {
      depth = simState.queueState[node.id].depth;
    }

    // Update rate limiter blocked count
    let blocked = node.data.blocked;
    if (node.type === 'apiGateway' && simState.rateLimiterState?.[node.id]) {
      blocked = simState.rateLimiterState[node.id].blocked;
    }

    // Update auto-scaler instance count
    let instanceCount = node.data.instanceCount;
    if (node.type === 'autoScaler' && simState.autoScalerState?.[node.id]) {
      instanceCount = simState.autoScalerState[node.id].instanceCount;
    }

    // Update circuit breaker state
    let cbState = node.data.cbState;
    let failures = node.data.failures;
    if (node.type === 'circuitBreaker' && simState.chaosState?.circuitBreakerStates?.[node.id]) {
      const cbs = simState.chaosState.circuitBreakerStates[node.id];
      cbState = cbs.state;
      failures = cbs.failures;
    }

    return {
      ...node,
      data: { ...node.data, rps: Math.round(traffic), status, hitRate, depth, blocked, instanceCount, cbState, failures },
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

  if (config.failCondition(metrics)) {
    gameStatus = 'failed';
    newSustainedTicks = 0;
  } else if (config.winCondition(metrics)) {
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
    queueState: simState.queueState || gameState.queueState,
    rateLimiterState: simState.rateLimiterState || gameState.rateLimiterState,
    autoScalerState: simState.autoScalerState || gameState.autoScalerState,
    chaosState: simState.chaosState || gameState.chaosState,
    metrics,
    gameStatus,
    sustainedTicks: newSustainedTicks,
  };
}
