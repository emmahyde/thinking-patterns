import { VisualReasoningServer } from '../../src/servers/VisualReasoningServer.js';

describe('VisualReasoningServer', () => {
  let server: VisualReasoningServer;

  beforeEach(() => {
    server = new VisualReasoningServer();
  });

  describe('process', () => {
    it('should process valid visual reasoning data correctly', () => {
      const input = {
        operation: 'create' as const,
        diagramId: 'graph-001',
        diagramType: 'graph' as const,
        iteration: 1,
        nextOperationNeeded: true
      };

      const result = server.process(input);

      expect(result.operation).toBe('create');
      expect(result.diagramId).toBe('graph-001');
      expect(result.diagramType).toBe('graph');
      expect(result.iteration).toBe(1);
      expect(result.nextOperationNeeded).toBe(true);
      expect(result.status).toBe('success');
      expect(result.elementCount).toBe(0);
      expect(result.hasObservation).toBe(false);
      expect(result.hasInsight).toBe(false);
      expect(result.hasHypothesis).toBe(false);
      expect(result.hasTransformationType).toBe(false);
      expect(result.timestamp).toBeDefined();
    });

    it('should process graph diagram with nodes and edges', () => {
      const input = {
        operation: 'create' as const,
        diagramId: 'network-graph',
        diagramType: 'graph' as const,
        iteration: 1,
        nextOperationNeeded: true,
        elements: [
          {
            id: 'node-1',
            type: 'node' as const,
            label: 'Start Node',
            properties: { color: 'blue', size: 'large' }
          },
          {
            id: 'node-2',
            type: 'node' as const,
            label: 'End Node',
            properties: { color: 'red', size: 'medium' }
          },
          {
            id: 'edge-1',
            type: 'edge' as const,
            source: 'node-1',
            target: 'node-2',
            properties: { weight: 0.8, directed: true }
          }
        ],
        observation: 'Network shows clear flow from start to end',
        insight: 'Simple directed graph with weighted connection'
      };

      const result = server.process(input);

      expect(result.diagramType).toBe('graph');
      expect(result.elementCount).toBe(3);
      expect(result.elements).toHaveLength(3);
      expect(result.hasObservation).toBe(true);
      expect(result.hasInsight).toBe(true);
      expect(result.observation).toBe('Network shows clear flow from start to end');
      expect(result.insight).toBe('Simple directed graph with weighted connection');
      expect(result.elements?.[0].type).toBe('node');
      expect(result.elements?.[2].source).toBe('node-1');
      expect(result.elements?.[2].target).toBe('node-2');
    });

    it('should process flowchart diagram with decision nodes', () => {
      const input = {
        operation: 'update' as const,
        diagramId: 'process-flow',
        diagramType: 'flowchart' as const,
        iteration: 3,
        nextOperationNeeded: false,
        elements: [
          {
            id: 'start',
            type: 'node' as const,
            label: 'Start Process',
            properties: { shape: 'oval', color: 'green' }
          },
          {
            id: 'decision',
            type: 'node' as const,
            label: 'Check Condition?',
            properties: { shape: 'diamond', color: 'yellow' }
          }
        ],
        observation: 'Flowchart represents a binary decision process',
        insight: 'Decision point creates two parallel execution paths',
        hypothesis: 'Adding error handling nodes would improve robustness'
      };

      const result = server.process(input);

      expect(result.diagramType).toBe('flowchart');
      expect(result.operation).toBe('update');
      expect(result.elementCount).toBe(2);
      expect(result.hasObservation).toBe(true);
      expect(result.hasInsight).toBe(true);
      expect(result.hasHypothesis).toBe(true);
      expect(result.hypothesis).toBe('Adding error handling nodes would improve robustness');
    });

    it('should process state diagram with transitions', () => {
      const input = {
        operation: 'transform' as const,
        diagramId: 'state-machine',
        diagramType: 'state-diagram' as const,
        iteration: 2,
        nextOperationNeeded: true,
        transformationType: 'regroup' as const,
        elements: [
          {
            id: 'idle',
            type: 'node' as const,
            label: 'Idle State',
            properties: { initial: true, color: 'gray' }
          },
          {
            id: 'processing',
            type: 'node' as const,
            label: 'Processing State',
            properties: { active: true, color: 'orange' }
          },
          {
            id: 'completed',
            type: 'node' as const,
            label: 'Completed State',
            properties: { final: true, color: 'green' }
          },
          {
            id: 'transition-1',
            type: 'edge' as const,
            source: 'idle',
            target: 'processing',
            label: 'start',
            properties: { trigger: 'user_input' }
          },
          {
            id: 'transition-2',
            type: 'edge' as const,
            source: 'processing',
            target: 'completed',
            label: 'finish',
            properties: { trigger: 'process_complete' }
          }
        ],
        observation: 'State machine shows linear progression',
        insight: 'Missing error states and rollback transitions'
      };

      const result = server.process(input);

      expect(result.diagramType).toBe('state-diagram');
      expect(result.operation).toBe('transform');
      expect(result.hasTransformationType).toBe(true);
      expect(result.transformationType).toBe('regroup');
      expect(result.elementCount).toBe(5);
      expect(result.insight).toBe('Missing error states and rollback transitions');
    });

    it('should process concept map with hierarchical relationships', () => {
      const input = {
        operation: 'create' as const,
        diagramId: 'concept-hierarchy',
        diagramType: 'concept-map' as const,
        iteration: 1,
        nextOperationNeeded: true,
        elements: [
          {
            id: 'root-concept',
            type: 'node' as const,
            label: 'Machine Learning',
            properties: { level: 0, category: 'root' }
          },
          {
            id: 'supervised',
            type: 'node' as const,
            label: 'Supervised Learning',
            properties: { level: 1, category: 'subconcept' }
          },
          {
            id: 'unsupervised',
            type: 'node' as const,
            label: 'Unsupervised Learning',
            properties: { level: 1, category: 'subconcept' }
          },
          {
            id: 'container-learning',
            type: 'container' as const,
            label: 'Learning Types',
            contains: ['supervised', 'unsupervised'],
            properties: { groupType: 'category' }
          }
        ],
        observation: 'Concept map organizes ML concepts hierarchically',
        insight: 'Clear separation between supervised and unsupervised approaches'
      };

      const result = server.process(input);

      expect(result.diagramType).toBe('concept-map');
      expect(result.elementCount).toBe(4);
      expect(result.elements?.[3].type).toBe('container');
      expect(result.elements?.[3].contains).toEqual(['supervised', 'unsupervised']);
    });

    it('should process tree diagram with branching structure', () => {
      const input = {
        operation: 'observe' as const,
        diagramId: 'decision-tree',
        diagramType: 'tree-diagram' as const,
        iteration: 1,
        nextOperationNeeded: false,
        elements: [
          {
            id: 'root',
            type: 'node' as const,
            label: 'Root Decision',
            properties: { depth: 0, children: 2 }
          },
          {
            id: 'left-branch',
            type: 'node' as const,
            label: 'Left Branch',
            properties: { depth: 1, parent: 'root' }
          },
          {
            id: 'right-branch',
            type: 'node' as const,
            label: 'Right Branch',
            properties: { depth: 1, parent: 'root' }
          },
          {
            id: 'annotation-1',
            type: 'annotation' as const,
            label: 'Decision criterion: value > threshold',
            properties: { target: 'root', position: 'top' }
          }
        ],
        observation: 'Binary tree structure with clear branching logic',
        hypothesis: 'Tree depth could be optimized for better performance'
      };

      const result = server.process(input);

      expect(result.diagramType).toBe('tree-diagram');
      expect(result.operation).toBe('observe');
      expect(result.elementCount).toBe(4);
      expect(result.elements?.[3].type).toBe('annotation');
      expect(result.hasHypothesis).toBe(true);
    });

    it('should process custom diagram type', () => {
      const input = {
        operation: 'create' as const,
        diagramId: 'custom-visualization',
        diagramType: 'custom' as const,
        iteration: 1,
        nextOperationNeeded: true,
        elements: [
          {
            id: 'custom-element',
            type: 'node' as const,
            label: 'Custom Element',
            properties: { customProperty: 'value', visualization: 'special' }
          }
        ],
        observation: 'Custom diagram allows for specialized visualizations'
      };

      const result = server.process(input);

      expect(result.diagramType).toBe('custom');
      expect(result.elementCount).toBe(1);
      expect(result.hasObservation).toBe(true);
    });

    it('should handle all operation types', () => {
      const operations = ['create', 'update', 'delete', 'transform', 'observe'] as const;
      
      operations.forEach((operation, index) => {
        const input = {
          operation: operation,
          diagramId: `diagram-${index}`,
          diagramType: 'graph' as const,
          iteration: 1,
          nextOperationNeeded: true
        };

        const result = server.process(input);
        expect(result.operation).toBe(operation);
        expect(result.status).toBe('success');
      });
    });

    it('should handle all diagram types', () => {
      const diagramTypes = ['graph', 'flowchart', 'state-diagram', 'concept-map', 'tree-diagram', 'custom'] as const;
      
      diagramTypes.forEach((type, index) => {
        const input = {
          operation: 'create' as const,
          diagramId: `${type}-diagram`,
          diagramType: type,
          iteration: 1,
          nextOperationNeeded: false
        };

        const result = server.process(input);
        expect(result.diagramType).toBe(type);
        expect(result.status).toBe('success');
      });
    });

    it('should handle all transformation types', () => {
      const transformations = ['rotate', 'move', 'resize', 'recolor', 'regroup'] as const;
      
      transformations.forEach((transformation, index) => {
        const input = {
          operation: 'transform' as const,
          diagramId: `transform-${index}`,
          diagramType: 'graph' as const,
          iteration: 1,
          nextOperationNeeded: true,
          transformationType: transformation
        };

        const result = server.process(input);
        expect(result.transformationType).toBe(transformation);
        expect(result.hasTransformationType).toBe(true);
      });
    });

    it('should handle all element types', () => {
      const elementTypes = ['node', 'edge', 'container', 'annotation'] as const;
      
      const elements = elementTypes.map((type, index) => ({
        id: `element-${index}`,
        type: type,
        label: `${type} element`,
        properties: { elementType: type }
      }));

      const input = {
        operation: 'create' as const,
        diagramId: 'multi-element-diagram',
        diagramType: 'graph' as const,
        iteration: 1,
        nextOperationNeeded: false,
        elements: elements
      };

      const result = server.process(input);

      expect(result.elementCount).toBe(4);
      elementTypes.forEach((type, index) => {
        expect(result.elements?.[index].type).toBe(type);
      });
    });

    it('should handle complex graph with multiple relationships', () => {
      const input = {
        operation: 'update' as const,
        diagramId: 'complex-network',
        diagramType: 'graph' as const,
        iteration: 5,
        nextOperationNeeded: true,
        transformationType: 'regroup' as const,
        elements: [
          {
            id: 'cluster-1',
            type: 'container' as const,
            label: 'Cluster A',
            contains: ['node-1', 'node-2', 'node-3'],
            properties: { clusterType: 'functional', color: 'lightblue' }
          },
          {
            id: 'cluster-2',
            type: 'container' as const,
            label: 'Cluster B',
            contains: ['node-4', 'node-5'],
            properties: { clusterType: 'organizational', color: 'lightgreen' }
          },
          {
            id: 'node-1',
            type: 'node' as const,
            label: 'Service A',
            properties: { importance: 'high', connections: 5 }
          },
          {
            id: 'node-2',
            type: 'node' as const,
            label: 'Service B',
            properties: { importance: 'medium', connections: 3 }
          },
          {
            id: 'cross-cluster-edge',
            type: 'edge' as const,
            source: 'node-1',
            target: 'node-4',
            label: 'Cross-cluster dependency',
            properties: { weight: 0.9, critical: true }
          }
        ],
        observation: 'Network shows clear clustering with cross-cluster dependencies',
        insight: 'High-importance nodes create bottlenecks in the system',
        hypothesis: 'Reducing cross-cluster dependencies would improve modularity'
      };

      const result = server.process(input);

      expect(result.elementCount).toBe(5);
      expect(result.hasTransformationType).toBe(true);
      expect(result.hasObservation).toBe(true);
      expect(result.hasInsight).toBe(true);
      expect(result.hasHypothesis).toBe(true);
      expect(result.elements?.[0].contains).toHaveLength(3);
      expect(result.elements?.[1].contains).toHaveLength(2);
    });

    it('should handle delete operations', () => {
      const input = {
        operation: 'delete' as const,
        diagramId: 'diagram-to-modify',
        diagramType: 'flowchart' as const,
        iteration: 2,
        nextOperationNeeded: true,
        elements: [
          {
            id: 'remaining-node',
            type: 'node' as const,
            label: 'Node to keep',
            properties: { status: 'active' }
          }
        ],
        observation: 'Removed redundant nodes from flowchart',
        insight: 'Simplified structure improves clarity'
      };

      const result = server.process(input);

      expect(result.operation).toBe('delete');
      expect(result.elementCount).toBe(1);
      expect(result.observation).toBe('Removed redundant nodes from flowchart');
    });

    it('should handle transformation with move operation', () => {
      const input = {
        operation: 'transform' as const,
        diagramId: 'layout-optimization',
        diagramType: 'graph' as const,
        iteration: 3,
        nextOperationNeeded: false,
        transformationType: 'move' as const,
        elements: [
          {
            id: 'moved-node',
            type: 'node' as const,
            label: 'Repositioned Node',
            properties: { x: 100, y: 200, previousX: 50, previousY: 150 }
          }
        ],
        observation: 'Node repositioning improves visual balance',
        insight: 'Spatial arrangement affects diagram readability'
      };

      const result = server.process(input);

      expect(result.transformationType).toBe('move');
      expect(result.hasTransformationType).toBe(true);
      expect(result.insight).toBe('Spatial arrangement affects diagram readability');
    });

    it('should handle resize transformation', () => {
      const input = {
        operation: 'transform' as const,
        diagramId: 'size-adjustment',
        diagramType: 'concept-map' as const,
        iteration: 1,
        nextOperationNeeded: true,
        transformationType: 'resize' as const,
        elements: [
          {
            id: 'resized-concept',
            type: 'node' as const,
            label: 'Important Concept',
            properties: { size: 'large', previousSize: 'medium', emphasis: true }
          }
        ],
        observation: 'Increased size of key concept for emphasis',
        hypothesis: 'Size variations help establish visual hierarchy'
      };

      const result = server.process(input);

      expect(result.transformationType).toBe('resize');
      expect(result.hasHypothesis).toBe(true);
    });

    it('should handle recolor transformation', () => {
      const input = {
        operation: 'transform' as const,
        diagramId: 'color-coding',
        diagramType: 'flowchart' as const,
        iteration: 2,
        nextOperationNeeded: false,
        transformationType: 'recolor' as const,
        elements: [
          {
            id: 'error-node',
            type: 'node' as const,
            label: 'Error Handler',
            properties: { color: 'red', previousColor: 'blue', category: 'error' }
          },
          {
            id: 'success-node',
            type: 'node' as const,
            label: 'Success Path',
            properties: { color: 'green', previousColor: 'blue', category: 'success' }
          }
        ],
        observation: 'Color coding distinguishes different node types',
        insight: 'Visual categorization improves diagram comprehension'
      };

      const result = server.process(input);

      expect(result.transformationType).toBe('recolor');
      expect(result.elementCount).toBe(2);
      expect(result.insight).toBe('Visual categorization improves diagram comprehension');
    });

    it('should handle rotate transformation', () => {
      const input = {
        operation: 'transform' as const,
        diagramId: 'orientation-change',
        diagramType: 'tree-diagram' as const,
        iteration: 1,
        nextOperationNeeded: true,
        transformationType: 'rotate' as const,
        observation: 'Rotated tree to horizontal layout',
        insight: 'Horizontal layout better utilizes screen space'
      };

      const result = server.process(input);

      expect(result.transformationType).toBe('rotate');
      expect(result.observation).toBe('Rotated tree to horizontal layout');
    });

    it('should handle high iteration numbers', () => {
      const input = {
        operation: 'update' as const,
        diagramId: 'iterative-design',
        diagramType: 'graph' as const,
        iteration: 50,
        nextOperationNeeded: false,
        observation: 'Diagram has undergone extensive iterative refinement'
      };

      const result = server.process(input);

      expect(result.iteration).toBe(50);
      expect(result.nextOperationNeeded).toBe(false);
    });

    it('should handle elements with complex properties', () => {
      const input = {
        operation: 'create' as const,
        diagramId: 'complex-properties',
        diagramType: 'graph' as const,
        iteration: 1,
        nextOperationNeeded: true,
        elements: [
          {
            id: 'complex-node',
            type: 'node' as const,
            label: 'Node with Complex Properties',
            properties: {
              metadata: {
                created: '2024-01-01',
                author: 'system',
                version: '1.0'
              },
              styling: {
                color: '#FF5733',
                borderWidth: 2,
                shape: 'ellipse'
              },
              behavior: {
                clickable: true,
                draggable: false,
                resizable: true
              },
              data: {
                value: 42,
                category: 'important',
                tags: ['primary', 'featured']
              }
            }
          }
        ]
      };

      const result = server.process(input);

      expect(result.elementCount).toBe(1);
      expect(result.elements?.[0].properties).toBeDefined();
      expect(typeof result.elements?.[0].properties).toBe('object');
    });

    it('should handle minimal diagram with no optional fields', () => {
      const input = {
        operation: 'create' as const,
        diagramId: 'minimal-diagram',
        diagramType: 'graph' as const,
        iteration: 1,
        nextOperationNeeded: false
      };

      const result = server.process(input);

      expect(result.elementCount).toBe(0);
      expect(result.hasObservation).toBe(false);
      expect(result.hasInsight).toBe(false);
      expect(result.hasHypothesis).toBe(false);
      expect(result.hasTransformationType).toBe(false);
      expect(result.elements).toBeUndefined();
    });

    it('should handle observation-only input', () => {
      const input = {
        operation: 'observe' as const,
        diagramId: 'observation-focus',
        diagramType: 'flowchart' as const,
        iteration: 1,
        nextOperationNeeded: true,
        observation: 'Process flow shows potential optimization opportunities'
      };

      const result = server.process(input);

      expect(result.hasObservation).toBe(true);
      expect(result.hasInsight).toBe(false);
      expect(result.hasHypothesis).toBe(false);
      expect(result.observation).toBe('Process flow shows potential optimization opportunities');
    });

    it('should handle insight-only input', () => {
      const input = {
        operation: 'observe' as const,
        diagramId: 'insight-focus',
        diagramType: 'concept-map' as const,
        iteration: 2,
        nextOperationNeeded: false,
        insight: 'Concept relationships reveal hidden dependencies'
      };

      const result = server.process(input);

      expect(result.hasObservation).toBe(false);
      expect(result.hasInsight).toBe(true);
      expect(result.hasHypothesis).toBe(false);
      expect(result.insight).toBe('Concept relationships reveal hidden dependencies');
    });

    it('should handle hypothesis-only input', () => {
      const input = {
        operation: 'observe' as const,
        diagramId: 'hypothesis-focus',
        diagramType: 'state-diagram' as const,
        iteration: 1,
        nextOperationNeeded: true,
        hypothesis: 'Adding intermediate states would improve user experience'
      };

      const result = server.process(input);

      expect(result.hasObservation).toBe(false);
      expect(result.hasInsight).toBe(false);
      expect(result.hasHypothesis).toBe(true);
      expect(result.hypothesis).toBe('Adding intermediate states would improve user experience');
    });

    it('should handle comprehensive visual analysis', () => {
      const input = {
        operation: 'transform' as const,
        diagramId: 'comprehensive-analysis',
        diagramType: 'graph' as const,
        iteration: 10,
        nextOperationNeeded: false,
        transformationType: 'regroup' as const,
        elements: [
          {
            id: 'central-hub',
            type: 'node' as const,
            label: 'Central Hub',
            properties: { centrality: 0.95, degree: 15, importance: 'critical' }
          },
          {
            id: 'peripheral-cluster',
            type: 'container' as const,
            label: 'Peripheral Nodes',
            contains: ['node-a', 'node-b', 'node-c'],
            properties: { clusterCoefficient: 0.8, density: 'high' }
          }
        ],
        observation: 'Network exhibits hub-and-spoke topology with peripheral clustering',
        insight: 'Central hub creates potential single point of failure',
        hypothesis: 'Introducing redundant pathways would improve network resilience'
      };

      const result = server.process(input);

      expect(result.hasObservation).toBe(true);
      expect(result.hasInsight).toBe(true);
      expect(result.hasHypothesis).toBe(true);
      expect(result.hasTransformationType).toBe(true);
      expect(result.elementCount).toBe(2);
      expect(result.iteration).toBe(10);
      expect(result.nextOperationNeeded).toBe(false);
    });
  });
}); 