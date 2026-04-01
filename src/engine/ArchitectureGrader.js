/**
 * Grades a player's architecture solution after winning a level.
 * Returns scores (0-100) for 4 dimensions + an overall letter grade.
 */
import { LEVEL_CONFIGS } from './LevelConfigs.js';

export function gradeArchitecture(gameState) {
  const { nodes, edges, money, latency, level } = gameState;
  const config = LEVEL_CONFIGS[level];
  if (!config) return defaultGrade();

  const costScore = gradeCost(money, config.budget);
  const latencyScore = gradeLatency(latency, config.baseLatency, config.latencyTarget);
  const resilienceScore = gradeResilience(nodes);
  const complexityScore = gradeComplexity(nodes, edges, config);

  const overall = Math.round((costScore + latencyScore + resilienceScore + complexityScore) / 4);
  const letter = toLetter(overall);

  return { costScore, latencyScore, resilienceScore, complexityScore, overall, letter };
}

function defaultGrade() {
  return { costScore: 50, latencyScore: 50, resilienceScore: 50, complexityScore: 50, overall: 50, letter: 'C' };
}

function gradeCost(moneyLeft, budget) {
  if (budget <= 0) return 100;
  const efficiency = moneyLeft / budget;
  return Math.round(Math.min(100, 40 + efficiency * 120));
}

function gradeLatency(currentLatency, baseLatency, latencyTarget) {
  const target = latencyTarget || 200;
  if (currentLatency <= baseLatency) return 100;
  if (currentLatency >= target * 2) return 10;
  const range = target * 2 - baseLatency;
  const position = currentLatency - baseLatency;
  return Math.round(Math.max(10, 100 - (position / range) * 90));
}

function gradeResilience(nodes) {
  let score = 50;
  const types = new Set(nodes.map(n => n.type));
  const serverCount = nodes.filter(n => n.type === 'server' && n.data?.status !== 'dead').length;

  if (serverCount >= 3) score += 15;
  else if (serverCount >= 2) score += 8;
  if (types.has('loadBalancer')) score += 10;
  if (types.has('cache')) score += 5;
  if (types.has('replica')) score += 10;
  if (types.has('healthCheck')) score += 5;
  if (types.has('cdn')) score += 3;
  if (types.has('circuitBreaker')) score += 7;

  const dbCount = nodes.filter(n => n.type === 'database' && n.data?.status !== 'dead').length;
  const replicaCount = nodes.filter(n => n.type === 'replica').length;
  if (dbCount === 1 && replicaCount === 0) score -= 10;

  return Math.round(Math.min(100, Math.max(0, score)));
}

function gradeComplexity(nodes, edges, config) {
  const addedNodes = Math.max(0, nodes.length - config.initialNodes.length);
  const addedEdges = Math.max(0, edges.length - config.initialEdges.length);
  const penalty = addedNodes * 8 + addedEdges * 3;
  return Math.round(Math.max(10, 100 - penalty));
}

function toLetter(score) {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}
