import { z } from 'zod';
import { ToolUsageHistorySchema } from './ToolSchemas.js';

// Metacognitive Monitoring Schema
export const KnowledgeAssessmentSchema = z.object({
  domain: z.string().describe("The specific domain or topic being assessed."),
  knowledgeLevel: z.enum(["expert", "proficient", "familiar", "basic", "minimal", "none"]).describe("The self-assessed level of knowledge in this domain."),
  confidenceScore: z.number().min(0).max(1).describe("A confidence score (0-1) in the assessed knowledge level."),
  supportingEvidence: z.string().describe("Evidence to support the assessed knowledge level."),
  knownLimitations: z.array(z.string()).describe("A list of known limitations or gaps in knowledge."),
  relevantTrainingCutoff: z.string().optional().describe("The date of the last relevant training or data cutoff."),
});

export const ClaimAssessmentSchema = z.object({
  claim: z.string().describe("The specific claim being assessed."),
  status: z.enum(["fact", "inference", "speculation", "uncertain"]).describe("The assessed status of the claim."),
  confidenceScore: z.number().min(0).max(1).describe("A confidence score (0-1) in the assessed status of the claim."),
  evidenceBasis: z.string().describe("The evidence supporting the assessment of the claim."),
  falsifiabilityCriteria: z.string().optional().describe("Criteria that could be used to falsify the claim."),
  alternativeInterpretations: z.array(z.string()).optional().describe("A list of alternative interpretations of the evidence."),
});

export const ReasoningAssessmentSchema = z.object({
  step: z.string().describe("The specific step in the reasoning process being assessed."),
  potentialBiases: z.array(z.string()).describe("A list of potential cognitive biases that may be influencing the reasoning."),
  assumptions: z.array(z.string()).describe("A list of assumptions being made in this reasoning step."),
  logicalValidity: z.number().min(0).max(1).describe("A score (0-1) for the logical validity of the reasoning step."),
  inferenceStrength: z.number().min(0).max(1).describe("A score (0-1) for the strength of the inference."),
});

export const MetacognitiveMonitoringSchema = z.object({
  task: z.string().describe("The overall task or problem being addressed."),
  stage: z.enum(["knowledge-assessment", "planning", "execution", "monitoring", "evaluation", "reflection"]).describe("The current stage of the metacognitive process."),
  knowledgeAssessment: KnowledgeAssessmentSchema.optional().describe("An assessment of the knowledge required for the task."),
  claims: z.array(ClaimAssessmentSchema).optional().describe("A list of claims being made and assessed."),
  reasoningSteps: z.array(ReasoningAssessmentSchema).optional().describe("A list of reasoning steps being assessed."),
  overallConfidence: z.number().min(0).max(1).describe("An overall confidence score (0-1) in the ability to complete the task successfully."),
  uncertaintyAreas: z.array(z.string()).describe("A list of areas where there is significant uncertainty."),
  recommendedApproach: z.string().describe("The recommended approach to address the task, given the metacognitive assessment."),
  monitoringId: z.string().describe("A unique identifier for this monitoring session."),
  iteration: z.number().describe("The iteration number of this monitoring session."),
  suggestedAssessments: z.array(z.enum(["knowledge", "claim", "reasoning", "overall"])).optional().describe("A list of suggested next assessments."),
  previousSteps: z.array(z.string()).optional().describe("A record of the steps that have already been completed."),
  remainingSteps: z.array(z.string()).optional().describe("A high-level list of the steps that are yet to be taken."),
  toolUsageHistory: z.array(ToolUsageHistorySchema).optional().describe("A log of the tools that have been used so far, along with their effectiveness."),
  nextAssessmentNeeded: z.boolean().describe("A flag indicating whether another assessment is required."),
});

// Type exports for TypeScript
export type MetacognitiveMonitoringData = z.infer<typeof MetacognitiveMonitoringSchema>;
export type KnowledgeAssessmentData = z.infer<typeof KnowledgeAssessmentSchema>;
export type ClaimAssessmentData = z.infer<typeof ClaimAssessmentSchema>;
export type ReasoningAssessmentData = z.infer<typeof ReasoningAssessmentSchema>;