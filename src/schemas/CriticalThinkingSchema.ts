import { z } from 'zod';

/**
 * Critical Thinking Schema
 * 
 * Defines the structure for systematic critical analysis of code, designs,
 * requirements, or concepts. Includes identification of potential issues,
 * edge cases, invalid assumptions, and alternative approaches.
 */

// Critical Thinking Schema with enhanced structural complexity
export const IssueSchema = z.object({
  id: z.string().optional().describe("A unique identifier for the issue."),
  description: z.string().describe("A detailed description of the potential issue or flaw."),
  severity: z.enum(["low", "medium", "high", "critical"]).describe("The severity level of the issue."),
  category: z.enum(["logic", "implementation", "design", "security", "performance", "usability", "maintainability"]).describe("The category of the issue."),
  evidence: z.array(z.string()).optional().describe("Evidence supporting the existence of this issue."),
  likelihood: z.number().min(0).max(1).describe("The probability (0-1) that this issue will actually occur."),
  impact: z.string().optional().describe("The potential impact if this issue manifests."),
  mitigation: z.string().optional().describe("Suggested approaches to mitigate or resolve this issue.")
});

export const EdgeCaseSchema = z.object({
  id: z.string().optional().describe("A unique identifier for the edge case."),
  scenario: z.string().describe("A description of the edge case scenario."),
  conditions: z.array(z.string()).describe("The specific conditions that trigger this edge case."),
  expectedBehavior: z.string().optional().describe("What should happen in this edge case."),
  currentBehavior: z.string().optional().describe("What currently happens (if known)."),
  testability: z.enum(["easy", "moderate", "difficult", "untestable"]).describe("How easy it is to test this edge case."),
  businessImpact: z.enum(["none", "low", "medium", "high"]).describe("The business impact if this edge case is not handled.")
});

export const AssumptionSchema = z.object({
  id: z.string().optional().describe("A unique identifier for the assumption."),
  statement: z.string().describe("The assumption being made."),
  validity: z.enum(["valid", "questionable", "invalid", "unknown"]).describe("Assessment of the assumption's validity."),
  dependencies: z.array(z.string()).optional().describe("What this assumption depends on."),
  consequences: z.string().optional().describe("What happens if this assumption is wrong."),
  verification: z.string().optional().describe("How this assumption could be verified or tested.")
});

export const AlternativeApproachSchema = z.object({
  id: z.string().optional().describe("A unique identifier for the alternative approach."),
  name: z.string().describe("A name or title for the alternative approach."),
  description: z.string().describe("A detailed description of the alternative approach."),
  advantages: z.array(z.string()).describe("The advantages of this approach over the current one."),
  disadvantages: z.array(z.string()).describe("The disadvantages or trade-offs of this approach."),
  complexity: z.enum(["low", "medium", "high"]).describe("The implementation complexity of this approach."),
  feasibility: z.number().min(0).max(1).describe("The feasibility score (0-1) of implementing this approach."),
  timeToImplement: z.string().optional().describe("Estimated time to implement this approach.")
});

export const CriticalThinkingSchema = z.object({
  subject: z.string().describe("The code, design, requirement, or concept being critically analyzed."),
  analysisId: z.string().optional().describe("A unique identifier for this critical thinking session."),
  context: z.string().optional().describe("The broader context or background relevant to the analysis."),
  objectives: z.array(z.string()).optional().describe("The specific objectives or goals of this critical analysis."),
  methodology: z.string().optional().describe("The approach or framework used for the critical analysis."),
  
  // Enhanced structural components
  potentialIssues: z.array(IssueSchema).describe("A structured list of potential issues or flaws identified."),
  edgeCases: z.array(EdgeCaseSchema).describe("A structured list of edge cases that might not be handled correctly."),
  invalidAssumptions: z.array(AssumptionSchema).describe("A structured list of assumptions that may be invalid or questionable."),
  alternativeApproaches: z.array(AlternativeApproachSchema).describe("A structured list of alternative approaches or solutions."),
  
  // Analysis metadata
  confidenceLevel: z.number().min(0).max(1).optional().describe("Overall confidence (0-1) in the completeness of this analysis."),
  analysisDepth: z.enum(["surface", "moderate", "deep", "comprehensive"]).optional().describe("The depth level of the critical analysis performed."),
  timeSpent: z.string().optional().describe("Time spent on this analysis (e.g., '2 hours')."),
  reviewers: z.array(z.string()).optional().describe("List of people who reviewed or contributed to this analysis."),
  
  // Synthesis and conclusions
  overallAssessment: z.string().optional().describe("An overall assessment or summary of the critical analysis."),
  prioritizedRecommendations: z.array(z.string()).optional().describe("Prioritized list of recommendations based on the analysis."),
  nextSteps: z.array(z.string()).optional().describe("Suggested next steps for addressing the findings."),
  followUpQuestions: z.array(z.string()).optional().describe("Questions that arose during analysis and need further investigation.")
});

// Type exports for TypeScript
export type CriticalThinkingData = z.infer<typeof CriticalThinkingSchema>;
export type IssueData = z.infer<typeof IssueSchema>;
export type EdgeCaseData = z.infer<typeof EdgeCaseSchema>;
export type AssumptionData = z.infer<typeof AssumptionSchema>;
export type AlternativeApproachData = z.infer<typeof AlternativeApproachSchema>; 