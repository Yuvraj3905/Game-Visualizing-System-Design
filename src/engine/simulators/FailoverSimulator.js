import { buildAdjacencyList, getChildren, buildNodeMap } from '../../utils/graphUtils.js';

export function simulateFailover(state) {
  const { nodes, edges, tickCount, disasterTime = 30, failoverState = {} } = state;
  const adj = buildAdjacencyList(edges);
  const nodeMap = buildNodeMap(nodes);

  const ticksPerSecond = 2;
  const disasterTick = disasterTime * ticksPerSecond;

  let updatedNodes = [...nodes];
  let systemDown = false;
  let survivedDisaster = failoverState.survivedDisaster || false;
  const disasterTriggered = failoverState.disasterTriggered || false;

  if (tickCount >= disasterTick && !disasterTriggered) {
    updatedNodes = updatedNodes.map(node => {
      if (node.type === 'database' && node.data.isPrimary) {
        return { ...node, data: { ...node.data, status: 'dead', rps: 0 } };
      }
      return node;
    });

    const healthChecks = updatedNodes.filter(n => n.type === 'healthCheck');
    const replicas = updatedNodes.filter(n => n.type === 'replica');

    if (healthChecks.length === 0 || replicas.length === 0) {
      systemDown = true;
    } else {
      let healthCheckConnected = false;
      for (const hc of healthChecks) {
        const children = getChildren(hc.id, adj);
        const monitoredDead = children.some(childId => {
          const child = nodeMap[childId];
          return child && child.type === 'database' && child.data.isPrimary;
        });
        if (monitoredDead) {
          healthCheckConnected = true;
          break;
        }
      }

      if (!healthCheckConnected) {
        systemDown = true;
      }
    }

    return {
      nodes: updatedNodes,
      systemDown,
      survivedDisaster: !systemDown,
      failoverState: { disasterTriggered: true, survivedDisaster: !systemDown },
    };
  }

  if (disasterTriggered && !failoverState.survivedDisaster) {
    const aliveDBs = updatedNodes.filter(n =>
      (n.type === 'database' || n.type === 'replica') && n.data.status !== 'dead'
    );
    systemDown = aliveDBs.length === 0;
    survivedDisaster = !systemDown;
  }

  return {
    nodes: updatedNodes,
    systemDown,
    survivedDisaster: failoverState.survivedDisaster || survivedDisaster,
    failoverState: { ...failoverState, disasterTriggered },
  };
}
