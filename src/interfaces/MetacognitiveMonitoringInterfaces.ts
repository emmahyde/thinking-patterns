// Metacognitive Monitoring Data Interfaces

export interface KnowledgeAssessment {
  domain: string;
  knowledgeLevel: "expert" | "proficient" | "familiar" | "basic" | "minimal" | "none";
  confidenceScore: number; // 0.0-1.0
  supportingEvidence: string;
  knownLimitations: string[];
  relevantTrainingCutoff?: string;
}

export interface ClaimAssessment {
  claim: string;
  status: "fact" | "inference" | "speculation" | "uncertain";
  confidenceScore: number; // 0.0-1.0
  evidenceBasis: string;
  falsifiabilityCriteria?: string;
  alternativeInterpretations?: string[];
}

export interface ReasoningAssessment {
  step: string;
  potentialBiases: string[];
  assumptions: string[];
  logicalValidity: number; // 0.0-1.0
  inferenceStrength: number; // 0.0-1.0
}

export interface MetacognitiveMonitoringData {
  task: string;
  stage: "knowledge-assessment" | "planning" | "execution" | "monitoring" | "evaluation" | "reflection";
  knowledgeAssessment?: KnowledgeAssessment;
  claims?: ClaimAssessment[];
  reasoningSteps?: ReasoningAssessment[];
  overallConfidence: number; // 0.0-1.0
  uncertaintyAreas: string[];
  recommendedApproach: string;
  monitoringId: string;
  iteration: number;
  suggestedAssessments?: ("knowledge" | "claim" | "reasoning" | "overall")[];
  nextAssessmentNeeded: boolean;
}
