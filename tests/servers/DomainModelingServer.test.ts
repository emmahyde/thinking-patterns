/**
 * Tests for DomainModelingServer
 * Tests structured domain modeling and reporting of entities, relationships, rules, and metrics
 */
import { DomainModelingServer } from '../../src/servers/DomainModelingServer.js';
import { DomainModelingData } from '../../src/schemas/index.js';

describe('DomainModelingServer', () => {
  let server: DomainModelingServer;

  beforeEach(() => {
    server = new DomainModelingServer();
  });

  describe('process', () => {
    it('should correctly format a domain model with axioms and rules', () => {
      const validInput: DomainModelingData = {
        domainName: 'E-commerce Platform',
        description: 'A platform for online sales.',
        modelingId: 'ecom-v2',
        iteration: 3,
        stage: 'logical',
        paradigm: 'domain-driven',
        abstractionLevel: 'medium',
        entities: [
          { name: 'User', description: 'A customer or seller', attributes: ['id', 'name', 'email'] },
          { name: 'Product', description: 'An item for sale', attributes: ['id', 'name', 'price', 'stock'] },
        ],
        relationships: [
          { name: 'places', sourceEntity: 'User', targetEntity: 'Order', type: 'one-to-many', description: 'User places an Order' },
        ],
        domainRules: [
          {
            id: 'axiom-1',
            name: 'Stock Cannot Be Negative',
            description: 'A product\'s stock level must always be zero or greater.',
            type: 'axiom',
            entities: ['Product'],
            condition: 'stock >= 0'
          },
          {
            id: 'rule-1',
            name: 'Free Shipping Over $50',
            description: 'If an order total is over $50, shipping is free.',
            type: 'business-rule',
            entities: ['Order'],
            condition: 'order.total > 50',
            consequence: 'shipping.cost = 0'
          }
        ],
        nextStageNeeded: false,
      };

      const result = server.process(validInput);

      expect(result.status).toBe('success');
      expect(result.domainName).toBe('E-commerce Platform');
      expect(result.entityCount).toBe(2);
      expect(result.relationshipCount).toBe(1);
      expect(result.domainRuleCount).toBe(2);
      expect(result.modelComplexity).toBe('LOW');
      expect(result.paradigm).toBe('domain-driven');
    });

    it('should handle a model with no rules or relationships', () => {
      const simpleInput: DomainModelingData = {
        domainName: 'Simple Blog',
        description: 'A basic blog.',
        modelingId: 'blog-v1',
        iteration: 1,
        stage: 'conceptual',
        paradigm: 'object-oriented',
        abstractionLevel: 'high',
        entities: [
          { name: 'Post', description: 'A blog entry', attributes: ['id', 'title', 'content'] },
        ],
        nextStageNeeded: true,
      };

      const result = server.process(simpleInput);
      
      expect(result.status).toBe('success');
      expect(result.domainName).toBe('Simple Blog');
      expect(result.entityCount).toBe(1);
      expect(result.relationshipCount).toBe(0);
      expect(result.domainRuleCount).toBe(0);
      expect(result.modelComplexity).toBe('LOW');
      expect(result.paradigm).toBe('object-oriented');
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
      const result = server.process({} as any);
      expect(result.status).toBe('error');
    });

    it('should handle invalid field types', () => {
      const invalidInput = {
        domainName: 123,
        entities: 'not-array',
      } as unknown as DomainModelingData;

      expect(() => server.process(invalidInput)).toThrow();
    });
  });
});