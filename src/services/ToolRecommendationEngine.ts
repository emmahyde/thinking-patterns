import { ToolRecommendation, ToolContext, CurrentStep } from '../interfaces/ThoughtData.js';

export class ToolRecommendationEngine {
  private toolDescriptions: Record<string, string> = {
    'mentalmodel': 'Structured thinking frameworks like first principles, opportunity cost analysis, and systematic problem decomposition',
    'debuggingapproach': 'Systematic debugging methods including binary search, divide and conquer, and cause elimination',
    'stochasticalgorithm': 'Probabilistic decision-making tools including MDPs, Monte Carlo methods, and Bayesian optimization',
    'collaborativereasoning': 'Multi-perspective problem solving with diverse viewpoints and stakeholder analysis',
    'decisionframework': 'Structured decision analysis with criteria evaluation and outcome modeling',
    'metacognitivemonitoring': 'Self-assessment of reasoning quality and knowledge gaps',
    'scientificmethod': 'Formal hypothesis testing and experimental validation',
    'structuredargumentation': 'Dialectical reasoning and systematic argument analysis',
    'visualreasoning': 'Diagram-based thinking and spatial problem solving'
  };

  private problemDomainMappings: Record<string, string[]> = {
    'technical': ['debuggingapproach', 'scientificmethod', 'mentalmodel'],
    'strategic': ['decisionframework', 'collaborativereasoning', 'stochasticalgorithm'],
    'research': ['scientificmethod', 'metacognitivemonitoring', 'mentalmodel'],
    'design': ['visualreasoning', 'collaborativereasoning', 'structuredargumentation'],
    'analysis': ['mentalmodel', 'debuggingapproach', 'metacognitivemonitoring']
  };

  public generateRecommendations(
    thought: string,
    thoughtNumber: number,
    totalThoughts: number,
    context: ToolContext
  ): ToolRecommendation[] {
    const recommendations: ToolRecommendation[] = [];
    const thoughtContent = thought.toLowerCase();

    // Analyze thought content for keywords and context
    const analysisResults = this.analyzeThoughtContent(thoughtContent);

    // Generate recommendations based on thinking stage
    const stageRecommendations = this.getStageBasedRecommendations(
      thoughtNumber,
      totalThoughts,
      analysisResults
    );

    // Generate domain-specific recommendations
    const domainRecommendations = this.getDomainSpecificRecommendations(
      context.problem_domain || 'general',
      analysisResults
    );

    // Combine and score recommendations
    const combinedRecommendations = this.combineRecommendations(
      stageRecommendations,
      domainRecommendations,
      context.available_tools
    );

    // Sort by confidence and return top recommendations
    return combinedRecommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  public generateCurrentStep(
    thought: string,
    thoughtNumber: number,
    totalThoughts: number,
    context: ToolContext
  ): CurrentStep {
    const recommendations = this.generateRecommendations(thought, thoughtNumber, totalThoughts, context);
    const analysisResults = this.analyzeThoughtContent(thought.toLowerCase());

    return {
      step_description: this.generateStepDescription(thought, thoughtNumber, totalThoughts),
      recommended_tools: recommendations,
      expected_outcome: this.generateExpectedOutcome(analysisResults, thoughtNumber, totalThoughts),
      next_step_conditions: this.generateNextStepConditions(analysisResults, thoughtNumber, totalThoughts),
      step_number: thoughtNumber,
      complexity_level: this.assessComplexity(analysisResults),
      estimated_duration: this.estimateDuration(analysisResults, recommendations.length)
    };
  }

  private analyzeThoughtContent(thought: string): {
    keywords: string[];
    intent: string;
    complexity: number;
    domain: string;
  } {
    const keywords = this.extractKeywords(thought);
    const intent = this.classifyIntent(thought, keywords);
    const complexity = this.assessContentComplexity(thought, keywords);
    const domain = this.inferDomain(keywords, intent);

    return { keywords, intent, complexity, domain };
  }

  private extractKeywords(thought: string): string[] {
    const problemKeywords = ['problem', 'issue', 'challenge', 'difficulty', 'error', 'bug'];
    const analysisKeywords = ['analyze', 'examine', 'investigate', 'research', 'study'];
    const decisionKeywords = ['decide', 'choose', 'select', 'option', 'alternative'];
    const planningKeywords = ['plan', 'strategy', 'approach', 'method', 'process'];
    const evaluationKeywords = ['evaluate', 'assess', 'measure', 'test', 'validate'];

    const allKeywords = [
      ...problemKeywords, ...analysisKeywords, ...decisionKeywords,
      ...planningKeywords, ...evaluationKeywords
    ];

    return allKeywords.filter(keyword => thought.includes(keyword));
  }

  private classifyIntent(thought: string, keywords: string[]): string {
    if (keywords.some(k => ['problem', 'issue', 'challenge'].includes(k))) return 'problem-identification';
    if (keywords.some(k => ['analyze', 'examine', 'research'].includes(k))) return 'analysis';
    if (keywords.some(k => ['decide', 'choose', 'select'].includes(k))) return 'decision-making';
    if (keywords.some(k => ['plan', 'strategy', 'approach'].includes(k))) return 'planning';
    if (keywords.some(k => ['evaluate', 'assess', 'test'].includes(k))) return 'evaluation';
    return 'exploration';
  }

  private assessContentComplexity(thought: string, keywords: string[]): number {
    let complexity = 0.5; // Base complexity

    // Length factor
    if (thought.length > 200) complexity += 0.2;
    if (thought.length > 500) complexity += 0.2;

    // Keyword density factor
    complexity += Math.min(keywords.length * 0.1, 0.3);

    // Technical terms factor
    const technicalTerms = ['algorithm', 'system', 'architecture', 'implementation', 'optimization'];
    if (technicalTerms.some(term => thought.includes(term))) complexity += 0.2;

    return Math.min(complexity, 1.0);
  }

  private inferDomain(keywords: string[], intent: string): string {
    const technicalIndicators = ['bug', 'error', 'system', 'algorithm', 'implementation'];
    const strategicIndicators = ['strategy', 'plan', 'decision', 'option', 'business'];
    const researchIndicators = ['research', 'study', 'investigate', 'analyze'];

    if (technicalIndicators.some(ind => keywords.includes(ind))) return 'technical';
    if (strategicIndicators.some(ind => keywords.includes(ind))) return 'strategic';
    if (researchIndicators.some(ind => keywords.includes(ind))) return 'research';

    return 'general';
  }

  private getStageBasedRecommendations(
    thoughtNumber: number,
    totalThoughts: number,
    analysis: any
  ): ToolRecommendation[] {
    const stage = this.determineThinkingStage(thoughtNumber, totalThoughts);
    const recommendations: ToolRecommendation[] = [];

    switch (stage) {
      case 'initial':
        recommendations.push({
          tool_name: 'mentalmodel',
          confidence: 0.8,
          rationale: 'Mental models help structure initial problem understanding and break down complex issues',
          priority: 1,
          alternative_tools: ['debuggingapproach']
        });
        if (analysis.intent === 'problem-identification') {
          recommendations.push({
            tool_name: 'debuggingapproach',
            confidence: 0.7,
            rationale: 'Debugging approaches provide systematic methods for identifying root causes',
            priority: 2
          });
        }
        break;

      case 'middle':
        if (analysis.intent === 'analysis') {
          recommendations.push({
            tool_name: 'scientificmethod',
            confidence: 0.8,
            rationale: 'Scientific method provides rigorous analysis framework for mid-stage investigation',
            priority: 1
          });
        }
        recommendations.push({
          tool_name: 'metacognitivemonitoring',
          confidence: 0.6,
          rationale: 'Monitor reasoning quality and identify knowledge gaps during analysis',
          priority: 3
        });
        break;

      case 'final':
        recommendations.push({
          tool_name: 'decisionframework',
          confidence: 0.9,
          rationale: 'Decision frameworks help evaluate options and make final choices',
          priority: 1
        });
        if (analysis.domain === 'strategic') {
          recommendations.push({
            tool_name: 'collaborativereasoning',
            confidence: 0.7,
            rationale: 'Multiple perspectives validate final decisions and identify blind spots',
            priority: 2
          });
        }
        break;
    }

    return recommendations;
  }

  private getDomainSpecificRecommendations(
    domain: string,
    analysis: any
  ): ToolRecommendation[] {
    const domainTools = this.problemDomainMappings[domain] || [];
    const recommendations: ToolRecommendation[] = [];

    domainTools.forEach((tool, index) => {
      let confidence = 0.6 - (index * 0.1); // Decrease confidence for lower priority tools
      let rationale = this.generateDomainRationale(tool, domain, analysis);

      // Boost confidence based on analysis results
      if (this.toolMatchesAnalysis(tool, analysis)) {
        confidence += 0.2;
      }

      recommendations.push({
        tool_name: tool,
        confidence: Math.min(confidence, 1.0),
        rationale,
        priority: index + 1
      });
    });

    return recommendations;
  }

  private combineRecommendations(
    stageRecs: ToolRecommendation[],
    domainRecs: ToolRecommendation[],
    availableTools: string[]
  ): ToolRecommendation[] {
    const combined = new Map<string, ToolRecommendation>();

    // Add stage-based recommendations
    stageRecs.forEach(rec => {
      if (availableTools.includes(rec.tool_name)) {
        combined.set(rec.tool_name, rec);
      }
    });

    // Merge domain-based recommendations
    domainRecs.forEach(rec => {
      if (availableTools.includes(rec.tool_name)) {
        const existing = combined.get(rec.tool_name);
        if (existing) {
          // Combine confidence scores and rationales
          existing.confidence = Math.min((existing.confidence + rec.confidence) / 2 + 0.1, 1.0);
          existing.rationale = `${existing.rationale}; ${rec.rationale}`;
        } else {
          combined.set(rec.tool_name, rec);
        }
      }
    });

    return Array.from(combined.values());
  }

  private determineThinkingStage(thoughtNumber: number, totalThoughts: number): string {
    const progress = thoughtNumber / totalThoughts;
    if (progress <= 0.3) return 'initial';
    if (progress >= 0.7) return 'final';
    return 'middle';
  }

  private toolMatchesAnalysis(toolName: string, analysis: any): boolean {
    const toolIntentMap: Record<string, string[]> = {
      'debuggingapproach': ['problem-identification'],
      'scientificmethod': ['analysis', 'evaluation'],
      'decisionframework': ['decision-making'],
      'mentalmodel': ['exploration', 'problem-identification'],
      'collaborativereasoning': ['planning', 'decision-making']
    };

    const matchingIntents = toolIntentMap[toolName] || [];
    return matchingIntents.includes(analysis.intent);
  }

  private generateDomainRationale(toolName: string, domain: string, analysis: any): string {
    const baseDescription = this.toolDescriptions[toolName] || 'Tool for systematic analysis';
    const domainContext = `Particularly effective for ${domain} domain problems`;
    return `${baseDescription}. ${domainContext}`;
  }

  private generateStepDescription(thought: string, thoughtNumber: number, totalThoughts: number): string {
    const stage = this.determineThinkingStage(thoughtNumber, totalThoughts);
    const stageDescriptions = {
      'initial': 'Initial problem analysis and framework establishment',
      'middle': 'Deep analysis and systematic investigation',
      'final': 'Solution synthesis and decision formulation'
    };

    return `${stageDescriptions[stage]} (Step ${thoughtNumber}/${totalThoughts})`;
  }

  private generateExpectedOutcome(analysis: any, thoughtNumber: number, totalThoughts: number): string {
    const stage = this.determineThinkingStage(thoughtNumber, totalThoughts);

    switch (stage) {
      case 'initial':
        return 'Clear problem definition and analytical framework';
      case 'middle':
        return 'Detailed analysis results and validated insights';
      case 'final':
        return 'Concrete solution or decision with supporting rationale';
      default:
        return 'Progressive understanding and actionable insights';
    }
  }

  private generateNextStepConditions(analysis: any, thoughtNumber: number, totalThoughts: number): string[] {
    const stage = this.determineThinkingStage(thoughtNumber, totalThoughts);

    switch (stage) {
      case 'initial':
        return [
          'Problem scope clearly defined',
          'Key variables identified',
          'Analysis approach selected'
        ];
      case 'middle':
        return [
          'Sufficient data gathered',
          'Analysis methods validated',
          'Initial hypotheses tested'
        ];
      case 'final':
        return [
          'All options evaluated',
          'Decision criteria met',
          'Implementation plan outlined'
        ];
      default:
        return ['Current step objectives achieved'];
    }
  }

  private assessComplexity(analysis: any): 'low' | 'medium' | 'high' {
    if (analysis.complexity < 0.4) return 'low';
    if (analysis.complexity < 0.7) return 'medium';
    return 'high';
  }

  private estimateDuration(analysis: any, toolCount: number): string {
    const baseTime = 5; // minutes
    const complexityMultiplier = {
      'low': 1,
      'medium': 1.5,
      'high': 2.5
    };

    const complexity = this.assessComplexity(analysis);
    const toolMultiplier = 1 + (toolCount * 0.3);

    const estimatedMinutes = baseTime * complexityMultiplier[complexity] * toolMultiplier;

    if (estimatedMinutes < 10) return '5-10 minutes';
    if (estimatedMinutes < 30) return '15-30 minutes';
    if (estimatedMinutes < 60) return '30-60 minutes';
    return '1+ hours';
  }
}
