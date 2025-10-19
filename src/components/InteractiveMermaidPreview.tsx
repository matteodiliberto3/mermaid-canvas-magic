import { useEffect, useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react";

interface Position {
  x: number;
  y: number;
}

interface NodePosition {
  id: string;
  offset: Position;
}

interface InteractiveMermaidPreviewProps {
  svg: string;
  onPositionsChange?: (positions: NodePosition[]) => void;
}

export const InteractiveMermaidPreview = ({ 
  svg, 
  onPositionsChange 
}: InteractiveMermaidPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);
  const [isDragMode, setIsDragMode] = useState(false);
  const [draggingNode, setDraggingNode] = useState<{
    element: SVGElement;
    id: string;
    startX: number;
    startY: number;
    initialTransform: Position;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current || !svg) return;

    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    // Find all draggable elements based on diagram type
    // Support: flowcharts, ER diagrams, sequence diagrams, class diagrams, etc.
    const draggableSelectors = [
      '.node',           // Flowchart nodes
      '.nodeLabel',      // Node labels
      '[class*="node"]', // Any class containing "node"
      '.entity',         // ER diagram entities
      '.er',             // ER elements
      '[id*="entity"]',  // ER entity IDs
      '.actor',          // Sequence diagram actors
      '.participant',    // Participants
      '.classGroup',     // Class diagram classes
      '[class*="cluster"]', // Clusters/subgraphs
    ];
    
    const elements = svgElement.querySelectorAll(draggableSelectors.join(', '));
    
    elements.forEach((element) => {
      // Find the parent group (g element) that should be draggable
      let nodeGroup: Element | null = element;
      
      // For ER diagrams and some types, we want the closest g element
      if (nodeGroup.tagName !== 'g') {
        nodeGroup = nodeGroup.closest('g');
      }
      
      if (!nodeGroup || !(nodeGroup instanceof SVGElement)) return;

      // Skip if this is already processed or if it's part of edges/lines
      if (nodeGroup.hasAttribute('data-draggable-processed')) return;
      if (nodeGroup.classList.contains('edgePath') || 
          nodeGroup.classList.contains('edgeLabel') ||
          nodeGroup.classList.contains('relation')) return;

      nodeGroup.setAttribute('data-draggable-processed', 'true');

      // Extract node ID from class or other attributes
      const nodeId = extractNodeId(nodeGroup);
      if (!nodeId) return;

      // Apply saved position if exists
      const savedPosition = nodePositions.find(p => p.id === nodeId);
      if (savedPosition) {
        applyTransform(nodeGroup, savedPosition.offset);
      }

      // Add visual indicator for drag mode - make it always draggable
      if (isDragMode) {
        nodeGroup.style.cursor = 'move';
        nodeGroup.style.opacity = '0.9';
        // Add a subtle outline to show it's draggable
        const firstChild = nodeGroup.querySelector('rect, circle, polygon, path');
        if (firstChild instanceof SVGElement) {
          firstChild.style.strokeWidth = '2';
          firstChild.style.stroke = 'hsl(var(--primary))';
        }
      } else {
        nodeGroup.style.cursor = 'grab';
        nodeGroup.style.opacity = '1';
        const firstChild = nodeGroup.querySelector('rect, circle, polygon, path');
        if (firstChild instanceof SVGElement) {
          firstChild.style.strokeWidth = '';
          firstChild.style.stroke = '';
        }
      }
    });
  }, [svg, nodePositions, isDragMode]);

  const extractNodeId = (element: SVGElement): string | null => {
    // Try to extract ID from various attributes
    const id = element.getAttribute('id') || '';
    if (id) return id;
    
    // Look for text content as identifier (works for ER entities and flowchart nodes)
    const textElements = element.querySelectorAll('text');
    const textContent = Array.from(textElements)
      .map(t => t.textContent?.trim())
      .filter(Boolean)
      .join('-') || '';
    
    if (textContent) return textContent;
    
    // Fallback to class names
    const classNames = element.getAttribute('class') || '';
    const firstClass = classNames.split(' ')[0];
    
    if (firstClass) return firstClass;
    
    // Last resort: generate a unique ID based on position
    if (element instanceof SVGGraphicsElement) {
      const bbox = element.getBBox();
      return `node-${Math.round(bbox.x)}-${Math.round(bbox.y)}`;
    }
    
    return `node-${Date.now()}`;
  };

  const getCurrentTransform = (element: SVGElement): Position => {
    const transform = element.getAttribute('transform') || '';
    const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
    
    if (match) {
      return {
        x: parseFloat(match[1]),
        y: parseFloat(match[2])
      };
    }
    
    return { x: 0, y: 0 };
  };

  const applyTransform = (element: SVGElement, offset: Position) => {
    const currentTransform = element.getAttribute('transform') || '';
    const otherTransforms = currentTransform.replace(/translate\([^)]+\)/, '').trim();
    
    element.setAttribute(
      'transform',
      `translate(${offset.x}, ${offset.y}) ${otherTransforms}`.trim()
    );
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDragMode) return;

    const target = e.target as Element;
    
    // Find the draggable node group
    let nodeGroup: Element | null = target;
    
    // Look for the parent g element with data-draggable-processed
    while (nodeGroup && nodeGroup.parentElement) {
      if (nodeGroup.tagName === 'g' && nodeGroup.hasAttribute('data-draggable-processed')) {
        break;
      }
      nodeGroup = nodeGroup.parentElement;
    }

    if (!nodeGroup || !(nodeGroup instanceof SVGElement)) return;
    if (!nodeGroup.hasAttribute('data-draggable-processed')) return;

    // Skip if clicking on edges or relations
    if (nodeGroup.classList.contains('edgePath') || 
        nodeGroup.classList.contains('edgeLabel') ||
        nodeGroup.classList.contains('relation')) return;

    const nodeId = extractNodeId(nodeGroup);
    if (!nodeId) return;

    const currentTransform = getCurrentTransform(nodeGroup);
    
    // Change cursor to grabbing
    nodeGroup.style.cursor = 'grabbing';

    setDraggingNode({
      element: nodeGroup,
      id: nodeId,
      startX: e.clientX,
      startY: e.clientY,
      initialTransform: currentTransform
    });

    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode) return;

    const deltaX = e.clientX - draggingNode.startX;
    const deltaY = e.clientY - draggingNode.startY;

    const newOffset: Position = {
      x: draggingNode.initialTransform.x + deltaX,
      y: draggingNode.initialTransform.y + deltaY
    };

    applyTransform(draggingNode.element, newOffset);
  };

  const handleMouseUp = () => {
    if (!draggingNode) return;

    // Reset cursor
    draggingNode.element.style.cursor = isDragMode ? 'move' : 'grab';

    const finalTransform = getCurrentTransform(draggingNode.element);
    
    // Update positions state
    setNodePositions(prev => {
      const filtered = prev.filter(p => p.id !== draggingNode.id);
      const updated = [...filtered, { id: draggingNode.id, offset: finalTransform }];
      onPositionsChange?.(updated);
      return updated;
    });

    setDraggingNode(null);
  };

  return (
    <div className="relative w-full h-full">
      <TransformWrapper
        initialScale={1}
        minScale={0.1}
        maxScale={5}
        centerOnInit
        wheel={{ step: 0.1, disabled: isDragMode }}
        doubleClick={{ mode: "reset", disabled: isDragMode }}
        panning={{ disabled: isDragMode }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button
                variant={isDragMode ? "default" : "outline"}
                size="icon"
                onClick={() => setIsDragMode(!isDragMode)}
                className="bg-background/80 backdrop-blur-sm"
                title={isDragMode ? "Modalità Pan/Zoom" : "Modalità Drag Nodi"}
              >
                <Move className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => zoomIn()}
                className="bg-background/80 backdrop-blur-sm"
                disabled={isDragMode}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => zoomOut()}
                className="bg-background/80 backdrop-blur-sm"
                disabled={isDragMode}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => resetTransform()}
                className="bg-background/80 backdrop-blur-sm"
                disabled={isDragMode}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
            <TransformComponent
              wrapperClass="!w-full !h-full"
              contentClass="!w-full !h-full flex items-center justify-center"
            >
              <div
                ref={containerRef}
                dangerouslySetInnerHTML={{ __html: svg }}
                className={isDragMode ? "cursor-move" : "select-none"}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
      {isDragMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-border text-sm">
          🖱️ Modalità Drag: Trascina i nodi per riposizionarli
        </div>
      )}
    </div>
  );
};
