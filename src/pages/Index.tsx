import { useState } from "react";
import { MermaidEditor } from "@/components/MermaidEditor";
import { TemplateSelector } from "@/components/TemplateSelector";
import { Code2 } from "lucide-react";

const Index = () => {
  const [currentCode, setCurrentCode] = useState("");

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
                Mermaid Live Editor
              </h1>
              <p className="text-sm text-muted-foreground">
                Crea e visualizza diagrammi in tempo reale
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto">
        <div className="py-4 px-4">
          <TemplateSelector onSelectTemplate={setCurrentCode} />
        </div>
        <MermaidEditor key={currentCode} initialCode={currentCode} />
      </main>
    </div>
  );
};

export default Index;
