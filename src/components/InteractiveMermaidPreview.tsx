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

    // Make nodes draggable
    const nodes = svgElement.querySelectorAll('.node, .nodeLabel, [class*="node"]');
    
    nodes.forEach((node) => {
      const element = node as SVGElement;
      
      // Find the parent group that contains the actual node
      let nodeGroup: Element | null = element;
      while (nodeGroup && nodeGroup.tagName !== 'g' && nodeGroup.parentElement) {
        nodeGroup = nodeGroup.parentElement;
      }
      
      if (!nodeGroup || !(nodeGroup instanceof SVGElement)) return;

      // Extract node ID from class or other attributes
      const nodeId = extractNodeId(nodeGroup);
      if (!nodeId) return;

      // Apply saved position if exists
      const savedPosition = nodePositions.find(p => p.id === nodeId);
      if (savedPosition) {
        applyTransform(nodeGroup, savedPosition.offset);
      }

      // Add visual indicator for drag mode
      if (isDragMode) {
        nodeGroup.style.cursor = 'move';
        nodeGroup.style.opacity = '0.8';
      } else {
        nodeGroup.style.cursor = 'default';
        nodeGroup.style.opacity = '1';
      }
    });
  }, [svg, nodePositions, isDragMode]);

  const extractNodeId = (element: SVGElement): string | null => {
    // Try to extract ID from various attributes
    const classNames = element.getAttribute('class') || '';
    const id = element.getAttribute('id') || '';
    
    // Look for text content as identifier
    const textElement = element.querySelector('text');
    const textContent = textElement?.textContent?.trim() || '';
    
    return id || textContent || classNames.split(' ')[0] || null;
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
    
    // Find the node group
    let nodeGroup: Element | null = target;
    while (nodeGroup && nodeGroup.tagName !== 'g' && nodeGroup.parentElement) {
      nodeGroup = nodeGroup.parentElement;
    }

    if (!nodeGroup || !(nodeGroup instanceof SVGElement)) return;

    const nodeId = extractNodeId(nodeGroup);
    if (!nodeId) return;

    const currentTransform = getCurrentTransform(nodeGroup);

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
