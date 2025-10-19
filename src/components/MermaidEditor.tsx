import { useState, useEffect, useRef } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Copy, FileText, Check } from "lucide-react";
import { toast } from "sonner";
import { InteractiveMermaidPreview } from "./InteractiveMermaidPreview";

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

const defaultCode = `graph TD
    A[Inizio] --> B{Decisione?}
    B -->|Si| C[Azione 1]
    B -->|No| D[Azione 2]
    C --> E[Fine]
    D --> E`;

interface MermaidEditorProps {
  initialCode?: string;
}

export const MermaidEditor = ({ initialCode = defaultCode }: MermaidEditorProps) => {
  const [code, setCode] = useState(initialCode);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    renderDiagram();
  }, [code]);

  const renderDiagram = async () => {
    if (!code.trim()) {
      setSvg("");
      setError("");
      return;
    }

    try {
      const { svg } = await mermaid.render("mermaid-preview", code);
      setSvg(svg);
      setError("");
    } catch (err: any) {
      setError(err.message || "Errore nel rendering del grafico");
      setSvg("");
    }
  };

  const handleDownloadSVG = () => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mermaid-diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Diagramma scaricato!");
  };

  const handleDownloadPNG = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "mermaid-diagram.png";
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Diagramma scaricato!");
        }
      });
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Codice copiato!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-120px)] p-4">
      {/* Editor Panel */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Editor</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className="gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copiato!" : "Copia"}
          </Button>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 p-4 font-mono text-sm bg-[hsl(var(--code-bg))] text-[hsl(var(--code-text))] resize-none focus:outline-none"
          placeholder="Scrivi qui il tuo codice Mermaid..."
          spellCheck={false}
        />
      </Card>

      {/* Preview Panel */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <h2 className="text-lg font-semibold">Anteprima</h2>
          {svg && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSVG}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                SVG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPNG}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                PNG
              </Button>
            </div>
          )}
        </div>
        <div
          ref={previewRef}
          className="flex-1 overflow-hidden bg-[hsl(var(--preview-bg))] relative"
        >
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-destructive text-center p-4">
                <p className="font-semibold mb-2">Errore di sintassi</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : svg ? (
            <InteractiveMermaidPreview 
              svg={svg} 
              onPositionsChange={(positions) => {
                console.log('Posizioni aggiornate:', positions);
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">
                Il grafico apparirà qui...
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
