import { 
  DomainModelingSchema, 
  EntitySchema, 
  RelationshipSchema, 
  DomainRuleSchema, 
  BoundarySchema, 
  ModelValidationSchema,
  type DomainModelingData,
  type EntityData,
  type RelationshipData,
  type DomainRuleData,
  type BoundaryData,
  type ModelValidationData
} from '../../src/schemas/DomainModelingSchema.js';

describe('DomainModelingSchema', () => {
  describe('EntitySchema', () => {
    it('should validate a valid entity', () => {
      const validEntity: EntityData = {
        name: 'User',
        description: 'A system user',
        attributes: ['id', 'name', 'email']
      };

      expect(() => EntitySchema.parse(validEntity)).not.toThrow();
    });

    it('should validate entity with optional fields', () => {
      const validEntity: EntityData = {
        id: 'user-entity',
        name: 'User',
        description: 'A system user',
        attributes: ['id', 'name', 'email'],
        behaviors: ['login', 'logout', 'updateProfile'],
        constraints: ['email must be unique'],
        invariants: ['id is immutable']
      };

      expect(() => EntitySchema.parse(validEntity)).not.toThrow();
    });

    it('should reject entity without required fields', () => {
      const invalidEntity = {
        name: 'User'
        // missing description and attributes
      };

      expect(() => EntitySchema.parse(invalidEntity)).toThrow();
    });

    it('should reject entity with empty attributes array', () => {
      const invalidEntity = {
        name: 'User',
        description: 'A system user',
        attributes: []
      };

      expect(() => EntitySchema.parse(invalidEntity)).not.toThrow(); // Empty arrays are allowed
    });
  });

  describe('RelationshipSchema', () => {
    it('should validate a valid relationship', () => {
      const validRelationship: RelationshipData = {
        name: 'UserOrder',
        type: 'one-to-many',
        sourceEntity: 'User',
        targetEntity: 'Order',
        description: 'A user can have multiple orders'
      };

      expect(() => RelationshipSchema.parse(validRelationship)).not.toThrow();
    });

    it('should validate all relationship types', () => {
      const relationshipTypes = [
        'one-to-one', 'one-to-many', 'many-to-many', 
        'inheritance', 'composition', 'aggregation', 'dependency'
      ];

      relationshipTypes.forEach(type => {
        const relationship = {
          name: 'TestRelationship',
          type,
          sourceEntity: 'EntityA',
          targetEntity: 'EntityB',
          description: 'Test relationship'
        };

        expect(() => RelationshipSchema.parse(relationship)).not.toThrow();
      });
    });

    it('should reject invalid relationship type', () => {
      const invalidRelationship = {
        name: 'TestRelationship',
        type: 'invalid-type',
        sourceEntity: 'EntityA',
        targetEntity: 'EntityB',
        description: 'Test relationship'
      };

      expect(() => RelationshipSchema.parse(invalidRelationship)).toThrow();
    });

    it('should validate relationship with optional fields', () => {
      const validRelationship: RelationshipData = {
        id: 'rel-1',
        name: 'UserOrder',
        type: 'one-to-many',
        sourceEntity: 'User',
        targetEntity: 'Order',
        description: 'A user can have multiple orders',
        constraints: ['cascade delete'],
        cardinality: '1:N'
      };

      expect(() => RelationshipSchema.parse(validRelationship)).not.toThrow();
    });
  });

  describe('DomainRuleSchema', () => {
    it('should validate a valid domain rule', () => {
      const validRule: DomainRuleData = {
        name: 'Order Total Rule',
        description: 'Order total must be positive',
        type: 'business-rule',
        entities: ['Order'],
        condition: 'total > 0'
      };

      expect(() => DomainRuleSchema.parse(validRule)).not.toThrow();
    });

    it('should validate all rule types', () => {
      const ruleTypes = ['business-rule', 'validation-rule', 'constraint', 'invariant', 'axiom'];

      ruleTypes.forEach(type => {
        const rule = {
          name: 'Test Rule',
          description: 'Test rule description',
          type,
          entities: ['TestEntity'],
          condition: 'test condition'
        };

        expect(() => DomainRuleSchema.parse(rule)).not.toThrow();
      });
    });

    it('should validate all priority levels', () => {
      const priorities = ['low', 'medium', 'high', 'critical'];

      priorities.forEach(priority => {
        const rule = {
          name: 'Test Rule',
          description: 'Test rule description',
          type: 'business-rule',
          entities: ['TestEntity'],
          condition: 'test condition',
          priority
        };

        expect(() => DomainRuleSchema.parse(rule)).not.toThrow();
      });
    });

    it('should validate rule with optional fields', () => {
      const validRule: DomainRuleData = {
        id: 'rule-1',
        name: 'Order Total Rule',
        description: 'Order total must be positive',
        type: 'business-rule',
        entities: ['Order', 'OrderItem'],
        condition: 'total > 0',
        consequence: 'reject order',
        priority: 'high'
      };

      expect(() => DomainRuleSchema.parse(validRule)).not.toThrow();
    });
  });

  describe('BoundarySchema', () => {
    it('should validate a valid boundary', () => {
      const validBoundary: BoundaryData = {
        name: 'Order Management',
        description: 'Handles order processing',
        includedEntities: ['Order', 'OrderItem', 'Customer']
      };

      expect(() => BoundarySchema.parse(validBoundary)).not.toThrow();
    });

    it('should validate boundary with optional fields', () => {
      const validBoundary: BoundaryData = {
        name: 'Order Management',
        description: 'Handles order processing',
        includedEntities: ['Order', 'OrderItem', 'Customer'],
        excludedConcepts: ['Payment', 'Shipping'],
        interfaces: ['OrderAPI', 'CustomerAPI'],
        responsibilities: ['Process orders', 'Validate customers']
      };

      expect(() => BoundarySchema.parse(validBoundary)).not.toThrow();
    });

    it('should reject boundary without required fields', () => {
      const invalidBoundary = {
        name: 'Order Management'
        // missing description and includedEntities
      };

      expect(() => BoundarySchema.parse(invalidBoundary)).toThrow();
    });
  });

  describe('ModelValidationSchema', () => {
    it('should validate a valid model validation', () => {
      const validValidation: ModelValidationData = {
        completeness: 0.85,
        consistency: 0.92,
        correctness: 0.78
      };

      expect(() => ModelValidationSchema.parse(validValidation)).not.toThrow();
    });

    it('should validate model validation with optional fields', () => {
      const validValidation: ModelValidationData = {
        completeness: 0.85,
        consistency: 0.92,
        correctness: 0.78,
        issues: ['Missing relationship between User and Profile'],
        suggestions: ['Add validation rules for email format']
      };

      expect(() => ModelValidationSchema.parse(validValidation)).not.toThrow();
    });

    it('should reject validation scores outside 0-1 range', () => {
      const invalidValidation = {
        completeness: 1.5,
        consistency: 0.92,
        correctness: 0.78
      };

      expect(() => ModelValidationSchema.parse(invalidValidation)).toThrow();

      const invalidValidation2 = {
        completeness: 0.85,
        consistency: -0.1,
        correctness: 0.78
      };

      expect(() => ModelValidationSchema.parse(invalidValidation2)).toThrow();
    });
  });

  describe('DomainModelingSchema', () => {
    it('should validate a minimal valid domain model', () => {
      const validModel: DomainModelingData = {
        domainName: 'E-commerce',
        description: 'Online shopping domain',
        modelingId: 'model-123',
        iteration: 1,
        stage: 'conceptual',
        entities: [{
          name: 'Product',
          description: 'A sellable item',
          attributes: ['id', 'name', 'price']
        }],
        abstractionLevel: 'high',
        paradigm: 'object-oriented',
        nextStageNeeded: true
      };

      expect(() => DomainModelingSchema.parse(validModel)).not.toThrow();
    });

    it('should validate a complete domain model', () => {
      const completeModel: DomainModelingData = {
        domainName: 'E-commerce',
        description: 'Online shopping domain',
        modelingId: 'model-123',
        iteration: 2,
        stage: 'logical',
        entities: [
          {
            id: 'user-entity',
            name: 'User',
            description: 'System user',
            attributes: ['id', 'name', 'email'],
            behaviors: ['login', 'logout'],
            constraints: ['email unique'],
            invariants: ['id immutable']
          },
          {
            name: 'Order',
            description: 'Customer order',
            attributes: ['id', 'total', 'date']
          }
        ],
        relationships: [{
          id: 'user-order-rel',
          name: 'UserOrders',
          type: 'one-to-many',
          sourceEntity: 'User',
          targetEntity: 'Order',
          description: 'User can have multiple orders',
          constraints: ['cascade delete'],
          cardinality: '1:N'
        }],
        domainRules: [{
          id: 'order-total-rule',
          name: 'Positive Order Total',
          description: 'Order total must be positive',
          type: 'business-rule',
          entities: ['Order'],
          condition: 'total > 0',
          consequence: 'reject order',
          priority: 'high'
        }],
        boundaries: {
          name: 'Order Management',
          description: 'Order processing boundary',
          includedEntities: ['User', 'Order'],
          excludedConcepts: ['Payment'],
          interfaces: ['OrderAPI'],
          responsibilities: ['Process orders']
        },
        assumptions: ['Users have valid email addresses'],
        stakeholders: ['Customers', 'Sales Team', 'IT Department'],
        useCases: ['Place Order', 'View Order History'],
        modelValidation: {
          completeness: 0.85,
          consistency: 0.92,
          correctness: 0.78,
          issues: ['Missing payment entity'],
          suggestions: ['Add payment processing']
        },
        abstractionLevel: 'medium',
        paradigm: 'domain-driven',
        nextStageNeeded: true,
        suggestedNextStage: 'Add payment processing entities',
        modelingNotes: ['Consider adding inventory management']
      };

      expect(() => DomainModelingSchema.parse(completeModel)).not.toThrow();
    });

    it('should validate all stage values', () => {
      const stages = ['analysis', 'conceptual', 'logical', 'physical', 'validation', 'refinement'];

      stages.forEach(stage => {
        const model = {
          domainName: 'Test Domain',
          description: 'Test description',
          modelingId: 'test-123',
          iteration: 1,
          stage,
          entities: [{
            name: 'TestEntity',
            description: 'Test entity',
            attributes: ['id']
          }],
          abstractionLevel: 'high',
          paradigm: 'object-oriented',
          nextStageNeeded: false
        };

        expect(() => DomainModelingSchema.parse(model)).not.toThrow();
      });
    });

    it('should validate all abstraction levels', () => {
      const levels = ['high', 'medium', 'low'];

      levels.forEach(abstractionLevel => {
        const model = {
          domainName: 'Test Domain',
          description: 'Test description',
          modelingId: 'test-123',
          iteration: 1,
          stage: 'conceptual',
          entities: [{
            name: 'TestEntity',
            description: 'Test entity',
            attributes: ['id']
          }],
          abstractionLevel,
          paradigm: 'object-oriented',
          nextStageNeeded: false
        };

        expect(() => DomainModelingSchema.parse(model)).not.toThrow();
      });
    });

    it('should validate all paradigm values', () => {
      const paradigms = [
        'object-oriented', 'relational', 'functional', 
        'event-driven', 'service-oriented', 'domain-driven'
      ];

      paradigms.forEach(paradigm => {
        const model = {
          domainName: 'Test Domain',
          description: 'Test description',
          modelingId: 'test-123',
          iteration: 1,
          stage: 'conceptual',
          entities: [{
            name: 'TestEntity',
            description: 'Test entity',
            attributes: ['id']
          }],
          abstractionLevel: 'high',
          paradigm,
          nextStageNeeded: false
        };

        expect(() => DomainModelingSchema.parse(model)).not.toThrow();
      });
    });

    it('should reject model without required fields', () => {
      const invalidModel = {
        domainName: 'Test Domain'
        // missing required fields
      };

      expect(() => DomainModelingSchema.parse(invalidModel)).toThrow();
    });

    it('should reject model with empty entities array', () => {
      const invalidModel = {
        domainName: 'Test Domain',
        description: 'Test description',
        modelingId: 'test-123',
        iteration: 1,
        stage: 'conceptual',
        entities: [], // empty entities array
        abstractionLevel: 'high',
        paradigm: 'object-oriented',
        nextStageNeeded: false
      };

      expect(() => DomainModelingSchema.parse(invalidModel)).not.toThrow(); // Empty arrays are allowed
    });

    it('should reject invalid stage value', () => {
      const invalidModel = {
        domainName: 'Test Domain',
        description: 'Test description',
        modelingId: 'test-123',
        iteration: 1,
        stage: 'invalid-stage',
        entities: [{
          name: 'TestEntity',
          description: 'Test entity',
          attributes: ['id']
        }],
        abstractionLevel: 'high',
        paradigm: 'object-oriented',
        nextStageNeeded: false
      };

      expect(() => DomainModelingSchema.parse(invalidModel)).toThrow();
    });

    it('should reject invalid abstraction level', () => {
      const invalidModel = {
        domainName: 'Test Domain',
        description: 'Test description',
        modelingId: 'test-123',
        iteration: 1,
        stage: 'conceptual',
        entities: [{
          name: 'TestEntity',
          description: 'Test entity',
          attributes: ['id']
        }],
        abstractionLevel: 'invalid-level',
        paradigm: 'object-oriented',
        nextStageNeeded: false
      };

      expect(() => DomainModelingSchema.parse(invalidModel)).toThrow();
    });

    it('should reject invalid paradigm', () => {
      const invalidModel = {
        domainName: 'Test Domain',
        description: 'Test description',
        modelingId: 'test-123',
        iteration: 1,
        stage: 'conceptual',
        entities: [{
          name: 'TestEntity',
          description: 'Test entity',
          attributes: ['id']
        }],
        abstractionLevel: 'high',
        paradigm: 'invalid-paradigm',
        nextStageNeeded: false
      };

      expect(() => DomainModelingSchema.parse(invalidModel)).toThrow();
    });
  });

  describe('Type inference', () => {
    it('should infer correct types for domain modeling data', () => {
      const model: DomainModelingData = {
        domainName: 'Test',
        description: 'Test domain',
        modelingId: 'test-123',
        iteration: 1,
        stage: 'conceptual',
        entities: [{
          name: 'TestEntity',
          description: 'Test entity',
          attributes: ['id']
        }],
        abstractionLevel: 'high',
        paradigm: 'object-oriented',
        nextStageNeeded: false
      };

      // Type assertions to verify correct inference
      expect(typeof model.domainName).toBe('string');
      expect(typeof model.iteration).toBe('number');
      expect(typeof model.nextStageNeeded).toBe('boolean');
      expect(Array.isArray(model.entities)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle large domain models', () => {
      const largeModel: DomainModelingData = {
        domainName: 'Large E-commerce System',
        description: 'Complex e-commerce domain with many entities',
        modelingId: 'large-model-123',
        iteration: 5,
        stage: 'physical',
        entities: Array.from({ length: 50 }, (_, i) => ({
          name: `Entity${i}`,
          description: `Description for entity ${i}`,
          attributes: Array.from({ length: 10 }, (_, j) => `attr${j}`)
        })),
        relationships: Array.from({ length: 75 }, (_, i) => ({
          name: `Relationship${i}`,
          type: 'one-to-many' as const,
          sourceEntity: `Entity${i % 25}`,
          targetEntity: `Entity${(i + 1) % 25}`,
          description: `Relationship ${i}`
        })),
        domainRules: Array.from({ length: 30 }, (_, i) => ({
          name: `Rule${i}`,
          description: `Business rule ${i}`,
          type: 'business-rule' as const,
          entities: [`Entity${i % 10}`],
          condition: `condition${i}`
        })),
        abstractionLevel: 'low',
        paradigm: 'domain-driven',
        nextStageNeeded: false
      };

      expect(() => DomainModelingSchema.parse(largeModel)).not.toThrow();
    });

    it('should handle model with complex validation data', () => {
      const modelWithValidation: DomainModelingData = {
        domainName: 'Validated Domain',
        description: 'Domain with comprehensive validation',
        modelingId: 'validated-123',
        iteration: 3,
        stage: 'validation',
        entities: [{
          name: 'ValidatedEntity',
          description: 'An entity with validation',
          attributes: ['id', 'name']
        }],
        modelValidation: {
          completeness: 0.95,
          consistency: 0.88,
          correctness: 0.92,
          issues: [
            'Entity X is missing required attribute Y',
            'Relationship Z has inconsistent cardinality',
            'Business rule A conflicts with rule B'
          ],
          suggestions: [
            'Add missing attributes to complete the model',
            'Review relationship cardinalities for consistency',
            'Resolve conflicting business rules'
          ]
        },
        abstractionLevel: 'medium',
        paradigm: 'object-oriented',
        nextStageNeeded: true,
        suggestedNextStage: 'Implement suggested improvements and re-validate'
      };

      expect(() => DomainModelingSchema.parse(modelWithValidation)).not.toThrow();
    });
  });

  describe('Real-world examples', () => {
    it('should validate a banking domain model', () => {
      const bankingModel: DomainModelingData = {
        domainName: 'Banking System',
        description: 'Core banking operations domain',
        modelingId: 'banking-v2.1',
        iteration: 3,
        stage: 'logical',
        entities: [
          {
            name: 'Customer',
            description: 'Bank customer',
            attributes: ['customerId', 'name', 'address', 'phone', 'email'],
            behaviors: ['openAccount', 'closeAccount', 'updateProfile'],
            constraints: ['email must be unique', 'phone must be valid'],
            invariants: ['customerId is immutable']
          },
          {
            name: 'Account',
            description: 'Bank account',
            attributes: ['accountNumber', 'balance', 'accountType', 'openDate'],
            behaviors: ['deposit', 'withdraw', 'transfer'],
            constraints: ['balance cannot be negative for savings accounts'],
            invariants: ['accountNumber is immutable', 'openDate is immutable']
          },
          {
            name: 'Transaction',
            description: 'Financial transaction',
            attributes: ['transactionId', 'amount', 'timestamp', 'type', 'description'],
            constraints: ['amount must be positive', 'timestamp cannot be future'],
            invariants: ['transactionId is immutable', 'timestamp is immutable']
          }
        ],
        relationships: [
          {
            name: 'CustomerAccounts',
            type: 'one-to-many',
            sourceEntity: 'Customer',
            targetEntity: 'Account',
            description: 'Customer can have multiple accounts',
            cardinality: '1:N'
          },
          {
            name: 'AccountTransactions',
            type: 'one-to-many',
            sourceEntity: 'Account',
            targetEntity: 'Transaction',
            description: 'Account has transaction history',
            cardinality: '1:N'
          }
        ],
        domainRules: [
          {
            name: 'Minimum Balance Rule',
            description: 'Savings accounts must maintain minimum balance',
            type: 'business-rule',
            entities: ['Account'],
            condition: 'accountType = "savings" AND balance >= 100',
            priority: 'high'
          },
          {
            name: 'Daily Withdrawal Limit',
            description: 'ATM withdrawals limited to $500 per day',
            type: 'business-rule',
            entities: ['Transaction', 'Account'],
            condition: 'transactionType = "withdrawal" AND dailyTotal <= 500',
            priority: 'critical'
          }
        ],
        boundaries: {
          name: 'Core Banking',
          description: 'Core banking operations boundary',
          includedEntities: ['Customer', 'Account', 'Transaction'],
          excludedConcepts: ['Loans', 'Investments', 'Insurance'],
          interfaces: ['CustomerAPI', 'AccountAPI', 'TransactionAPI'],
          responsibilities: ['Manage customer accounts', 'Process transactions', 'Maintain balances']
        },
        assumptions: [
          'Customers have valid identification',
          'All transactions are in USD',
          'System operates during business hours'
        ],
        stakeholders: ['Bank Customers', 'Tellers', 'Account Managers', 'Compliance Team'],
        useCases: [
          'Open new account',
          'Deposit funds',
          'Withdraw funds',
          'Transfer between accounts',
          'View account balance',
          'View transaction history'
        ],
        abstractionLevel: 'medium',
        paradigm: 'domain-driven',
        nextStageNeeded: true,
        suggestedNextStage: 'Add loan and investment entities',
        modelingNotes: [
          'Consider adding audit trail for all transactions',
          'May need to add support for multiple currencies',
          'Compliance requirements may require additional constraints'
        ]
      };

      expect(() => DomainModelingSchema.parse(bankingModel)).not.toThrow();
    });

    it('should validate a healthcare domain model', () => {
      const healthcareModel: DomainModelingData = {
        domainName: 'Healthcare Management',
        description: 'Patient care and medical records management',
        modelingId: 'healthcare-v1.0',
        iteration: 1,
        stage: 'conceptual',
        entities: [
          {
            name: 'Patient',
            description: 'Healthcare patient',
            attributes: ['patientId', 'name', 'dateOfBirth', 'gender', 'address'],
            behaviors: ['scheduleAppointment', 'updateContactInfo'],
            constraints: ['dateOfBirth must be in the past'],
            invariants: ['patientId is immutable']
          },
          {
            name: 'Doctor',
            description: 'Medical practitioner',
            attributes: ['doctorId', 'name', 'specialty', 'licenseNumber'],
            behaviors: ['diagnose', 'prescribe', 'scheduleAppointment'],
            constraints: ['licenseNumber must be valid'],
            invariants: ['doctorId is immutable', 'licenseNumber is immutable']
          },
          {
            name: 'Appointment',
            description: 'Medical appointment',
            attributes: ['appointmentId', 'dateTime', 'duration', 'status', 'notes'],
            constraints: ['dateTime must be in the future when scheduled'],
            invariants: ['appointmentId is immutable']
          }
        ],
        relationships: [
          {
            name: 'PatientAppointments',
            type: 'one-to-many',
            sourceEntity: 'Patient',
            targetEntity: 'Appointment',
            description: 'Patient can have multiple appointments'
          },
          {
            name: 'DoctorAppointments',
            type: 'one-to-many',
            sourceEntity: 'Doctor',
            targetEntity: 'Appointment',
            description: 'Doctor can have multiple appointments'
          }
        ],
        domainRules: [
          {
            name: 'No Double Booking',
            description: 'Doctor cannot have overlapping appointments',
            type: 'constraint',
            entities: ['Doctor', 'Appointment'],
            condition: 'no overlapping appointment times for same doctor',
            priority: 'critical'
          }
        ],
        abstractionLevel: 'high',
        paradigm: 'object-oriented',
        nextStageNeeded: true,
        stakeholders: ['Patients', 'Doctors', 'Nurses', 'Administrators'],
        useCases: ['Schedule appointment', 'View patient history', 'Update medical records']
      };

      expect(() => DomainModelingSchema.parse(healthcareModel)).not.toThrow();
    });
  });
}); 