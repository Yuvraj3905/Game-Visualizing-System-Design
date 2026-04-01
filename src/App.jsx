import React, { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import useGameStore from './store/useGameStore';

import ServerNode from './game-nodes/ServerNode';
import DatabaseNode from './game-nodes/DatabaseNode';
import TrafficSourceNode from './game-nodes/TrafficSourceNode';
import LoadBalancerNode from './game-nodes/LoadBalancerNode';
import CacheNode from './game-nodes/CacheNode';
import CDNNode from './game-nodes/CDNNode';
import RegionNode from './game-nodes/RegionNode';
import ReplicaNode from './game-nodes/ReplicaNode';
import HealthCheckNode from './game-nodes/HealthCheckNode';
import DeletableNodeWrapper from './game-nodes/DeletableNodeWrapper';

import HUD from './components/HUD';
import ComponentTray from './components/ComponentTray';
import LevelIntro from './components/LevelIntro';
import WinScreen from './components/WinScreen';
import FailScreen from './components/FailScreen';
import LevelSelect from './components/LevelSelect';
import SustainBar from './components/SustainBar';
import AnimatedEdge from './components/AnimatedEdge';
import ObjectivePanel from './components/ObjectivePanel';
import GuidedTour from './components/GuidedTour';

// HOC to wrap deletable nodes — defined at module scope for referential stability
const withDeletable = (Component) => {
  const Wrapped = (props) => (
    <DeletableNodeWrapper id={props.id}>
      <Component {...props} />
    </DeletableNodeWrapper>
  );
  Wrapped.displayName = `Deletable(${Component.displayName || Component.name})`;
  return Wrapped;
};

const nodeTypes = {
  server: withDeletable(ServerNode),
  database: withDeletable(DatabaseNode),
  loadBalancer: withDeletable(LoadBalancerNode),
  cache: withDeletable(CacheNode),
  cdn: withDeletable(CDNNode),
  region: withDeletable(RegionNode),
  replica: withDeletable(ReplicaNode),
  healthCheck: withDeletable(HealthCheckNode),
  trafficSource: TrafficSourceNode, // never deletable — part of level setup
};

const edgeTypes = {
  animated: AnimatedEdge,
};

export default function App() {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: storeSetNodes,
    setEdges: storeSetEdges,
    loadLevel,
    addNode,
  } = useGameStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      loadLevel(1);
    }
  }, [loadLevel]);

  useEffect(() => {
    setNodes(storeNodes);
  }, [storeNodes, setNodes]);

  useEffect(() => {
    setEdges(storeEdges);
  }, [storeEdges, setEdges]);

  const handleNodesChange = useCallback((changes) => {
    const { gameStatus } = useGameStore.getState();
    // Block keyboard-triggered removals when not playing
    const filtered = gameStatus === 'playing'
      ? changes
      : changes.filter(c => c.type !== 'remove');

    onNodesChange(filtered);
    const positionChanges = filtered.filter(c => c.type === 'position' && c.position);
    if (positionChanges.length > 0) {
      storeSetNodes(nds =>
        nds.map(n => {
          const change = positionChanges.find(c => c.id === n.id);
          return change ? { ...n, position: change.position } : n;
        })
      );
    }
  }, [onNodesChange, storeSetNodes]);

  const handleEdgesChange = useCallback((changes) => {
    const { gameStatus } = useGameStore.getState();
    const filtered = gameStatus === 'playing'
      ? changes
      : changes.filter(c => c.type !== 'remove');

    onEdgesChange(filtered);

    const removals = filtered.filter(c => c.type === 'remove');
    if (removals.length > 0) {
      const removedIds = new Set(removals.map(c => c.id));
      storeSetEdges(eds => eds.filter(e => !removedIds.has(e.id)));
    }
  }, [onEdgesChange, storeSetEdges]);

  const onConnect = useCallback((params) => {
    const newEdge = { ...params, id: `e-${params.source}-${params.target}`, animated: true };
    setEdges(eds => addEdge(newEdge, eds));
    storeSetEdges(eds => [...eds, newEdge]);
  }, [setEdges, storeSetEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds) return;

    const position = {
      x: event.clientX - bounds.left - 180,
      y: event.clientY - bounds.top - 72,
    };

    addNode(type, position);
  }, [addNode]);

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <HUD />

      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        <ComponentTray />

        <div
          data-tour="canvas"
          ref={reactFlowWrapper}
          style={{ flex: 1, position: 'relative' }}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{ type: 'animated', animated: true }}
            deleteKeyCode="Delete"
            edgesFocusable={true}
            fitView
          >
            <Background color="var(--border-primary)" gap={24} size={1} />
            <Controls />
            <MiniMap
              nodeStrokeWidth={3}
              nodeColor={(node) => {
                const colorMap = {
                  server: '#3b82f6',
                  database: '#a855f7',
                  loadBalancer: '#f59e0b',
                  cache: '#22c55e',
                  cdn: '#06b6d4',
                  trafficSource: '#f97316',
                  region: '#64748b',
                  replica: '#8b5cf6',
                  healthCheck: '#ec4899',
                };
                return colorMap[node.type] || '#666';
              }}
            />
          </ReactFlow>
          <SustainBar />
          <ObjectivePanel />
        </div>
      </div>

      <LevelIntro />
      <WinScreen />
      <FailScreen />
      <LevelSelect />
      <GuidedTour />
    </div>
  );
}
