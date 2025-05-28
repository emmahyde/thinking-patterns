// Visual Reasoning Data Interfaces

export interface VisualElement {
  id: string;
  type: "node" | "edge" | "container" | "annotation";
  label?: string;
  properties: Record<string, any>;
  source?: string;
  target?: string;
  contains?: string[];
}

export interface VisualOperationData {
  operation: "create" | "update" | "delete" | "transform" | "observe";
  elements?: VisualElement[];
  transformationType?: "rotate" | "move" | "resize" | "recolor" | "regroup";
  diagramId: string;
  diagramType: "graph" | "flowchart" | "stateDiagram" | "conceptMap" | "treeDiagram" | "custom";
  iteration: number;
  observation?: string;
  insight?: string;
  hypothesis?: string;
  nextOperationNeeded: boolean;
}
