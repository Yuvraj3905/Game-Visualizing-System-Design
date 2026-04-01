import { buildAdjacencyList, buildNodeMap, findReachable } from '../../utils/graphUtils.js';

const BASE_INTER_SERVICE_LATENCY = 30;
const MESH_INTER_SERVICE_LATENCY = 10;

export function simulateServiceMesh(simState) {
  const { nodes, edges, nodeTraffic } = simState;
  const adj = buildAdjacencyList(edges);
  const nodeMap = buildNodeMap(nodes);

  const meshNodes = nodes.filter(n => n.type === 'serviceMesh');

  // Find all inter-service edges (service -> service)
  const interServiceEdges = edges.filter(e => {
    const source = nodeMap[e.source];
    const target = nodeMap[e.target];
    return (
      source && target &&
      (source.type === 'service' || source.type === 'server') &&
      (target.type === 'service' || target.type === 'server')
    );
  });

  // Count total inter-service calls based on traffic
  let interServiceCalls = 0;
  for (const edge of interServiceEdges) {
    interServiceCalls += nodeTraffic[edge.source] || 0;
  }

  // Determine which inter-service paths have a mesh node present
  // A mesh covers a path if it's reachable in the graph near the service nodes
  const meshCoveredNodes = new Set();
  for (const mesh of meshNodes) {
    const reachable = findReachable(mesh.id, adj);
    for (const nodeId of reachable) {
      meshCoveredNodes.add(nodeId);
    }
  }

  let coveredCalls = 0;
  let uncoveredCalls = 0;

  for (const edge of interServiceEdges) {
    const traffic = nodeTraffic[edge.source] || 0;
    const sourceInMesh = meshCoveredNodes.has(edge.source);
    const targetInMesh = meshCoveredNodes.has(edge.target);

    if (sourceInMesh || targetInMesh) {
      coveredCalls += traffic;
    } else {
      uncoveredCalls += traffic;
    }
  }

  // Calculate latency penalty
  const meshLatencyPenalty =
    (coveredCalls * MESH_INTER_SERVICE_LATENCY +
     uncoveredCalls * BASE_INTER_SERVICE_LATENCY);

  return {
    meshLatencyPenalty,
    interServiceCalls,
  };
}
