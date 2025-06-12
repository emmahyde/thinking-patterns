import { MetacognitiveMonitoringServer } from '../../src/servers/MetacognitiveMonitoringServer.js';

describe('MetacognitiveMonitoringServer', () => {
  let server: MetacognitiveMonitoringServer;

  beforeEach(() => {
    server = new MetacognitiveMonitoringServer();
  });

  describe('process', () => {
    it('should process valid metacognitive monitoring data correctly', () => {
      const input = {
        task: 'Analyze market trends for product strategy',
        stage: 'knowledge-assessment' as const,
        overallConfidence: 0.75,
        uncertaintyAreas: ['Market volatility', 'Competitor response'],
        recommendedApproach: 'Gather more market research data',
        monitoringId: 'meta-001',
        iteration: 1,
        nextAssessmentNeeded: true
      };

      const result = server.process(input);

      expect(result.task).toBe('Analyze market trends for product strategy');
      expect(result.stage).toBe('knowledge-assessment');
      expect(result.overallConfidence).toBe(0.75);
      expect(result.uncertaintyAreas).toEqual(['Market volatility', 'Competitor response']);
      expect(result.recommendedApproach).toBe('Gather more market research data');
      expect(result.monitoringId).toBe('meta-001');
      expect(result.iteration).toBe(1);
      expect(result.nextAssessmentNeeded).toBe(true);
      expect(result.status).toBe('success');
      expect(result.uncertaintyAreaCount).toBe(2);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle complete monitoring with all optional fields', () => {
      const input = {
        task: 'Develop AI strategy for company',
        stage: 'evaluation' as const,
        overallConfidence: 0.85,
        uncertaintyAreas: ['Technical feasibility', 'Regulatory compliance'],
        recommendedApproach: 'Conduct technical proof of concept',
        monitoringId: 'meta-002',
        iteration: 3,
        nextAssessmentNeeded: false,
        knowledgeAssessment: {
          domain: 'Artificial Intelligence',
          knowledgeLevel: 'proficient' as const,
          confidenceScore: 0.8,
          supportingEvidence: 'Multiple AI projects completed successfully',
          knownLimitations: ['Limited experience with regulatory frameworks', 'Uncertainty about emerging technologies'],
          relevantTrainingCutoff: '2024-01'
        },
        claims: [
          {
            claim: 'AI will significantly improve operational efficiency',
            status: 'inference' as const,
            confidenceScore: 0.9,
            evidenceBasis: 'Industry case studies and pilot results',
            falsifiabilityCriteria: 'Measurable efficiency metrics over 6 months',
            alternativeInterpretations: ['Efficiency gains may be offset by implementation costs']
          }
        ],
        reasoningSteps: [
          {
            step: 'Analyzed current operational bottlenecks',
            potentialBiases: ['Confirmation bias', 'Availability heuristic'],
            assumptions: ['Current processes remain stable', 'Staff will adapt to AI tools'],
            logicalValidity: 0.85,
            inferenceStrength: 0.8
          }
        ],
        suggestedAssessments: ['knowledge' as const, 'reasoning' as const],
        previousSteps: ['Initial market analysis', 'Stakeholder interviews'],
        remainingSteps: ['Technical validation', 'Implementation planning'],
        toolUsageHistory: [
          {
            toolName: 'market-analysis',
            usedAt: '2024-01-15T10:00:00Z',
            effectivenessScore: 0.85
          }
        ]
      };

      const result = server.process(input);

      expect(result.hasKnowledgeAssessment).toBe(true);
      expect(result.claimCount).toBe(1);
      expect(result.reasoningStepCount).toBe(1);
      expect(result.hasSuggestedAssessments).toBe(true);
      expect(result.hasPreviousSteps).toBe(true);
      expect(result.hasRemainingSteps).toBe(true);
      expect(result.hasToolUsageHistory).toBe(true);
      expect(result.knowledgeAssessment?.domain).toBe('Artificial Intelligence');
      expect(result.claims?.[0].claim).toBe('AI will significantly improve operational efficiency');
      expect(result.reasoningSteps?.[0].logicalValidity).toBe(0.85);
    });

    it('should handle planning stage with multiple reasoning steps', () => {
      const input = {
        task: 'Design new product architecture',
        stage: 'planning' as const,
        overallConfidence: 0.6,
        uncertaintyAreas: ['Scalability requirements', 'Technology stack selection', 'Team capacity'],
        recommendedApproach: 'Create multiple architecture prototypes for evaluation',
        monitoringId: 'arch-plan-001',
        iteration: 2,
        nextAssessmentNeeded: true,
        reasoningSteps: [
          {
            step: 'Evaluated microservices vs monolithic architecture',
            potentialBiases: ['Bandwagon effect favoring microservices'],
            assumptions: ['Team has microservices experience', 'Infrastructure supports container orchestration'],
            logicalValidity: 0.7,
            inferenceStrength: 0.75
          },
          {
            step: 'Assessed database requirements and scaling patterns',
            potentialBiases: ['Anchoring on previous database choices'],
            assumptions: ['Data growth follows historical patterns', 'Query patterns remain similar'],
            logicalValidity: 0.8,
            inferenceStrength: 0.85
          }
        ],
        claims: [
          {
            claim: 'Microservices will improve system maintainability',
            status: 'speculation' as const,
            confidenceScore: 0.65,
            evidenceBasis: 'Industry best practices and team discussions'
          },
          {
            claim: 'Current database can handle projected load',
            status: 'uncertain' as const,
            confidenceScore: 0.4,
            evidenceBasis: 'Limited load testing data'
          }
        ]
      };

      const result = server.process(input);

      expect(result.stage).toBe('planning');
      expect(result.reasoningStepCount).toBe(2);
      expect(result.claimCount).toBe(2);
      expect(result.overallConfidence).toBe(0.6);
      expect(result.reasoningSteps?.[0].step).toBe('Evaluated microservices vs monolithic architecture');
      expect(result.claims?.[1].status).toBe('uncertain');
    });

    it('should handle monitoring stage with tool usage history', () => {
      const input = {
        task: 'Monitor system performance optimization',
        stage: 'monitoring' as const,
        overallConfidence: 0.9,
        uncertaintyAreas: ['Edge case scenarios'],
        recommendedApproach: 'Continue monitoring with increased logging',
        monitoringId: 'perf-monitor-001',
        iteration: 5,
        nextAssessmentNeeded: false,
        toolUsageHistory: [
          {
            toolName: 'performance-profiler',
            usedAt: '2024-01-10T09:00:00Z',
            effectivenessScore: 0.95
          },
          {
            toolName: 'load-tester',
            usedAt: '2024-01-10T11:00:00Z',
            effectivenessScore: 0.88
          },
          {
            toolName: 'log-analyzer',
            usedAt: '2024-01-10T14:00:00Z',
            effectivenessScore: 0.82
          }
        ],
        previousSteps: ['Baseline performance measurement', 'Optimization identification', 'Implementation of changes'],
        remainingSteps: ['Final validation', 'Documentation update']
      };

      const result = server.process(input);

      expect(result.stage).toBe('monitoring');
      expect(result.hasToolUsageHistory).toBe(true);
      expect(result.toolUsageHistory).toHaveLength(3);
      expect(result.toolUsageHistory?.[0].effectivenessScore).toBe(0.95);
      expect(result.hasPreviousSteps).toBe(true);
      expect(result.hasRemainingSteps).toBe(true);
    });

    it('should handle knowledge assessment with expert level', () => {
      const input = {
        task: 'Security audit of cloud infrastructure',
        stage: 'knowledge-assessment' as const,
        overallConfidence: 0.95,
        uncertaintyAreas: ['New threat vectors'],
        recommendedApproach: 'Proceed with comprehensive audit',
        monitoringId: 'sec-audit-001',
        iteration: 1,
        nextAssessmentNeeded: false,
        knowledgeAssessment: {
          domain: 'Cloud Security',
          knowledgeLevel: 'expert' as const,
          confidenceScore: 0.95,
          supportingEvidence: '10+ years cloud security experience, certified in multiple cloud platforms',
          knownLimitations: ['Limited experience with newest serverless security patterns'],
          relevantTrainingCutoff: '2024-01'
        }
      };

      const result = server.process(input);

      expect(result.hasKnowledgeAssessment).toBe(true);
      expect(result.knowledgeAssessment?.knowledgeLevel).toBe('expert');
      expect(result.knowledgeAssessment?.confidenceScore).toBe(0.95);
      expect(result.overallConfidence).toBe(0.95);
    });

    it('should handle reflection stage with comprehensive analysis', () => {
      const input = {
        task: 'Post-project retrospective analysis',
        stage: 'reflection' as const,
        overallConfidence: 0.8,
        uncertaintyAreas: ['Long-term impact assessment', 'Unforeseen consequences'],
        recommendedApproach: 'Document lessons learned and update processes',
        monitoringId: 'retro-001',
        iteration: 1,
        nextAssessmentNeeded: false,
        claims: [
          {
            claim: 'Project met all success criteria',
            status: 'fact' as const,
            confidenceScore: 1.0,
            evidenceBasis: 'Documented metrics and stakeholder feedback'
          },
          {
            claim: 'Team velocity improved due to new processes',
            status: 'inference' as const,
            confidenceScore: 0.85,
            evidenceBasis: 'Sprint velocity metrics and team surveys'
          }
        ],
        reasoningSteps: [
          {
            step: 'Analyzed project success metrics against initial goals',
            potentialBiases: ['Hindsight bias', 'Success attribution bias'],
            assumptions: ['Metrics accurately reflect reality', 'Goals were appropriate'],
            logicalValidity: 0.9,
            inferenceStrength: 0.95
          }
        ],
        suggestedAssessments: ['overall' as const]
      };

      const result = server.process(input);

      expect(result.stage).toBe('reflection');
      expect(result.claimCount).toBe(2);
      expect(result.claims?.[0].status).toBe('fact');
      expect(result.claims?.[1].status).toBe('inference');
      expect(result.reasoningStepCount).toBe(1);
      expect(result.hasSuggestedAssessments).toBe(true);
    });

    // Edge cases and validation tests
    it('should handle empty uncertainty areas array', () => {
      const input = {
        task: 'Simple task with high confidence',
        stage: 'execution' as const,
        overallConfidence: 0.99,
        uncertaintyAreas: [],
        recommendedApproach: 'Proceed as planned',
        monitoringId: 'simple-001',
        iteration: 1,
        nextAssessmentNeeded: false
      };

      const result = server.process(input);

      expect(result.uncertaintyAreaCount).toBe(0);
      expect(result.uncertaintyAreas).toEqual([]);
    });

    it('should handle minimal knowledge level assessment', () => {
      const input = {
        task: 'Learn new programming language',
        stage: 'knowledge-assessment' as const,
        overallConfidence: 0.2,
        uncertaintyAreas: ['Syntax', 'Best practices', 'Ecosystem'],
        recommendedApproach: 'Start with tutorials and basic examples',
        monitoringId: 'learn-001',
        iteration: 1,
        nextAssessmentNeeded: true,
        knowledgeAssessment: {
          domain: 'Rust Programming',
          knowledgeLevel: 'minimal' as const,
          confidenceScore: 0.15,
          supportingEvidence: 'Only read documentation, no hands-on experience',
          knownLimitations: ['No practical experience', 'Unfamiliar with memory management concepts']
        }
      };

      const result = server.process(input);

      expect(result.knowledgeAssessment?.knowledgeLevel).toBe('minimal');
      expect(result.knowledgeAssessment?.confidenceScore).toBe(0.15);
      expect(result.overallConfidence).toBe(0.2);
    });

    it('should handle multiple claim statuses', () => {
      const input = {
        task: 'Research new market opportunity',
        stage: 'evaluation' as const,
        overallConfidence: 0.7,
        uncertaintyAreas: ['Market size', 'Competitive landscape'],
        recommendedApproach: 'Conduct primary market research',
        monitoringId: 'market-research-001',
        iteration: 2,
        nextAssessmentNeeded: true,
        claims: [
          {
            claim: 'Market size is $10B globally',
            status: 'fact' as const,
            confidenceScore: 0.95,
            evidenceBasis: 'Published industry reports from multiple sources'
          },
          {
            claim: 'Our solution will capture 5% market share',
            status: 'speculation' as const,
            confidenceScore: 0.3,
            evidenceBasis: 'Optimistic projections based on limited data'
          },
          {
            claim: 'Competitors have similar technology capabilities',
            status: 'inference' as const,
            confidenceScore: 0.75,
            evidenceBasis: 'Analysis of public information and product demos'
          },
          {
            claim: 'Regulatory approval timeline is unclear',
            status: 'uncertain' as const,
            confidenceScore: 0.1,
            evidenceBasis: 'Limited precedent for this type of product'
          }
        ]
      };

      const result = server.process(input);

      expect(result.claimCount).toBe(4);
      expect(result.claims?.map(c => c.status)).toEqual(['fact', 'speculation', 'inference', 'uncertain']);
      expect(result.claims?.[0].confidenceScore).toBe(0.95);
      expect(result.claims?.[3].confidenceScore).toBe(0.1);
    });

    it('should handle all knowledge levels', () => {
      const knowledgeLevels = ['expert', 'proficient', 'familiar', 'basic', 'minimal', 'none'] as const;
      
      knowledgeLevels.forEach((level, index) => {
        const input = {
          task: `Task requiring ${level} knowledge`,
          stage: 'knowledge-assessment' as const,
          overallConfidence: 0.5,
          uncertaintyAreas: ['Domain expertise'],
          recommendedApproach: 'Assess and improve knowledge',
          monitoringId: `knowledge-${index}`,
          iteration: 1,
          nextAssessmentNeeded: true,
          knowledgeAssessment: {
            domain: 'Test Domain',
            knowledgeLevel: level,
            confidenceScore: 0.5,
            supportingEvidence: `Evidence for ${level} level`,
            knownLimitations: [`Limitations at ${level} level`]
          }
        };

        const result = server.process(input);
        expect(result.knowledgeAssessment?.knowledgeLevel).toBe(level);
      });
    });

    it('should handle all monitoring stages', () => {
      const stages = ['knowledge-assessment', 'planning', 'execution', 'monitoring', 'evaluation', 'reflection'] as const;
      
      stages.forEach((stage, index) => {
        const input = {
          task: `Task in ${stage} stage`,
          stage: stage,
          overallConfidence: 0.5,
          uncertaintyAreas: ['Test uncertainty'],
          recommendedApproach: 'Test approach',
          monitoringId: `stage-${index}`,
          iteration: 1,
          nextAssessmentNeeded: true
        };

        const result = server.process(input);
        expect(result.stage).toBe(stage);
      });
    });

    it('should handle all suggested assessment types', () => {
      const input = {
        task: 'Comprehensive assessment task',
        stage: 'evaluation' as const,
        overallConfidence: 0.5,
        uncertaintyAreas: ['Multiple areas'],
        recommendedApproach: 'Comprehensive evaluation',
        monitoringId: 'comprehensive-001',
        iteration: 1,
        nextAssessmentNeeded: true,
        suggestedAssessments: ['knowledge' as const, 'claim' as const, 'reasoning' as const, 'overall' as const]
      };

      const result = server.process(input);

      expect(result.hasSuggestedAssessments).toBe(true);
      expect(result.suggestedAssessments).toEqual(['knowledge', 'claim', 'reasoning', 'overall']);
    });

    it('should handle optional fields being undefined', () => {
      const input = {
        task: 'Minimal task',
        stage: 'execution' as const,
        overallConfidence: 0.8,
        uncertaintyAreas: ['Minor uncertainty'],
        recommendedApproach: 'Proceed',
        monitoringId: 'minimal-001',
        iteration: 1,
        nextAssessmentNeeded: false
      };

      const result = server.process(input);

      expect(result.hasKnowledgeAssessment).toBe(false);
      expect(result.claimCount).toBe(0);
      expect(result.reasoningStepCount).toBe(0);
      expect(result.hasSuggestedAssessments).toBe(false);
      expect(result.hasPreviousSteps).toBe(false);
      expect(result.hasRemainingSteps).toBe(false);
      expect(result.hasToolUsageHistory).toBe(false);
    });

    it('should handle high iteration numbers', () => {
      const input = {
        task: 'Long-running iterative task',
        stage: 'monitoring' as const,
        overallConfidence: 0.95,
        uncertaintyAreas: [],
        recommendedApproach: 'Continue monitoring',
        monitoringId: 'long-running-001',
        iteration: 50,
        nextAssessmentNeeded: false
      };

      const result = server.process(input);

      expect(result.iteration).toBe(50);
      expect(result.nextAssessmentNeeded).toBe(false);
    });
  });
}); 