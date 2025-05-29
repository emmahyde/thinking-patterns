import { z } from 'zod';

// Decision Framework Schema
export const DecisionOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string()
});

export const DecisionCriterionSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  weight: z.number().min(0).max(1),
  evaluationMethod: z.enum(["quantitative", "qualitative", "boolean"])
});

export const CriterionEvaluationSchema = z.object({
  criterionId: z.string(),
  optionId: z.string(),
  score: z.number().min(0).max(1),
  justification: z.string()
});

export const PossibleOutcomeSchema = z.object({
  id: z.string().optional(),
  description: z.string(),
  probability: z.number().min(0).max(1),
  value: z.number(),
  optionId: z.string(),
  confidenceInEstimate: z.number().min(0).max(1)
});

export const InformationGapSchema = z.object({
  description: z.string(),
  impact: z.number().min(0).max(1),
  researchMethod: z.string()
});

export const DecisionFrameworkSchema = z.object({
  decisionStatement: z.string(),
  options: z.array(DecisionOptionSchema),
  criteria: z.array(DecisionCriterionSchema).optional(),
  stakeholders: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  timeHorizon: z.string().optional(),
  riskTolerance: z.enum(["risk-averse", "risk-neutral", "risk-seeking"]).optional(),
  possibleOutcomes: z.array(PossibleOutcomeSchema).optional(),
  criteriaEvaluations: z.array(CriterionEvaluationSchema).optional(),
  informationGaps: z.array(InformationGapSchema).optional(),
  analysisType: z.enum(["expected-utility", "multi-criteria", "maximin", "minimax-regret", "satisficing"]),
  stage: z.enum(["problem-definition", "options", "criteria", "evaluation", "analysis", "recommendation"]),
  recommendation: z.string().optional(),
  sensitivityInsights: z.array(z.string()).optional(),
  expectedValues: z.record(z.number()).optional(),
  multiCriteriaScores: z.record(z.number()).optional(),
  decisionId: z.string(),
  iteration: z.number(),
  suggestedNextStage: z.string().optional(),
  nextStageNeeded: z.boolean()
});

// Type exports for TypeScript
export type DecisionFrameworkData = z.infer<typeof DecisionFrameworkSchema>;
export type DecisionOptionData = z.infer<typeof DecisionOptionSchema>;
export type DecisionCriterionData = z.infer<typeof DecisionCriterionSchema>;