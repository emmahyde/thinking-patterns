import { BaseToolServer } from '../base/BaseToolServer.js';
import { DecisionFrameworkSchema, DecisionFrameworkData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Decision Framework Server using clear-thought tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class DecisionFrameworkServer extends BaseToolServer<DecisionFrameworkData, any> {
  constructor() {
    super(DecisionFrameworkSchema);
  }

  protected handle(validInput: DecisionFrameworkData): any {
    return this.process(validInput);
  }

  /**
   * Standardized process method for decision framework
   * @param validInput - Validated decision framework data
   * @returns Processed decision framework result
   */
  public process(validInput: DecisionFrameworkData): any {
    // Format output using boxed utility
    const formattedOutput = this.formatDecisionOutput(validInput);

    // Log formatted output to console
    console.error(formattedOutput);

    return {
      decisionStatement: validInput.decisionStatement,
      decisionId: validInput.decisionId,
      analysisType: validInput.analysisType,
      stage: validInput.stage,
      iteration: validInput.iteration,
      nextStageNeeded: validInput.nextStageNeeded,
      status: 'success',
      optionCount: validInput.options.length,
      criteriaCount: validInput.criteria?.length ?? 0,
      hasRecommendation: !!validInput.recommendation,
      timestamp: new Date().toISOString(),
      framework: 'clear-thought-tools'
    };
  }

  private formatDecisionOutput(data: DecisionFrameworkData): string {
    const sections: Record<string, string | string[]> = {
      'Decision': data.decisionStatement,
      'Analysis Type': data.analysisType.replace('-', ' ').toUpperCase(),
      'Stage': data.stage.replace('-', ' ').toUpperCase(),
      'Decision ID': data.decisionId,
      'Iteration': data.iteration.toString()
    };

    // Options
    if (data.options.length > 0) {
      sections['Options'] = data.options.map(option => `• ${option.name}: ${option.description}`);
    }

    // Criteria
    if (data.criteria && data.criteria.length > 0) {
      sections['Criteria'] = data.criteria.map(criterion =>
        `• ${criterion.name} (weight: ${(criterion.weight * 100).toFixed(0)}%): ${criterion.description}`
      );
    }

    // Stakeholders
    if (data.stakeholders && data.stakeholders.length > 0) {
      sections['Stakeholders'] = data.stakeholders.map(stakeholder => `• ${stakeholder}`);
    }

    // Constraints
    if (data.constraints && data.constraints.length > 0) {
      sections['Constraints'] = data.constraints.map(constraint => `• ${constraint}`);
    }

    // Time horizon and risk tolerance
    if (data.timeHorizon) {
      sections['Time Horizon'] = data.timeHorizon;
    }

    if (data.riskTolerance) {
      sections['Risk Tolerance'] = data.riskTolerance.replace('-', ' ').toUpperCase();
    }

    // Expected values
    if (data.expectedValues && Object.keys(data.expectedValues).length > 0) {
      sections['Expected Values'] = Object.entries(data.expectedValues).map(([option, value]) =>
        `• ${option}: ${value.toFixed(3)}`
      );
    }

    // Multi-criteria scores
    if (data.multiCriteriaScores && Object.keys(data.multiCriteriaScores).length > 0) {
      sections['Multi-Criteria Scores'] = Object.entries(data.multiCriteriaScores).map(([option, score]) =>
        `• ${option}: ${score.toFixed(3)}`
      );
    }

    // Information gaps
    if (data.informationGaps && data.informationGaps.length > 0) {
      sections['Information Gaps'] = data.informationGaps.map(gap =>
        `• ${gap.description} (impact: ${(gap.impact * 100).toFixed(0)}%)`
      );
    }

    // Sensitivity insights
    if (data.sensitivityInsights && data.sensitivityInsights.length > 0) {
      sections['Sensitivity Insights'] = data.sensitivityInsights.map(insight => `• ${insight}`);
    }

    // Recommendation
    if (data.recommendation) {
      sections['Recommendation'] = data.recommendation;
    }

    // Suggested next stage
    if (data.suggestedNextStage) {
      sections['Suggested Next Stage'] = data.suggestedNextStage;
    }

    return boxed('📊 Decision Framework', sections);
  }
}
