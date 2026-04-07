export function gradeInterview(gameState, scenarioConfig) {
  const { nodes, edges, money, latency, metrics } = gameState;
  const types = new Set(nodes.map(n => n.type));
  const serverCount = nodes.filter(n => n.type === 'server').length;
  const budget = scenarioConfig.budget;
  const target = scenarioConfig.latencyTarget;
  const initialNodeCount = scenarioConfig.initialNodes.length;
  const addedNodes = nodes.length - initialNodeCount;
  const addedEdges = edges.length - scenarioConfig.initialEdges.length;

  // Scalability (0-20)
  let scalability = 0;
  if (types.has('loadBalancer')) scalability += 4;
  if (serverCount >= 3) scalability += 4;
  if (types.has('autoScaler')) scalability += 4;
  if (types.has('cache')) scalability += 4;
  if (types.has('cdn')) scalability += 4;
  scalability = Math.min(20, scalability);

  // Reliability (0-20)
  let reliability = 0;
  if (types.has('replica')) reliability += 5;
  if (types.has('healthCheck')) reliability += 5;
  if (types.has('circuitBreaker')) reliability += 4;
  if (serverCount >= 2) reliability += 3;
  if (types.has('messageQueue')) reliability += 3;
  reliability = Math.min(20, reliability);

  // Latency (0-20)
  let latencyScore = 0;
  const avgLat = metrics.avgLatency || latency || 999;
  if (avgLat <= target) latencyScore += 10;
  else if (avgLat <= target * 1.5) latencyScore += 5;
  if (types.has('cache')) latencyScore += 5;
  if (types.has('cdn')) latencyScore += 5;
  latencyScore = Math.min(20, latencyScore);

  // Cost Efficiency (0-20)
  let costEfficiency = 0;
  const remaining = money / budget;
  if (remaining >= 0.3) costEfficiency += 8;
  else if (remaining >= 0.15) costEfficiency += 4;
  // Check for disconnected nodes
  const connectedIds = new Set();
  edges.forEach(e => { connectedIds.add(e.source); connectedIds.add(e.target); });
  const disconnected = nodes.filter(n => !connectedIds.has(n.id) && n.type !== 'trafficSource').length;
  if (disconnected === 0) costEfficiency += 6;
  else if (disconnected <= 1) costEfficiency += 3;
  // Reasonable node count
  const idealCount = scenarioConfig.idealSolution?.nodes?.reduce((sum, n) => sum + n.count, 0) || 10;
  if (nodes.length <= idealCount * 1.5) costEfficiency += 6;
  else if (nodes.length <= idealCount * 2) costEfficiency += 3;
  costEfficiency = Math.min(20, costEfficiency);

  // Simplicity (0-20)
  let simplicity = 0;
  const maxNodes = Math.floor(budget / 350); // rough max affordable
  if (nodes.length < maxNodes) simplicity += 8;
  else if (nodes.length < maxNodes * 1.2) simplicity += 4;
  if (addedEdges < addedNodes * 2.5) simplicity += 6;
  else if (addedEdges < addedNodes * 3.5) simplicity += 3;
  // No redundant same-type beyond need
  const typeCounts = {};
  nodes.forEach(n => { typeCounts[n.type] = (typeCounts[n.type] || 0) + 1; });
  const hasExcess = Object.values(typeCounts).some(c => c > 6);
  if (!hasExcess) simplicity += 6;
  else simplicity += 2;
  simplicity = Math.min(20, simplicity);

  const total = scalability + reliability + latencyScore + costEfficiency + simplicity;

  let outcome;
  if (total >= 80) outcome = 'Strong Hire';
  else if (total >= 60) outcome = 'Hire';
  else if (total >= 40) outcome = 'Lean Hire';
  else outcome = 'No Hire';

  return {
    scalability,
    reliability,
    latency: latencyScore,
    costEfficiency,
    simplicity,
    total,
    outcome,
  };
}

export function loadInterviewResult(scenarioIndex) {
  try {
    return JSON.parse(localStorage.getItem(`sdsim-interview-${scenarioIndex}`)) || null;
  } catch { return null; }
}

export function saveInterviewResult(scenarioIndex, grade, timeTaken) {
  const existing = loadInterviewResult(scenarioIndex);
  const result = {
    bestScore: Math.max(grade.total, existing?.bestScore || 0),
    bestOutcome: grade.total >= (existing?.bestScore || 0) ? grade.outcome : (existing?.bestOutcome || grade.outcome),
    attempts: (existing?.attempts || 0) + 1,
    lastAttempt: Date.now(),
    lastTimeTaken: timeTaken,
  };
  try {
    localStorage.setItem(`sdsim-interview-${scenarioIndex}`, JSON.stringify(result));
  } catch { /* quota */ }
  return result;
}
