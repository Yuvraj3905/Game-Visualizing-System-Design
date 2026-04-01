import { buildAdjacencyList, getChildren, buildNodeMap } from '../../utils/graphUtils.js';

export function simulateLoadBalancing(state) {
  const { nodes, edges, nodeTraffic } = state;
  const adj = buildAdjacencyList(edges);
  const nodeMap = buildNodeMap(nodes);
  const updatedTraffic = { ...nodeTraffic };

  const loadBalancers = nodes.filter(n => n.type === 'loadBalancer');

  for (const lb of loadBalancers) {
    const incomingRps = updatedTraffic[lb.id] || 0;
    if (incomingRps === 0) continue;

    const children = getChildren(lb.id, adj);
    const serverChildren = children.filter(id => {
      const node = nodeMap[id];
      return node && node.type === 'server' && node.data.status !== 'dead';
    });

    if (serverChildren.length === 0) continue;

    const rpsPerServer = incomingRps / serverChildren.length;

    for (const serverId of serverChildren) {
      updatedTraffic[serverId] = rpsPerServer;
    }
  }

  return { nodeTraffic: updatedTraffic };
}

export function findOverloadedServers(nodes, nodeTraffic) {
  return nodes
    .filter(n => n.type === 'server' && n.data.status !== 'dead')
    .filter(n => (nodeTraffic[n.id] || 0) > n.data.capacity)
    .map(n => n.id);
}
