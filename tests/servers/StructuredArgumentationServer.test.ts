import { StructuredArgumentationServer } from '../../src/servers/StructuredArgumentationServer.js';

describe('StructuredArgumentationServer', () => {
  let server: StructuredArgumentationServer;

  beforeEach(() => {
    server = new StructuredArgumentationServer();
  });

  describe('process', () => {
    it('should process valid thesis argument correctly', () => {
      const input = {
        claim: 'Remote work increases productivity for knowledge workers',
        premises: [
          'Remote workers have fewer office distractions',
          'Flexible schedules allow for peak performance hours',
          'Reduced commute time increases available work time'
        ],
        conclusion: 'Companies should adopt remote work policies',
        argumentType: 'thesis' as const,
        confidence: 0.8,
        nextArgumentNeeded: true
      };

      const result = server.process(input);

      expect(result.claim).toBe('Remote work increases productivity for knowledge workers');
      expect(result.premises).toHaveLength(3);
      expect(result.conclusion).toBe('Companies should adopt remote work policies');
      expect(result.argumentType).toBe('thesis');
      expect(result.confidence).toBe(0.8);
      expect(result.nextArgumentNeeded).toBe(true);
      expect(result.status).toBe('success');
      expect(result.premiseCount).toBe(3);
      expect(result.hasConclusion).toBe(true);
      expect(result.timestamp).toBeDefined();
    });

    it('should process antithesis argument with counter-claims', () => {
      const input = {
        claim: 'Remote work actually decreases productivity',
        premises: [
          'Home environments have many distractions',
          'Collaboration and communication suffer',
          'Work-life boundaries become blurred'
        ],
        conclusion: 'In-person work is more effective for most roles',
        argumentId: 'arg-002',
        argumentType: 'antithesis' as const,
        confidence: 0.75,
        respondsTo: 'arg-001',
        contradicts: ['Remote work increases productivity'],
        weaknesses: ['Based on limited studies', 'May not apply to all industries'],
        nextArgumentNeeded: true,
        suggestedNextTypes: ['synthesis' as const, 'rebuttal' as const]
      };

      const result = server.process(input);

      expect(result.argumentType).toBe('antithesis');
      expect(result.hasRespondsTo).toBe(true);
      expect(result.respondsTo).toBe('arg-001');
      expect(result.hasContradicts).toBe(true);
      expect(result.contradicts).toEqual(['Remote work increases productivity']);
      expect(result.weaknessCount).toBe(2);
      expect(result.hasSuggestedNextTypes).toBe(true);
      expect(result.suggestedNextTypes).toEqual(['synthesis', 'rebuttal']);
    });

    it('should process synthesis argument combining perspectives', () => {
      const input = {
        claim: 'Hybrid work models optimize both productivity and collaboration',
        premises: [
          'Remote work benefits individual focused tasks',
          'In-person work facilitates team collaboration',
          'Different tasks require different work environments',
          'Technology enables seamless transitions between modes'
        ],
        conclusion: 'A flexible hybrid approach maximizes overall effectiveness',
        argumentId: 'arg-003',
        argumentType: 'synthesis' as const,
        confidence: 0.85,
        supports: ['Remote work benefits', 'In-person collaboration benefits'],
        strengths: [
          'Addresses concerns from both perspectives',
          'Practical and implementable',
          'Supported by emerging research'
        ],
        nextArgumentNeeded: false
      };

      const result = server.process(input);

      expect(result.argumentType).toBe('synthesis');
      expect(result.hasSupports).toBe(true);
      expect(result.supports).toHaveLength(2);
      expect(result.strengthCount).toBe(3);
      expect(result.nextArgumentNeeded).toBe(false);
      expect(result.confidence).toBe(0.85);
    });

    it('should process objection argument with specific concerns', () => {
      const input = {
        claim: 'The hybrid work proposal has significant implementation challenges',
        premises: [
          'Managing hybrid teams requires new skills',
          'Technology infrastructure costs are substantial',
          'Equity issues arise between remote and in-office employees'
        ],
        conclusion: 'Implementation barriers may outweigh theoretical benefits',
        argumentType: 'objection' as const,
        confidence: 0.7,
        respondsTo: 'arg-003',
        weaknesses: [
          'Implementation challenges can be addressed with proper planning',
          'Short-term costs vs long-term benefits not fully considered'
        ],
        strengths: [
          'Highlights practical concerns',
          'Based on real implementation experiences'
        ],
        nextArgumentNeeded: true,
        suggestedNextTypes: ['rebuttal' as const]
      };

      const result = server.process(input);

      expect(result.argumentType).toBe('objection');
      expect(result.hasRespondsTo).toBe(true);
      expect(result.strengthCount).toBe(2);
      expect(result.weaknessCount).toBe(2);
      expect(result.hasSuggestedNextTypes).toBe(true);
      expect(result.suggestedNextTypes).toEqual(['rebuttal']);
    });

    it('should process rebuttal argument addressing objections', () => {
      const input = {
        claim: 'Implementation challenges for hybrid work are manageable with proper strategy',
        premises: [
          'Many companies have successfully implemented hybrid models',
          'Technology costs are decreasing and ROI is demonstrable',
          'Equity issues can be addressed through clear policies',
          'Training programs can develop necessary management skills'
        ],
        conclusion: 'The objections, while valid, can be systematically addressed',
        argumentType: 'rebuttal' as const,
        confidence: 0.8,
        respondsTo: 'objection-001',
        supports: ['Hybrid work feasibility'],
        contradicts: ['Implementation is too difficult'],
        strengths: [
          'Provides concrete solutions',
          'Supported by case studies',
          'Addresses each objection specifically'
        ],
        nextArgumentNeeded: false
      };

      const result = server.process(input);

      expect(result.argumentType).toBe('rebuttal');
      expect(result.hasSupports).toBe(true);
      expect(result.hasContradicts).toBe(true);
      expect(result.strengthCount).toBe(3);
      expect(result.confidence).toBe(0.8);
    });

    it('should handle argument with minimal required fields', () => {
      const input = {
        claim: 'Simple claim statement',
        premises: ['Single premise'],
        conclusion: 'Simple conclusion',
        argumentType: 'thesis' as const,
        confidence: 0.5,
        nextArgumentNeeded: false
      };

      const result = server.process(input);

      expect(result.premiseCount).toBe(1);
      expect(result.hasRespondsTo).toBe(false);
      expect(result.hasSupports).toBe(false);
      expect(result.hasContradicts).toBe(false);
      expect(result.strengthCount).toBe(0);
      expect(result.weaknessCount).toBe(0);
      expect(result.hasSuggestedNextTypes).toBe(false);
    });

    it('should handle argument with multiple supports', () => {
      const input = {
        claim: 'Argument with multiple supporting claims',
        premises: ['Premise 1', 'Premise 2'],
        conclusion: 'Conclusion',
        argumentType: 'thesis' as const,
        confidence: 0.9,
        supports: [
          'Supporting claim 1',
          'Supporting claim 2',
          'Supporting claim 3',
          'Supporting claim 4'
        ],
        nextArgumentNeeded: true
      };

      const result = server.process(input);

      expect(result.hasSupports).toBe(true);
      expect(result.supports).toHaveLength(4);
      expect(result.supports).toEqual([
        'Supporting claim 1',
        'Supporting claim 2',
        'Supporting claim 3',
        'Supporting claim 4'
      ]);
    });

    it('should handle argument with multiple contradictions', () => {
      const input = {
        claim: 'Argument contradicting multiple claims',
        premises: ['Counter-premise 1', 'Counter-premise 2'],
        conclusion: 'Counter-conclusion',
        argumentType: 'antithesis' as const,
        confidence: 0.75,
        contradicts: [
          'Opposing claim 1',
          'Opposing claim 2',
          'Opposing claim 3'
        ],
        nextArgumentNeeded: true
      };

      const result = server.process(input);

      expect(result.hasContradicts).toBe(true);
      expect(result.contradicts).toHaveLength(3);
      expect(result.contradicts).toContain('Opposing claim 1');
      expect(result.contradicts).toContain('Opposing claim 3');
    });

    it('should handle all argument types', () => {
      const argumentTypes = ['thesis', 'antithesis', 'synthesis', 'objection', 'rebuttal'] as const;

      argumentTypes.forEach((type, index) => {
        const input = {
          claim: `Claim for ${type} argument`,
          premises: [`Premise for ${type}`],
          conclusion: `Conclusion for ${type}`,
          argumentType: type,
          confidence: 0.6,
          nextArgumentNeeded: true
        };

        const result = server.process(input);
        expect(result.argumentType).toBe(type);
        expect(result.status).toBe('success');
      });
    });

    it('should handle argument with comprehensive strengths analysis', () => {
      const input = {
        claim: 'Well-supported argument with detailed analysis',
        premises: [
          'Strong empirical evidence',
          'Logical reasoning chain',
          'Expert consensus'
        ],
        conclusion: 'High-confidence conclusion',
        argumentType: 'thesis' as const,
        confidence: 0.95,
        strengths: [
          'Based on peer-reviewed research',
          'Logical consistency throughout',
          'Addresses potential counterarguments',
          'Practical implications clearly stated',
          'Methodology is transparent'
        ],
        nextArgumentNeeded: false
      };

      const result = server.process(input);

      expect(result.strengthCount).toBe(5);
      expect(result.strengths).toContain('Based on peer-reviewed research');
      expect(result.strengths).toContain('Methodology is transparent');
      expect(result.confidence).toBe(0.95);
    });

    it('should handle argument with comprehensive weaknesses analysis', () => {
      const input = {
        claim: 'Argument with identified weaknesses',
        premises: [
          'Limited sample size',
          'Potential selection bias',
          'Correlation vs causation issues'
        ],
        conclusion: 'Tentative conclusion requiring further research',
        argumentType: 'thesis' as const,
        confidence: 0.4,
        weaknesses: [
          'Small sample size limits generalizability',
          'Study design has inherent biases',
          'Causal mechanisms not clearly established',
          'Alternative explanations not fully explored',
          'Replication studies needed'
        ],
        nextArgumentNeeded: true,
        suggestedNextTypes: ['objection' as const, 'antithesis' as const]
      };

      const result = server.process(input);

      expect(result.weaknessCount).toBe(5);
      expect(result.weaknesses).toContain('Small sample size limits generalizability');
      expect(result.weaknesses).toContain('Replication studies needed');
      expect(result.confidence).toBe(0.4);
      expect(result.hasSuggestedNextTypes).toBe(true);
    });

    it('should handle complex argument with all optional fields', () => {
      const input = {
        claim: 'Complex comprehensive argument',
        premises: [
          'Comprehensive premise 1',
          'Comprehensive premise 2',
          'Comprehensive premise 3'
        ],
        conclusion: 'Comprehensive conclusion',
        argumentId: 'complex-arg-001',
        argumentType: 'synthesis' as const,
        confidence: 0.85,
        respondsTo: 'previous-arg-001',
        supports: ['Supporting position A', 'Supporting position B'],
        contradicts: ['Opposing position X'],
        strengths: [
          'Integrates multiple perspectives',
          'Addresses key objections'
        ],
        weaknesses: [
          'Complexity may reduce clarity'
        ],
        nextArgumentNeeded: true,
        suggestedNextTypes: ['objection' as const, 'rebuttal' as const]
      };

      const result = server.process(input);

      expect(result.argumentId).toBe('complex-arg-001');
      expect(result.hasRespondsTo).toBe(true);
      expect(result.hasSupports).toBe(true);
      expect(result.hasContradicts).toBe(true);
      expect(result.strengthCount).toBe(2);
      expect(result.weaknessCount).toBe(1);
      expect(result.hasSuggestedNextTypes).toBe(true);
      expect(result.supports).toHaveLength(2);
      expect(result.contradicts).toHaveLength(1);
    });

    it('should handle high confidence arguments', () => {
      const input = {
        claim: 'Very well-established claim',
        premises: ['Strong evidence', 'Consensus agreement', 'Repeated validation'],
        conclusion: 'High-confidence conclusion',
        argumentType: 'thesis' as const,
        confidence: 1.0,
        nextArgumentNeeded: false
      };

      const result = server.process(input);

      expect(result.confidence).toBe(1.0);
      expect(result.nextArgumentNeeded).toBe(false);
    });

    it('should handle low confidence arguments', () => {
      const input = {
        claim: 'Speculative claim requiring investigation',
        premises: ['Limited preliminary evidence'],
        conclusion: 'Tentative conclusion',
        argumentType: 'thesis' as const,
        confidence: 0.1,
        nextArgumentNeeded: true
      };

      const result = server.process(input);

      expect(result.confidence).toBe(0.1);
      expect(result.nextArgumentNeeded).toBe(true);
    });

    it('should handle single premise arguments', () => {
      const input = {
        claim: 'Simple claim with single premise',
        premises: ['One strong premise'],
        conclusion: 'Direct conclusion',
        argumentType: 'thesis' as const,
        confidence: 0.8,
        nextArgumentNeeded: false
      };

      const result = server.process(input);

      expect(result.premiseCount).toBe(1);
      expect(result.premises).toEqual(['One strong premise']);
    });

    it('should handle multiple premise arguments', () => {
      const input = {
        claim: 'Complex claim with multiple supporting premises',
        premises: [
          'First supporting premise',
          'Second supporting premise',
          'Third supporting premise',
          'Fourth supporting premise',
          'Fifth supporting premise'
        ],
        conclusion: 'Well-supported conclusion',
        argumentType: 'thesis' as const,
        confidence: 0.9,
        nextArgumentNeeded: false
      };

      const result = server.process(input);

      expect(result.premiseCount).toBe(5);
      expect(result.premises).toHaveLength(5);
      expect(result.premises[0]).toBe('First supporting premise');
      expect(result.premises[4]).toBe('Fifth supporting premise');
    });

    it('should handle arguments responding to multiple sources', () => {
      const input = {
        claim: 'Response addressing multiple previous arguments',
        premises: ['Integrative premise'],
        conclusion: 'Synthesized conclusion',
        argumentType: 'synthesis' as const,
        confidence: 0.8,
        respondsTo: 'arg-001,arg-002,arg-003',
        supports: ['Common ground from all arguments'],
        nextArgumentNeeded: false
      };

      const result = server.process(input);

      expect(result.hasRespondsTo).toBe(true);
      expect(result.respondsTo).toBe('arg-001,arg-002,arg-003');
      expect(result.hasSupports).toBe(true);
    });

    it('should handle empty supports and contradicts arrays', () => {
      const input = {
        claim: 'Neutral argument',
        premises: ['Neutral premise'],
        conclusion: 'Neutral conclusion',
        argumentType: 'thesis' as const,
        confidence: 0.5,
        supports: [],
        contradicts: [],
        strengths: [],
        weaknesses: [],
        suggestedNextTypes: [],
        nextArgumentNeeded: false
      };

      const result = server.process(input);

      expect(result.hasSupports).toBe(false);
      expect(result.hasContradicts).toBe(false);
      expect(result.strengthCount).toBe(0);
      expect(result.weaknessCount).toBe(0);
      expect(result.hasSuggestedNextTypes).toBe(false);
    });

    it('should handle all suggested next argument types', () => {
      const allTypes: Array<'thesis' | 'antithesis' | 'synthesis' | 'objection' | 'rebuttal'> = [
        'thesis', 'antithesis', 'synthesis', 'objection', 'rebuttal'
      ];

      const input = {
        claim: 'Argument suggesting all possible next types',
        premises: ['Comprehensive premise'],
        conclusion: 'Open-ended conclusion',
        argumentType: 'synthesis' as const,
        confidence: 0.7,
        suggestedNextTypes: allTypes,
        nextArgumentNeeded: true
      };

      const result = server.process(input);

      expect(result.hasSuggestedNextTypes).toBe(true);
      expect(result.suggestedNextTypes).toHaveLength(5);
      expect(result.suggestedNextTypes).toEqual(allTypes);
    });

    it('should preserve long complex claims and conclusions', () => {
      const longClaim = 'This is a very long and complex claim that contains multiple sub-claims and qualifications, addressing various aspects of the problem domain including technical, social, economic, and ethical considerations that must all be carefully balanced in any comprehensive analysis of the situation';
      const longConclusion = 'Therefore, given all the evidence presented and the careful analysis of multiple perspectives, taking into account both the strengths and limitations of the available data, while recognizing the inherent uncertainties and potential for future developments to change the landscape, we can conclude with reasonable confidence that the proposed approach represents a balanced and pragmatic solution';

      const input = {
        claim: longClaim,
        premises: ['Long premise supporting the complex claim'],
        conclusion: longConclusion,
        argumentType: 'synthesis' as const,
        confidence: 0.75,
        nextArgumentNeeded: false
      };

      const result = server.process(input);

      expect(result.claim).toBe(longClaim);
      expect(result.conclusion).toBe(longConclusion);
      expect(result.hasConclusion).toBe(true);
    });
  });
});
