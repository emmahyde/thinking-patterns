import { describe, it, expect } from 'vitest';
import { DomainModelingServer } from '../../src/servers/DomainModelingServer.js';
import { DomainModelingData } from '../../src/schemas/index.js';

describe('DomainModelingServer', () => {
  let server: DomainModelingServer;

  beforeEach(() => {
    server = new DomainModelingServer();
  });

  describe('run method', () => {
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

      const response = server.run(validInput);
      const output = response.content[0].text;

      expect(response.isError).toBeFalsy();
      expect(output).toMatch(/Axioms \(Core Truths\)/);
      expect(output).toMatch(/Stock Cannot Be Negative/);
      expect(output).toMatch(/Business Rules/);
      expect(output).toMatch(/IF order\.total > 50 THEN shipping\.cost = 0/);
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

      const response = server.run(simpleInput);
      const output = response.content[0].text;
      
      expect(output).toMatch(/Domain:[\s\S]*?Simple Blog \(object-oriented\)/);
      expect(output).toMatch(/Post: \[id, title, content\]/);
      expect(output).not.toMatch(/Axioms/);
      expect(output).not.toMatch(/Business Rules/);
      expect(output).not.toMatch(/Relationships/);
    });
  });
});