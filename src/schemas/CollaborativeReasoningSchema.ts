import { z } from 'zod';

/**
 * Collaborative Reasoning Schema
 * 
 * Defines the structure for multi-perspective collaborative problem solving
 * with diverse personas and structured contributions. Supports systematic
 * group reasoning processes with consensus building and disagreement resolution.
 */

// Collaborative Reasoning Schema
export const PersonaSchema = z.object({
  id: z.string().describe("A unique identifier for the persona."),
  name: z.string().describe("The name of the persona (e.g., 'Devil's Advocate', 'Chief Technology Officer')."),
  expertise: z.array(z.string()).describe("A list of the persona's areas of expertise (e.g., 'cybersecurity', 'user experience')."),
  background: z.string().describe("The background and context of the persona, informing their perspective."),
  perspective: z.string().describe("The unique viewpoint or lens this persona brings to the discussion."),
  biases: z.array(z.string()).describe("A list of potential cognitive biases this persona may have (e.g., 'Confirmation Bias', 'Optimism Bias')."),
  communication: z.object({
    style: z.string().describe("The communication style of the persona (e.g., 'Socratic', 'data-driven', 'narrative-focused')."),
    tone: z.string().describe("The communication tone of the persona (e.g., 'skeptical', 'supportive', 'formal').")
  }).describe("The communication style and tone of the persona.")
});

export const ContributionSchema = z.object({
  personaId: z.string().describe("The ID of the persona making the contribution."),
  content: z.string().describe("The substance of the contribution, such as an idea, question, or piece of evidence."),
  type: z.enum(["observation", "question", "insight", "concern", "suggestion", "challenge", "synthesis"]).describe("The type of contribution, which frames its intent."),
  confidence: z.number().min(0).max(1).describe("A confidence score (0-1) in the validity or importance of the contribution."),
  referenceIds: z.array(z.string()).optional().describe("A list of IDs of other contributions this one builds upon, challenges, or refers to.")
});

export const DisagreementPositionSchema = z.object({
  personaId: z.string().describe("The ID of the persona advocating for this position."),
  position: z.string().describe("A clear statement of the position taken in the disagreement."),
  arguments: z.array(z.string()).describe("The key arguments and evidence supporting this position.")
});

export const DisagreementResolutionSchema = z.object({
  type: z.enum(["consensus", "compromise", "integration", "tabled"]).describe("The method by which the disagreement was resolved."),
  description: z.string().describe("A summary of the resolution and the reasoning behind it.")
});

export const DisagreementSchema = z.object({
  topic: z.string().describe("The specific topic or point of contention."),
  positions: z.array(DisagreementPositionSchema).describe("The different positions taken by personas in the disagreement."),
  resolution: DisagreementResolutionSchema.optional().describe("The outcome of the attempt to resolve the disagreement.")
});

export const CollaborativeReasoningSchema = z.object({
  topic: z.string().describe("The central topic or problem being addressed in the collaborative session."),
  personas: z.array(PersonaSchema).describe("The set of diverse personas participating in the reasoning process."),
  contributions: z.array(ContributionSchema).describe("A log of all contributions made during the session."),
  stage: z.enum(["problem-definition", "ideation", "critique", "integration", "decision", "reflection"]).describe("The current stage of the collaborative reasoning process, guiding the nature of contributions."),
  activePersonaId: z.string().describe("The ID of the persona who is currently expected to contribute."),
  nextPersonaId: z.string().optional().describe("The ID of the persona designated to contribute next, guiding the conversation flow."),
  consensusPoints: z.array(z.string()).optional().describe("A list of key points or decisions on which all personas have reached agreement."),
  disagreements: z.array(DisagreementSchema).optional().describe("A list of active or resolved disagreements that have occurred."),
  keyInsights: z.array(z.string()).optional().describe("A list of significant insights that have emerged from the discussion."),
  openQuestions: z.array(z.string()).optional().describe("A list of unresolved questions that require further discussion or information."),
  finalRecommendation: z.string().optional().describe("The final, synthesized recommendation or decision resulting from the session."),
  sessionId: z.string().describe("A unique identifier for this collaborative reasoning session."),
  iteration: z.number().describe("The turn number or iteration of the session, for tracking progress."),
  suggestedContributionTypes: z.array(z.enum(["observation", "question", "insight", "concern", "suggestion", "challenge", "synthesis"])).optional().describe("A list of suggested types for the next contribution to guide the active persona."),
  nextContributionNeeded: z.boolean().describe("A flag indicating whether the session is awaiting another contribution to proceed.")
});

// Type exports for TypeScript
export type CollaborativeReasoningData = z.infer<typeof CollaborativeReasoningSchema>;
export type PersonaData = z.infer<typeof PersonaSchema>;
export type ContributionData = z.infer<typeof ContributionSchema>;
export type DisagreementData = z.infer<typeof DisagreementSchema>;