import { z } from 'zod';

// Collaborative Reasoning Schema
export const PersonaSchema = z.object({
  id: z.string(),
  name: z.string(),
  expertise: z.array(z.string()),
  background: z.string(),
  perspective: z.string(),
  biases: z.array(z.string()),
  communication: z.object({
    style: z.string(),
    tone: z.string()
  })
});

export const ContributionSchema = z.object({
  personaId: z.string(),
  content: z.string(),
  type: z.enum(["observation", "question", "insight", "concern", "suggestion", "challenge", "synthesis"]),
  confidence: z.number().min(0).max(1),
  referenceIds: z.array(z.string()).optional()
});

export const DisagreementPositionSchema = z.object({
  personaId: z.string(),
  position: z.string(),
  arguments: z.array(z.string())
});

export const DisagreementResolutionSchema = z.object({
  type: z.enum(["consensus", "compromise", "integration", "tabled"]),
  description: z.string()
});

export const DisagreementSchema = z.object({
  topic: z.string(),
  positions: z.array(DisagreementPositionSchema),
  resolution: DisagreementResolutionSchema.optional()
});

export const CollaborativeReasoningSchema = z.object({
  topic: z.string(),
  personas: z.array(PersonaSchema),
  contributions: z.array(ContributionSchema),
  stage: z.enum(["problem-definition", "ideation", "critique", "integration", "decision", "reflection"]),
  activePersonaId: z.string(),
  nextPersonaId: z.string().optional(),
  consensusPoints: z.array(z.string()).optional(),
  disagreements: z.array(DisagreementSchema).optional(),
  keyInsights: z.array(z.string()).optional(),
  openQuestions: z.array(z.string()).optional(),
  finalRecommendation: z.string().optional(),
  sessionId: z.string(),
  iteration: z.number(),
  suggestedContributionTypes: z.array(z.enum(["observation", "question", "insight", "concern", "suggestion", "challenge", "synthesis"])).optional(),
  nextContributionNeeded: z.boolean()
});

// Type exports for TypeScript
export type CollaborativeReasoningData = z.infer<typeof CollaborativeReasoningSchema>;
export type PersonaData = z.infer<typeof PersonaSchema>;
export type ContributionData = z.infer<typeof ContributionSchema>;
export type DisagreementData = z.infer<typeof DisagreementSchema>;