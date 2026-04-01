export function collectMetrics(state) {
  const {
    nodes,
    nodeTraffic = {},
    rps = 0,
    cacheState = {},
    regionMetrics = {},
    systemDown = false,
    survivedDisaster = false,
    baseLatency = 50,
    congestionFactor = 0.1,
  } = state;

  const servers = nodes.filter(n => n.type === 'server' && n.data.status !== 'dead');
  const totalCapacity = servers.reduce((sum, s) => sum + (s.data.capacity || 0), 0);

  const overloadedServers = servers.filter(
    s => (nodeTraffic[s.id] || 0) > s.data.capacity
  ).length;

  const databases = nodes.filter(n => n.type === 'database' && n.data.status !== 'dead');
  const dbLoad = databases.reduce((sum, db) => sum + (nodeTraffic[db.id] || 0), 0);
  const dbCapacity = databases.reduce((sum, db) => sum + (db.data.capacity || 0), 0);

  const cacheEntries = Object.values(cacheState);
  const avgCacheHitRate = cacheEntries.length > 0
    ? cacheEntries.reduce((sum, c) => sum + c.hitRate, 0) / cacheEntries.length
    : 0;

  const load = totalCapacity > 0 ? rps / totalCapacity : 999;
  const serverLatency = baseLatency + (load * congestionFactor * 1000);

  const dbLatency = 30;
  const cacheLatencyFactor = cacheEntries.length > 0
    ? (avgCacheHitRate * 1) + ((1 - avgCacheHitRate) * dbLatency)
    : dbLatency;

  const regionValues = Object.values(regionMetrics);
  const maxRegionLatency = regionValues.length > 0
    ? Math.max(...regionValues.map(r => r.latency))
    : 0;
  const geoLatencyPenalty = maxRegionLatency;

  const avgLatency = Math.round(
    serverLatency + cacheLatencyFactor + (geoLatencyPenalty > 0 ? geoLatencyPenalty : 0)
  );

  const bouncedUsers = regionValues.reduce((sum, r) => sum + (r.bounced || 0), 0);

  let healthPercent = 100;
  if (systemDown) {
    healthPercent = 0;
  } else {
    const totalNodes = nodes.filter(n => n.type !== 'trafficSource' && n.type !== 'region');
    const deadNodes = totalNodes.filter(n => n.data.status === 'dead');
    const overloadPenalty = overloadedServers * 15;
    healthPercent = Math.max(
      0,
      Math.round(((totalNodes.length - deadNodes.length) / Math.max(totalNodes.length, 1)) * 100 - overloadPenalty)
    );
  }

  return {
    rps,
    totalCapacity,
    overloadedServers,
    dbLoad,
    dbCapacity,
    avgCacheHitRate: Math.round(avgCacheHitRate * 100),
    avgLatency,
    maxRegionLatency,
    bouncedUsers,
    healthPercent,
    systemDown,
    survivedDisaster,
  };
}
