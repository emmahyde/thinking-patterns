import { z } from 'zod';

/**
 * Problem Decomposition Schema
 * 
 * Defines the structure for systematic problem breakdown and task decomposition.
 * Includes hierarchical task structures, resource requirements, risk assessment,
 * stakeholder management, and progress tracking capabilities.
 */

// Enhanced Task Schema with complex structural information
export const ResourceRequirementSchema = z.object({
  type: z.enum(["human", "financial", "technical", "infrastructure", "external"]).describe("The type of resource required."),
  description: z.string().describe("Description of the specific resource needed."),
  quantity: z.string().optional().describe("Quantity or amount of the resource needed."),
  availability: z.enum(["available", "limited", "unavailable", "unknown"]).describe("Current availability of this resource."),
  criticality: z.enum(["low", "medium", "high", "critical"]).describe("How critical this resource is for task completion.")
});

export const RiskSchema = z.object({
  id: z.string().optional().describe("A unique identifier for the risk."),
  description: z.string().describe("Description of the potential risk."),
  probability: z.number().min(0).max(1).describe("Probability (0-1) of the risk occurring."),
  impact: z.enum(["low", "medium", "high", "critical"]).describe("Impact level if the risk materializes."),
  category: z.enum(["technical", "resource", "timeline", "external", "quality"]).describe("Category of the risk."),
  mitigation: z.string().optional().describe("Strategies to mitigate this risk."),
  contingency: z.string().optional().describe("Contingency plan if the risk occurs.")
});

export const StakeholderSchema = z.object({
  name: z.string().describe("Name or role of the stakeholder."),
  role: z.enum(["owner", "contributor", "reviewer", "approver", "informed"]).describe("The stakeholder's role in this task."),
  influence: z.enum(["low", "medium", "high"]).describe("Level of influence this stakeholder has."),
  interest: z.enum(["low", "medium", "high"]).describe("Level of interest this stakeholder has."),
  availability: z.string().optional().describe("Availability of this stakeholder.")
});

export const AcceptanceCriteriaSchema = z.object({
  id: z.string().optional().describe("A unique identifier for the acceptance criterion."),
  description: z.string().describe("Description of what must be achieved for the task to be considered complete."),
  measurable: z.boolean().describe("Whether this criterion can be objectively measured."),
  priority: z.enum(["must-have", "should-have", "could-have", "won't-have"]).describe("Priority level of this criterion."),
  testable: z.boolean().describe("Whether this criterion can be tested or verified.")
});

export const ProgressTrackingSchema = z.object({
  status: z.enum(["not-started", "in-progress", "blocked", "completed", "cancelled"]).describe("Current status of the task."),
  percentComplete: z.number().min(0).max(100).optional().describe("Percentage completion (0-100)."),
  startDate: z.string().optional().describe("Actual or planned start date."),
  endDate: z.string().optional().describe("Actual or planned end date."),
  lastUpdated: z.string().optional().describe("When the progress was last updated."),
  blockers: z.array(z.string()).optional().describe("Current blockers preventing progress."),
  milestones: z.array(z.object({
    name: z.string().describe("Name of the milestone."),
    date: z.string().describe("Target or actual date of the milestone."),
    achieved: z.boolean().describe("Whether the milestone has been achieved.")
  })).optional().describe("Key milestones for this task.")
});

export type Task = {
  id: string;
  description: string;
  subTasks?: Task[];
  dependencies?: string[];
  effortEstimate?: string;
  implementationOrder?: number;
  priority?: "low" | "medium" | "high" | "critical";
  complexity?: "low" | "medium" | "high";
  category?: string;
  tags?: string[];
  resourceRequirements?: z.infer<typeof ResourceRequirementSchema>[];
  risks?: z.infer<typeof RiskSchema>[];
  stakeholders?: z.infer<typeof StakeholderSchema>[];
  acceptanceCriteria?: z.infer<typeof AcceptanceCriteriaSchema>[];
  progress?: z.infer<typeof ProgressTrackingSchema>;
  assumptions?: string[];
  constraints?: string[];
  deliverables?: string[];
};

export const TaskSchema: z.ZodType<Task> = z.object({
  id: z.string().describe("A unique identifier for the task."),
  description: z.string().describe("A detailed description of the task and its objectives."),
  subTasks: z.array(z.lazy(() => TaskSchema)).optional().describe("A hierarchical list of sub-tasks that make up this task."),
  dependencies: z.array(z.string()).optional().describe("A list of task IDs that this task depends on."),
  effortEstimate: z.string().optional().describe("An estimate of the effort required (e.g., '2 days', '40 hours')."),
  implementationOrder: z.number().optional().describe("The order in which this task should be implemented."),
  
  // Enhanced task properties
  priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("Priority level of this task."),
  complexity: z.enum(["low", "medium", "high"]).optional().describe("Complexity level of this task."),
  category: z.string().optional().describe("Category or type of work this task represents."),
  tags: z.array(z.string()).optional().describe("Tags for categorizing and filtering tasks."),
  
  // Resource and risk management
  resourceRequirements: z.array(ResourceRequirementSchema).optional().describe("Resources required to complete this task."),
  risks: z.array(RiskSchema).optional().describe("Potential risks associated with this task."),
  stakeholders: z.array(StakeholderSchema).optional().describe("Stakeholders involved in or affected by this task."),
  
  // Quality and completion criteria
  acceptanceCriteria: z.array(AcceptanceCriteriaSchema).optional().describe("Criteria that must be met for the task to be considered complete."),
  progress: ProgressTrackingSchema.optional().describe("Current progress and status of the task."),
  
  // Additional context
  assumptions: z.array(z.string()).optional().describe("Assumptions made about this task."),
  constraints: z.array(z.string()).optional().describe("Constraints that limit how this task can be completed."),
  deliverables: z.array(z.string()).optional().describe("Specific deliverables expected from this task.")
});

export const DecompositionMetricsSchema = z.object({
  totalTasks: z.number().describe("Total number of tasks in the decomposition."),
  maxDepth: z.number().describe("Maximum depth of the task hierarchy."),
  estimatedTotalEffort: z.string().optional().describe("Total estimated effort across all tasks."),
  criticalPath: z.array(z.string()).optional().describe("Task IDs that form the critical path."),
  riskScore: z.number().min(0).max(1).optional().describe("Overall risk score (0-1) for the entire decomposition."),
  complexityDistribution: z.object({
    low: z.number().describe("Number of low complexity tasks."),
    medium: z.number().describe("Number of medium complexity tasks."),
    high: z.number().describe("Number of high complexity tasks.")
  }).optional().describe("Distribution of tasks by complexity level.")
});

export const ProblemDecompositionSchema = z.object({
  problem: z.string().describe("A clear and comprehensive description of the problem to be decomposed."),
  decompositionId: z.string().optional().describe("A unique identifier for this decomposition."),
  methodology: z.string().optional().describe("The methodology or approach used for decomposition (e.g., 'Work Breakdown Structure', 'Feature-driven')."),
  scope: z.string().optional().describe("The scope and boundaries of this problem decomposition."),
  objectives: z.array(z.string()).optional().describe("The main objectives to be achieved through this decomposition."),
  
  // Core decomposition
  decomposition: z.array(TaskSchema).describe("A hierarchical list of tasks that the problem is decomposed into."),
  
  // Analysis and metrics
  metrics: DecompositionMetricsSchema.optional().describe("Metrics and analysis of the decomposition."),
  
  // Validation and quality
  completenessCheck: z.array(z.string()).optional().describe("Checklist items to verify completeness of the decomposition."),
  reviewNotes: z.array(z.string()).optional().describe("Notes from reviews of this decomposition."),
  alternativeApproaches: z.array(z.string()).optional().describe("Alternative ways the problem could have been decomposed."),
  
  // Meta information
  createdBy: z.string().optional().describe("Who created this decomposition."),
  createdDate: z.string().optional().describe("When this decomposition was created."),
  lastModified: z.string().optional().describe("When this decomposition was last modified."),
  version: z.string().optional().describe("Version of this decomposition.")
});

// Type exports for TypeScript
export type ProblemDecompositionData = z.infer<typeof ProblemDecompositionSchema>;
export type ResourceRequirementData = z.infer<typeof ResourceRequirementSchema>;
export type RiskData = z.infer<typeof RiskSchema>;
export type StakeholderData = z.infer<typeof StakeholderSchema>;
export type AcceptanceCriteriaData = z.infer<typeof AcceptanceCriteriaSchema>;
export type ProgressTrackingData = z.infer<typeof ProgressTrackingSchema>;
export type DecompositionMetricsData = z.infer<typeof DecompositionMetricsSchema>; 