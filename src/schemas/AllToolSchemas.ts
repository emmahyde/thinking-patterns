import { z } from 'zod';

// Mental Model Schema
export const MentalModelSchema = z.object({
  modelName: z.string().min(1),
  problem: z.string().min(1),
  steps: z.array(z.string()).optional(),
  reasoning: z.string().optional(),
  conclusion: z.string().optional()
});

// Debugging Approach Schema
export const DebuggingApproachSchema = z.object({
  approachName: z.string().min(1),
  issue: z.string().min(1),
  steps: z.array(z.string()).optional(),
  findings: z.string().optional(),
  resolution: z.string().optional()
});

// Stochastic Algorithm Schema
export const StochasticAlgorithmSchema = z.object({
  algorithm: z.string().min(1),
  problem: z.string().min(1),
  parameters: z.record(z.unknown()).optional(),
  result: z.string().optional()
});

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

// Scientific Method Schema
export const VariableSchema = z.object({
  name: z.string(),
  type: z.enum(["independent", "dependent", "controlled", "confounding"]),
  operationalization: z.string().optional()
});

export const HypothesisSchema = z.object({
  statement: z.string(),
  variables: z.array(VariableSchema),
  assumptions: z.array(z.string()),
  hypothesisId: z.string(),
  confidence: z.number().min(0).max(1),
  domain: z.string(),
  iteration: z.number(),
  alternativeTo: z.array(z.string()).optional(),
  refinementOf: z.string().optional(),
  status: z.enum(["proposed", "testing", "supported", "refuted", "refined"])
});

export const PredictionSchema = z.object({
  if: z.string(),
  then: z.string(),
  else: z.string().optional()
});

export const ExperimentSchema = z.object({
  design: z.string(),
  methodology: z.string(),
  predictions: z.array(PredictionSchema),
  experimentId: z.string(),
  hypothesisId: z.string(),
  controlMeasures: z.array(z.string()),
  results: z.string().optional(),
  outcomeMatched: z.boolean().optional(),
  unexpectedObservations: z.array(z.string()).optional(),
  limitations: z.array(z.string()).optional(),
  nextSteps: z.array(z.string()).optional()
});

export const ScientificMethodSchema = z.object({
  stage: z.enum(["observation", "question", "hypothesis", "experiment", "analysis", "conclusion", "iteration"]),
  observation: z.string().optional(),
  question: z.string().optional(),
  hypothesis: HypothesisSchema.optional(),
  experiment: ExperimentSchema.optional(),
  analysis: z.string().optional(),
  conclusion: z.string().optional(),
  inquiryId: z.string(),
  iteration: z.number(),
  nextStageNeeded: z.boolean()
});

// Structured Argumentation Schema
export const StructuredArgumentationSchema = z.object({
  claim: z.string(),
  premises: z.array(z.string()),
  conclusion: z.string(),
  argumentId: z.string().optional(),
  argumentType: z.enum(["thesis", "antithesis", "synthesis", "objection", "rebuttal"]),
  confidence: z.number().min(0).max(1),
  respondsTo: z.string().optional(),
  supports: z.array(z.string()).optional(),
  contradicts: z.array(z.string()).optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  nextArgumentNeeded: z.boolean(),
  suggestedNextTypes: z.array(z.enum(["thesis", "antithesis", "synthesis", "objection", "rebuttal"])).optional()
});

// Visual Reasoning Schema
export const VisualElementSchema = z.object({
  id: z.string(),
  type: z.enum(["node", "edge", "container", "annotation"]),
  label: z.string().optional(),
  properties: z.record(z.unknown()),
  source: z.string().optional(),
  target: z.string().optional(),
  contains: z.array(z.string()).optional()
});

export const VisualReasoningSchema = z.object({
  operation: z.enum(["create", "update", "delete", "transform", "observe"]),
  elements: z.array(VisualElementSchema).optional(),
  transformationType: z.enum(["rotate", "move", "resize", "recolor", "regroup"]).optional(),
  diagramId: z.string(),
  diagramType: z.enum(["graph", "flowchart", "stateDiagram", "conceptMap", "treeDiagram", "custom"]),
  iteration: z.number(),
  observation: z.string().optional(),
  insight: z.string().optional(),
  hypothesis: z.string().optional(),
  nextOperationNeeded: z.boolean()
});

// Type exports for TypeScript
export type MentalModelData = z.infer<typeof MentalModelSchema>;
export type DebuggingApproachData = z.infer<typeof DebuggingApproachSchema>;
export type StochasticAlgorithmData = z.infer<typeof StochasticAlgorithmSchema>;
export type CollaborativeReasoningData = z.infer<typeof CollaborativeReasoningSchema>;
export type DecisionFrameworkData = z.infer<typeof DecisionFrameworkSchema>;
export type MetacognitiveMonitoringData = z.infer<typeof MetacognitiveMonitoringSchema>;
export type ScientificMethodData = z.infer<typeof ScientificMethodSchema>;
export type StructuredArgumentationData = z.infer<typeof StructuredArgumentationSchema>;
export type VisualReasoningData = z.infer<typeof VisualReasoningSchema>;

// Individual component exports
export type PersonaData = z.infer<typeof PersonaSchema>;
export type ContributionData = z.infer<typeof ContributionSchema>;
export type DisagreementData = z.infer<typeof DisagreementSchema>;
export type DecisionOptionData = z.infer<typeof DecisionOptionSchema>;
export type DecisionCriterionData = z.infer<typeof DecisionCriterionSchema>;
export type KnowledgeAssessmentData = z.infer<typeof KnowledgeAssessmentSchema>;
export type ClaimAssessmentData = z.infer<typeof ClaimAssessmentSchema>;
export type ReasoningAssessmentData = z.infer<typeof ReasoningAssessmentSchema>;
export type VariableData = z.infer<typeof VariableSchema>;
export type HypothesisData = z.infer<typeof HypothesisSchema>;
export type PredictionData = z.infer<typeof PredictionSchema>;
export type ExperimentData = z.infer<typeof ExperimentSchema>;
export type VisualElementData = z.infer<typeof VisualElementSchema>;
