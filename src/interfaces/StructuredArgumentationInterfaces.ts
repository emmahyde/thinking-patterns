// Structured Argumentation Data Interfaces

export interface ArgumentData {
  claim: string;
  premises: string[];
  conclusion: string;
  argumentId?: string;
  argumentType: "thesis" | "antithesis" | "synthesis" | "objection" | "rebuttal";
  confidence: number; // 0.0-1.0
  respondsTo?: string;
  supports?: string[];
  contradicts?: string[];
  strengths?: string[];
  weaknesses?: string[];
  nextArgumentNeeded: boolean;
  suggestedNextTypes?: ("thesis" | "antithesis" | "synthesis" | "objection" | "rebuttal")[];
}
