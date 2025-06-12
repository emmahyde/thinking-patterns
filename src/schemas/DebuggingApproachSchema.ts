import { z } from 'zod';

/**
 * Debugging Approach Schema
 * 
 * Defines the structure for systematic debugging methodologies and
 * troubleshooting approaches. Includes AI-optimized debugging methods,
 * evidence collection, hypothesis testing, and resolution tracking.
 */

// Enhanced Debugging Approach Schema with AI-optimized methods and complex structural information
export const DebuggingMethodSchema = z.object({
  name: z.enum([
    // Traditional debugging approaches
    "Binary Search Debugging",
    "The 5 Whys", 
    "Saff Squeeze",
    "Rubber Duck Debugging",
    "Divide & Conquer",
    "Hypothesis Testing",
    
    // AI-optimized debugging approaches from the GitHub PR
    "Log Analysis",
    "Static Analysis", 
    "Root Cause Analysis",
    "Delta Debugging",
    "Fuzzing",
    "Incremental Testing",
    
    // Additional systematic approaches
    "Bisection Method",
    "Wolf Fence Algorithm",
    "Tracing",
    "Print Debugging",
    "Interactive Debugging",
    "Profiling",
    "Memory Analysis",
    "Performance Analysis",
    "Custom"
  ]).describe("The systematic debugging method being applied."),
  description: z.string().optional().describe("Detailed description of how this debugging method works."),
  aiOptimized: z.boolean().optional().describe("Whether this method leverages AI for enhanced problem-solving capabilities."),
  complexity: z.enum(["low", "medium", "high", "expert"]).optional().describe("Complexity level required to apply this method effectively."),
  timeEstimate: z.string().optional().describe("Estimated time to apply this method (e.g., '30 minutes', '2 hours').")
});

export const EvidenceSchema = z.object({
  id: z.string().optional().describe("Unique identifier for this piece of evidence."),
  type: z.enum(["log", "error_message", "stack_trace", "performance_metric", "user_report", "test_result", "code_analysis", "observation"]).describe("Type of evidence collected."),
  source: z.string().describe("Where this evidence was collected from."),
  content: z.string().describe("The actual evidence content or description."),
  timestamp: z.string().optional().describe("When this evidence was collected."),
  relevance: z.enum(["high", "medium", "low"]).optional().describe("Relevance of this evidence to the issue."),
  verified: z.boolean().optional().describe("Whether this evidence has been verified or confirmed.")
});

export const DebuggingHypothesisSchema = z.object({
  id: z.string().optional().describe("Unique identifier for this hypothesis."),
  statement: z.string().describe("The hypothesis statement about the potential cause."),
  confidence: z.number().min(0).max(1).describe("Confidence level (0-1) in this hypothesis."),
  evidence: z.array(z.string()).optional().describe("IDs of evidence supporting this hypothesis."),
  testPlan: z.string().optional().describe("Plan for testing this hypothesis."),
  status: z.enum(["proposed", "testing", "confirmed", "refuted", "inconclusive"]).describe("Current status of the hypothesis."),
  priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("Priority for testing this hypothesis.")
});

export const DebuggingStepSchema = z.object({
  stepNumber: z.number().describe("Sequential number of this debugging step."),
  action: z.string().describe("The specific action taken in this step."),
  method: z.string().optional().describe("The debugging method applied in this step."),
  tools: z.array(z.string()).optional().describe("Tools or technologies used in this step."),
  duration: z.string().optional().describe("Time spent on this step."),
  outcome: z.string().optional().describe("Result or outcome of this step."),
  evidenceCollected: z.array(z.string()).optional().describe("IDs of evidence collected during this step."),
  nextSteps: z.array(z.string()).optional().describe("Potential next steps based on this step's outcome.")
});

export const IssueClassificationSchema = z.object({
  category: z.enum(["functional", "performance", "security", "usability", "compatibility", "reliability", "maintainability"]).describe("Primary category of the issue."),
  severity: z.enum(["critical", "high", "medium", "low"]).describe("Severity level of the issue."),
  priority: z.enum(["urgent", "high", "medium", "low"]).describe("Priority for fixing this issue."),
  impact: z.enum(["system-wide", "module-specific", "feature-specific", "edge-case"]).describe("Scope of impact of the issue."),
  frequency: z.enum(["always", "often", "sometimes", "rarely", "once"]).describe("How frequently the issue occurs."),
  environment: z.array(z.string()).optional().describe("Environments where the issue occurs (e.g., 'production', 'staging').")
});

export const AIAnalysisSchema = z.object({
  patternRecognition: z.object({
    similarIssues: z.array(z.string()).optional().describe("Similar issues identified by AI analysis."),
    patterns: z.array(z.string()).optional().describe("Patterns identified in logs, code, or behavior."),
    anomalies: z.array(z.string()).optional().describe("Anomalies detected by AI analysis.")
  }).optional().describe("AI-powered pattern recognition results."),
  recommendations: z.array(z.object({
    action: z.string().describe("Recommended action."),
    confidence: z.number().min(0).max(1).describe("AI confidence in this recommendation."),
    reasoning: z.string().describe("AI reasoning behind this recommendation.")
  })).optional().describe("AI-generated recommendations."),
  riskAssessment: z.object({
    riskLevel: z.enum(["low", "medium", "high", "critical"]).describe("Overall risk level."),
    factors: z.array(z.string()).describe("Risk factors identified."),
    mitigation: z.array(z.string()).optional().describe("Risk mitigation strategies.")
  }).optional().describe("AI risk assessment of the issue and proposed solutions.")
});

export const DebuggingApproachSchema = z.object({
  // Core identification
  approachName: z.string().min(1).describe("The name of the systematic debugging method being applied (e.g., 'Log Analysis', 'Delta Debugging', 'Root Cause Analysis')."),
  sessionId: z.string().optional().describe("Unique identifier for this debugging session."),
  
  // Issue details with enhanced classification
  issue: z.string().min(1).describe("A detailed and specific description of the problem, including observed vs. expected behavior, and steps to reproduce if known."),
  classification: IssueClassificationSchema.optional().describe("Structured classification of the issue."),
  
  // Debugging methodology
  method: DebuggingMethodSchema.optional().describe("Detailed information about the debugging method being used."),
  hypotheses: z.array(DebuggingHypothesisSchema).optional().describe("Hypotheses about potential causes of the issue."),
  
  // Evidence and findings
  evidence: z.array(EvidenceSchema).optional().describe("Evidence collected during the debugging process."),
  steps: z.union([
    z.array(z.string()),
    z.array(DebuggingStepSchema)
  ]).optional().describe("Debugging steps taken, either as simple strings or detailed step objects."),
  findings: z.string().optional().describe("The key observations, data points, or discoveries made during the debugging process."),
  
  // AI-enhanced analysis (based on the GitHub PR's AI-optimized approaches)
  aiAnalysis: AIAnalysisSchema.optional().describe("AI-powered analysis results for enhanced debugging capabilities."),
  
  // Resolution and follow-up
  resolution: z.string().optional().describe("A clear explanation of the final fix, including any code changes, configuration updates, or other actions taken."),
  preventionMeasures: z.array(z.string()).optional().describe("Measures to prevent similar issues in the future."),
  lessonsLearned: z.array(z.string()).optional().describe("Key lessons learned from this debugging session."),
  
  // Metadata and tracking
  startTime: z.string().optional().describe("When the debugging session started."),
  endTime: z.string().optional().describe("When the debugging session ended."),
  totalDuration: z.string().optional().describe("Total time spent debugging."),
  participants: z.array(z.string()).optional().describe("People involved in the debugging process."),
  tools: z.array(z.string()).optional().describe("Tools and technologies used during debugging."),
  
  // Quality and effectiveness metrics
  effectiveness: z.object({
    timeToResolution: z.string().optional().describe("Time taken to resolve the issue."),
    accuracyOfInitialHypothesis: z.number().min(0).max(1).optional().describe("How accurate the initial hypothesis was (0-1)."),
    methodEffectiveness: z.enum(["very-effective", "effective", "somewhat-effective", "ineffective"]).optional().describe("Effectiveness of the chosen debugging method."),
    satisfactionScore: z.number().min(1).max(5).optional().describe("Satisfaction score with the debugging process (1-5).")
  }).optional().describe("Metrics for evaluating the effectiveness of the debugging approach."),
  
  // Documentation and knowledge sharing
  documentation: z.object({
    publicSummary: z.string().optional().describe("Public summary suitable for sharing with the team."),
    technicalDetails: z.string().optional().describe("Technical details for future reference."),
    codeChanges: z.array(z.string()).optional().describe("List of code changes made."),
    configChanges: z.array(z.string()).optional().describe("List of configuration changes made.")
  }).optional().describe("Documentation of the debugging process and resolution.")
});

// Type exports for TypeScript
export type DebuggingApproachData = z.infer<typeof DebuggingApproachSchema>;
export type DebuggingMethodData = z.infer<typeof DebuggingMethodSchema>;
export type EvidenceData = z.infer<typeof EvidenceSchema>;
export type DebuggingHypothesisData = z.infer<typeof DebuggingHypothesisSchema>;
export type DebuggingStepData = z.infer<typeof DebuggingStepSchema>;
export type IssueClassificationData = z.infer<typeof IssueClassificationSchema>;
export type AIAnalysisData = z.infer<typeof AIAnalysisSchema>;