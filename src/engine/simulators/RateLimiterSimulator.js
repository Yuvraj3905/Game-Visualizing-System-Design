import { buildAdjacencyList, getChildren } from '../../utils/graphUtils.js';

export function simulateRateLimiter(simState) {
  const { nodes, edges, nodeTraffic } = simState;
  const adj = buildAdjacencyList(edges);
  const newTraffic = { ...nodeTraffic };
  const rateLimiterState = {};

  const gateways = nodes.filter(n => n.type === 'apiGateway');

  for (const gateway of gateways) {
    const incoming = newTraffic[gateway.id] || 0;
    const rateLimit = gateway.data.rateLimit || Infinity;

    const passed = Math.min(incoming, rateLimit);
    const blocked = Math.max(incoming - rateLimit, 0);

    rateLimiterState[gateway.id] = { blocked, passed };

    // Update gateway's own traffic to what it passes through
    newTraffic[gateway.id] = passed;

    // Distribute passed traffic to downstream children
    const children = getChildren(gateway.id, adj);
    if (children.length > 0) {
      const perChild = passed / children.length;
      for (const childId of children) {
        newTraffic[childId] = (newTraffic[childId] || 0) + perChild;
      }
    }
  }

  return { nodeTraffic: newTraffic, rateLimiterState };
}
