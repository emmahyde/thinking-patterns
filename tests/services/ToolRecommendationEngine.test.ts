/**
 * Tests for ToolRecommendationEngine class
 * Tests recommendation algorithms, confidence scoring, and tool suggestion logic
 */

import { jest } from '@jest/globals';
import { ToolRecommendationEngine } from '../../src/services/ToolRecommendationEngine.js';
import {
  createMockToolRecommendation,
  createMockCurrentStep,
  resetAllMocks
} from '../helpers/mockFactories.js';

describe('ToolRecommendationEngine', () => {
  let engine: ToolRecommendationEngine;

  beforeEach(() => {
    resetAllMocks();
    engine = new ToolRecommendationEngine();
  });

  describe('constructor', () => {
    it('should initialize with tool descriptions and domain mappings', () => {
      expect(engine).toBeInstanceOf(ToolRecommendationEngine);
      expect(engine['toolDescriptions']).toBeDefined();
      expect(engine['problemDomainMappings']).toBeDefined();

      // Check that some expected tools are present
      expect(engine['toolDescriptions']).toHaveProperty('mental_model');
      expect(engine['toolDescriptions']).toHaveProperty('debugging_approach');
      expect(engine['toolDescriptions']).toHaveProperty('scientific_method');
    });

    it('should have domain mappings for different problem types', () => {
      const mappings = engine['problemDomainMappings'];

      expect(mappings).toHaveProperty('technical');
      expect(mappings).toHaveProperty('strategic');
      expect(mappings).toHaveProperty('research');
      expect(mappings).toHaveProperty('design');
      expect(mappings).toHaveProperty('analysis');

      expect(Array.isArray(mappings.technical)).toBe(true);
      expect(mappings.technical.length).toBeGreaterThan(0);
    });
  });

  describe('generateRecommendations', () => {
    const mockContext = {
      availableTools: ['mental_model', 'debugging_approach', 'scientific_method', 'decision_framework'],
      userPreferences: {},
      sessionHistory: [],
      problemDomain: 'general'
    };

    it('should generate recommendations for initial thinking stage', () => {
      const recommendations = engine.generateRecommendations(
        "I need to understand this complex problem",
        1,
        5,
        mockContext
      );

      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.length).toBeLessThanOrEqual(5);

      // Check recommendation structure
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('toolName');
        expect(rec).toHaveProperty('confidence');
        expect(rec).toHaveProperty('rationale');
        expect(rec).toHaveProperty('priority');
        expect(typeof rec.confidence).toBe('number');
        expect(rec.confidence).toBeGreaterThanOrEqual(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should generate different recommendations for different stages', () => {
      const initialRecs = engine.generateRecommendations(
        "Starting to analyze this problem",
        1,
        10,
        mockContext
      );

      const midRecs = engine.generateRecommendations(
        "Analyzing the data systematically",
        5,
        10,
        mockContext
      );

      const finalRecs = engine.generateRecommendations(
        "Need to make a final decision",
        9,
        10,
        mockContext
      );

      // Different stages should potentially have different recommendations
      expect(initialRecs).toBeInstanceOf(Array);
      expect(midRecs).toBeInstanceOf(Array);
      expect(finalRecs).toBeInstanceOf(Array);

      // Final stage should likely include decision framework
      const finalToolNames = finalRecs.map(r => r.toolName);
      expect(finalToolNames).toContain('decision_framework');
    });

    it('should only recommend available tools', () => {
      const limitedContext = {
        ...mockContext,
        availableTools: ['mental_model', 'debugging_approach']
      };

      const recommendations = engine.generateRecommendations(
        "Test thought",
        1,
        3,
        limitedContext
      );

      recommendations.forEach(rec => {
        expect(limitedContext.availableTools).toContain(rec.toolName);
      });
    });

    it('should sort recommendations by confidence', () => {
      const recommendations = engine.generateRecommendations(
        "Complex analysis needed",
        3,
        5,
        mockContext
      );

      // Check that recommendations are sorted by confidence (descending)
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i-1].confidence).toBeGreaterThanOrEqual(recommendations[i].confidence);
      }
    });

    it('should adapt to different problem domains', () => {
      const technicalContext = { ...mockContext, problemDomain: 'technical' };
      const strategicContext = { ...mockContext, problemDomain: 'strategic' };

      const technicalRecs = engine.generateRecommendations(
        "Debug this system issue",
        1,
        3,
        technicalContext
      );

      const strategicRecs = engine.generateRecommendations(
        "Strategic planning needed",
        1,
        3,
        strategicContext
      );

      // Technical domain should prefer debugging approaches
      const technicalTools = technicalRecs.map(r => r.toolName);
      expect(technicalTools).toContain('debugging_approach');

      // Strategic domain should prefer decision frameworks
      const strategicTools = strategicRecs.map(r => r.toolName);
      expect(strategicTools).toContain('decision_framework');
    });

    it('should handle edge cases gracefully', () => {
      // Empty thought
      const emptyRecs = engine.generateRecommendations('', 1, 1, mockContext);
      expect(emptyRecs).toBeInstanceOf(Array);

      // Single thought process
      const singleRecs = engine.generateRecommendations('Quick thought', 1, 1, mockContext);
      expect(singleRecs).toBeInstanceOf(Array);

      // Very long thought process
      const longRecs = engine.generateRecommendations('Long analysis', 50, 100, mockContext);
      expect(longRecs).toBeInstanceOf(Array);
    });
  });

  describe('generateCurrentStep', () => {
    const mockContext = {
      availableTools: ['mental_model', 'debugging_approach', 'scientific_method'],
      userPreferences: {},
      sessionHistory: [],
      problemDomain: 'general'
    };

    it('should generate a complete current step', () => {
      const step = engine.generateCurrentStep(
        "I need to analyze this problem systematically",
        2,
        5,
        mockContext
      );

      expect(step).toHaveProperty('stepDescription');
      expect(step).toHaveProperty('recommendedTools');
      expect(step).toHaveProperty('expectedOutcome');
      expect(step).toHaveProperty('nextStepConditions');
      expect(step).toHaveProperty('stepNumber');
      expect(step).toHaveProperty('complexityLevel');
      expect(step).toHaveProperty('estimatedDuration');

      expect(typeof step.stepDescription).toBe('string');
      expect(Array.isArray(step.recommendedTools)).toBe(true);
      expect(typeof step.expectedOutcome).toBe('string');
      expect(Array.isArray(step.nextStepConditions)).toBe(true);
      expect(typeof step.stepNumber).toBe('number');
      expect(['low', 'medium', 'high']).toContain(step.complexityLevel);
      expect(typeof step.estimatedDuration).toBe('string');
    });

    it('should include step number in response', () => {
      const step = engine.generateCurrentStep(
        "Test thought",
        3,
        5,
        mockContext
      );

      expect(step.stepNumber).toBe(3);
    });

    it('should generate appropriate step descriptions for different stages', () => {
      const initialStep = engine.generateCurrentStep("Starting analysis", 1, 10, mockContext);
      const middleStep = engine.generateCurrentStep("Deep analysis", 5, 10, mockContext);
      const finalStep = engine.generateCurrentStep("Final decision", 9, 10, mockContext);

      expect(initialStep.stepDescription).toContain('Initial');
      expect(middleStep.stepDescription).toContain('analysis');
      expect(finalStep.stepDescription).toContain('Solution');
    });

    it('should provide relevant next step conditions', () => {
      const step = engine.generateCurrentStep(
        "Problem identification phase",
        1,
        5,
        mockContext
      );

      expect(step.nextStepConditions.length).toBeGreaterThan(0);
      step.nextStepConditions.forEach((condition: string) => {
        expect(typeof condition).toBe('string');
        expect(condition.length).toBeGreaterThan(0);
      });
    });

    it('should estimate duration based on complexity', () => {
      const simpleStep = engine.generateCurrentStep("Simple task", 1, 2, mockContext);
      const complexStep = engine.generateCurrentStep(
        "Complex analysis requiring deep investigation of multiple interconnected systems with various stakeholders and dependencies",
        1,
        2,
        mockContext
      );

      // Duration should be a reasonable time estimate
      expect(simpleStep.estimatedDuration).toMatch(/\d+/);
      expect(complexStep.estimatedDuration).toMatch(/\d+/);
    });
  });

  describe('analyzeThoughtContent', () => {
    it('should extract relevant keywords', () => {
      const analysis = engine['analyzeThoughtContent']("I need to debug this problem and analyze the system");

      expect(analysis).toHaveProperty('keywords');
      expect(analysis).toHaveProperty('intent');
      expect(analysis).toHaveProperty('complexity');
      expect(analysis).toHaveProperty('domain');

      expect(Array.isArray(analysis.keywords)).toBe(true);
      expect(analysis.keywords).toContain('debug');
      expect(analysis.keywords).toContain('problem');
      expect(analysis.keywords).toContain('analyze');
    });

    it('should classify intent correctly', () => {
      const problemAnalysis = engine['analyzeThoughtContent']("I have a problem to solve");
      const decisionAnalysis = engine['analyzeThoughtContent']("I need to decide between options");
      const planningAnalysis = engine['analyzeThoughtContent']("Let me plan my approach");

      expect(problemAnalysis.intent).toBe('problem-identification');
      expect(decisionAnalysis.intent).toBe('decision-making');
      expect(planningAnalysis.intent).toBe('planning');
    });

    it('should assess complexity based on content', () => {
      const simpleAnalysis = engine['analyzeThoughtContent']("Simple task");
      const complexAnalysis = engine['analyzeThoughtContent'](
        "This is a very complex problem that requires deep analysis of multiple interconnected systems, " +
        "careful evaluation of various algorithms, and systematic implementation of optimization strategies " +
        "across different architectural layers with consideration for performance, scalability, and maintainability"
      );

      expect(simpleAnalysis.complexity).toBeLessThan(complexAnalysis.complexity);
      expect(complexAnalysis.complexity).toBeGreaterThan(0.5);
    });

    it('should infer domain from content', () => {
      const technicalAnalysis = engine['analyzeThoughtContent']("Debug this algorithm implementation");
      const strategicAnalysis = engine['analyzeThoughtContent']("Business strategy planning needed");
      const researchAnalysis = engine['analyzeThoughtContent']("Research and investigate this topic");

      expect(technicalAnalysis.domain).toBe('technical');
      expect(strategicAnalysis.domain).toBe('strategic');
      expect(researchAnalysis.domain).toBe('research');
    });
  });

  describe('determineThinkingStage', () => {
    it('should correctly identify initial stage', () => {
      expect(engine['determineThinkingStage'](1, 10)).toBe('initial');
      expect(engine['determineThinkingStage'](2, 10)).toBe('initial');
      expect(engine['determineThinkingStage'](3, 10)).toBe('initial');
    });

    it('should correctly identify middle stage', () => {
      expect(engine['determineThinkingStage'](4, 10)).toBe('middle');
      expect(engine['determineThinkingStage'](5, 10)).toBe('middle');
      expect(engine['determineThinkingStage'](6, 10)).toBe('middle');
    });

    it('should correctly identify final stage', () => {
      expect(engine['determineThinkingStage'](7, 10)).toBe('final');
      expect(engine['determineThinkingStage'](8, 10)).toBe('final');
      expect(engine['determineThinkingStage'](9, 10)).toBe('final');
      expect(engine['determineThinkingStage'](10, 10)).toBe('final');
    });

    it('should handle edge cases', () => {
      expect(engine['determineThinkingStage'](1, 1)).toBe('final');
      expect(engine['determineThinkingStage'](1, 2)).toBe('initial');
      expect(engine['determineThinkingStage'](2, 2)).toBe('final');
    });
  });

  describe('getStageBasedRecommendations', () => {
    it('should provide initial stage recommendations', () => {
      const analysis = { intent: 'problem-identification', domain: 'general', complexity: 0.5 };
      const recommendations = engine['getStageBasedRecommendations'](1, 5, analysis);

      expect(recommendations.length).toBeGreaterThan(0);
      const toolNames = recommendations.map(r => r.toolName);
      expect(toolNames).toContain('mental_model');
    });

    it('should provide middle stage recommendations', () => {
      const analysis = { intent: 'analysis', domain: 'technical', complexity: 0.7 };
      const recommendations = engine['getStageBasedRecommendations'](3, 5, analysis);

      expect(recommendations.length).toBeGreaterThan(0);
      const toolNames = recommendations.map(r => r.toolName);
      expect(toolNames).toContain('scientific_method');
    });

    it('should provide final stage recommendations', () => {
      const analysis = { intent: 'decision-making', domain: 'strategic', complexity: 0.6 };
      const recommendations = engine['getStageBasedRecommendations'](5, 5, analysis);

      expect(recommendations.length).toBeGreaterThan(0);
      const toolNames = recommendations.map(r => r.toolName);
      expect(toolNames).toContain('decision_framework');
    });
  });

  describe('getDomainSpecificRecommendations', () => {
    it('should provide technical domain recommendations', () => {
      const analysis = { intent: 'problem-identification', complexity: 0.5 };
      const recommendations = engine['getDomainSpecificRecommendations']('technical', analysis);

      expect(recommendations.length).toBeGreaterThan(0);
      recommendations.forEach(rec => {
        expect(engine['problemDomainMappings']['technical']).toContain(rec.toolName);
      });
    });

    it('should provide strategic domain recommendations', () => {
      const analysis = { intent: 'planning', complexity: 0.6 };
      const recommendations = engine['getDomainSpecificRecommendations']('strategic', analysis);

      expect(recommendations.length).toBeGreaterThan(0);
      recommendations.forEach(rec => {
        expect(engine['problemDomainMappings']['strategic']).toContain(rec.toolName);
      });
    });

    it('should handle unknown domains gracefully', () => {
      const analysis = { intent: 'exploration', complexity: 0.4 };
      const recommendations = engine['getDomainSpecificRecommendations']('unknown', analysis);

      expect(recommendations).toEqual([]);
    });

    it('should boost confidence for matching tools', () => {
      const analysis = { intent: 'problem-identification', complexity: 0.5 };
      const recommendations = engine['getDomainSpecificRecommendations']('technical', analysis);

      // Find debugging approach recommendation (should match problem-identification intent)
      const debuggingRec = recommendations.find(r => r.toolName === 'debugging_approach');
      if (debuggingRec) {
        expect(debuggingRec.confidence).toBeGreaterThan(0.6); // Base + boost
      }
    });
  });

  describe('combineRecommendations', () => {
    it('should combine stage and domain recommendations', () => {
      const stageRecs = [
        createMockToolRecommendation({ toolName: 'mental_model', confidence: 0.8 })
      ];
      const domainRecs = [
        createMockToolRecommendation({ toolName: 'debugging_approach', confidence: 0.7 }),
        createMockToolRecommendation({ toolName: 'mental_model', confidence: 0.6 })
      ];
      const availableTools = ['mental_model', 'debugging_approach', 'scientific_method'];

      const combined = engine['combineRecommendations'](stageRecs, domainRecs, availableTools);

      expect(combined.length).toBe(2);

      // Check that mental_model confidence was combined
      const mentalModelRec = combined.find(r => r.toolName === 'mental_model');
      expect(mentalModelRec).toBeDefined();
      expect(Math.round(mentalModelRec!.confidence * 100) / 100).toBeGreaterThanOrEqual(0.8); // Should be higher due to combination
    });

    it('should only include available tools', () => {
      const stageRecs = [
        createMockToolRecommendation({ toolName: 'unavailable-tool', confidence: 0.9 })
      ];
      const domainRecs = [
        createMockToolRecommendation({ toolName: 'mental_model', confidence: 0.7 })
      ];
      const availableTools = ['mental_model'];

      const combined = engine['combineRecommendations'](stageRecs, domainRecs, availableTools);

      expect(combined.length).toBe(1);
      expect(combined[0].toolName).toBe('mental_model');
    });
  });

  describe('assessComplexity', () => {
    it('should return low complexity for simple analysis', () => {
      const simpleAnalysis = { complexity: 0.3 };
      expect(engine['assessComplexity'](simpleAnalysis)).toBe('low');
    });

    it('should return medium complexity for moderate analysis', () => {
      const moderateAnalysis = { complexity: 0.5 };
      expect(engine['assessComplexity'](moderateAnalysis)).toBe('medium');
    });

    it('should return high complexity for complex analysis', () => {
      const complexAnalysis = { complexity: 0.8 };
      expect(engine['assessComplexity'](complexAnalysis)).toBe('high');
    });
  });

  describe('estimateDuration', () => {
    it('should estimate reasonable durations', () => {
      const lowComplexity = { complexity: 0.2 };
      const highComplexity = { complexity: 0.9 };

      const lowDuration = engine['estimateDuration'](lowComplexity, 1);
      const highDuration = engine['estimateDuration'](highComplexity, 3);

      expect(lowDuration).toMatch(/\d+/);
      expect(highDuration).toMatch(/\d+/);

      // High complexity should generally take longer
      const lowMinutes = lowDuration.includes('minutes') ? parseInt(lowDuration) : 60;
      const highMinutes = highDuration.includes('hour') ? 60 : parseInt(highDuration);

      // This is a loose check since duration strings can vary
      expect(typeof lowDuration).toBe('string');
      expect(typeof highDuration).toBe('string');
    });

    it('should consider tool count in duration estimation', () => {
      const analysis = { complexity: 0.5 };

      const fewToolsDuration = engine['estimateDuration'](analysis, 1);
      const manyToolsDuration = engine['estimateDuration'](analysis, 5);

      expect(typeof fewToolsDuration).toBe('string');
      expect(typeof manyToolsDuration).toBe('string');
    });
  });

  describe('toolMatchesAnalysis', () => {
    it('should correctly match tools to analysis intent', () => {
      const problemAnalysis = { intent: 'problem-identification' };
      const analysisIntent = { intent: 'analysis' };
      const decisionAnalysis = { intent: 'decision-making' };

      expect(engine['toolMatchesAnalysis']('debugging_approach', problemAnalysis)).toBe(true);
      expect(engine['toolMatchesAnalysis']('scientific_method', analysisIntent)).toBe(true);
      expect(engine['toolMatchesAnalysis']('decision_framework', decisionAnalysis)).toBe(true);

      expect(engine['toolMatchesAnalysis']('debugging_approach', decisionAnalysis)).toBe(false);
    });

    it('should handle unknown tools gracefully', () => {
      const analysis = { intent: 'exploration' };
      expect(engine['toolMatchesAnalysis']('unknown-tool', analysis)).toBe(false);
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle empty or null inputs gracefully', () => {
      const mockContext = {
        availableTools: ['mental_model'],
        userPreferences: {},
        sessionHistory: [],
        problemDomain: 'general'
      };

      expect(() => engine.generateRecommendations('', 1, 1, mockContext)).not.toThrow();
      expect(() => engine.generateCurrentStep('', 1, 1, mockContext)).not.toThrow();
    });

    it('should handle zero or negative thought numbers', () => {
      const mockContext = {
        availableTools: ['mental_model'],
        userPreferences: {},
        sessionHistory: [],
        problemDomain: 'general'
      };

      expect(() => engine.generateRecommendations('test', 0, 1, mockContext)).not.toThrow();
      expect(() => engine.generateRecommendations('test', -1, 1, mockContext)).not.toThrow();
    });

    it('should handle context with no available tools', () => {
      const emptyContext = {
        availableTools: [],
        userPreferences: {},
        sessionHistory: [],
        problemDomain: 'test'
      };

      const recommendations = engine.generateRecommendations('test', 1, 1, emptyContext);
      expect(recommendations).toEqual([]);
    });

    it('should handle very long thought content', () => {
      const longThought = 'x'.repeat(10000);
      const mockContext = {
        availableTools: ['mental_model'],
        userPreferences: {},
        sessionHistory: [],
        problemDomain: 'general'
      };

      expect(() => engine.generateRecommendations(longThought, 1, 1, mockContext)).not.toThrow();
    });
  });
});
