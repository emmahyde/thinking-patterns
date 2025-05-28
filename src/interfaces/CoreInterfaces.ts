// Core thinking pattern interfaces

export interface ThoughtData {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts?: boolean;
  nextThoughtNeeded: boolean;
}

export interface MentalModelData {
  modelName: string;
  problem: string;
  steps: string[];
  reasoning: string;
  conclusion: string;
}

export interface DebuggingApproachData {
  approachName: string;
  issue: string;
  steps: string[];
  findings: string;
  resolution: string;
}

export interface StochasticData {
  algorithm: string;
  problem: string;
  parameters: Record<string, unknown>;
  result?: string;
}
