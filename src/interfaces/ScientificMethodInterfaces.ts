// Scientific Method Data Interfaces

export interface Variable {
  name: string;
  type: "independent" | "dependent" | "controlled" | "confounding";
  operationalization?: string;
}

export interface HypothesisData {
  statement: string;
  variables: Variable[];
  assumptions: string[];
  hypothesisId: string;
  confidence: number; // 0.0-1.0
  domain: string;
  iteration: number;
  alternativeTo?: string[];
  refinementOf?: string;
  status: "proposed" | "testing" | "supported" | "refuted" | "refined";
}

export interface Prediction {
  if: string;
  then: string;
  else?: string;
}

export interface ExperimentData {
  design: string;
  methodology: string;
  predictions: Prediction[];
  experimentId: string;
  hypothesisId: string;
  controlMeasures: string[];
  results?: string;
  outcomeMatched?: boolean;
  unexpectedObservations?: string[];
  limitations?: string[];
  nextSteps?: string[];
}

export interface ScientificInquiryData {
  stage: "observation" | "question" | "hypothesis" | "experiment" | "analysis" | "conclusion" | "iteration";
  observation?: string;
  question?: string;
  hypothesis?: HypothesisData;
  experiment?: ExperimentData;
  analysis?: string;
  conclusion?: string;
  inquiryId: string;
  iteration: number;
  nextStageNeeded: boolean;
}
