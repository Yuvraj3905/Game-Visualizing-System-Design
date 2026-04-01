// Chaos events scheduled at specific ticks

const CHAOS_SCHEDULE = [
  { tick: 15, type: 'serverCrash' },
  { tick: 25, type: 'latencySpike' },
  { tick: 35, type: 'trafficSurge' },
  { tick: 45, type: 'capacityDegradation' },
  { tick: 55, type: 'serverCrash' },
];

const EVENT_DURATIONS = {
  serverCrash: 0,           // instant, permanent until healed
  latencySpike: 10,
  trafficSurge: 6,
  capacityDegradation: 0,   // instant, permanent
};

export function simulateChaos(simState) {
  const { nodes, nodeTraffic, chaosState = {}, tickCount } = simState;
  const newTraffic = { ...nodeTraffic };
  let updatedNodes = nodes.map(n => ({ ...n, data: { ...n.data } }));
  let chaosLatencyPenalty = 0;

  let newChaosState = { ...chaosState };

  // Check if a currently active timed event has expired
  if (newChaosState.activeEvent && newChaosState.eventEndTick != null) {
    if (tickCount >= newChaosState.eventEndTick) {
      newChaosState = { activeEvent: null, eventEndTick: null, affectedNodes: [] };
    }
  }

  // Check if an ongoing trafficSurge is still active (multiply traffic)
  if (newChaosState.activeEvent === 'trafficSurge' && tickCount < newChaosState.eventEndTick) {
    // Check for circuit breaker mitigation
    const hasCircuitBreaker = nodes.some(n => n.type === 'circuitBreaker');
    if (!hasCircuitBreaker) {
      for (const nodeId of Object.keys(newTraffic)) {
        newTraffic[nodeId] = newTraffic[nodeId] * 2;
      }
    }
    // If circuit breakers exist, the surge is absorbed
  }

  // Check if an ongoing latencySpike is still active
  if (newChaosState.activeEvent === 'latencySpike' && tickCount < newChaosState.eventEndTick) {
    const hasCircuitBreaker = nodes.some(n => n.type === 'circuitBreaker');
    chaosLatencyPenalty = hasCircuitBreaker ? 150 * 0.4 : 150;
  }

  // Trigger new event if scheduled for this tick
  const scheduled = CHAOS_SCHEDULE.find(e => e.tick === tickCount);
  if (scheduled) {
    const eventType = scheduled.type;
    const duration = EVENT_DURATIONS[eventType] || 0;
    const affectedNodes = [];

    const hasCircuitBreaker = nodes.some(n => n.type === 'circuitBreaker');

    switch (eventType) {
      case 'serverCrash': {
        const healthyServers = updatedNodes.filter(
          n => (n.type === 'server' || n.type === 'replica') && n.data.status !== 'dead'
        );
        if (healthyServers.length > 0) {
          const victim = healthyServers[Math.floor(Math.random() * healthyServers.length)];
          const idx = updatedNodes.findIndex(n => n.id === victim.id);
          if (idx !== -1) {
            updatedNodes[idx] = {
              ...updatedNodes[idx],
              data: { ...updatedNodes[idx].data, status: 'dead' },
            };
            affectedNodes.push(victim.id);
          }
        }
        newChaosState = { activeEvent: eventType, eventEndTick: null, affectedNodes };
        break;
      }
      case 'latencySpike': {
        chaosLatencyPenalty = hasCircuitBreaker ? 150 * 0.4 : 150;
        newChaosState = {
          activeEvent: eventType,
          eventEndTick: tickCount + duration,
          affectedNodes: [],
        };
        break;
      }
      case 'trafficSurge': {
        if (!hasCircuitBreaker) {
          for (const nodeId of Object.keys(newTraffic)) {
            newTraffic[nodeId] = newTraffic[nodeId] * 2;
          }
        }
        newChaosState = {
          activeEvent: eventType,
          eventEndTick: tickCount + duration,
          affectedNodes: [],
        };
        break;
      }
      case 'capacityDegradation': {
        updatedNodes = updatedNodes.map(n => {
          if (n.type === 'server' || n.type === 'replica') {
            affectedNodes.push(n.id);
            return {
              ...n,
              data: {
                ...n.data,
                capacity: Math.round((n.data.capacity || 1000) * 0.8),
              },
            };
          }
          return n;
        });
        newChaosState = { activeEvent: eventType, eventEndTick: null, affectedNodes };
        break;
      }
    }
  }

  return {
    nodes: updatedNodes,
    nodeTraffic: newTraffic,
    chaosState: newChaosState,
    chaosLatencyPenalty,
  };
}
