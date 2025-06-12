import { z } from 'zod';

// Domain Modeling Schema
export const EntitySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  attributes: z.array(z.string()),
  behaviors: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  invariants: z.array(z.string()).optional()
});

export const RelationshipSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.enum(["one-to-one", "one-to-many", "many-to-many", "inheritance", "composition", "aggregation", "dependency"]),
  sourceEntity: z.string(),
  targetEntity: z.string(),
  description: z.string(),
  constraints: z.array(z.string()).optional(),
  cardinality: z.string().optional()
});

export const DomainRuleSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  type: z.enum(["business-rule", "validation-rule", "constraint", "invariant", "axiom"]),
  entities: z.array(z.string()),
  condition: z.string(),
  consequence: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional()
});

export const BoundarySchema = z.object({
  name: z.string(),
  description: z.string(),
  includedEntities: z.array(z.string()),
  excludedConcepts: z.array(z.string()).optional(),
  interfaces: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional()
});

export const ModelValidationSchema = z.object({
  completeness: z.number().min(0).max(1),
  consistency: z.number().min(0).max(1),
  correctness: z.number().min(0).max(1),
  issues: z.array(z.string()).optional(),
  suggestions: z.array(z.string()).optional()
});

export const DomainModelingSchema = z.object({
  domainName: z.string(),
  description: z.string(),
  modelingId: z.string(),
  iteration: z.number(),
  stage: z.enum(["analysis", "conceptual", "logical", "physical", "validation", "refinement"]),
  entities: z.array(EntitySchema),
  relationships: z.array(RelationshipSchema).optional(),
  domainRules: z.array(DomainRuleSchema).optional(),
  boundaries: BoundarySchema.optional(),
  assumptions: z.array(z.string()).optional(),
  stakeholders: z.array(z.string()).optional(),
  useCases: z.array(z.string()).optional(),
  modelValidation: ModelValidationSchema.optional(),
  abstractionLevel: z.enum(["high", "medium", "low"]),
  paradigm: z.enum(["object-oriented", "relational", "functional", "event-driven", "service-oriented", "domain-driven"]),
  nextStageNeeded: z.boolean(),
  suggestedNextStage: z.string().optional(),
  modelingNotes: z.array(z.string()).optional()
});

// Type exports for TypeScript
export type DomainModelingData = z.infer<typeof DomainModelingSchema>;
export type EntityData = z.infer<typeof EntitySchema>;
export type RelationshipData = z.infer<typeof RelationshipSchema>;
export type DomainRuleData = z.infer<typeof DomainRuleSchema>;
export type BoundaryData = z.infer<typeof BoundarySchema>;
export type ModelValidationData = z.infer<typeof ModelValidationSchema>; 