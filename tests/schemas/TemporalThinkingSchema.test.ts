import {
  TemporalThinkingSchema,
  StateSchema,
  EventSchema,
  TransitionSchema,
  StatePropertiesSchema,
  EventPropertiesSchema,
  TransitionPropertiesSchema,
  TemporalAnalysisSchema,
  ValidationResultsSchema,
  type TemporalThinkingData
} from '../../src/schemas/TemporalThinkingSchema.js';

describe('TemporalThinkingSchema', () => {
  describe('StatePropertiesSchema', () => {
    it('should validate basic state properties', () => {
      const validData = {
        isInitial: true,
        isFinal: false,
        isStable: true
      };
      
      const result = StatePropertiesSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with duration constraints', () => {
      const validData = {
        isInitial: false,
        duration: {
          min: '1 minute',
          max: '10 minutes',
          typical: '5 minutes'
        },
        capacity: 100,
        cost: 50.5,
        priority: 'high' as const
      };
      
      const result = StatePropertiesSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate empty properties object', () => {
      const validData = {};
      
      const result = StatePropertiesSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('StateSchema', () => {
    it('should validate minimal state', () => {
      const validData = {
        name: 'idle'
      };
      
      const result = StateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate comprehensive state', () => {
      const validData = {
        name: 'processing',
        description: 'System is actively processing requests',
        properties: {
          isInitial: false,
          isFinal: false,
          isStable: false,
          duration: {
            min: '100ms',
            max: '5s',
            typical: '1s'
          },
          capacity: 50,
          priority: 'high' as const
        },
        invariants: [
          'CPU usage < 90%',
          'Memory usage < 80%'
        ],
        entryActions: [
          'Start processing timer',
          'Log entry event'
        ],
        exitActions: [
          'Stop processing timer',
          'Log exit event'
        ],
        subStates: ['validating', 'executing', 'finalizing'],
        parentState: 'active'
      };
      
      const result = StateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing name', () => {
      const invalidData = {
        description: 'A state without a name'
      };
      
      const result = StateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('EventPropertiesSchema', () => {
    it('should validate basic event properties', () => {
      const validData = {
        type: 'external' as const,
        frequency: 'every 5 minutes',
        predictability: 'deterministic' as const
      };
      
      const result = EventPropertiesSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with all properties', () => {
      const validData = {
        type: 'timer' as const,
        frequency: 'hourly',
        predictability: 'stochastic' as const,
        priority: 'critical' as const,
        cost: 25.0
      };
      
      const result = EventPropertiesSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('EventSchema', () => {
    it('should validate minimal event', () => {
      const validData = {
        name: 'timeout'
      };
      
      const result = EventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate comprehensive event', () => {
      const validData = {
        name: 'user_request',
        description: 'User submits a new request to the system',
        properties: {
          type: 'external' as const,
          frequency: 'variable',
          predictability: 'unpredictable' as const,
          priority: 'medium' as const,
          cost: 10.0
        },
        preconditions: [
          'User is authenticated',
          'System is available'
        ],
        parameters: [
          {
            name: 'userId',
            type: 'string',
            description: 'Unique identifier for the user'
          },
          {
            name: 'requestType',
            type: 'enum',
            description: 'Type of request being made'
          }
        ],
        triggers: [
          'HTTP POST request',
          'WebSocket message'
        ]
      };
      
      const result = EventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('TransitionPropertiesSchema', () => {
    it('should validate basic transition properties', () => {
      const validData = {
        probability: 0.8,
        duration: '500ms'
      };
      
      const result = TransitionPropertiesSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with all properties', () => {
      const validData = {
        probability: 0.95,
        duration: '2 seconds',
        cost: 15.5,
        priority: 'critical' as const,
        reversible: true
      };
      
      const result = TransitionPropertiesSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid probability values', () => {
      const invalidData = {
        probability: 1.5 // > 1.0
      };
      
      const result = TransitionPropertiesSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('TransitionSchema', () => {
    it('should validate minimal transition', () => {
      const validData = {
        from: 'idle',
        to: 'processing',
        event: 'start_request'
      };
      
      const result = TransitionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate comprehensive transition', () => {
      const validData = {
        from: 'processing',
        to: 'completed',
        event: 'finish_processing',
        guard: 'all_tasks_completed && no_errors',
        action: 'send_completion_notification',
        properties: {
          probability: 0.9,
          duration: '100ms',
          cost: 5.0,
          priority: 'high' as const,
          reversible: false
        },
        sideEffects: [
          'Update database',
          'Send metrics'
        ],
        rollbackActions: [
          'Restore previous state',
          'Log rollback event'
        ]
      };
      
      const result = TransitionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        from: 'state1',
        to: 'state2'
        // Missing event
      };
      
      const result = TransitionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('TemporalAnalysisSchema', () => {
    it('should validate basic reachability analysis', () => {
      const validData = {
        reachability: {
          reachableStates: ['idle', 'processing', 'completed']
        }
      };
      
      const result = TemporalAnalysisSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate comprehensive analysis', () => {
      const validData = {
        reachability: {
          reachableStates: ['idle', 'processing', 'completed'],
          unreachableStates: ['deprecated_state'],
          deadlockStates: ['error_state']
        },
        cycles: [
          {
            states: ['idle', 'processing', 'idle'],
            type: 'simple' as const,
            length: 2
          },
          {
            states: ['processing'],
            type: 'self-loop' as const,
            length: 1
          }
        ],
        criticalPaths: [
          {
            path: ['idle', 'processing', 'completed'],
            duration: '5 seconds',
            probability: 0.8
          }
        ],
        bottlenecks: [
          {
            state: 'processing',
            reason: 'Limited CPU resources',
            impact: 'high' as const
          }
        ]
      };
      
      const result = TemporalAnalysisSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('ValidationResultsSchema', () => {
    it('should validate basic validation results', () => {
      const validData = {
        isValid: true,
        completeness: 0.9,
        consistency: 0.95
      };
      
      const result = ValidationResultsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with issues and suggestions', () => {
      const validData = {
        isValid: false,
        completeness: 0.7,
        consistency: 0.8,
        issues: [
          {
            type: 'error' as const,
            description: 'Unreachable state detected',
            location: 'state: orphaned_state',
            severity: 'high' as const
          },
          {
            type: 'warning' as const,
            description: 'Potential deadlock condition',
            severity: 'medium' as const
          }
        ],
        suggestions: [
          'Remove unreachable states',
          'Add timeout transitions to prevent deadlocks'
        ]
      };
      
      const result = ValidationResultsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid completeness values', () => {
      const invalidData = {
        isValid: true,
        completeness: 1.5, // > 1.0
        consistency: 0.9
      };
      
      const result = ValidationResultsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('TemporalThinkingSchema', () => {
    it('should validate minimal temporal thinking data', () => {
      const validData = {
        context: 'Simple state machine for user authentication',
        initialState: 'logged_out',
        states: [
          { name: 'logged_out' },
          { name: 'logged_in' }
        ],
        events: [
          { name: 'login' },
          { name: 'logout' }
        ],
        transitions: [
          { from: 'logged_out', to: 'logged_in', event: 'login' },
          { from: 'logged_in', to: 'logged_out', event: 'logout' }
        ]
      };
      
      const result = TemporalThinkingSchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        const data: TemporalThinkingData = result.data;
        expect(data.context).toBe('Simple state machine for user authentication');
        expect(data.initialState).toBe('logged_out');
        expect(data.states).toHaveLength(2);
        expect(data.events).toHaveLength(2);
        expect(data.transitions).toHaveLength(2);
      }
    });

    it('should validate comprehensive temporal thinking data', () => {
      const validData = {
        context: 'E-commerce order processing system with complex state transitions',
        modelId: 'order-processing-v2.1',
        domain: 'e-commerce',
        purpose: 'Model the complete lifecycle of an order from creation to fulfillment',
        initialState: 'pending',
        states: [
          {
            name: 'pending',
            description: 'Order has been created but not yet processed',
            properties: {
              isInitial: true,
              isFinal: false,
              isStable: true,
              duration: { typical: '5 minutes' },
              priority: 'medium' as const
            },
            invariants: ['order.total > 0', 'order.items.length > 0'],
            entryActions: ['log_order_creation', 'send_confirmation_email']
          },
          {
            name: 'processing',
            description: 'Order is being validated and prepared',
            properties: {
              isStable: false,
              duration: { min: '1 minute', max: '30 minutes', typical: '10 minutes' }
            }
          },
          {
            name: 'shipped',
            description: 'Order has been shipped to customer',
            properties: {
              isStable: true,
              duration: { typical: '3 days' }
            }
          },
          {
            name: 'delivered',
            description: 'Order has been delivered to customer',
            properties: {
              isFinal: true,
              isStable: true
            }
          }
        ],
        events: [
          {
            name: 'payment_received',
            description: 'Customer payment has been processed successfully',
            properties: {
              type: 'external' as const,
              predictability: 'stochastic' as const,
              priority: 'high' as const
            },
            preconditions: ['payment_method_valid', 'sufficient_funds']
          },
          {
            name: 'inventory_confirmed',
            description: 'All items are available in inventory',
            properties: {
              type: 'internal' as const,
              predictability: 'deterministic' as const
            }
          },
          {
            name: 'shipping_complete',
            description: 'Package has been handed to shipping carrier',
            properties: {
              type: 'external' as const,
              priority: 'medium' as const
            }
          }
        ],
        transitions: [
          {
            from: 'pending',
            to: 'processing',
            event: 'payment_received',
            guard: 'payment_amount >= order_total',
            action: 'start_order_processing',
            properties: {
              probability: 0.95,
              duration: '500ms',
              priority: 'high' as const
            }
          },
          {
            from: 'processing',
            to: 'shipped',
            event: 'inventory_confirmed',
            guard: 'all_items_available',
            properties: {
              probability: 0.9,
              duration: '2 hours'
            },
            sideEffects: ['update_inventory', 'generate_shipping_label']
          },
          {
            from: 'shipped',
            to: 'delivered',
            event: 'shipping_complete',
            properties: {
              probability: 0.98,
              duration: '1-5 days'
            }
          }
        ],
        finalStates: ['delivered', 'cancelled'],
        analysis: {
          reachability: {
            reachableStates: ['pending', 'processing', 'shipped', 'delivered'],
            unreachableStates: ['legacy_state']
          },
          cycles: [
            {
              states: ['processing', 'pending'],
              type: 'simple' as const,
              length: 2
            }
          ],
          criticalPaths: [
            {
              path: ['pending', 'processing', 'shipped', 'delivered'],
              duration: '3-5 days',
              probability: 0.85
            }
          ],
          bottlenecks: [
            {
              state: 'processing',
              reason: 'Manual inventory verification required',
              impact: 'medium' as const
            }
          ]
        },
        validation: {
          isValid: true,
          completeness: 0.9,
          consistency: 0.95,
          suggestions: [
            'Add timeout transitions for stuck orders',
            'Consider adding cancellation states'
          ]
        },
        globalConstraints: [
          'No order can remain in processing for more than 24 hours',
          'All state transitions must be logged'
        ],
        timeConstraints: [
          {
            description: 'Order must be processed within 24 hours',
            type: 'deadline' as const,
            value: '24 hours'
          },
          {
            description: 'Shipping updates every 6 hours',
            type: 'frequency' as const,
            value: '6 hours'
          }
        ],
        scenarios: [
          {
            name: 'happy_path',
            description: 'Normal order processing without issues',
            initialConditions: ['valid_payment_method', 'items_in_stock'],
            expectedOutcome: 'Order delivered successfully',
            testSteps: [
              'Create order',
              'Process payment',
              'Confirm inventory',
              'Ship order',
              'Confirm delivery'
            ]
          },
          {
            name: 'payment_failure',
            description: 'Order fails due to payment issues',
            initialConditions: ['invalid_payment_method'],
            expectedOutcome: 'Order cancelled due to payment failure'
          }
        ],
        complexity: 'medium' as const,
        completeness: 0.9,
        lastModified: '2024-01-15T10:30:00Z',
        version: '2.1.0',
        tags: ['e-commerce', 'order-processing', 'state-machine']
      };
      
      const result = TemporalThinkingSchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        const data: TemporalThinkingData = result.data;
        expect(data.states).toHaveLength(4);
        expect(data.events).toHaveLength(3);
        expect(data.transitions).toHaveLength(3);
        expect(data.finalStates).toHaveLength(2);
        expect(data.scenarios).toHaveLength(2);
        expect(data.timeConstraints).toHaveLength(2);
        expect(data.tags).toHaveLength(3);
      }
    });

    it('should validate different complexity levels', () => {
      const complexityLevels = ['low', 'medium', 'high', 'very-high'] as const;
      
      complexityLevels.forEach(complexity => {
        const validData = {
          context: `System with ${complexity} complexity`,
          initialState: 'start',
          states: [{ name: 'start' }],
          events: [{ name: 'event1' }],
          transitions: [{ from: 'start', to: 'start', event: 'event1' }],
          complexity
        };
        
        const result = TemporalThinkingSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    it('should validate different time constraint types', () => {
      const constraintTypes = ['deadline', 'duration', 'interval', 'frequency'] as const;
      
      constraintTypes.forEach(type => {
        const validData = {
          context: 'Test system',
          initialState: 'start',
          states: [{ name: 'start' }],
          events: [{ name: 'event1' }],
          transitions: [{ from: 'start', to: 'start', event: 'event1' }],
          timeConstraints: [
            {
              description: `Test ${type} constraint`,
              type,
              value: '1 hour'
            }
          ]
        };
        
        const result = TemporalThinkingSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        context: 'Test system',
        initialState: 'start',
        states: [{ name: 'start' }],
        events: [{ name: 'event1' }]
        // Missing transitions
      };
      
      const result = TemporalThinkingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid completeness values', () => {
      const invalidData = {
        context: 'Test system',
        initialState: 'start',
        states: [{ name: 'start' }],
        events: [{ name: 'event1' }],
        transitions: [{ from: 'start', to: 'start', event: 'event1' }],
        completeness: 1.5 // > 1.0
      };
      
      const result = TemporalThinkingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should handle empty optional arrays', () => {
      const validData = {
        context: 'Minimal system',
        initialState: 'only_state',
        states: [{ name: 'only_state' }],
        events: [{ name: 'self_event' }],
        transitions: [{ from: 'only_state', to: 'only_state', event: 'self_event' }],
        finalStates: [],
        globalConstraints: [],
        timeConstraints: [],
        scenarios: [],
        tags: []
      };
      
      const result = TemporalThinkingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Type inference', () => {
    it('should properly infer TypeScript types', () => {
      const validData = {
        context: 'Type test system',
        initialState: 'start',
        states: [{ name: 'start' }],
        events: [{ name: 'event1' }],
        transitions: [{ from: 'start', to: 'start', event: 'event1' }],
        complexity: 'low' as const,
        completeness: 0.8
      };
      
      const result = TemporalThinkingSchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        const data: TemporalThinkingData = result.data;
        
        // TypeScript should infer these types correctly
        expect(typeof data.context).toBe('string');
        expect(typeof data.initialState).toBe('string');
        expect(Array.isArray(data.states)).toBe(true);
        expect(Array.isArray(data.events)).toBe(true);
        expect(Array.isArray(data.transitions)).toBe(true);
        expect(typeof data.complexity).toBe('string');
        expect(typeof data.completeness).toBe('number');
      }
    });
  });
}); 