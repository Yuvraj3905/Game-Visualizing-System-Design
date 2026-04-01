import { getBezierPath } from 'reactflow';

export default function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  selected,
}) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const rps = data?.rps || 0;
  const dotCount = rps === 0 ? 0 : Math.min(Math.max(Math.ceil(rps / 500), 1), 6);
  const duration = rps === 0 ? 3 : Math.max(3 - (rps / 2000), 0.8);

  const strokeColor = selected ? 'var(--color-critical)' : 'var(--border-primary)';
  const strokeWidth = selected ? 3 : 2;

  return (
    <g>
      {/* Wider transparent hit area for easier clicking */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
      />
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        style={style}
      />
      {rps > 0 && !selected && (
        <path
          d={edgePath}
          fill="none"
          stroke="var(--color-info)"
          strokeWidth={1}
          strokeOpacity={0.4}
        />
      )}
      {Array.from({ length: dotCount }).map((_, i) => (
        <circle
          key={i}
          r={3}
          fill={selected ? 'var(--color-critical)' : 'var(--color-info)'}
          style={{
            offsetPath: `path("${edgePath}")`,
            animation: `dot-flow ${duration}s linear infinite`,
            animationDelay: `${(i / dotCount) * duration}s`,
            filter: selected ? 'drop-shadow(0 0 3px var(--color-critical-glow))' : 'drop-shadow(0 0 3px var(--color-info-glow))',
          }}
        />
      ))}
    </g>
  );
}
