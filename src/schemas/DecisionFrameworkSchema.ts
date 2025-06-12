import { z } from 'zod';

/**
 * Decision Framework Schema
 * 
 * Defines the structure for structured decision analysis and rational choice
 * frameworks. Supports multi-criteria analysis, expected utility calculations,
 * and systematic evaluation of decision options.
 */

// Decision Framework Schema
export const DecisionOptionSchema = z.object({
  id: z.string().optional().describe("A unique identifier for the decision option."),
  name: z.string().describe("The name of the decision option."),
  description: z.string().describe("A detailed description of the decision option."),
});

export const DecisionCriterionSchema = z.object({
  id: z.string().optional().describe("A unique identifier for the decision criterion."),
  name: z.string().describe("The name of the decision criterion."),
  description: z.string().describe("A detailed description of the decision criterion."),
  weight: z.number().min(0).max(1).describe("The weight of the criterion in the decision (0-1)."),
  evaluationMethod: z.enum(["quantitative", "qualitative", "boolean"]).describe("The method used to evaluate the criterion."),
});

export const CriterionEvaluationSchema = z.object({
  criterionId: z.string().describe("The ID of the criterion being evaluated."),
  optionId: z.string().describe("The ID of the option being evaluated against the criterion."),
  score: z.number().min(0).max(1).describe("The score of the option against the criterion (0-1)."),
  justification: z.string().describe("The justification for the score."),
});

export const PossibleOutcomeSchema = z.object({
  id: z.string().optional().describe("A unique identifier for the possible outcome."),
  description: z.string().describe("A detailed description of the possible outcome."),
  probability: z.number().min(0).max(1).describe("The probability of this outcome occurring (0-1)."),
  value: z.number().describe("The value of this outcome."),
  optionId: z.string().describe("The ID of the option this outcome is associated with."),
  confidenceInEstimate: z.number().min(0).max(1).describe("A confidence score (0-1) in the probability and value estimates."),
});

export const InformationGapSchema = z.object({
  description: z.string().describe("A description of the information gap."),
  impact: z.number().min(0).max(1).describe("The potential impact of this information gap on the decision (0-1)."),
  researchMethod: z.string().describe("The method for researching and filling this information gap."),
});

export const DecisionFrameworkSchema = z.object({
  decisionStatement: z.string().describe("A clear and concise statement of the decision to be made."),
  options: z.array(DecisionOptionSchema).describe("A list of the options being considered."),
  criteria: z.array(DecisionCriterionSchema).optional().describe("A list of the criteria used to evaluate the options."),
  stakeholders: z.array(z.string()).optional().describe("A list of stakeholders involved in the decision."),
  constraints: z.array(z.string()).optional().describe("A list of constraints on the decision."),
  timeHorizon: z.string().optional().describe("The time horizon for the decision."),
  riskTolerance: z.enum(["risk-averse", "risk-neutral", "risk-seeking"]).optional().describe("The risk tolerance for the decision."),
  possibleOutcomes: z.array(PossibleOutcomeSchema).optional().describe("A list of possible outcomes for the decision."),
  criteriaEvaluations: z.array(CriterionEvaluationSchema).optional().describe("A list of evaluations of the options against the criteria."),
  informationGaps: z.array(InformationGapSchema).optional().describe("A list of information gaps that need to be filled."),
  analysisType: z.enum(["expected-utility", "multi-criteria", "maximin", "minimax-regret", "satisficing"]).describe("The type of analysis to be performed."),
  stage: z.enum(["problem-definition", "options", "criteria", "evaluation", "analysis", "recommendation"]).describe("The current stage of the decision-making process."),
  recommendation: z.string().optional().describe("The final recommendation."),
  sensitivityInsights: z.array(z.string()).optional().describe("A list of insights from sensitivity analysis."),
  expectedValues: z.record(z.number()).optional().describe("A record of the expected values for each option."),
  multiCriteriaScores: z.record(z.number()).optional().describe("A record of the multi-criteria scores for each option."),
  decisionId: z.string().describe("A unique identifier for this decision."),
  iteration: z.number().describe("The iteration number of this decision-making process."),
  suggestedNextStage: z.string().optional().describe("The suggested next stage in the decision-making process."),
  nextStageNeeded: z.boolean().describe("A flag indicating whether another stage is needed."),
});

// Type exports for TypeScript
export type DecisionFrameworkData = z.infer<typeof DecisionFrameworkSchema>;
export type DecisionOptionData = z.infer<typeof DecisionOptionSchema>;
export type DecisionCriterionData = z.infer<typeof DecisionCriterionSchema>;