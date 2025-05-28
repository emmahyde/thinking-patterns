// Decision Framework Data Interfaces

export interface DecisionOption {
  id?: string;
  name: string;
  description: string;
}

export interface DecisionCriterion {
  id?: string;
  name: string;
  description: string;
  weight: number; // 0.0-1.0
  evaluationMethod: "quantitative" | "qualitative" | "boolean";
}

export interface CriterionEvaluation {
  criterionId: string;
  optionId: string;
  score: number; // 0.0-1.0
  justification: string;
}

export interface PossibleOutcome {
  id?: string;
  description: string;
  probability: number; // 0.0-1.0
  value: number; // Utility value
  optionId: string;
  confidenceInEstimate: number; // 0.0-1.0
}

export interface InformationGap {
  description: string;
  impact: number; // 0.0-1.0
  researchMethod: string;
}

export interface DecisionFrameworkData {
  decisionStatement: string;
  options: DecisionOption[];
  criteria?: DecisionCriterion[];
  stakeholders?: string[];
  constraints?: string[];
  timeHorizon?: string;
  riskTolerance?: "risk-averse" | "risk-neutral" | "risk-seeking";
  possibleOutcomes?: PossibleOutcome[];
  criteriaEvaluations?: CriterionEvaluation[];
  informationGaps?: InformationGap[];
  analysisType: "expected-utility" | "multi-criteria" | "maximin" | "minimax-regret" | "satisficing";
  stage: "problem-definition" | "options" | "criteria" | "evaluation" | "analysis" | "recommendation";
  recommendation?: string;
  sensitivityInsights?: string[];
  expectedValues?: Record<string, number>;
  multiCriteriaScores?: Record<string, number>;
  decisionId: string;
  iteration: number;
  suggestedNextStage?: string;
  nextStageNeeded: boolean;
}
