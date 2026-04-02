import { AlertTriangle, TrendingDown, Server, Zap, ArrowRight, Shield, Database, Globe, Layers } from 'lucide-react';
import useGameStore from '../store/useGameStore';

// --- Analysis helpers ---

function findBottlenecks(nodes, metrics) {
  const bottlenecks = [];

  // System-wide outage: primary DB is the bottleneck
  if (metrics.systemDown) {
    const primaryDb = nodes.find(n => n.type === 'database' && n.data.isPrimary);
    if (primaryDb) {
      bottlenecks.push({
        id: primaryDb.id,
        label: primaryDb.data.label || 'Primary Database',
        type: 'database',
        reason: 'Primary database went down causing full system outage',
        rps: primaryDb.data.rps || 0,
        capacity: primaryDb.data.capacity || 0,
      });
    }
  }

  // Overloaded servers
  nodes
    .filter(n => n.type === 'server' && n.data.rps > n.data.capacity)
    .forEach(n => {
      bottlenecks.push({
        id: n.id,
        label: n.data.label || 'Server',
        type: 'server',
        reason: `Overloaded: ${n.data.rps.toLocaleString()} / ${n.data.capacity.toLocaleString()} RPS`,
        rps: n.data.rps,
        capacity: n.data.capacity,
      });
    });

  // Overloaded databases
  nodes
    .filter(n => n.type === 'database' && n.data.rps > n.data.capacity)
    .forEach(n => {
      if (!bottlenecks.some(b => b.id === n.id)) {
        bottlenecks.push({
          id: n.id,
          label: n.data.label || 'Database',
          type: 'database',
          reason: `Overloaded: ${n.data.rps.toLocaleString()} / ${n.data.capacity.toLocaleString()} RPS`,
          rps: n.data.rps,
          capacity: n.data.capacity,
        });
      }
    });

  // Bounced users: regions without CDN
  if (metrics.bouncedUsers > 0) {
    const trafficSources = nodes.filter(n => n.type === 'trafficSource');
    trafficSources.forEach(ts => {
      if (!bottlenecks.some(b => b.id === ts.id)) {
        bottlenecks.push({
          id: ts.id,
          label: ts.data.label || 'Traffic Source',
          type: 'trafficSource',
          reason: `${metrics.bouncedUsers.toLocaleString()} users bounced — no CDN edge caching`,
          rps: ts.data.rps || 0,
          capacity: 0,
        });
      }
    });
  }

  // High latency: DB nodes without cache upstream
  if (metrics.avgLatency > 200) {
    nodes
      .filter(n => n.type === 'database')
      .forEach(n => {
        if (!bottlenecks.some(b => b.id === n.id)) {
          bottlenecks.push({
            id: n.id,
            label: n.data.label || 'Database',
            type: 'database',
            reason: 'High latency — no cache layer to absorb read traffic',
            rps: n.data.rps || 0,
            capacity: n.data.capacity || 0,
          });
        }
      });
  }

  return bottlenecks;
}

function buildFailureChain(nodes, edges, bottlenecks) {
  const chains = [];
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  // Build adjacency (reverse direction: target -> sources)
  const incomingEdges = {};
  edges.forEach(e => {
    if (!incomingEdges[e.target]) incomingEdges[e.target] = [];
    incomingEdges[e.target].push(e.source);
  });

  bottlenecks.forEach(bottleneck => {
    const visited = new Set();
    const path = [];

    // Walk backwards from bottleneck to find traffic sources
    function walk(nodeId) {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      const sources = incomingEdges[nodeId] || [];
      sources.forEach(srcId => {
        const srcNode = nodeMap[srcId];
        const tgtNode = nodeMap[nodeId];
        if (srcNode && tgtNode) {
          path.push({
            from: srcNode.data.label || srcNode.type,
            fromId: srcId,
            to: tgtNode.data.label || tgtNode.type,
            toId: nodeId,
            toOverloaded: nodeId === bottleneck.id,
          });
          walk(srcId);
        }
      });
    }

    walk(bottleneck.id);

    if (path.length > 0) {
      // Reverse so the chain reads source -> ... -> bottleneck
      chains.push(path.reverse());
    }
  });

  return chains;
}

function getSuggestions(nodes, metrics) {
  const suggestions = [];
  const types = new Set(nodes.map(n => n.type));

  if (!types.has('loadBalancer')) {
    suggestions.push('Add a Load Balancer to distribute traffic evenly across servers');
  }

  if (!types.has('cache')) {
    suggestions.push('Add a Cache (Redis) to reduce database load and latency');
  }

  const overloadedServers = nodes.filter(n => n.type === 'server' && n.data.rps > n.data.capacity);
  if (overloadedServers.length > 0) {
    suggestions.push('Add more servers to increase total compute capacity');
  }

  if (!types.has('cdn')) {
    suggestions.push('Add a CDN for edge caching to reduce origin load');
  }

  const hasReplica = types.has('replica');
  const dbOverloaded = nodes.some(n => n.type === 'database' && n.data.rps > n.data.capacity);
  if (!hasReplica && dbOverloaded) {
    suggestions.push('Add database read replicas to scale read throughput');
  }

  if (metrics.systemDown && !types.has('healthCheck')) {
    suggestions.push('Add Health Checks for automatic failure detection');
  }

  if (suggestions.length === 0) {
    suggestions.push('Review your topology — ensure all servers are connected to the load balancer');
  }

  return suggestions;
}

// --- Styles ---

const monoFont = "'JetBrains Mono', monospace";

const sectionStyle = {
  marginBottom: 20,
};

const sectionTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  marginBottom: 10,
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--text-muted)',
};

const bottleneckCardStyle = {
  background: 'var(--bg-primary)',
  border: '1px solid var(--color-critical)',
  borderRadius: 10,
  padding: '10px 14px',
  marginBottom: 8,
};

const metricBoxStyle = {
  background: 'var(--bg-primary)',
  borderRadius: 8,
  padding: '8px 12px',
  flex: 1,
  minWidth: 80,
  textAlign: 'center',
};

const suggestionPillStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: 'var(--bg-primary)',
  border: '1px solid var(--color-healthy)',
  borderRadius: 20,
  padding: '6px 14px',
  marginRight: 8,
  marginBottom: 8,
  fontSize: 12,
  color: 'var(--color-healthy)',
  fontWeight: 600,
};

const chainContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 4,
  marginBottom: 8,
  padding: '8px 12px',
  background: 'var(--bg-primary)',
  borderRadius: 8,
};

const chainNodeStyle = (isOverloaded) => ({
  fontSize: 12,
  fontFamily: monoFont,
  fontWeight: 600,
  color: isOverloaded ? 'var(--color-critical)' : 'var(--text-secondary)',
  whiteSpace: 'nowrap',
});

// --- Component ---

export default function FailurePostMortem() {
  const { nodes, edges, metrics, rps, latency } = useGameStore();

  const bottlenecks = findBottlenecks(nodes, metrics);
  const chains = buildFailureChain(nodes, edges, bottlenecks);
  const suggestions = getSuggestions(nodes, metrics);

  const overloadedCount = nodes.filter(
    n => (n.type === 'server' || n.type === 'database') && n.data.rps > n.data.capacity
  ).length;

  return (
    <div style={{ textAlign: 'left', marginTop: 16 }}>
      {/* Bottleneck Analysis */}
      {bottlenecks.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <AlertTriangle size={13} style={{ color: 'var(--color-critical)' }} />
            <span>Bottleneck Analysis</span>
          </div>
          {bottlenecks.map((b) => (
            <div key={b.id} style={bottleneckCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {b.type === 'server' && <Server size={14} style={{ color: 'var(--color-critical)' }} />}
                {b.type === 'database' && <Database size={14} style={{ color: 'var(--color-critical)' }} />}
                {b.type === 'trafficSource' && <Globe size={14} style={{ color: 'var(--color-critical)' }} />}
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {b.label}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {b.reason}
              </div>
              {b.capacity > 0 && (
                <div style={{
                  marginTop: 6,
                  height: 4,
                  borderRadius: 2,
                  background: 'var(--bg-tertiary)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min((b.rps / b.capacity) * 100, 100)}%`,
                    background: 'var(--color-critical)',
                    borderRadius: 2,
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Metrics Snapshot */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <TrendingDown size={13} style={{ color: 'var(--color-warning)' }} />
          <span>Metrics at Failure</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={metricBoxStyle}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>RPS</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: monoFont, color: 'var(--text-accent)' }}>
              {(metrics.rps || rps || 0).toLocaleString()}
            </div>
          </div>
          <div style={metricBoxStyle}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Latency</div>
            <div style={{
              fontSize: 16, fontWeight: 700, fontFamily: monoFont,
              color: (metrics.avgLatency || latency) > 200 ? 'var(--color-critical)' : 'var(--text-accent)',
            }}>
              {Math.round(metrics.avgLatency || latency || 0)}ms
            </div>
          </div>
          <div style={metricBoxStyle}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Overloaded</div>
            <div style={{
              fontSize: 16, fontWeight: 700, fontFamily: monoFont,
              color: overloadedCount > 0 ? 'var(--color-critical)' : 'var(--color-healthy)',
            }}>
              {overloadedCount}
            </div>
          </div>
          <div style={metricBoxStyle}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Health</div>
            <div style={{
              fontSize: 16, fontWeight: 700, fontFamily: monoFont,
              color: metrics.healthPercent < 50 ? 'var(--color-critical)'
                : metrics.healthPercent < 80 ? 'var(--color-warning)'
                : 'var(--color-healthy)',
            }}>
              {Math.round(metrics.healthPercent || 0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Failure Chain */}
      {chains.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <Zap size={13} style={{ color: 'var(--color-warning)' }} />
            <span>Failure Chain</span>
          </div>
          {chains.map((chain, ci) => {
            // Flatten chain into unique ordered node labels
            const seen = new Set();
            const orderedNodes = [];
            chain.forEach(link => {
              if (!seen.has(link.fromId)) {
                seen.add(link.fromId);
                orderedNodes.push({ label: link.from, id: link.fromId, overloaded: false });
              }
              if (!seen.has(link.toId)) {
                seen.add(link.toId);
                orderedNodes.push({ label: link.to, id: link.toId, overloaded: link.toOverloaded });
              }
            });

            return (
              <div key={ci} style={chainContainerStyle}>
                {orderedNodes.map((node, ni) => (
                  <span key={node.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={chainNodeStyle(node.overloaded)}>
                      {node.label}
                      {node.overloaded && (
                        <span style={{
                          marginLeft: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--color-critical)',
                          textTransform: 'uppercase',
                        }}>
                          (overloaded)
                        </span>
                      )}
                    </span>
                    {ni < orderedNodes.length - 1 && (
                      <ArrowRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    )}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Suggestions */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <Shield size={13} style={{ color: 'var(--color-healthy)' }} />
          <span>Suggested Fixes</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {suggestions.map((s, i) => (
            <span key={i} style={suggestionPillStyle}>
              <Layers size={12} />
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
