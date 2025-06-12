import { BaseToolServer } from '../base/BaseToolServer.js';
import { DecisionFrameworkSchema, DecisionFrameworkData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Decision Framework Server using thinking-patterns tools approach
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

    // Log formatted output to console (suppress during tests)
    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    return {
      decisionStatement: validInput.decisionStatement,
      decisionId: validInput.decisionId,
      analysisType: validInput.analysisType,
      stage: validInput.stage,
      iteration: validInput.iteration,
      nextStageNeeded: validInput.nextStageNeeded,
      options: validInput.options,
      criteria: validInput.criteria,
      stakeholders: validInput.stakeholders,
      constraints: validInput.constraints,
      timeHorizon: validInput.timeHorizon,
      riskTolerance: validInput.riskTolerance,
      possibleOutcomes: validInput.possibleOutcomes,
      criteriaEvaluations: validInput.criteriaEvaluations,
      informationGaps: validInput.informationGaps,
      sensitivityInsights: validInput.sensitivityInsights,
      expectedValues: validInput.expectedValues,
      multiCriteriaScores: validInput.multiCriteriaScores,
      recommendation: validInput.recommendation,
      suggestedNextStage: validInput.suggestedNextStage,
      status: 'success',
      optionCount: validInput.options.length,
      criteriaCount: validInput.criteria?.length ?? 0,
      hasStakeholders: !!validInput.stakeholders && validInput.stakeholders.length > 0,
      hasConstraints: !!validInput.constraints && validInput.constraints.length > 0,
      hasTimeHorizon: !!validInput.timeHorizon,
      hasRiskTolerance: !!validInput.riskTolerance,
      hasPossibleOutcomes: !!validInput.possibleOutcomes && validInput.possibleOutcomes.length > 0,
      hasCriteriaEvaluations: !!validInput.criteriaEvaluations && validInput.criteriaEvaluations.length > 0,
      hasInformationGaps: !!validInput.informationGaps && validInput.informationGaps.length > 0,
      hasSensitivityInsights: !!validInput.sensitivityInsights && validInput.sensitivityInsights.length > 0,
      hasExpectedValues: !!validInput.expectedValues && Object.keys(validInput.expectedValues).length > 0,
      hasMultiCriteriaScores: !!validInput.multiCriteriaScores && Object.keys(validInput.multiCriteriaScores).length > 0,
      hasRecommendation: !!validInput.recommendation,
      hasSuggestedNextStage: !!validInput.suggestedNextStage,
      timestamp: new Date().toISOString(),
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
