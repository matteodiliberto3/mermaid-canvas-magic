import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { parseMermaidCode, generateMermaidCode } from '@/lib/mermaidParser';
import dagre from 'dagre';

interface MermaidFlowEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
}

const nodeTypes: NodeTypes = {};

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 100,
        y: nodeWithPosition.y - 40,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const MermaidFlowEditor = ({ code, onCodeChange }: MermaidFlowEditorProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const { nodes: parsedNodes, edges: parsedEdges } = parseMermaidCode(code);
    
    const flowNodes: Node[] = parsedNodes.map((n, i) => ({
      id: n.id,
      type: 'default',
      data: { label: n.label },
      position: { x: i * 250, y: i * 100 },
      style: {
        background: 'hsl(var(--card))',
        border: '2px solid hsl(var(--primary))',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
        color: 'hsl(var(--card-foreground))',
      },
    }));

    const flowEdges: Edge[] = parsedEdges.map((e, i) => ({
      id: `e${i}`,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(flowNodes, flowEdges);
    
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [code]);

  useEffect(() => {
    if (nodes.length > 0) {
      const newCode = generateMermaidCode(nodes, edges);
      onCodeChange(newCode);
    }
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full bg-background rounded-lg border border-border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};
