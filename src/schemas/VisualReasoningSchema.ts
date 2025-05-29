import { z } from 'zod';

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
export type VisualReasoningData = z.infer<typeof VisualReasoningSchema>;
export type VisualElementData = z.infer<typeof VisualElementSchema>;