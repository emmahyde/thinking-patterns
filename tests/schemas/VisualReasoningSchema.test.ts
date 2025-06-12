import { describe, it, expect } from 'vitest';
import {
  VisualReasoningSchema,
  VisualElementSchema,
  SpatialRelationshipSchema,
  VisualPatternSchema,
  CognitiveLoadSchema,
  ReasoningStepSchema,
  DiagramAnalysisSchema,
  type VisualReasoningData
} from '../../src/schemas/VisualReasoningSchema.js';

describe('VisualReasoningSchema', () => {
  describe('SpatialRelationshipSchema', () => {
    it('should validate a basic spatial relationship', () => {
      const validData = {
        type: 'adjacent' as const,
        elementA: 'node1',
        elementB: 'node2'
      };
      
      const result = SpatialRelationshipSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with optional fields', () => {
      const validData = {
        type: 'overlapping' as const,
        elementA: 'shape1',
        elementB: 'shape2',
        strength: 0.8,
        description: 'Partially overlapping circles'
      };
      
      const result = SpatialRelationshipSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid relationship type', () => {
      const invalidData = {
        type: 'invalid-type',
        elementA: 'node1',
        elementB: 'node2'
      };
      
      const result = SpatialRelationshipSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('VisualPatternSchema', () => {
    it('should validate a basic visual pattern', () => {
      const validData = {
        type: 'symmetry' as const,
        elements: ['elem1', 'elem2', 'elem3'],
        confidence: 0.9,
        significance: 'high' as const,
        description: 'Bilateral symmetry pattern'
      };
      
      const result = VisualPatternSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with optional id', () => {
      const validData = {
        id: 'pattern-001',
        type: 'repetition' as const,
        elements: ['item1', 'item2'],
        confidence: 0.7,
        significance: 'medium' as const,
        description: 'Repeating geometric pattern'
      };
      
      const result = VisualPatternSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('CognitiveLoadSchema', () => {
    it('should validate cognitive load assessment', () => {
      const validData = {
        complexity: 'medium' as const,
        elementCount: 15,
        connectionDensity: 0.6,
        informationDensity: 'moderate' as const
      };
      
      const result = CognitiveLoadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with all optional fields', () => {
      const validData = {
        complexity: 'high' as const,
        elementCount: 25,
        connectionDensity: 0.8,
        hierarchyDepth: 4,
        informationDensity: 'dense' as const,
        readabilityScore: 0.4
      };
      
      const result = CognitiveLoadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('ReasoningStepSchema', () => {
    it('should validate a basic reasoning step', () => {
      const validData = {
        stepNumber: 1,
        type: 'observation' as const,
        description: 'Initial observation of the diagram structure',
        confidence: 0.9
      };
      
      const result = ReasoningStepSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with all optional fields', () => {
      const validData = {
        id: 'step-001',
        stepNumber: 2,
        type: 'inference' as const,
        description: 'Inferred relationship between components',
        evidence: ['visual-cue-1', 'pattern-match'],
        confidence: 0.8,
        dependencies: ['step-001']
      };
      
      const result = ReasoningStepSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('VisualElementSchema', () => {
    it('should validate a basic visual element', () => {
      const validData = {
        id: 'node1',
        type: 'node' as const,
        properties: {
          color: 'blue',
          size: 'medium'
        }
      };
      
      const result = VisualElementSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with enhanced properties format', () => {
      const validData = {
        id: 'shape1',
        type: 'shape' as const,
        label: 'Process Step',
        properties: {
          position: { x: 100, y: 200 },
          dimensions: { width: 80, height: 40 },
          style: {
            color: 'blue',
            shape: 'rectangle',
            size: 'medium' as const,
            opacity: 0.8
          },
          semantics: {
            meaning: 'Business process',
            importance: 'high' as const,
            category: 'workflow'
          }
        }
      };
      
      const result = VisualElementSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate edge elements with source and target', () => {
      const validData = {
        id: 'edge1',
        type: 'edge' as const,
        source: 'node1',
        target: 'node2',
        properties: {
          style: { color: 'gray' }
        }
      };
      
      const result = VisualElementSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate container elements', () => {
      const validData = {
        id: 'container1',
        type: 'container' as const,
        label: 'Group A',
        contains: ['node1', 'node2', 'edge1'],
        properties: {
          style: { color: 'lightgray' }
        }
      };
      
      const result = VisualElementSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('DiagramAnalysisSchema', () => {
    it('should validate basic diagram analysis', () => {
      const validData = {
        structure: {
          type: 'hierarchical' as const
        }
      };
      
      const result = DiagramAnalysisSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate comprehensive diagram analysis', () => {
      const validData = {
        structure: {
          type: 'network' as const,
          balance: 'symmetric' as const,
          flow: 'top-down' as const
        },
        patterns: [{
          type: 'hierarchy' as const,
          elements: ['root', 'child1', 'child2'],
          confidence: 0.9,
          significance: 'high' as const,
          description: 'Clear hierarchical structure'
        }],
        relationships: [{
          type: 'above' as const,
          elementA: 'parent',
          elementB: 'child',
          strength: 0.8
        }],
        cognitiveLoad: {
          complexity: 'medium' as const,
          elementCount: 12,
          connectionDensity: 0.5,
          informationDensity: 'moderate' as const
        },
        effectiveness: {
          clarity: 0.8,
          completeness: 0.9,
          efficiency: 0.7
        }
      };
      
      const result = DiagramAnalysisSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('VisualReasoningSchema', () => {
    it('should validate minimal visual reasoning data', () => {
      const validData = {
        operation: 'observe' as const,
        diagramId: 'diagram-001',
        diagramType: 'flowchart' as const,
        iteration: 1,
        nextOperationNeeded: false
      };
      
      const result = VisualReasoningSchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        const data: VisualReasoningData = result.data;
        expect(data.operation).toBe('observe');
        expect(data.diagramId).toBe('diagram-001');
        expect(data.diagramType).toBe('flowchart');
      }
    });

    it('should validate comprehensive visual reasoning data', () => {
      const validData = {
        operation: 'analyze' as const,
        diagramId: 'complex-diagram',
        diagramType: 'conceptMap' as const,
        elements: [
          {
            id: 'concept1',
            type: 'node' as const,
            label: 'Main Concept',
            properties: {
              position: { x: 100, y: 100 },
              style: { color: 'blue', size: 'large' as const }
            }
          },
          {
            id: 'relation1',
            type: 'edge' as const,
            source: 'concept1',
            target: 'concept2',
            properties: { style: { color: 'gray' } }
          }
        ],
        transformationType: 'highlight' as const,
        transformationDetails: {
          target: ['concept1'],
          parameters: { highlightColor: 'yellow' },
          rationale: 'Emphasize key concept'
        },
        reasoningChain: [
          {
            stepNumber: 1,
            type: 'observation' as const,
            description: 'Identified central concept',
            confidence: 0.9
          },
          {
            stepNumber: 2,
            type: 'inference' as const,
            description: 'Concept appears to be hub node',
            confidence: 0.8,
            dependencies: ['step-1']
          }
        ],
        iteration: 3,
        observation: 'The diagram shows a hub-and-spoke pattern',
        insight: 'Central concept is the key organizing principle',
        hypothesis: 'Highlighting the central concept will improve comprehension',
        diagramAnalysis: {
          structure: {
            type: 'network' as const,
            balance: 'radial' as const
          },
          effectiveness: {
            clarity: 0.7,
            completeness: 0.8,
            efficiency: 0.6
          }
        },
        recommendations: [
          'Increase font size of central concept',
          'Use consistent color coding for related concepts'
        ],
        nextOperationNeeded: true,
        suggestedOperations: ['transform' as const, 'update' as const],
        purpose: 'Improve diagram readability and comprehension',
        audience: 'Students learning the subject matter',
        context: 'Educational material for introductory course'
      };
      
      const result = VisualReasoningSchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        const data: VisualReasoningData = result.data;
        expect(data.elements).toHaveLength(2);
        expect(data.reasoningChain).toHaveLength(2);
        expect(data.recommendations).toHaveLength(2);
        expect(data.suggestedOperations).toHaveLength(2);
      }
    });

    it('should validate different diagram types', () => {
      const diagramTypes = ['graph', 'flowchart', 'stateDiagram', 'conceptMap', 'treeDiagram', 'networkDiagram', 'mindMap', 'organizationChart', 'custom'] as const;
      
      diagramTypes.forEach(diagramType => {
        const validData = {
          operation: 'create' as const,
          diagramId: `${diagramType}-test`,
          diagramType,
          iteration: 1,
          nextOperationNeeded: false
        };
        
        const result = VisualReasoningSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    it('should validate different operations', () => {
      const operations = ['create', 'update', 'delete', 'transform', 'observe', 'analyze', 'compare', 'synthesize'] as const;
      
      operations.forEach(operation => {
        const validData = {
          operation,
          diagramId: 'test-diagram',
          diagramType: 'graph' as const,
          iteration: 1,
          nextOperationNeeded: false
        };
        
        const result = VisualReasoningSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        operation: 'observe' as const,
        diagramType: 'flowchart' as const,
        iteration: 1
        // Missing diagramId and nextOperationNeeded
      };
      
      const result = VisualReasoningSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid operation type', () => {
      const invalidData = {
        operation: 'invalid-operation',
        diagramId: 'test',
        diagramType: 'graph' as const,
        iteration: 1,
        nextOperationNeeded: false
      };
      
      const result = VisualReasoningSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should handle legacy properties format', () => {
      const validData = {
        operation: 'update' as const,
        diagramId: 'legacy-diagram',
        diagramType: 'custom' as const,
        elements: [
          {
            id: 'legacy-node',
            type: 'node' as const,
            properties: {
              // Legacy format - any object
              customField: 'value',
              anotherField: 123,
              nestedObject: { key: 'value' }
            }
          }
        ],
        iteration: 1,
        nextOperationNeeded: false
      };
      
      const result = VisualReasoningSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Type inference', () => {
    it('should properly infer TypeScript types', () => {
      const validData = {
        operation: 'analyze' as const,
        diagramId: 'type-test',
        diagramType: 'graph' as const,
        iteration: 1,
        nextOperationNeeded: true,
        observation: 'Test observation',
        insight: 'Test insight'
      };
      
      const result = VisualReasoningSchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        const data: VisualReasoningData = result.data;
        
        // TypeScript should infer these types correctly
        expect(typeof data.operation).toBe('string');
        expect(typeof data.diagramId).toBe('string');
        expect(typeof data.iteration).toBe('number');
        expect(typeof data.nextOperationNeeded).toBe('boolean');
        expect(typeof data.observation).toBe('string');
        expect(typeof data.insight).toBe('string');
      }
    });
  });
}); 