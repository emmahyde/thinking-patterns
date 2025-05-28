// Collaborative Reasoning Data Interfaces

export interface PersonaData {
  id: string;
  name: string;
  expertise: string[];
  background: string;
  perspective: string;
  biases: string[];
  communication: {
    style: string;
    tone: string;
  };
}

export interface ContributionData {
  personaId: string;
  content: string;
  type: "observation" | "question" | "insight" | "concern" | "suggestion" | "challenge" | "synthesis";
  confidence: number; // 0.0-1.0
  referenceIds?: string[]; // IDs of previous contributions this builds upon
}

export interface DisagreementPosition {
  personaId: string;
  position: string;
  arguments: string[];
}

export interface DisagreementResolution {
  type: "consensus" | "compromise" | "integration" | "tabled";
  description: string;
}

export interface DisagreementData {
  topic: string;
  positions: DisagreementPosition[];
  resolution?: DisagreementResolution;
}

export interface CollaborativeReasoningData {
  topic: string;
  personas: PersonaData[];
  contributions: ContributionData[];
  stage: "problem-definition" | "ideation" | "critique" | "integration" | "decision" | "reflection";
  activePersonaId: string;
  nextPersonaId?: string;
  consensusPoints?: string[];
  disagreements?: DisagreementData[];
  keyInsights?: string[];
  openQuestions?: string[];
  finalRecommendation?: string;
  sessionId: string;
  iteration: number;
  suggestedContributionTypes?: ("observation" | "question" | "insight" | "concern" | "suggestion" | "challenge" | "synthesis")[];
  nextContributionNeeded: boolean;
}
