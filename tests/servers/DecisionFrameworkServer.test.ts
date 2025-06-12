import { DecisionFrameworkServer } from '../../src/servers/DecisionFrameworkServer.js';

describe('DecisionFrameworkServer', () => {
  let server: DecisionFrameworkServer;

  beforeEach(() => {
    server = new DecisionFrameworkServer();
  });

  describe('process', () => {
    it('should process complete decision framework data correctly', () => {
      const input = {
        decisionStatement: 'Choose the best cloud provider for our application',
        decisionId: 'cloud-decision-001',
        analysisType: 'multi-criteria' as const,
        stage: 'evaluation' as const,
        iteration: 2,
        nextStageNeeded: true,
        options: [
          {
            id: 'aws',
            name: 'Amazon Web Services',
            description: 'Comprehensive cloud platform with extensive services'
          },
          {
            id: 'azure',
            name: 'Microsoft Azure',
            description: 'Enterprise-focused cloud platform with strong hybrid capabilities'
          },
          {
            id: 'gcp',
            name: 'Google Cloud Platform',
            description: 'Data and AI-focused cloud platform with competitive pricing'
          }
        ],
        criteria: [
          {
            id: 'cost',
            name: 'Cost',
            description: 'Total cost of ownership including compute, storage, and data transfer',
            weight: 0.3,
            evaluationMethod: 'quantitative' as const
          },
          {
            id: 'performance',
            name: 'Performance',
            description: 'Latency, throughput, and reliability metrics',
            weight: 0.25,
            evaluationMethod: 'quantitative' as const
          },
          {
            id: 'security',
            name: 'Security',
            description: 'Security features, compliance, and data protection',
            weight: 0.25,
            evaluationMethod: 'qualitative' as const
          },
          {
            id: 'integration',
            name: 'Integration',
            description: 'Ease of integration with existing systems',
            weight: 0.2,
            evaluationMethod: 'qualitative' as const
          }
        ],
        criteriaEvaluations: [
          {
            criterionId: 'cost',
            optionId: 'aws',
            score: 0.7,
            justification: 'Competitive pricing with reserved instances'
          },
          {
            criterionId: 'cost',
            optionId: 'azure',
            score: 0.8,
            justification: 'Good enterprise pricing and hybrid cost benefits'
          },
          {
            criterionId: 'cost',
            optionId: 'gcp',
            score: 0.9,
            justification: 'Most competitive pricing for our workload'
          }
        ],
        stakeholders: ['Engineering Team', 'Finance Department', 'Security Team'],
        constraints: ['Budget under $10K/month', 'GDPR compliance required'],
        timeHorizon: '3 years',
        riskTolerance: 'risk-neutral' as const
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.decisionStatement).toBe('Choose the best cloud provider for our application');
      expect(result.decisionId).toBe('cloud-decision-001');
      expect(result.analysisType).toBe('multi-criteria');
      expect(result.stage).toBe('evaluation');
      expect(result.iteration).toBe(2);
      expect(result.nextStageNeeded).toBe(true);
      expect(result.optionCount).toBe(3);
      expect(result.criteriaCount).toBe(4);
      expect(result.hasStakeholders).toBe(true);
      expect(result.hasConstraints).toBe(true);
      expect(result.hasTimeHorizon).toBe(true);
      expect(result.hasRiskTolerance).toBe(true);
      expect(result.hasCriteriaEvaluations).toBe(true);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle minimal decision framework data', () => {
      const input = {
        decisionStatement: 'Simple binary choice',
        decisionId: 'simple-decision-001',
        analysisType: 'expected-utility' as const,
        stage: 'problem-definition' as const,
        iteration: 1,
        nextStageNeeded: true,
        options: [
          {
            id: 'option-a',
            name: 'Option A',
            description: 'First choice'
          },
          {
            id: 'option-b',
            name: 'Option B',
            description: 'Second choice'
          }
        ]
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.decisionStatement).toBe('Simple binary choice');
      expect(result.analysisType).toBe('expected-utility');
      expect(result.stage).toBe('problem-definition');
      expect(result.optionCount).toBe(2);
      expect(result.criteriaCount).toBe(0);
      expect(result.hasStakeholders).toBe(false);
      expect(result.hasConstraints).toBe(false);
    });

    it('should handle expected utility analysis', () => {
      const input = {
        decisionStatement: 'Investment decision with uncertainty',
        decisionId: 'investment-decision-001',
        analysisType: 'expected-utility' as const,
        stage: 'analysis' as const,
        iteration: 3,
        nextStageNeeded: true,
        options: [
          {
            id: 'conservative',
            name: 'Conservative Investment',
            description: 'Low risk, low return investment'
          },
          {
            id: 'aggressive',
            name: 'Aggressive Investment',
            description: 'High risk, high return investment'
          }
        ],
        possibleOutcomes: [
          {
            id: 'market-up',
            description: 'Market performs well',
            probability: 0.6,
            value: 15000,
            optionId: 'aggressive',
            confidenceInEstimate: 0.8
          },
          {
            id: 'market-down',
            description: 'Market performs poorly',
            probability: 0.4,
            value: -5000,
            optionId: 'aggressive',
            confidenceInEstimate: 0.7
          },
          {
            id: 'conservative-outcome',
            description: 'Stable conservative return',
            probability: 0.9,
            value: 3000,
            optionId: 'conservative',
            confidenceInEstimate: 0.95
          }
        ],
        riskTolerance: 'risk-averse' as const
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.analysisType).toBe('expected-utility');
      expect(result.riskTolerance).toBe('risk-averse');
      expect(result.hasPossibleOutcomes).toBe(true);
    });

    it('should handle decision with information gaps', () => {
      const input = {
        decisionStatement: 'Technology adoption with uncertainties',
        decisionId: 'tech-adoption-001',
        analysisType: 'maximin' as const,
        stage: 'evaluation' as const,
        iteration: 2,
        nextStageNeeded: true,
        options: [
          {
            id: 'new-tech',
            name: 'New Technology',
            description: 'Cutting-edge but unproven technology'
          },
          {
            id: 'current-tech',
            name: 'Current Technology',
            description: 'Proven but potentially outdated technology'
          }
        ],
        informationGaps: [
          {
            description: 'Long-term support and maintenance costs for new technology',
            impact: 0.8,
            researchMethod: 'Vendor interviews and case studies'
          },
          {
            description: 'Market adoption rate and ecosystem development',
            impact: 0.6,
            researchMethod: 'Industry reports and trend analysis'
          }
        ]
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.analysisType).toBe('maximin');
      expect(result.hasInformationGaps).toBe(true);
      expect(result.informationGaps).toHaveLength(2);
    });

    it('should handle recommendation stage', () => {
      const input = {
        decisionStatement: 'Final recommendation for hiring platform',
        decisionId: 'hiring-platform-001',
        analysisType: 'multi-criteria' as const,
        stage: 'recommendation' as const,
        iteration: 4,
        nextStageNeeded: false,
        options: [
          {
            id: 'platform-a',
            name: 'Platform A',
            description: 'Comprehensive HR platform'
          },
          {
            id: 'platform-b',
            name: 'Platform B',
            description: 'Lightweight recruiting tool'
          }
        ],
        recommendation: 'Choose Platform A due to superior integration capabilities and long-term scalability',
        sensitivityInsights: [
          'Decision is robust across different weight assignments',
          'Platform A maintains advantage even with 20% cost increase'
        ]
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.stage).toBe('recommendation');
      expect(result.nextStageNeeded).toBe(false);
      expect(result.hasRecommendation).toBe(true);
      expect(result.hasSensitivityInsights).toBe(true);
      expect(result.recommendation).toContain('Platform A');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null input', () => {
      const response = server.run(null);
      expect(response.isError).toBe(true);
    });

    it('should handle undefined input', () => {
      const response = server.run(undefined);
      expect(response.isError).toBe(true);
    });

    it('should handle empty object input', () => {
      const response = server.run({});
      expect(response.isError).toBe(true);
    });

    it('should handle missing required fields', () => {
      const incompleteInput = {
        decisionStatement: 'Test decision'
        // Missing required fields
      };

      const response = server.run(incompleteInput);
      expect(response.isError).toBe(true);
    });

    it('should handle invalid analysis type', () => {
      const invalidInput = {
        decisionStatement: 'Test decision',
        decisionId: 'test-001',
        analysisType: 'invalid-type',
        stage: 'analysis',
        iteration: 1,
        nextStageNeeded: true,
        options: []
      };

      const response = server.run(invalidInput);
      expect(response.isError).toBe(true);
    });

    it('should handle invalid stage', () => {
      const invalidInput = {
        decisionStatement: 'Test decision',
        decisionId: 'test-001',
        analysisType: 'multi-criteria',
        stage: 'invalid-stage',
        iteration: 1,
        nextStageNeeded: true,
        options: []
      };

      const response = server.run(invalidInput);
      expect(response.isError).toBe(true);
    });
  });

  describe('output formatting', () => {
    it('should return properly formatted JSON content', () => {
      const input = {
        decisionStatement: 'Test decision',
        decisionId: 'test-001',
        analysisType: 'multi-criteria' as const,
        stage: 'analysis' as const,
        iteration: 1,
        nextStageNeeded: true,
        options: [
          {
            id: 'option-1',
            name: 'Option 1',
            description: 'First option'
          }
        ]
      };

      const response = server.run(input);

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(() => JSON.parse(response.content[0].text)).not.toThrow();

      const parsedContent = JSON.parse(response.content[0].text);
      expect(parsedContent.status).toBe('success');
      expect(parsedContent.decisionStatement).toBe('Test decision');
      expect(parsedContent.decisionId).toBe('test-001');
      expect(parsedContent.analysisType).toBe('multi-criteria');
      expect(parsedContent.optionCount).toBe(1);
      expect(parsedContent.timestamp).toBeDefined();
    });
  });

  describe('analysis types', () => {
    it('should handle satisficing analysis', () => {
      const input = {
        decisionStatement: 'Find acceptable solution quickly',
        decisionId: 'satisficing-001',
        analysisType: 'satisficing' as const,
        stage: 'analysis' as const,
        iteration: 1,
        nextStageNeeded: true,
        options: [
          {
            id: 'quick-fix',
            name: 'Quick Fix',
            description: 'Fast implementation, meets minimum requirements'
          },
          {
            id: 'optimal',
            name: 'Optimal Solution',
            description: 'Best possible solution but takes longer'
          }
        ]
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.analysisType).toBe('satisficing');
    });

    it('should handle minimax-regret analysis', () => {
      const input = {
        decisionStatement: 'Minimize worst-case regret',
        decisionId: 'minimax-regret-001',
        analysisType: 'minimax-regret' as const,
        stage: 'analysis' as const,
        iteration: 1,
        nextStageNeeded: true,
        options: [
          {
            id: 'conservative',
            name: 'Conservative Choice',
            description: 'Safe option with limited upside'
          },
          {
            id: 'aggressive',
            name: 'Aggressive Choice',
            description: 'Risky option with high potential'
          }
        ]
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.analysisType).toBe('minimax-regret');
    });
  });
}); 