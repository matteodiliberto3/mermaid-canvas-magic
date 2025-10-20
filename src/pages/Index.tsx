import { useState } from "react";
import Editor from "@monaco-editor/react";
import { MermaidFlowEditor } from "@/components/MermaidFlowEditor";
import { TemplateSelector } from "@/components/TemplateSelector";
import { Code2 } from "lucide-react";

const defaultCode = `graph TD
  A[Start]-->B[Process]
  B-->C[End]`;

const Index = () => {
  const [currentCode, setCurrentCode] = useState(defaultCode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Code2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Mermaid Visual Editor
              </h1>
              <p className="text-sm text-muted-foreground">
                Crea e modifica diagrammi in modo visuale
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="mb-4">
          <TemplateSelector onSelectTemplate={setCurrentCode} />
        </div>
        
        <div className="grid grid-cols-2 gap-4 h-[calc(100vh-200px)]">
          <div className="rounded-lg border border-border overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="markdown"
              value={currentCode}
              onChange={(value) => setCurrentCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </div>
          
          <MermaidFlowEditor code={currentCode} onCodeChange={setCurrentCode} />
        </div>
      </main>
    </div>
  );
};

export default Index;
