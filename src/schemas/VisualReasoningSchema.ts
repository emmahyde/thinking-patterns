import { z } from 'zod';

// Enhanced Visual Reasoning Schema with complex structural information
export const SpatialRelationshipSchema = z.object({
  type: z.enum(["adjacent", "overlapping", "contained", "above", "below", "left", "right", "diagonal", "connected", "disconnected"]).describe("The type of spatial relationship."),
  elementA: z.string().describe("ID of the first element in the relationship."),
  elementB: z.string().describe("ID of the second element in the relationship."),
  strength: z.number().min(0).max(1).optional().describe("Strength of the relationship (0-1)."),
  description: z.string().optional().describe("Additional description of the relationship.")
});

export const VisualPatternSchema = z.object({
  id: z.string().optional().describe("A unique identifier for the pattern."),
  type: z.enum(["symmetry", "repetition", "hierarchy", "flow", "clustering", "alignment", "progression", "contrast"]).describe("The type of visual pattern identified."),
  elements: z.array(z.string()).describe("IDs of elements that participate in this pattern."),
  confidence: z.number().min(0).max(1).describe("Confidence level (0-1) in the pattern identification."),
  significance: z.enum(["low", "medium", "high"]).describe("Significance of this pattern for understanding the diagram."),
  description: z.string().describe("Description of the pattern and its implications.")
});

export const CognitiveLoadSchema = z.object({
  complexity: z.enum(["low", "medium", "high", "overwhelming"]).describe("Overall cognitive complexity of the diagram."),
  elementCount: z.number().describe("Total number of visual elements."),
  connectionDensity: z.number().min(0).max(1).describe("Density of connections (0-1)."),
  hierarchyDepth: z.number().optional().describe("Depth of hierarchical structure if present."),
  informationDensity: z.enum(["sparse", "moderate", "dense", "cluttered"]).describe("Density of information presented."),
  readabilityScore: z.number().min(0).max(1).optional().describe("Readability score (0-1) of the diagram.")
});

export const ReasoningStepSchema = z.object({
  id: z.string().optional().describe("A unique identifier for the reasoning step."),
  stepNumber: z.number().describe("Sequential number of this reasoning step."),
  type: z.enum(["observation", "inference", "hypothesis", "validation", "conclusion"]).describe("Type of reasoning step."),
  description: z.string().describe("Description of what was reasoned in this step."),
  evidence: z.array(z.string()).optional().describe("Visual evidence supporting this reasoning step."),
  confidence: z.number().min(0).max(1).describe("Confidence level (0-1) in this reasoning step."),
  dependencies: z.array(z.string()).optional().describe("IDs of previous reasoning steps this depends on.")
});

export const VisualElementSchema = z.object({
  id: z.string().describe("A unique identifier for the visual element."),
  type: z.enum(["node", "edge", "container", "annotation", "shape", "text", "image", "connector"]).describe("The type of the visual element."),
  label: z.string().optional().describe("A label or text content for the visual element."),
  
  // Enhanced properties - flexible to support both old and new formats
  properties: z.union([
    // New enhanced format
    z.object({
      position: z.object({
        x: z.number().optional().describe("X coordinate position."),
        y: z.number().optional().describe("Y coordinate position."),
        z: z.number().optional().describe("Z coordinate for 3D diagrams.")
      }).optional().describe("Spatial position of the element."),
      dimensions: z.object({
        width: z.number().optional().describe("Width of the element."),
        height: z.number().optional().describe("Height of the element."),
        depth: z.number().optional().describe("Depth for 3D elements.")
      }).optional().describe("Dimensions of the element."),
      style: z.object({
        color: z.string().optional().describe("Color of the element."),
        shape: z.string().optional().describe("Shape of the element."),
        size: z.enum(["small", "medium", "large"]).optional().describe("Relative size of the element."),
        opacity: z.number().min(0).max(1).optional().describe("Opacity level (0-1).")
      }).optional().describe("Visual styling properties."),
      semantics: z.object({
        meaning: z.string().optional().describe("Semantic meaning of the element."),
        importance: z.enum(["low", "medium", "high", "critical"]).optional().describe("Importance level of the element."),
        category: z.string().optional().describe("Category or classification of the element.")
      }).optional().describe("Semantic properties of the element."),
      metadata: z.record(z.unknown()).optional().describe("Additional metadata about the element.")
    }),
    // Legacy format - any object for backward compatibility
    z.record(z.unknown())
  ]).describe("Properties of the visual element - supports both enhanced and legacy formats."),
  
  // Relationships
  source: z.string().optional().describe("The ID of the source element for edges/connectors."),
  target: z.string().optional().describe("The ID of the target element for edges/connectors."),
  contains: z.array(z.string()).optional().describe("A list of element IDs contained within this element."),
  connectedTo: z.array(z.string()).optional().describe("IDs of elements this element is connected to.")
});

export const DiagramAnalysisSchema = z.object({
  structure: z.object({
    type: z.enum(["hierarchical", "network", "linear", "circular", "matrix", "hybrid"]).describe("Overall structural type of the diagram."),
    balance: z.enum(["symmetric", "asymmetric", "radial"]).optional().describe("Visual balance of the diagram."),
    flow: z.enum(["top-down", "bottom-up", "left-right", "right-left", "circular", "random"]).optional().describe("Information flow direction.")
  }).describe("Structural analysis of the diagram."),
  patterns: z.array(VisualPatternSchema).optional().describe("Visual patterns identified in the diagram."),
  relationships: z.array(SpatialRelationshipSchema).optional().describe("Spatial relationships between elements."),
  cognitiveLoad: CognitiveLoadSchema.optional().describe("Analysis of cognitive load and complexity."),
  effectiveness: z.object({
    clarity: z.number().min(0).max(1).describe("Clarity score (0-1) of the diagram."),
    completeness: z.number().min(0).max(1).describe("Completeness score (0-1) of the information."),
    efficiency: z.number().min(0).max(1).describe("Efficiency score (0-1) of information presentation.")
  }).optional().describe("Effectiveness metrics of the diagram.")
});

export const VisualReasoningSchema = z.object({
  // Core operation and context
  operation: z.enum(["create", "update", "delete", "transform", "observe", "analyze", "compare", "synthesize"]).describe("The operation to be performed on the visual elements."),
  diagramId: z.string().describe("A unique identifier for the diagram."),
  diagramType: z.enum(["graph", "flowchart", "stateDiagram", "conceptMap", "treeDiagram", "networkDiagram", "mindMap", "organizationChart", "custom"]).describe("The type of diagram being reasoned about."),
  
  // Enhanced visual elements
  elements: z.array(VisualElementSchema).optional().describe("The visual elements being operated on or analyzed."),
  
  // Transformation details
  transformationType: z.enum(["rotate", "move", "resize", "recolor", "regroup", "restructure", "annotate", "highlight"]).optional().describe("The type of transformation to be applied."),
  transformationDetails: z.object({
    target: z.array(z.string()).optional().describe("IDs of elements to be transformed."),
    parameters: z.record(z.unknown()).optional().describe("Parameters for the transformation."),
    rationale: z.string().optional().describe("Reasoning behind the transformation.")
  }).optional().describe("Detailed information about the transformation."),
  
  // Reasoning process
  reasoningChain: z.array(ReasoningStepSchema).optional().describe("Sequential steps in the visual reasoning process."),
  iteration: z.number().describe("The iteration number of this reasoning step."),
  
  // Observations and insights
  observation: z.string().optional().describe("An observation made about the diagram."),
  insight: z.string().optional().describe("An insight gained from the visual analysis."),
  hypothesis: z.string().optional().describe("A hypothesis formed from the insight."),
  
  // Analysis results
  diagramAnalysis: DiagramAnalysisSchema.optional().describe("Comprehensive analysis of the diagram structure and properties."),
  
  // Recommendations and next steps
  recommendations: z.array(z.string()).optional().describe("Recommendations for improving the diagram."),
  nextOperationNeeded: z.boolean().describe("A flag indicating whether another operation is needed."),
  suggestedOperations: z.array(z.enum(["create", "update", "delete", "transform", "observe", "analyze", "compare", "synthesize"])).optional().describe("Suggested next operations."),
  
  // Meta information
  purpose: z.string().optional().describe("The purpose or goal of this visual reasoning session."),
  audience: z.string().optional().describe("The intended audience for the diagram."),
  context: z.string().optional().describe("Additional context relevant to the visual reasoning.")
});

// Type exports for TypeScript
export type VisualReasoningData = z.infer<typeof VisualReasoningSchema>;
export type VisualElementData = z.infer<typeof VisualElementSchema>;
export type SpatialRelationship = z.infer<typeof SpatialRelationshipSchema>;
export type VisualPattern = z.infer<typeof VisualPatternSchema>;
export type CognitiveLoad = z.infer<typeof CognitiveLoadSchema>;
export type ReasoningStep = z.infer<typeof ReasoningStepSchema>;
export type DiagramAnalysis = z.infer<typeof DiagramAnalysisSchema>;