const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 72;
const AXES = ['cost', 'latency', 'resilience', 'simplicity'];
const LABELS = ['Cost', 'Latency', 'Resilience', 'Simplicity'];
const GRID_LEVELS = [25, 50, 75, 100];

// 4 axes: top, right, bottom, left (starting from top, going clockwise)
const ANGLES = AXES.map((_, i) => (i * Math.PI * 2) / AXES.length - Math.PI / 2);

function polarToXY(angle, r) {
  return {
    x: CENTER + r * Math.cos(angle),
    y: CENTER + r * Math.sin(angle),
  };
}

function scoreColor(score) {
  if (score >= 80) return 'var(--color-healthy)';
  if (score >= 60) return 'var(--color-info)';
  if (score >= 40) return 'var(--color-warning)';
  return 'var(--color-critical)';
}

export default function RadarChart({ scores }) {
  const values = AXES.map(key => scores[key] ?? 0);

  // Build the filled polygon points
  const polygonPoints = ANGLES.map((angle, i) => {
    const r = (values[i] / 100) * RADIUS;
    const { x, y } = polarToXY(angle, r);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{ width: '100%', maxWidth: SIZE, display: 'block', margin: '0 auto' }}
      aria-label="Performance radar chart"
    >
      {/* Grid rings */}
      {GRID_LEVELS.map(level => {
        const r = (level / 100) * RADIUS;
        const ringPoints = ANGLES.map(angle => {
          const { x, y } = polarToXY(angle, r);
          return `${x},${y}`;
        }).join(' ');
        return (
          <polygon
            key={level}
            points={ringPoints}
            fill="none"
            stroke="var(--bg-tertiary)"
            strokeWidth="1"
          />
        );
      })}

      {/* Axis lines from center to each vertex */}
      {ANGLES.map((angle, i) => {
        const { x, y } = polarToXY(angle, RADIUS);
        return (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="var(--bg-tertiary)"
            strokeWidth="1"
          />
        );
      })}

      {/* Filled score polygon */}
      <polygon
        points={polygonPoints}
        fill="var(--text-accent)"
        fillOpacity="0.18"
        stroke="var(--text-accent)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Dots and labels at each vertex */}
      {ANGLES.map((angle, i) => {
        const score = values[i];
        const dotR = (score / 100) * RADIUS;
        const dot = polarToXY(angle, dotR);
        const labelPos = polarToXY(angle, RADIUS + 20);
        const scorePos = polarToXY(angle, RADIUS + 11);
        const color = scoreColor(score);

        // Adjust label text-anchor based on position
        const dx = Math.cos(angle);
        const textAnchor = dx > 0.1 ? 'start' : dx < -0.1 ? 'end' : 'middle';

        return (
          <g key={i}>
            {/* Score dot on polygon vertex */}
            <circle cx={dot.x} cy={dot.y} r={3.5} fill={color} />

            {/* Axis label */}
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fontSize="9"
              fontFamily="Inter, sans-serif"
              fill="var(--text-secondary)"
              fontWeight="600"
            >
              {LABELS[i]}
            </text>

            {/* Score number */}
            <text
              x={scorePos.x}
              y={scorePos.y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fontSize="8"
              fontFamily="'JetBrains Mono', monospace"
              fill={color}
              fontWeight="700"
            >
              {score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
