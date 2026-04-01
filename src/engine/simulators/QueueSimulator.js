import { buildAdjacencyList, buildNodeMap, getChildren } from '../../utils/graphUtils.js';

export function simulateQueue(simState) {
  const { nodes, edges, nodeTraffic, queueState = {} } = simState;
  const adj = buildAdjacencyList(edges);
  const nodeMap = buildNodeMap(nodes);
  const newTraffic = { ...nodeTraffic };
  const newQueueState = { ...queueState };
  let queueLatencyPenalty = 0;

  const queues = nodes.filter(n => n.type === 'messageQueue');

  for (const queue of queues) {
    const maxDepth = queue.data.maxDepth || 5000;
    const fillRate = newTraffic[queue.id] || 0;

    // Find downstream worker nodes and compute drain rate
    const children = getChildren(queue.id, adj);
    const workerChildren = children.filter(id => {
      const n = nodeMap[id];
      return n && (n.type === 'worker' || n.type === 'server');
    });
    const drainRate = workerChildren.reduce((sum, id) => {
      const n = nodeMap[id];
      return sum + (n.data.capacity || 0);
    }, 0);

    // Update queue depth
    let state = newQueueState[queue.id] || { depth: 0 };
    let depth = state.depth + (fillRate - drainRate);
    depth = Math.max(0, Math.min(depth, maxDepth));

    newQueueState[queue.id] = { depth };

    // Latency penalty when queue is nearly full
    if (depth > maxDepth * 0.9) {
      const overflowRatio = (depth - maxDepth * 0.9) / (maxDepth * 0.1);
      queueLatencyPenalty += 100 * overflowRatio;
    }

    // Distribute actual drain rate as traffic to worker children
    const actualDrain = Math.min(drainRate, fillRate + state.depth);
    if (workerChildren.length > 0) {
      const perWorker = actualDrain / workerChildren.length;
      for (const childId of workerChildren) {
        newTraffic[childId] = (newTraffic[childId] || 0) + perWorker;
      }
    }
  }

  return { nodeTraffic: newTraffic, queueState: newQueueState, queueLatencyPenalty };
}
