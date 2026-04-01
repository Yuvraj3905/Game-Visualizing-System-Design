const REGION_LATENCY = {
  'region-india': { 'region-us': 250, 'region-europe': 180 },
  'region-us': { 'region-india': 250, 'region-europe': 120 },
  'region-europe': { 'region-india': 180, 'region-us': 120 },
};

export function simulateGeoLatency(state) {
  const { nodes, trafficPerSource = {} } = state;

  const cdnNodes = nodes.filter(n => n.type === 'cdn' && n.data.status !== 'dead');
  const hasCDN = cdnNodes.length > 0;
  const cdnReduction = hasCDN ? 0.6 : 1.0;

  const serverRegions = new Set();
  for (const node of nodes) {
    if (node.type === 'server' && node.parentNode) {
      serverRegions.add(node.parentNode);
    }
  }

  const regionMetrics = {};
  let totalBounced = 0;
  let maxLatency = 0;

  for (const [sourceId, sourceData] of Object.entries(trafficPerSource)) {
    const userRegion = sourceData.region;
    if (userRegion === 'default') {
      regionMetrics[sourceId] = { latency: 10, bounced: 0, region: 'default' };
      continue;
    }

    let minLatency = Infinity;

    if (serverRegions.size === 0) {
      minLatency = 200;
    } else {
      for (const serverRegion of serverRegions) {
        if (serverRegion === userRegion) {
          minLatency = 10;
          break;
        }
        const latency = REGION_LATENCY[userRegion]?.[serverRegion] || 300;
        minLatency = Math.min(minLatency, latency);
      }
    }

    const effectiveLatency = Math.round(minLatency * cdnReduction);
    const bounceRate = effectiveLatency > 250 ? 0.4 : effectiveLatency > 150 ? 0.1 : 0;
    const bounced = Math.round(sourceData.rps * bounceRate);

    regionMetrics[sourceId] = { latency: effectiveLatency, bounced, region: userRegion };
    totalBounced += bounced;
    maxLatency = Math.max(maxLatency, effectiveLatency);
  }

  return { regionMetrics, bouncedUsers: totalBounced, maxRegionLatency: maxLatency };
}
