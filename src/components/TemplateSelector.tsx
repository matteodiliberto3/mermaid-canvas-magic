import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  GitBranch,
  Workflow,
  Activity,
  Users,
  Database,
  Calendar,
  GitCommitHorizontal,
  Map,
  Brain,
  Clock,
  Grid2X2,
  FileText,
  PieChart,
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
  
  state: `stateDiagram-v2
    [*] --> Inattivo
    Inattivo --> Attivo : Avvio
    Attivo --> InLavorazione : Inizia Task
    InLavorazione --> Completato : Finisce
    InLavorazione --> Errore : Fallisce
    Errore --> InLavorazione : Riprova
    Completato --> [*]`,
  
  journey: `journey
    title Esperienza Utente
    section Visita Sito
      Vai alla home: 5: Utente
      Naviga prodotti: 4: Utente
      Cerca prodotto: 3: Utente
    section Acquisto
      Aggiungi al carrello: 5: Utente
      Checkout: 4: Utente
      Pagamento: 3: Utente, Sistema
    section Post-vendita
      Conferma ordine: 5: Sistema
      Spedizione: 4: Sistema
      Recensione: 5: Utente`,
  
  gitGraph: `gitGraph
    commit id: "Initial"
    branch develop
    checkout develop
    commit id: "Feature A"
    commit id: "Feature B"
    checkout main
    merge develop
    commit id: "Release v1.0"
    branch hotfix
    commit id: "Bug fix"
    checkout main
    merge hotfix`,
  
  mindmap: `mindmap
  root((Progetto))
    Planning
      Obiettivi
      Timeline
      Budget
    Design
      UI/UX
      Wireframe
      Prototipo
    Development
      Frontend
      Backend
      Database
    Testing
      Unit Test
      Integration
      E2E`,
  
  timeline: `timeline
    title Storia dell'Azienda
    2020 : Fondazione
         : Prima sede
    2021 : Primo prodotto
         : 10 dipendenti
    2022 : Espansione
         : Apertura filiale
    2023 : Serie A funding
         : 50 dipendenti
    2024 : Lancio internazionale
         : 100+ clienti`,
  
  quadrant: `quadrantChart
    title Priorità Feature
    x-axis Basso Effort --> Alto Effort
    y-axis Basso Impatto --> Alto Impatto
    quadrant-1 Quick Wins
    quadrant-2 Big Bets
    quadrant-3 Fill Ins
    quadrant-4 Hard Slogs
    Login: [0.2, 0.9]
    Dashboard: [0.7, 0.8]
    Reports: [0.4, 0.5]
    Settings: [0.3, 0.2]
    Export: [0.8, 0.4]`,
};

interface TemplateSelectorProps {
  onSelectTemplate: (code: string) => void;
}

export const TemplateSelector = ({ onSelectTemplate }: TemplateSelectorProps) => {
  const templateButtons = [
    { key: "flowchart", label: "Flowchart", icon: GitBranch },
    { key: "sequence", label: "Sequence", icon: Workflow },
    { key: "class", label: "Classi", icon: Activity },
    { key: "state", label: "State", icon: Activity },
    { key: "erDiagram", label: "ER Diagram", icon: Database },
    { key: "gantt", label: "Gantt", icon: Calendar },
    { key: "pie", label: "Pie Chart", icon: PieChart },
    { key: "journey", label: "Journey", icon: Map },
    { key: "gitGraph", label: "Git Graph", icon: GitCommitHorizontal },
    { key: "mindmap", label: "Mindmap", icon: Brain },
    { key: "timeline", label: "Timeline", icon: Clock },
    { key: "quadrant", label: "Quadrant", icon: Grid2X2 },
  ];

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
        Template Rapidi
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
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
