export const LEVEL_OBJECTIVES = {
  1: [
    { label: 'Reach 1,000 RPS', check: (m) => m.rps >= 1000 },
    { label: '0 overloaded servers', check: (m) => m.overloadedServers === 0 },
  ],
  2: [
    { label: 'Reach 3,000 RPS', check: (m) => m.rps >= 3000 },
    { label: 'Even traffic distribution', check: (m) => m.overloadedServers === 0 },
  ],
  3: [
    { label: 'Reach 5,000 RPS', check: (m) => m.rps >= 5000 },
    { label: 'Latency < 100ms', check: (m) => m.avgLatency < 100 },
  ],
  4: [
    { label: 'Reach 8,000 RPS', check: (m) => m.rps >= 8000 },
    { label: 'Max region latency < 200ms', check: (m) => m.maxRegionLatency < 200 },
    { label: '0 bounced users', check: (m) => m.bouncedUsers === 0 },
  ],
  5: [
    { label: 'Survive disaster', check: (m) => m.survivedDisaster === true },
    { label: 'Maintain 5,000+ RPS', check: (m) => m.rps >= 5000 },
  ],
};
