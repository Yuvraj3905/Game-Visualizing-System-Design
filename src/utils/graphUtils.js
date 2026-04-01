export function buildAdjacencyList(edges) {
  const adj = {};
  for (const edge of edges) {
    if (!adj[edge.source]) adj[edge.source] = [];
    adj[edge.source].push(edge.target);
  }
  return adj;
}

export function findReachable(startId, adjacencyList) {
  const visited = new Set();
  const queue = [startId];
  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    const neighbors = adjacencyList[current] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) queue.push(neighbor);
    }
  }
  return visited;
}

export function findDownstreamByType(startId, type, adjacencyList, nodesMap) {
  const reachable = findReachable(startId, adjacencyList);
  const result = [];
  for (const nodeId of reachable) {
    if (nodeId !== startId && nodesMap[nodeId]?.type === type) {
      result.push(nodesMap[nodeId]);
    }
  }
  return result;
}

export function buildNodeMap(nodes) {
  const map = {};
  for (const node of nodes) {
    map[node.id] = node;
  }
  return map;
}

export function getChildren(nodeId, adjacencyList) {
  return adjacencyList[nodeId] || [];
}

export function getParents(nodeId, edges) {
  return edges.filter(e => e.target === nodeId).map(e => e.source);
}
