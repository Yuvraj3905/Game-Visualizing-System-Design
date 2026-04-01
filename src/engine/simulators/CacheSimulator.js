import { buildAdjacencyList, getChildren, buildNodeMap } from '../../utils/graphUtils.js';

export function simulateCache(state) {
  const { nodes, edges, nodeTraffic, cacheState = {} } = state;
  const adj = buildAdjacencyList(edges);
  const nodeMap = buildNodeMap(nodes);
  const updatedTraffic = { ...nodeTraffic };
  const updatedCacheState = { ...cacheState };

  const caches = nodes.filter(n => n.type === 'cache');

  for (const cache of caches) {
    const incomingRps = updatedTraffic[cache.id] || 0;

    const prevHitRate = updatedCacheState[cache.id]?.hitRate || 0;
    const hitRate = incomingRps > 0
      ? Math.min(prevHitRate + 0.03, 0.85)
      : Math.max(prevHitRate - 0.05, 0);

    updatedCacheState[cache.id] = { hitRate };

    const cacheMisses = incomingRps * (1 - hitRate);

    const children = getChildren(cache.id, adj);
    for (const childId of children) {
      const child = nodeMap[childId];
      if (child && (child.type === 'database' || child.type === 'replica')) {
        updatedTraffic[childId] = cacheMisses;
      }
    }
  }

  return { nodeTraffic: updatedTraffic, cacheState: updatedCacheState };
}

export function calculateCacheLatency(cacheState, baseDbLatency) {
  const cacheEntries = Object.values(cacheState);
  if (cacheEntries.length === 0) return baseDbLatency;

  const avgHitRate = cacheEntries.reduce((sum, c) => sum + c.hitRate, 0) / cacheEntries.length;
  const cacheHitLatency = 1;
  return (avgHitRate * cacheHitLatency) + ((1 - avgHitRate) * baseDbLatency);
}
