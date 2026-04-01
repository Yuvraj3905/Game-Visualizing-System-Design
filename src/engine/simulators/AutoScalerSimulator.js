import { buildAdjacencyList, buildNodeMap, getChildren } from '../../utils/graphUtils.js';

export function simulateAutoScaler(simState) {
  const { nodes, edges, nodeTraffic, autoScalerState = {}, tickCount } = simState;
  const adj = buildAdjacencyList(edges);
  const nodeMap = buildNodeMap(nodes);
  const newAutoScalerState = { ...autoScalerState };
  const updatedNodes = nodes.map(n => ({ ...n, data: { ...n.data } }));
  const updatedNodeMap = buildNodeMap(updatedNodes);

  const autoScalers = nodes.filter(n => n.type === 'autoScaler');

  for (const scaler of autoScalers) {
    const scaleUpThreshold = scaler.data.scaleUpThreshold ?? 0.7;
    const scaleDownThreshold = scaler.data.scaleDownThreshold ?? 0.3;
    const cooldown = scaler.data.cooldown ?? 3;

    let state = newAutoScalerState[scaler.id] || {
      lastScaleAction: -Infinity,
      instanceCount: 1,
    };

    // Find downstream server nodes
    const children = getChildren(scaler.id, adj);
    const serverChildren = children.filter(id => {
      const n = nodeMap[id];
      return n && (n.type === 'server' || n.type === 'replica');
    });

    if (serverChildren.length === 0) {
      newAutoScalerState[scaler.id] = state;
      continue;
    }

    // Calculate average load across downstream servers
    let totalLoad = 0;
    for (const childId of serverChildren) {
      const rps = nodeTraffic[childId] || 0;
      const capacity = nodeMap[childId]?.data.capacity || 1;
      totalLoad += rps / capacity;
    }
    const avgLoad = totalLoad / serverChildren.length;

    const cooldownElapsed = (tickCount - state.lastScaleAction) >= cooldown;

    if (avgLoad > scaleUpThreshold && cooldownElapsed) {
      // Scale up: increase capacity of downstream servers
      state = {
        lastScaleAction: tickCount,
        instanceCount: state.instanceCount + 1,
      };
      for (const childId of serverChildren) {
        const node = updatedNodeMap[childId];
        if (node) {
          node.data.capacity = (node.data.capacity || 1000) + 1000;
        }
      }
    } else if (avgLoad < scaleDownThreshold && cooldownElapsed && state.instanceCount > 1) {
      // Scale down: reduce capacity of downstream servers
      state = {
        lastScaleAction: tickCount,
        instanceCount: state.instanceCount - 1,
      };
      for (const childId of serverChildren) {
        const node = updatedNodeMap[childId];
        if (node) {
          node.data.capacity = Math.max(1000, (node.data.capacity || 1000) - 1000);
        }
      }
    }

    newAutoScalerState[scaler.id] = state;
  }

  return { autoScalerState: newAutoScalerState, nodes: updatedNodes };
}
