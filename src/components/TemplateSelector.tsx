import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  GitBranch,
  Workflow,
  Activity,
  Users,
  Database,
  Calendar,
} from "lucide-react";

export const templates = {
  flowchart: `graph TD
    A[Inizio] --> B{Decisione?}
    B -->|Si| C[Azione 1]
    B -->|No| D[Azione 2]
    C --> E[Fine]
    D --> E`,
  
  sequence: `sequenceDiagram
    participant U as Utente
    participant S as Server
    participant D as Database
    
    U->>S: Richiesta
    S->>D: Query
    D-->>S: Dati
    S-->>U: Risposta`,
  
  class: `classDiagram
    class Animale {
        +String nome
        +int età
        +mangia()
        +dormi()
    }
    class Cane {
        +String razza
        +abbaia()
    }
    class Gatto {
        +String colore
        +miagola()
    }
    Animale <|-- Cane
    Animale <|-- Gatto`,
  
  gantt: `gantt
    title Pianificazione Progetto
    dateFormat YYYY-MM-DD
    
    section Fase 1
    Analisi           :a1, 2024-01-01, 30d
    Design            :a2, after a1, 20d
    
    section Fase 2
    Sviluppo          :a3, after a2, 45d
    Testing           :a4, after a3, 15d`,
  
  erDiagram: `erDiagram
    UTENTE ||--o{ ORDINE : effettua
    ORDINE ||--|{ PRODOTTO : contiene
    UTENTE {
        int id
        string nome
        string email
    }
    ORDINE {
        int id
        date data
        float totale
    }
    PRODOTTO {
        int id
        string nome
        float prezzo
    }`,
  
  pie: `pie title Distribuzione Browser
    "Chrome" : 60
    "Firefox" : 20
    "Safari" : 15
    "Altri" : 5`,
};

interface TemplateSelectorProps {
  onSelectTemplate: (code: string) => void;
}

export const TemplateSelector = ({ onSelectTemplate }: TemplateSelectorProps) => {
  const templateButtons = [
    { key: "flowchart", label: "Flowchart", icon: GitBranch },
    { key: "sequence", label: "Sequence", icon: Workflow },
    { key: "class", label: "Classi", icon: Activity },
    { key: "gantt", label: "Gantt", icon: Calendar },
    { key: "erDiagram", label: "ER Diagram", icon: Database },
    { key: "pie", label: "Pie Chart", icon: Users },
  ];

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
        Template Rapidi
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {templateButtons.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            onClick={() => onSelectTemplate(templates[key as keyof typeof templates])}
            className="flex flex-col h-auto py-3 gap-2"
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
};
