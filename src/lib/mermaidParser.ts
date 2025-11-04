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
  
  // Detect diagram type
  const isErDiagram = lines.some(l => l.startsWith('erDiagram'));
  
  if (isErDiagram) {
    // Parse ER Diagram
    let currentEntity = '';
    
    lines.forEach(line => {
      if (line.startsWith('erDiagram') || line.startsWith('%%')) return;
      
      // Parse entity definition: EntityName {
      const entityMatch = line.match(/^(\w+)\s*\{/);
      if (entityMatch) {
        currentEntity = entityMatch[1];
        if (!nodes.find(n => n.id === currentEntity)) {
          nodes.push({ id: currentEntity, label: currentEntity, type: 'entity' });
        }
        return;
      }
      
      // Parse ER relationships: Entity1 ||--o{ Entity2 : "label"
      const erRelMatch = line.match(/(\w+)\s+([|o}]{2}--[o|{]{2})\s+(\w+)\s*:\s*"([^"]+)"/);
      if (erRelMatch) {
        const [, source, , target, label] = erRelMatch;
        edges.push({ source, target, label });
        
        // Ensure entities exist
        if (!nodes.find(n => n.id === source)) {
          nodes.push({ id: source, label: source, type: 'entity' });
        }
        if (!nodes.find(n => n.id === target)) {
          nodes.push({ id: target, label: target, type: 'entity' });
        }
      }
    });
  } else {
    // Parse Flowchart/Graph
    lines.forEach(line => {
      if (line.startsWith('graph') || line.startsWith('flowchart')) return;
      
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
  }
  
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
