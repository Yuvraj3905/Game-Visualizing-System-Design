import { buildAdjacencyList, buildNodeMap, getChildren } from '../utils/graphUtils.js';

export function walkTopology(nodes, edges, totalRps) {
  const adj = buildAdjacencyList(edges);
  const nodeMap = buildNodeMap(nodes);
  const nodeTraffic = {};
  const paths = [];
  const connectedNodes = new Set();

  for (const node of nodes) {
    nodeTraffic[node.id] = 0;
  }

  const trafficSources = nodes.filter(n => n.type === 'trafficSource');

  if (trafficSources.length === 0) {
    return { paths, nodeTraffic, connectedNodes, disconnectedNodes: [...nodes] };
  }

  const rpsPerSource = totalRps / trafficSources.length;

  for (const source of trafficSources) {
    nodeTraffic[source.id] = rpsPerSource;
    connectedNodes.add(source.id);
    distributeFromNode(source.id, rpsPerSource, adj, nodeMap, nodeTraffic, paths, connectedNodes);
  }

  const disconnectedNodes = nodes.filter(n => !connectedNodes.has(n.id));
  return { paths, nodeTraffic, connectedNodes, disconnectedNodes };
}

function distributeFromNode(nodeId, rps, adj, nodeMap, nodeTraffic, paths, connectedNodes) {
  const children = getChildren(nodeId, adj);
  if (children.length === 0 || rps === 0) return;

  const rpsPerChild = rps / children.length;

  for (const childId of children) {
    const child = nodeMap[childId];
    if (!child) continue;

    paths.push({ from: nodeId, to: childId, rps: rpsPerChild });
    nodeTraffic[childId] += rpsPerChild;
    connectedNodes.add(childId);

    distributeFromNode(childId, rpsPerChild, adj, nodeMap, nodeTraffic, paths, connectedNodes);
  }
}
