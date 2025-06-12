import { z } from 'zod';

// Scientific Method Schema
export const VariableSchema = z.object({
  name: z.string().describe("The name of the variable (e.g., 'user conversion rate', 'website latency')."),
  type: z.enum(["independent", "dependent", "controlled", "confounding"]).describe("The role of the variable in the experiment. Independent: the one you change. Dependent: the one you measure. Controlled: the ones you keep constant."),
  operationalization: z.string().optional().describe("A precise description of how the variable will be measured or manipulated (e.g., 'Latency measured as Time to First Byte in ms', 'Conversion measured by sign-ups per 1000 visitors').")
});

export const HypothesisSchema = z.object({
  statement: z.string().describe("A clear, falsifiable statement predicting a relationship between variables (e.g., 'Reducing button size will decrease user conversion rate')."),
  variables: z.array(VariableSchema).describe("An array defining all variables involved in the hypothesis."),
  assumptions: z.array(z.string()).describe("Any conditions assumed to be true for the hypothesis to hold (e.g., 'Users notice button size')."),
  hypothesisId: z.string().describe("A unique identifier for tracking this specific hypothesis."),
  confidence: z.number().min(0).max(1).describe("A prior confidence score (0-1) in the hypothesis before testing."),
  domain: z.string().describe("The specific area of study or context of the hypothesis (e.g., 'UI/UX Optimization')."),
  iteration: z.number().describe("The version number of this hypothesis, for tracking refinements."),
  alternativeTo: z.array(z.string()).optional().describe("A list of IDs of competing or alternative hypotheses."),
  refinementOf: z.string().optional().describe("The ID of a previous, broader hypothesis that this one refines."),
  status: z.enum(["proposed", "testing", "supported", "refuted", "refined"]).describe("The current lifecycle stage of the hypothesis.")
});

export const PredictionSchema = z.object({
  if: z.string().describe("The specific condition or action to be taken in the experiment (e.g., 'If we decrease the button size by 50%')."),
  then: z.string().describe("The specific, measurable outcome expected if the hypothesis is true (e.g., 'then the user conversion rate will drop by at least 5%')."),
  else: z.string().optional().describe("An alternative outcome, which might support a competing hypothesis (e.g., 'else the conversion rate will remain unchanged').")
});

export const ExperimentSchema = z.object({
  design: z.string().describe("A description of the experimental design (e.g., 'A/B Test', 'Repeated Measures Design')."),
  methodology: z.string().describe("The step-by-step procedure for conducting the experiment."),
  predictions: z.array(PredictionSchema).describe("The specific, testable predictions derived from the hypothesis."),
  experimentId: z.string().describe("A unique identifier for this specific experiment."),
  hypothesisId: z.string().describe("The ID of the hypothesis this experiment is designed to test."),
  controlMeasures: z.array(z.string()).describe("Measures taken to prevent confounding variables from influencing the results (e.g., 'Ensuring both user groups have similar demographics')."),
  results: z.string().optional().describe("A summary of the raw data or findings from the experiment."),
  outcomeMatched: z.boolean().optional().describe("A flag indicating whether the results matched the 'then' part of the prediction."),
  unexpectedObservations: z.array(z.string()).optional().describe("Any surprising findings not anticipated by the hypothesis."),
  limitations: z.array(z.string()).optional().describe("Factors that may limit the generalizability of the findings (e.g., 'Sample size was small')."),
  nextSteps: z.array(z.string()).optional().describe("Proposed follow-up actions, such as further experiments or analysis.")
});

export const ScientificMethodSchema = z.object({
  stage: z.enum(["observation", "question", "hypothesis", "experiment", "analysis", "conclusion", "iteration"]).describe("The current stage in the scientific inquiry process."),
  observation: z.string().optional().describe("An initial observation that sparks inquiry (e.g., 'The new feature has lower engagement than expected')."),
  question: z.string().optional().describe("A specific question that arises from the observation (e.g., 'Why is user engagement low?')."),
  hypothesis: HypothesisSchema.optional().describe("The formal hypothesis being investigated."),
  experiment: ExperimentSchema.optional().describe("The design and details of the experiment to test the hypothesis."),
  analysis: z.string().optional().describe("The interpretation of the experimental results and statistical analysis."),
  conclusion: z.string().optional().describe("The final conclusion drawn from the analysis, stating whether the hypothesis was supported or refuted."),
  inquiryId: z.string().describe("A unique identifier for the entire scientific inquiry from observation to conclusion."),
  iteration: z.number().describe("The iteration number of the inquiry process, for tracking cycles of refinement."),
  nextStageNeeded: z.boolean().describe("A flag indicating whether the inquiry requires a subsequent stage.")
});

// Type exports for TypeScript
export type ScientificMethodData = z.infer<typeof ScientificMethodSchema>;
export type VariableData = z.infer<typeof VariableSchema>;
export type HypothesisData = z.infer<typeof HypothesisSchema>;
export type PredictionData = z.infer<typeof PredictionSchema>;
export type ExperimentData = z.infer<typeof ExperimentSchema>;