export interface ToolRecommendation {
  toolName: string;
  confidence: number; // 0.0-1.0
  rationale: string;
  priority: number;
  alternativeTools?: string[];
}

export interface StepRecommendation {
  stepDescription: string;
  recommendedTools: ToolRecommendation[];
  expectedOutcome: string;
  nextStepConditions: string[];
}

export interface CurrentStep extends StepRecommendation {
  stepNumber?: number;
  estimatedDuration?: string;
  complexityLevel?: 'low' | 'medium' | 'high';
}

export interface SequentialThoughtData {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts?: boolean;
  currentStep?: CurrentStep;
  previousSteps?: StepRecommendation[];
  remainingSteps?: string[];
  toolUsageHistory?: {
    toolName: string;
    usedAt: string;
    effectivenessScore?: number;
  }[];
}

export interface ToolContext {
  availableTools: string[];
  userPreferences?: Record<string, any>;
  sessionHistory?: string[];
  problemDomain?: string;
}
