export function simulateTraffic(state) {
  const { nodes, rps } = state;
  const trafficSources = nodes.filter(n => n.type === 'trafficSource');

  if (trafficSources.length === 0) {
    return { rps: 0, trafficPerSource: {} };
  }

  const rpsPerSource = rps / trafficSources.length;
  const trafficPerSource = {};
  for (const source of trafficSources) {
    trafficPerSource[source.id] = {
      rps: rpsPerSource,
      region: source.data.region || 'default',
    };
  }

  return { rps, trafficPerSource };
}

export function rampTraffic(currentRps, targetRps) {
  if (currentRps >= targetRps) return targetRps;
  const diff = targetRps - currentRps;
  const step = Math.max(diff * 0.1, 50);
  return Math.min(currentRps + step, targetRps);
}
