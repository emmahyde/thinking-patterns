import { z } from 'zod';

// Domain Modeling Schema
export const EntitySchema = z.object({
  id: z.string().optional().describe("A unique identifier for the entity."),
  name: z.string().describe("The name of the entity."),
  description: z.string().describe("A detailed description of the entity's purpose and role."),
  attributes: z.array(z.string()).describe("A list of data attributes associated with the entity."),
  behaviors: z.array(z.string()).optional().describe("A list of behaviors or operations the entity can perform."),
  constraints: z.array(z.string()).optional().describe("A list of rules or constraints that apply to this entity."),
  invariants: z.array(z.string()).optional().describe("A list of conditions that must always be true for this entity."),
});

export const RelationshipSchema = z.object({
  id: z.string().optional().describe("A unique identifier for the relationship."),
  name: z.string().describe("The name of the relationship."),
  type: z.enum(["one-to-one", "one-to-many", "many-to-many", "inheritance", "composition", "aggregation", "dependency"]).describe("The type of relationship between entities."),
  sourceEntity: z.string().describe("The name of the source entity in the relationship."),
  targetEntity: z.string().describe("The name of the target entity in the relationship."),
  description: z.string().describe("A detailed description of the relationship."),
  constraints: z.array(z.string()).optional().describe("A list of rules or constraints that apply to this relationship."),
  cardinality: z.string().optional().describe("The cardinality of the relationship (e.g., '1..*')."),
});

export const DomainRuleSchema = z.object({
  id: z.string().optional().describe("A unique identifier for the domain rule."),
  name: z.string().describe("The name of the domain rule."),
  description: z.string().describe("A detailed description of the domain rule."),
  type: z.enum(["business-rule", "validation-rule", "constraint", "invariant", "axiom"]).describe("The type of the domain rule."),
  entities: z.array(z.string()).describe("A list of entities to which this rule applies."),
  condition: z.string().describe("The condition that must be met for the rule to apply."),
  consequence: z.string().optional().describe("The consequence of the rule being met."),
  priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("The priority of the domain rule."),
});

export const BoundarySchema = z.object({
  name: z.string().describe("The name of the bounded context."),
  description: z.string().describe("A description of the bounded context."),
  includedEntities: z.array(z.string()).describe("A list of entities included in this bounded context."),
  excludedConcepts: z.array(z.string()).optional().describe("A list of concepts explicitly excluded from this bounded context."),
  interfaces: z.array(z.string()).optional().describe("A list of interfaces this bounded context exposes."),
  responsibilities: z.array(z.string()).optional().describe("A list of responsibilities of this bounded context."),
});

export const ModelValidationSchema = z.object({
  completeness: z.number().min(0).max(1).describe("A score indicating the completeness of the model."),
  consistency: z.number().min(0).max(1).describe("A score indicating the consistency of the model."),
  correctness: z.number().min(0).max(1).describe("A score indicating the correctness of the model."),
  issues: z.array(z.string()).optional().describe("A list of identified issues with the model."),
  suggestions: z.array(z.string()).optional().describe("A list of suggestions for improving the model."),
});

export const DomainModelingSchema = z.object({
  domainName: z.string().describe("The name of the domain being modeled."),
  description: z.string().describe("A detailed description of the domain."),
  modelingId: z.string().describe("A unique identifier for this modeling session."),
  iteration: z.number().describe("The iteration number of this modeling session."),
  stage: z.enum(["analysis", "conceptual", "logical", "physical", "validation", "refinement"]).describe("The current stage of the modeling process."),
  entities: z.array(EntitySchema).describe("A list of all entities in the domain."),
  relationships: z.array(RelationshipSchema).optional().describe("A list of all relationships between entities."),
  domainRules: z.array(DomainRuleSchema).optional().describe("A list of all domain rules."),
  boundaries: BoundarySchema.optional().describe("The bounded context of the domain."),
  assumptions: z.array(z.string()).optional().describe("A list of assumptions made during the modeling process."),
  stakeholders: z.array(z.string()).optional().describe("A list of stakeholders involved in the modeling process."),
  useCases: z.array(z.string()).optional().describe("A list of use cases for the domain."),
  modelValidation: ModelValidationSchema.optional().describe("Validation results for the model."),
  abstractionLevel: z.enum(["high", "medium", "low"]).describe("The level of abstraction of the model."),
  paradigm: z.enum(["object-oriented", "relational", "functional", "event-driven", "service-oriented", "domain-driven"]).describe("The modeling paradigm used."),
  nextStageNeeded: z.boolean().describe("A flag indicating whether another modeling stage is required."),
  suggestedNextStage: z.string().optional().describe("The suggested next stage in the modeling process."),
  modelingNotes: z.array(z.string()).optional().describe("A list of notes related to the modeling process."),
});

// Type exports for TypeScript
export type DomainModelingData = z.infer<typeof DomainModelingSchema>;
export type EntityData = z.infer<typeof EntitySchema>;
export type RelationshipData = z.infer<typeof RelationshipSchema>;
export type DomainRuleData = z.infer<typeof DomainRuleSchema>;
export type BoundaryData = z.infer<typeof BoundarySchema>;
export type ModelValidationData = z.infer<typeof ModelValidationSchema>; 