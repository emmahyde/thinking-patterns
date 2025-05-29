import { z } from 'zod';

// Metacognitive Monitoring Schema
export const KnowledgeAssessmentSchema = z.object({
  domain: z.string(),
  knowledgeLevel: z.enum(["expert", "proficient", "familiar", "basic", "minimal", "none"]),
  confidenceScore: z.number().min(0).max(1),
  supportingEvidence: z.string(),
  knownLimitations: z.array(z.string()),
  relevantTrainingCutoff: z.string().optional()
});

export const ClaimAssessmentSchema = z.object({
  claim: z.string(),
  status: z.enum(["fact", "inference", "speculation", "uncertain"]),
  confidenceScore: z.number().min(0).max(1),
  evidenceBasis: z.string(),
  falsifiabilityCriteria: z.string().optional(),
  alternativeInterpretations: z.array(z.string()).optional()
});

export const ReasoningAssessmentSchema = z.object({
  step: z.string(),
  potentialBiases: z.array(z.string()),
  assumptions: z.array(z.string()),
  logicalValidity: z.number().min(0).max(1),
  inferenceStrength: z.number().min(0).max(1)
});

export const MetacognitiveMonitoringSchema = z.object({
  task: z.string(),
  stage: z.enum(["knowledge-assessment", "planning", "execution", "monitoring", "evaluation", "reflection"]),
  knowledgeAssessment: KnowledgeAssessmentSchema.optional(),
  claims: z.array(ClaimAssessmentSchema).optional(),
  reasoningSteps: z.array(ReasoningAssessmentSchema).optional(),
  overallConfidence: z.number().min(0).max(1),
  uncertaintyAreas: z.array(z.string()),
  recommendedApproach: z.string(),
  monitoringId: z.string(),
  iteration: z.number(),
  suggestedAssessments: z.array(z.enum(["knowledge", "claim", "reasoning", "overall"])).optional(),
  nextAssessmentNeeded: z.boolean()
});

// Type exports for TypeScript
export type MetacognitiveMonitoringData = z.infer<typeof MetacognitiveMonitoringSchema>;
export type KnowledgeAssessmentData = z.infer<typeof KnowledgeAssessmentSchema>;
export type ClaimAssessmentData = z.infer<typeof ClaimAssessmentSchema>;
export type ReasoningAssessmentData = z.infer<typeof ReasoningAssessmentSchema>;