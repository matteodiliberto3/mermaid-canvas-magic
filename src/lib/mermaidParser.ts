// Parse Mermaid code to React Flow nodes and edges
export interface MermaidNode {
  id: string;
  label: string;
  type?: string;
}

export interface MermaidEdge {
  source: string;
  target: string;
  label?: string;
}

export const parseMermaidCode = (code: string): { nodes: MermaidNode[], edges: MermaidEdge[] } => {
  const nodes: MermaidNode[] = [];
  const edges: MermaidEdge[] = [];
  
  const lines = code.split('\n').map(l => l.trim()).filter(Boolean);
  
  lines.forEach(line => {
    // Skip directive lines
    if (line.startsWith('graph') || line.startsWith('flowchart') || line.startsWith('erDiagram')) return;
    
    // Parse edges: A-->B, A---|Label|-->B
    const edgeMatch = line.match(/(\w+)\s*(-{1,2}>?|\|.*?\|)\s*(\w+)/);
    if (edgeMatch) {
      const [, source, connection, target] = edgeMatch;
      edges.push({ source, target });
      
      // Ensure nodes exist
      if (!nodes.find(n => n.id === source)) {
        nodes.push({ id: source, label: source });
      }
      if (!nodes.find(n => n.id === target)) {
        nodes.push({ id: target, label: target });
      }
      return;
    }
    
    // Parse node definitions: A[Label]
    const nodeMatch = line.match(/(\w+)\[([^\]]+)\]/);
    if (nodeMatch) {
      const [, id, label] = nodeMatch;
      const existing = nodes.find(n => n.id === id);
      if (existing) {
        existing.label = label;
      } else {
        nodes.push({ id, label });
      }
    }
  });
  
  return { nodes, edges };
};

export const generateMermaidCode = (nodes: any[], edges: any[]): string => {
  let code = 'graph TD\n';
  
  nodes.forEach(node => {
    code += `  ${node.id}[${node.data.label}]\n`;
  });
  
  edges.forEach(edge => {
    code += `  ${edge.source}-->${edge.target}\n`;
  });
  
  return code;
};
