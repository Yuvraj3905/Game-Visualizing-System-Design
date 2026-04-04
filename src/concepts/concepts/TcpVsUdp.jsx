import { useState, useRef, useCallback, useEffect } from 'react';

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
});

const PACKET_COUNT = 6;
const TCP_INTERVAL = 200;
const UDP_DROP_CHANCE = 0.25;

function makePackets() {
  return Array.from({ length: PACKET_COUNT }, (_, i) => ({
    id: i + 1,
    label: `P${i + 1}`,
    status: 'pending', // 'pending' | 'delivered' | 'dropped'
  }));
}

export default function TcpVsUdp() {
  const [tcpPackets, setTcpPackets] = useState(makePackets());
  const [udpPackets, setUdpPackets] = useState(makePackets());
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);

  const timeoutsRef = useRef([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

  const sendPackets = useCallback(() => {
    clearAllTimeouts();
    setTcpPackets(makePackets());
    setUdpPackets(makePackets());
    setResults(null);
    setRunning(true);

    const tcpStart = performance.now();
    let tcpDone = false;
    let udpDone = false;
    let tcpEndTime = 0;
    let udpEndTime = 0;
    let udpDelivered = 0;
    let udpDropped = 0;

    // Track completion
    const checkDone = () => {
      if (tcpDone && udpDone) {
        setRunning(false);
        setResults({
          tcpDelivered: PACKET_COUNT,
          tcpLost: 0,
          tcpTime: Math.round(tcpEndTime - tcpStart),
          udpDelivered,
          udpLost: udpDropped,
          udpTime: Math.round(udpEndTime - tcpStart),
        });
      }
    };

    // TCP: sequential delivery, one packet every ~200ms
    for (let i = 0; i < PACKET_COUNT; i++) {
      const delay = TCP_INTERVAL * (i + 1);
      const id = setTimeout(() => {
        const packetId = i + 1;
        setTcpPackets(prev =>
          prev.map(p => p.id === packetId ? { ...p, status: 'delivered' } : p)
        );
        if (packetId === PACKET_COUNT) {
          tcpEndTime = performance.now();
          tcpDone = true;
          checkDone();
        }
      }, delay);
      timeoutsRef.current.push(id);
    }

    // UDP: random delays, random drops
    const udpTimings = Array.from({ length: PACKET_COUNT }, () =>
      Math.floor(Math.random() * (350 - 50 + 1)) + 50
    );
    const udpDrops = Array.from({ length: PACKET_COUNT }, () =>
      Math.random() < UDP_DROP_CHANCE
    );

    // Count up-front for results tracking
    udpDelivered = udpDrops.filter(d => !d).length;
    udpDropped = udpDrops.filter(d => d).length;

    let udpFinished = 0;
    let maxUdpTime = 0;

    for (let i = 0; i < PACKET_COUNT; i++) {
      const delay = udpTimings[i];
      const dropped = udpDrops[i];
      const packetId = i + 1;
      if (delay > maxUdpTime) maxUdpTime = delay;

      const id = setTimeout(() => {
        setUdpPackets(prev =>
          prev.map(p => p.id === packetId ? { ...p, status: dropped ? 'dropped' : 'delivered' } : p)
        );
        udpFinished++;
        if (udpFinished === PACKET_COUNT) {
          udpEndTime = performance.now();
          udpDone = true;
          checkDone();
        }
      }, delay);
      timeoutsRef.current.push(id);
    }
  }, [clearAllTimeouts]);

  const packetStyle = (status, protocol) => {
    const isInfo = protocol === 'tcp';
    const baseColor = isInfo ? 'var(--color-info)' : 'var(--color-healthy)';

    if (status === 'pending') {
      return {
        width: 36, height: 36,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 6,
        border: '1.5px solid var(--border-primary)',
        background: 'var(--bg-tertiary)',
        color: 'var(--text-muted)',
        fontSize: 11, fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
        transition: 'all 250ms',
      };
    }
    if (status === 'delivered') {
      return {
        width: 36, height: 36,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 6,
        border: `2px solid ${baseColor}`,
        background: `color-mix(in srgb, ${baseColor} 15%, var(--bg-tertiary))`,
        color: baseColor,
        fontSize: 11, fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
        transition: 'all 250ms',
      };
    }
    // dropped
    return {
      width: 36, height: 36,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 6,
      border: '2px solid var(--color-critical)',
      background: 'color-mix(in srgb, var(--color-critical) 12%, var(--bg-tertiary))',
      color: 'var(--color-critical)',
      fontSize: 11, fontWeight: 700,
      fontFamily: "'JetBrains Mono', monospace",
      textDecoration: 'line-through',
      transition: 'all 250ms',
    };
  };

  return (
    <div style={{
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: 20,
      borderRadius: 12,
      border: '1px solid var(--border-primary)',
      maxWidth: 420,
      fontFamily: "'Inter', sans-serif",
    }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, color: 'var(--text-accent)' }}>TCP vs UDP</h3>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        TCP guarantees delivery via acknowledgements but adds latency. UDP is faster but packets may be lost.
      </p>

      {/* TCP Lane */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: 'var(--color-info)',
            background: 'color-mix(in srgb, var(--color-info) 15%, var(--bg-tertiary))',
            border: '1px solid var(--color-info)',
            borderRadius: 4, padding: '2px 7px',
            fontFamily: "'JetBrains Mono', monospace",
          }}>TCP</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Sequential delivery · ~{TCP_INTERVAL * PACKET_COUNT}ms · 100% reliable
          </span>
        </div>
        <div style={{
          display: 'flex', gap: 6, flexWrap: 'wrap',
          padding: 12, background: 'var(--bg-secondary)',
          borderRadius: 8, border: '1px solid var(--border-primary)',
          minHeight: 60, alignItems: 'center',
        }}>
          {tcpPackets.map(p => (
            <div key={p.id} style={packetStyle(p.status, 'tcp')}>
              {p.label}
            </div>
          ))}
        </div>
      </div>

      {/* UDP Lane */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: 'var(--color-healthy)',
            background: 'color-mix(in srgb, var(--color-healthy) 15%, var(--bg-tertiary))',
            border: '1px solid var(--color-healthy)',
            borderRadius: 4, padding: '2px 7px',
            fontFamily: "'JetBrains Mono', monospace",
          }}>UDP</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Random delays · 50–350ms · ~25% drop rate
          </span>
        </div>
        <div style={{
          display: 'flex', gap: 6, flexWrap: 'wrap',
          padding: 12, background: 'var(--bg-secondary)',
          borderRadius: 8, border: '1px solid var(--border-primary)',
          minHeight: 60, alignItems: 'center',
        }}>
          {udpPackets.map(p => (
            <div key={p.id} style={packetStyle(p.status, 'udp')}>
              {p.label}
            </div>
          ))}
        </div>
      </div>

      {/* Send button */}
      <button
        onClick={sendPackets}
        disabled={running}
        style={{
          padding: '8px 20px',
          background: running ? 'var(--bg-tertiary)' : 'var(--text-accent)',
          color: running ? 'var(--text-muted)' : 'var(--bg-primary)',
          border: `1px solid ${running ? 'var(--border-primary)' : 'var(--text-accent)'}`,
          borderRadius: 8, fontSize: 13, fontWeight: 700,
          cursor: running ? 'not-allowed' : 'pointer',
          transition: 'all 150ms',
          marginBottom: results ? 16 : 0,
        }}
      >
        {running ? 'Sending…' : 'Send Packets'}
      </button>

      {/* Results panel */}
      {results && (
        <div style={{
          padding: 14, background: 'var(--bg-secondary)',
          borderRadius: 8, border: '1px solid var(--border-primary)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
            Results
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {/* TCP column */}
            <div style={{
              padding: 10, borderRadius: 6,
              background: 'color-mix(in srgb, var(--color-info) 8%, var(--bg-tertiary))',
              border: '1px solid color-mix(in srgb, var(--color-info) 30%, transparent)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-info)', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>TCP</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <div>
                  <span style={{ color: 'var(--color-healthy)', fontWeight: 700 }}>{results.tcpDelivered}/{PACKET_COUNT}</span>
                  {' '}delivered
                </div>
                <div>
                  <span style={{ color: 'var(--color-critical)', fontWeight: 700 }}>{results.tcpLost}</span>
                  {' '}lost
                </div>
                <div style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                  {results.tcpTime}ms total
                </div>
              </div>
            </div>
            {/* UDP column */}
            <div style={{
              padding: 10, borderRadius: 6,
              background: 'color-mix(in srgb, var(--color-healthy) 8%, var(--bg-tertiary))',
              border: '1px solid color-mix(in srgb, var(--color-healthy) 30%, transparent)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-healthy)', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>UDP</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <div>
                  <span style={{ color: 'var(--color-healthy)', fontWeight: 700 }}>{results.udpDelivered}/{PACKET_COUNT}</span>
                  {' '}delivered
                </div>
                <div>
                  <span style={{ color: 'var(--color-critical)', fontWeight: 700 }}>{results.udpLost}</span>
                  {' '}lost
                </div>
                <div style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                  {results.udpTime}ms total
                </div>
              </div>
            </div>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            TCP ensures every packet is acknowledged and retransmitted if lost — zero data loss, but sequencing adds latency.
            UDP fires and forgets — lower latency, ideal for real-time streams where a lost frame is acceptable.
          </p>
        </div>
      )}
    </div>
  );
}
