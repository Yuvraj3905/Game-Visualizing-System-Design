import { useState, useCallback } from 'react';

const toggleStyle = (active) => ({
  padding: '6px 14px',
  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
  color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
  border: `1px solid ${active ? 'var(--text-accent)' : 'var(--border-primary)'}`,
  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
});

const EVENTS = [
  {
    type: 'UserCreated',
    data: { userId: 'u1', name: 'Alice', email: 'alice@example.com' },
    color: '#38bdf8',
  },
  {
    type: 'OrderPlaced',
    data: { orderId: 'o1', items: ['Book', 'Pen'], amount: 42.00 },
    color: '#a78bfa',
  },
  {
    type: 'PaymentProcessed',
    data: { orderId: 'o1', amount: 42.00, method: 'card' },
    color: '#22c55e',
  },
  {
    type: 'OrderShipped',
    data: { orderId: 'o1', trackingId: 'TRK-001' },
    color: '#14b8a6',
  },
  {
    type: 'OrderPlaced',
    data: { orderId: 'o2', items: ['Laptop'], amount: 899.00 },
    color: '#a78bfa',
  },
  {
    type: 'OrderCancelled',
    data: { orderId: 'o2', reason: 'Out of stock' },
    color: '#f87171',
  },
  {
    type: 'RefundIssued',
    data: { orderId: 'o2', amount: 899.00 },
    color: '#f59e0b',
  },
];

function replayTo(index) {
  const state = { userName: null, orders: {}, balance: 0 };
  for (let i = 0; i <= index; i++) {
    const ev = EVENTS[i];
    switch (ev.type) {
      case 'UserCreated':
        state.userName = ev.data.name;
        break;
      case 'OrderPlaced':
        state.orders[ev.data.orderId] = { status: 'placed', amount: ev.data.amount };
        state.balance -= ev.data.amount;
        break;
      case 'PaymentProcessed':
        if (state.orders[ev.data.orderId]) {
          state.orders[ev.data.orderId].status = 'paid';
        }
        break;
      case 'OrderShipped':
        if (state.orders[ev.data.orderId]) {
          state.orders[ev.data.orderId].status = 'shipped';
        }
        break;
      case 'OrderCancelled':
        if (state.orders[ev.data.orderId]) {
          state.orders[ev.data.orderId].status = 'cancelled';
        }
        break;
      case 'RefundIssued':
        if (state.orders[ev.data.orderId]) {
          state.orders[ev.data.orderId].status = 'refunded';
          state.balance += ev.data.amount;
        }
        break;
      default:
        break;
    }
  }
  return state;
}

function orderStatusColor(status) {
  if (status === 'cancelled' || status === 'refunded') return 'var(--color-critical)';
  if (status === 'shipped') return 'var(--color-healthy)';
  return 'var(--text-primary)';
}

export default function EventSourcing() {
  const [cursor, setCursor] = useState(0);

  const aggregate = replayTo(cursor);

  const goFirst = useCallback(() => setCursor(0), []);
  const goBack = useCallback(() => setCursor(c => Math.max(0, c - 1)), []);
  const goForward = useCallback(() => setCursor(c => Math.min(EVENTS.length - 1, c + 1)), []);
  const goLast = useCallback(() => setCursor(EVENTS.length - 1), []);

  return (
    <div style={{
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: 20,
      borderRadius: 12,
      border: '1px solid var(--border-primary)',
      maxWidth: 500,
      fontFamily: "'Inter', sans-serif",
    }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, color: 'var(--text-accent)' }}>Event Sourcing</h3>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--text-muted)' }}>
        Click any event to replay aggregate state up to that point.
      </p>

      {/* Event Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {EVENTS.map((ev, i) => {
          const isCurrent = i === cursor;
          const isDimmed = i > cursor;
          return (
            <div
              key={i}
              onClick={() => setCursor(i)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 8,
                border: isCurrent
                  ? `2px solid ${ev.color}`
                  : '1px solid var(--border-primary)',
                background: isCurrent ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                opacity: isDimmed ? 0.35 : 1,
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
            >
              {/* Index + color dot */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 28 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: ev.color, flexShrink: 0, marginTop: 2,
                }} />
                <span style={{
                  fontSize: 10, color: 'var(--text-muted)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>#{i}</span>
              </div>

              {/* Event details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: ev.color, marginBottom: 3 }}>
                  {ev.type}
                </div>
                <div style={{
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--text-muted)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}>
                  {JSON.stringify(ev.data, null, 0)
                    .replace(/[{}"]/g, '')
                    .replace(/,/g, '  ')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        <button style={toggleStyle(false)} onClick={goFirst} disabled={cursor === 0}>First</button>
        <button style={toggleStyle(false)} onClick={goBack} disabled={cursor === 0}>Back</button>
        <button style={toggleStyle(false)} onClick={goForward} disabled={cursor === EVENTS.length - 1}>Forward</button>
        <button style={toggleStyle(false)} onClick={goLast} disabled={cursor === EVENTS.length - 1}>Last</button>
        <span style={{
          marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)',
          fontFamily: "'JetBrains Mono', monospace",
          alignSelf: 'center',
        }}>
          event {cursor + 1} / {EVENTS.length}
        </span>
      </div>

      {/* Aggregate State Panel */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 8,
        padding: 12,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-accent)', marginBottom: 10, letterSpacing: '0.04em' }}>
          AGGREGATE STATE
        </div>

        {/* User */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
            user:{'  '}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: aggregate.userName ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {aggregate.userName ?? '—'}
          </span>
        </div>

        {/* Balance */}
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
            balance:{'  '}
          </span>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            color: aggregate.balance >= 0 ? 'var(--color-healthy)' : 'var(--color-critical)',
          }}>
            ${aggregate.balance.toFixed(2)}
          </span>
        </div>

        {/* Orders */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, fontFamily: "'JetBrains Mono', monospace" }}>
            orders:
          </div>
          {Object.keys(aggregate.orders).length === 0 ? (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 12 }}>—</div>
          ) : (
            Object.entries(aggregate.orders).map(([id, order]) => (
              <div key={id} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
                paddingLeft: 12, marginBottom: 4,
              }}>
                <span style={{
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--text-secondary)',
                }}>
                  {id}
                </span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--text-muted)',
                  }}>
                    ${order.amount.toFixed(2)}
                  </span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: orderStatusColor(order.status),
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
