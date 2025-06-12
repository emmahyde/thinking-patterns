/**
 * Tests for ProblemDecompositionServer
 * Tests systematic problem breakdown and task decomposition
 */

import { ProblemDecompositionServer } from '../../src/servers/ProblemDecompositionServer.js';
import { ProblemDecompositionData } from '../../src/schemas/index.js';

describe('ProblemDecompositionServer', () => {
  let server: ProblemDecompositionServer;

  beforeEach(() => {
    server = new ProblemDecompositionServer();
  });

  describe('process', () => {
    it('should process valid problem decomposition data correctly', () => {
      const validInput: ProblemDecompositionData = {
        problem: 'Build a scalable e-commerce platform',
        methodology: 'work-breakdown-structure',
        decomposition: [
          {
            id: 'auth-system',
            description: 'Implement secure user registration and login system',
            priority: 'high',
            complexity: 'medium',
            effortEstimate: '2 weeks',
            dependencies: [],
            category: 'authentication'
          },
          {
            id: 'product-catalog',
            description: 'Create system for managing product inventory and catalog',
            priority: 'high',
            complexity: 'high',
            effortEstimate: '3 weeks',
            dependencies: ['auth-system'],
            category: 'core-functionality'
          },
          {
            id: 'payment-processing',
            description: 'Integrate payment gateway for secure transactions',
            priority: 'medium',
            complexity: 'high',
            effortEstimate: '2 weeks',
            dependencies: ['auth-system', 'product-catalog'],
            category: 'payments'
          }
        ],
        metrics: {
          totalTasks: 3,
          maxDepth: 1,
          estimatedTotalEffort: '7 weeks',
          criticalPath: ['auth-system', 'product-catalog', 'payment-processing'],
          riskScore: 0.35,
          complexityDistribution: {
            low: 0,
            medium: 1,
            high: 2
          }
        }
      };

      const result = server.process(validInput);

      expect(result.problem).toBe('Build a scalable e-commerce platform');
      expect(result.methodology).toBe('work-breakdown-structure');
      expect(result.decomposition).toHaveLength(3);
      expect(result.metrics?.totalTasks).toBe(3);
      expect(result.metrics?.maxDepth).toBe(1);
      expect(result.status).toBe('success');
      expect(result.timestamp).toBeDefined();
    });

    it('should handle minimal problem decomposition data', () => {
      const minimalInput: ProblemDecompositionData = {
        problem: 'Simple task breakdown',
        decomposition: [
          {
            id: 'task-1',
            description: 'Complete the simple task'
          }
        ]
      };

      const result = server.process(minimalInput);

      expect(result.problem).toBe('Simple task breakdown');
      expect(result.decomposition).toHaveLength(1);
      expect(result.decomposition[0].id).toBe('task-1');
      expect(result.status).toBe('success');
    });

    it('should handle hierarchical task structures', () => {
      const input: ProblemDecompositionData = {
        problem: 'Complex project with subtasks',
        decomposition: [
          {
            id: 'main-task',
            description: 'Main task with subtasks',
            priority: 'high',
            complexity: 'high',
            subTasks: [
              {
                id: 'subtask-1',
                description: 'First subtask',
                priority: 'medium',
                complexity: 'low'
              },
              {
                id: 'subtask-2',
                description: 'Second subtask',
                priority: 'medium',
                complexity: 'medium',
                dependencies: ['subtask-1']
              }
            ]
          }
        ],
        metrics: {
          totalTasks: 3,
          maxDepth: 2,
          complexityDistribution: {
            low: 1,
            medium: 1,
            high: 1
          }
        }
      };

      const result = server.process(input);

      expect(result.decomposition).toHaveLength(1);
      expect(result.decomposition[0].subTasks).toHaveLength(2);
      expect(result.decomposition[0].subTasks?.[1].dependencies).toContain('subtask-1');
      expect(result.metrics?.maxDepth).toBe(2);
    });

    it('should handle validation errors gracefully', () => {
      const invalidInput = {
        // Missing required problem field
        decomposition: [
          {
            id: 'task-1',
            description: 'Task description'
          }
        ]
      };

      const result = server.run(invalidInput);
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Validation failed');
    });

    it('should return properly formatted output', () => {
      const input: ProblemDecompositionData = {
        problem: 'Test problem',
        decomposition: [
          {
            id: 'test-task',
            description: 'Test task description'
          }
        ]
      };

      const result = server.process(input);

      expect(result).toHaveProperty('problem');
      expect(result).toHaveProperty('decomposition');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(Array.isArray(result.decomposition)).toBe(true);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null input', () => {
      expect(() => server.process(null as any)).toThrow();
    });

    it('should handle undefined input', () => {
      expect(() => server.process(undefined as any)).toThrow();
    });

    it('should handle empty object input', () => {
      expect(() => server.process({} as any)).toThrow();
    });

    it('should handle invalid field types', () => {
      const invalidInput = {
        problem: 123, // Should be string
        decomposition: 'not-array' // Should be array
      };

      expect(() => server.process(invalidInput as any)).toThrow();
    });

    it('should handle empty decomposition array', () => {
      const input: ProblemDecompositionData = {
        problem: 'Problem with no tasks',
        decomposition: []
      };

      const result = server.process(input);
      expect(result.decomposition).toHaveLength(0);
      expect(result.status).toBe('success');
    });

    it('should handle complex dependency chains', () => {
      const input: ProblemDecompositionData = {
        problem: 'Complex dependency project',
        decomposition: [
          {
            id: 'task-a',
            description: 'First task',
            priority: 'high',
            complexity: 'low'
          },
          {
            id: 'task-b',
            description: 'Depends on A',
            priority: 'high',
            complexity: 'medium',
            dependencies: ['task-a']
          },
          {
            id: 'task-c',
            description: 'Depends on A and B',
            priority: 'medium',
            complexity: 'high',
            dependencies: ['task-a', 'task-b']
          }
        ],
        metrics: {
          totalTasks: 3,
          maxDepth: 1,
          criticalPath: ['task-a', 'task-b', 'task-c'],
          complexityDistribution: {
            low: 1,
            medium: 1,
            high: 1
          }
        }
      };

      const result = server.process(input);
      expect(result.decomposition).toHaveLength(3);
      expect(result.decomposition[2].dependencies).toContain('task-a');
      expect(result.decomposition[2].dependencies).toContain('task-b');
      expect(result.status).toBe('success');
    });

    it('should handle large numbers of tasks', () => {
      const manyTasks = Array.from({ length: 50 }, (_, i) => ({
        id: `task-${i}`,
        description: `Task ${i} description`,
        priority: 'medium' as const,
        complexity: 'low' as const,
        dependencies: i > 0 ? [`task-${i - 1}`] : []
      }));

      const input: ProblemDecompositionData = {
        problem: 'Large project with many tasks',
        decomposition: manyTasks,
        metrics: {
          totalTasks: 50,
          maxDepth: 1,
          complexityDistribution: {
            low: 50,
            medium: 0,
            high: 0
          }
        }
      };

      const result = server.process(input);
      expect(result.decomposition).toHaveLength(50);
      expect(result.metrics?.totalTasks).toBe(50);
    });

    it('should handle tasks with resource requirements and risks', () => {
      const input: ProblemDecompositionData = {
        problem: 'Project with resource and risk management',
        decomposition: [
          {
            id: 'risky-task',
            description: 'Task with resources and risks',
            priority: 'high',
            complexity: 'high',
            resourceRequirements: [
              {
                type: 'human',
                description: 'Senior developer',
                availability: 'limited',
                criticality: 'high'
              }
            ],
            risks: [
              {
                description: 'Technical complexity risk',
                probability: 0.7,
                impact: 'high',
                category: 'technical',
                mitigation: 'Prototype early to validate approach'
              }
            ]
          }
        ]
      };

      const result = server.process(input);
      expect(result.decomposition[0].resourceRequirements).toHaveLength(1);
      expect(result.decomposition[0].risks).toHaveLength(1);
      expect(result.decomposition[0].risks?.[0].probability).toBe(0.7);
    });
  });
}); 