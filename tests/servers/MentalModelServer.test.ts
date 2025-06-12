import { MentalModelServer } from '../../src/servers/MentalModelServer.js';

describe('MentalModelServer', () => {
  let server: MentalModelServer;

  beforeEach(() => {
    server = new MentalModelServer();
  });

  describe('processModel', () => {
    it('should process valid mental model data and return enriched analysis', () => {
      const input = {
        modelName: 'First Principles Thinking',
        problem: 'How to reduce customer churn in a SaaS business to improve revenue',
        steps: [
          'Break down the problem to fundamental truths about customer needs and value',
          'Identify the core, unchangeable reasons why customers are leaving the service',
          'Analyze the alignment between our value proposition and these core customer needs',
          'Design and propose targeted retention strategies based on first principles'
        ],
        reasoning: 'By understanding the fundamental drivers of customer behavior, we can address the root causes of churn rather than just treating the symptoms with superficial fixes.',
        conclusion: 'The primary focus should be on improving the new user onboarding experience and demonstrating clear, undeniable value within the first 30 days of service.'
      };

      const result = server.processModel(input);

      expect(result.isError).toBeFalsy();
      expect(result.data).toBeDefined();

      const parsedContent = JSON.parse(result.content[0].text);
      
      expect(parsedContent.modelName).toBe('First Principles Thinking');
      expect(parsedContent.problem).toBe('How to reduce customer churn in a SaaS business to improve revenue');
      
      // Test the new analysis structure
      expect(parsedContent.analysis).toBeDefined();
      expect(parsedContent.analysis.status).toBe('success');
      expect(parsedContent.analysis.complexity).toBe('medium');
      expect(parsedContent.analysis.suggestions).toBeInstanceOf(Array);
      expect(parsedContent.analysis.keywords).toContain('customer');

      // Test the summary structure
      expect(parsedContent.summary).toBeDefined();
      expect(parsedContent.summary.stepCount).toBe(4);
      expect(parsedContent.summary.hasConclusion).toBe(true);
    });

    it('should handle complex multi-step analysis', () => {
      const input = {
        modelName: 'Systems Thinking',
        problem: 'Organizational inefficiency in remote work environment',
        steps: [
          'Map the current system and stakeholders',
          'Identify feedback loops and dependencies',
          'Locate bottlenecks and constraints',
          'Analyze information flow patterns',
          'Examine decision-making processes',
          'Evaluate communication channels',
          'Design system-level interventions'
        ],
        reasoning: 'Remote work creates new system dynamics that require holistic analysis. Traditional efficiency measures may not capture the full picture of distributed team performance.',
        conclusion: 'Implement asynchronous communication protocols, establish clear decision rights, and create virtual collaboration spaces that mirror in-person interaction patterns'
      };

      const result = server.processModel(input);

      expect(result.isError).toBeFalsy();
      expect(result.data?.steps).toHaveLength(7);
      expect(result.data?.modelName).toBe('Systems Thinking');
    });

    it('should handle validation errors for missing modelName', () => {
      const input = {
        problem: 'Test problem',
      };

      const result = server.processModel(input);

      expect(result.isError).toBe(true);
      const errorContent = JSON.parse(result.content[0].text);
      expect(errorContent.error).toContain('modelName: Required');
    });

    it('should handle validation errors for missing problem', () => {
      const input = {
        modelName: 'Test Model',
        steps: ['Step 1'],
        reasoning: 'Test reasoning',
        conclusion: 'Test conclusion'
      };

      const result = server.processModel(input);

      expect(result.isError).toBe(true);
      const errorContent = JSON.parse(result.content[0].text);
      expect(errorContent.error).toContain('problem: Required');
    });

    it('should handle validation errors for invalid steps', () => {
      const input = {
        modelName: 'Test Model',
        problem: 'Test problem',
        steps: 'Not an array',
        reasoning: 'Test reasoning',
        conclusion: 'Test conclusion'
      };

      const result = server.processModel(input);

      expect(result.isError).toBe(true);
      const errorContent = JSON.parse(result.content[0].text);
      expect(errorContent.error).toContain('steps: Expected array, received string');
    });

    it('should handle validation errors for non-string steps', () => {
      const input = {
        modelName: 'Test Model',
        problem: 'Test problem',
        steps: ['Valid step', 123, 'Another valid step'],
        reasoning: 'Test reasoning',
        conclusion: 'Test conclusion'
      };

      const result = server.processModel(input);

      expect(result.isError).toBe(true);
      const errorContent = JSON.parse(result.content[0].text);
      expect(errorContent.error).toContain('steps.1: Expected string, received number');
    });

    it('should handle missing reasoning (optional field)', () => {
      const input = {
        modelName: 'Test Model',
        problem: 'Test problem',
        steps: ['Step 1'],
        conclusion: 'Test conclusion'
      };

      const result = server.processModel(input);

      expect(result.isError).toBeFalsy();
      expect(result.data?.reasoning).toBeUndefined();
    });

    it('should handle missing conclusion (optional field)', () => {
      const input = {
        modelName: 'Test Model',
        problem: 'Test problem',
        steps: ['Step 1'],
        reasoning: 'Test reasoning'
      };

      const result = server.processModel(input);

      expect(result.isError).toBeFalsy();
      expect(result.data?.conclusion).toBeUndefined();
    });

    it('should handle empty steps array', () => {
      const input = {
        modelName: 'Minimal Model',
        problem: 'Simple problem',
        steps: [],
        reasoning: 'Sometimes the solution is obvious',
        conclusion: 'Direct action required'
      };

      const result = server.processModel(input);

      expect(result.isError).toBeFalsy();
      expect(result.data?.steps).toHaveLength(0);
    });

    it('should handle single step analysis', () => {
      const input = {
        modelName: 'Occam\'s Razor',
        problem: 'Website loading slowly',
        steps: ['Choose the simplest explanation that fits the data'],
        reasoning: 'Multiple complex theories exist, but the simplest is usually correct',
        conclusion: 'Check server resources before investigating complex caching issues'
      };

      const result = server.processModel(input);

      expect(result.isError).toBeFalsy();
      expect(result.data?.steps).toHaveLength(1);
      expect(result.data?.steps[0]).toBe('Choose the simplest explanation that fits the data');
    });

    it('should return properly formatted JSON content', () => {
      const input = {
        modelName: 'Test Model',
        problem: 'Test problem',
        steps: ['Step 1', 'Step 2'],
        reasoning: 'Test reasoning',
        conclusion: 'Test conclusion'
      };

      const result = server.processModel(input);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(() => JSON.parse(result.content[0].text)).not.toThrow();

      const parsedContent = JSON.parse(result.content[0].text);
      expect(parsedContent.modelName).toBe('Test Model');
      expect(parsedContent.problem).toBe('Test problem');
      expect(parsedContent.analysis.status).toBe('success');
      expect(parsedContent.summary.hasSteps).toBe(true);
      expect(parsedContent.summary.hasConclusion).toBe(true);
      expect(parsedContent.summary.stepCount).toBe(2);
      expect(parsedContent.analysis.timestamp).toBeDefined();

      // Check that the input data is available in the data field
      expect(result.data?.modelName).toBe('Test Model');
      expect(result.data?.problem).toBe('Test problem');
      expect(result.data?.steps).toEqual(['Step 1', 'Step 2']);
      expect(result.data?.reasoning).toBe('Test reasoning');
      expect(result.data?.conclusion).toBe('Test conclusion');
    });

    it('should suggest improvements for a sparse model', () => {
      const input = {
        modelName: 'Shallow Analysis',
        problem: 'A small problem.',
        steps: ['One step'],
        reasoning: 'Quick thought.',
        conclusion: 'Done.'
      };

      const result = server.processModel(input);
      const parsedContent = JSON.parse(result.content[0].text);

      expect(result.isError).toBeFalsy();
      expect(parsedContent.analysis.suggestions).toEqual(
        expect.arrayContaining([
          "Consider adding more detail to the reasoning or conclusion for a more complete analysis.",
          "Breaking the problem down into more steps could provide deeper insight.",
          "Ensure the conclusion logically follows from the reasoning and steps."
        ])
      );
      expect(parsedContent.analysis.complexity).toBe('low');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null input', () => {
      const result = server.processModel(null);
      expect(result.isError).toBe(true);
    });

    it('should handle undefined input', () => {
      const result = server.processModel(undefined);
      expect(result.isError).toBe(true);
    });

    it('should handle empty object input', () => {
      const result = server.processModel({});
      expect(result.isError).toBe(true);
    });

    it('should handle wrong data types for all fields', () => {
      const input = {
        modelName: 123,
        problem: true,
        steps: 'not-an-array',
        reasoning: [],
        conclusion: {}
      };

      const result = server.processModel(input);
      expect(result.isError).toBe(true);
    });

    it('should handle very long content gracefully', () => {
      const longString = 'A'.repeat(10000);
      const input = {
        modelName: 'Long Content Model',
        problem: longString,
        steps: [longString, longString],
        reasoning: longString,
        conclusion: longString
      };

      const result = server.processModel(input);
      expect(result.isError).toBeFalsy();
      expect(result.data?.problem).toBe(longString);
    });
  });

  describe('real-world mental models', () => {
    it('should handle Inversion mental model', () => {
      const input = {
        modelName: 'Inversion',
        problem: 'How to build a successful startup',
        steps: [
          'Instead of asking "How to succeed?", ask "How to fail?"',
          'List all the ways a startup typically fails',
          'Identify the most common failure modes',
          'Design strategies to avoid these failure modes',
          'Implement safeguards against critical risks'
        ],
        reasoning: 'By understanding what leads to failure, we can work backwards to avoid those pitfalls and increase our chances of success',
        conclusion: 'Focus on avoiding common startup killers: running out of money, building something nobody wants, and team conflicts'
      };

      const result = server.processModel(input);
      expect(result.isError).toBeFalsy();
      expect(result.data?.modelName).toBe('Inversion');
    });

    it('should handle Circle of Competence mental model', () => {
      const input = {
        modelName: 'Circle of Competence',
        problem: 'Should we expand into a new market segment?',
        steps: [
          'Define our current circle of competence',
          'Assess our knowledge and skills in the new market',
          'Identify gaps in understanding',
          'Evaluate the cost of acquiring necessary competence',
          'Consider staying within our circle vs expanding it'
        ],
        reasoning: 'Operating within our circle of competence increases our chances of success, while expanding requires careful consideration of the learning curve and risks',
        conclusion: 'Partner with domain experts in the new market rather than trying to build competence from scratch'
      };

      const result = server.processModel(input);
      expect(result.isError).toBeFalsy();
      expect(result.data?.modelName).toBe('Circle of Competence');
    });

    it('should handle Second-Order Thinking mental model', () => {
      const input = {
        modelName: 'Second-Order Thinking',
        problem: 'Should we implement a 4-day work week?',
        steps: [
          'First-order effect: Employees work fewer hours',
          'Second-order effect: Potential productivity increase due to better rest',
          'Third-order effect: Possible competitive advantage in talent acquisition',
          'Fourth-order effect: Industry-wide adoption pressure',
          'Consider unintended consequences and feedback loops'
        ],
        reasoning: 'Most people stop at first-order thinking, but the real insights come from considering the chain of consequences',
        conclusion: 'Pilot the program with metrics to measure actual productivity changes, not just employee satisfaction'
      };

      const result = server.processModel(input);
      expect(result.isError).toBeFalsy();
      expect(result.data?.steps).toHaveLength(5);
    });
  });
});
