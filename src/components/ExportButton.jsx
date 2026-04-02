import { Download } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIGS } from '../engine/LevelConfigs';
import Tooltip from './Tooltip';

const NODE_COLORS = {
  server: '#3b82f6',
  database: '#a855f7',
  loadBalancer: '#f59e0b',
  cache: '#22c55e',
  cdn: '#06b6d4',
  trafficSource: '#f97316',
  region: '#64748b',
  replica: '#8b5cf6',
  healthCheck: '#ec4899',
  apiGateway: '#f43f5e',
  messageQueue: '#14b8a6',
  worker: '#0ea5e9',
  autoScaler: '#f97316',
  circuitBreaker: '#ef4444',
};

const CANVAS_PADDING = 60;
const NODE_WIDTH = 140;
const NODE_HEIGHT = 52;
const HEADER_HEIGHT = 60;
const FOOTER_HEIGHT = 50;
const STATS_HEIGHT = 40;

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function getNodeCenter(node, offsetX, offsetY) {
  return {
    x: node.position.x + offsetX + NODE_WIDTH / 2,
    y: node.position.y + offsetY + NODE_HEIGHT / 2,
  };
}

export default function ExportButton() {
  const handleExport = () => {
    const { nodes, edges, level, grade, rps, latency, metrics } = useGameStore.getState();
    const config = LEVEL_CONFIGS[level];

    if (nodes.length === 0) return;

    // Calculate bounds
    const xs = nodes.map((n) => n.position.x);
    const ys = nodes.map((n) => n.position.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs) + NODE_WIDTH;
    const maxY = Math.max(...ys) + NODE_HEIGHT;

    const graphWidth = maxX - minX + CANVAS_PADDING * 2;
    const graphHeight = maxY - minY + CANVAS_PADDING * 2;
    const canvasWidth = Math.max(graphWidth, 500);
    const canvasHeight = graphHeight + HEADER_HEIGHT + STATS_HEIGHT + FOOTER_HEIGHT;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth * 2;
    canvas.height = canvasHeight * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Header
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 18px Inter, system-ui, sans-serif';
    const titleText = config
      ? `Level ${level} — ${config.name}`
      : `Level ${level}`;
    ctx.fillText(titleText, CANVAS_PADDING, 36);

    if (grade) {
      const titleWidth = ctx.measureText(titleText).width;
      const gradeColors = { S: '#facc15', A: '#22c55e', B: '#3b82f6', C: '#f59e0b', D: '#ef4444' };
      ctx.fillStyle = gradeColors[grade] || '#94a3b8';
      ctx.font = 'bold 20px "JetBrains Mono", monospace';
      ctx.fillText(grade, CANVAS_PADDING + titleWidth + 16, 37);
    }

    // Offset for drawing nodes/edges within the graph area
    const offsetX = (canvasWidth - graphWidth) / 2 + CANVAS_PADDING - minX;
    const offsetY = HEADER_HEIGHT + CANVAS_PADDING - minY;

    // Draw edges
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    for (const edge of edges) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!sourceNode || !targetNode) continue;

      const src = getNodeCenter(sourceNode, offsetX, offsetY);
      const tgt = getNodeCenter(targetNode, offsetX, offsetY);

      ctx.beginPath();
      const midX = (src.x + tgt.x) / 2;
      ctx.moveTo(src.x, src.y);
      ctx.bezierCurveTo(midX, src.y, midX, tgt.y, tgt.x, tgt.y);
      ctx.stroke();

      // Arrowhead
      const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x);
      const arrowLen = 8;
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(tgt.x, tgt.y);
      ctx.lineTo(
        tgt.x - arrowLen * Math.cos(angle - Math.PI / 6),
        tgt.y - arrowLen * Math.sin(angle - Math.PI / 6),
      );
      ctx.lineTo(
        tgt.x - arrowLen * Math.cos(angle + Math.PI / 6),
        tgt.y - arrowLen * Math.sin(angle + Math.PI / 6),
      );
      ctx.closePath();
      ctx.fill();
    }

    // Draw nodes
    for (const node of nodes) {
      const x = node.position.x + offsetX;
      const y = node.position.y + offsetY;
      const color = NODE_COLORS[node.type] || '#64748b';

      // Node body
      drawRoundedRect(ctx, x, y, NODE_WIDTH, NODE_HEIGHT, 10);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Color accent bar at top
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + 10, y);
      ctx.lineTo(x + NODE_WIDTH - 10, y);
      ctx.quadraticCurveTo(x + NODE_WIDTH, y, x + NODE_WIDTH, y + 4);
      ctx.lineTo(x, y + 4);
      ctx.quadraticCurveTo(x, y, x + 10, y);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();

      // Label
      const label = node.data?.label || node.type;
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + NODE_WIDTH / 2, y + 28, NODE_WIDTH - 16);

      // Sub-label (type)
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillText(node.type, x + NODE_WIDTH / 2, y + 44, NODE_WIDTH - 16);
      ctx.textAlign = 'left';
    }

    // Stats bar
    const statsY = HEADER_HEIGHT + graphHeight + CANVAS_PADDING + 8;
    ctx.fillStyle = '#1e293b';
    drawRoundedRect(ctx, CANVAS_PADDING, statsY, canvasWidth - CANVAS_PADDING * 2, 28, 8);
    ctx.fill();

    ctx.font = '12px "JetBrains Mono", monospace';
    const statItems = [
      { label: 'RPS', value: Math.round(rps).toLocaleString(), color: '#3b82f6' },
      { label: 'Latency', value: `${Math.round(latency)}ms`, color: latency > 200 ? '#ef4444' : latency > 100 ? '#f59e0b' : '#22c55e' },
      { label: 'Health', value: `${Math.round(metrics.healthPercent)}%`, color: metrics.healthPercent > 70 ? '#22c55e' : metrics.healthPercent > 30 ? '#f59e0b' : '#ef4444' },
      { label: 'Nodes', value: String(nodes.length), color: '#94a3b8' },
    ];

    let statX = CANVAS_PADDING + 16;
    for (const stat of statItems) {
      ctx.fillStyle = '#64748b';
      ctx.fillText(`${stat.label}: `, statX, statsY + 18);
      const labelWidth = ctx.measureText(`${stat.label}: `).width;
      ctx.fillStyle = stat.color;
      ctx.fillText(stat.value, statX + labelWidth, statsY + 18);
      statX += labelWidth + ctx.measureText(stat.value).width + 28;
    }

    // Footer
    const footerY = canvasHeight - 20;
    ctx.fillStyle = '#475569';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillText('System Design Sim', CANVAS_PADDING, footerY);

    ctx.textAlign = 'right';
    ctx.fillText(new Date().toLocaleDateString(), canvasWidth - CANVAS_PADDING, footerY);
    ctx.textAlign = 'left';

    // Download
    const link = document.createElement('a');
    link.download = `system-design-level-${level}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <Tooltip text="Export canvas as PNG" position="bottom">
      <button
        onClick={handleExport}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 10,
          padding: '6px 12px',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'background 150ms, color 150ms',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-secondary)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-tertiary)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        <Download size={14} />
        Export PNG
      </button>
    </Tooltip>
  );
}
