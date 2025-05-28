import { BaseToolServer } from '../base/BaseToolServer.js';
import { MetacognitiveMonitoringSchema, MetacognitiveMonitoringData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Metacognitive Monitoring Server using clear-thought tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class MetacognitiveMonitoringServer extends BaseToolServer<MetacognitiveMonitoringData, any> {
  constructor() {
    super(MetacognitiveMonitoringSchema);
  }

  protected handle(validInput: MetacognitiveMonitoringData): any {
    return this.process(validInput);
  }

  /**
   * Standardized process method for metacognitive monitoring
   * @param validInput - Validated metacognitive monitoring data
   * @returns Processed metacognitive monitoring result
   */
  public process(validInput: MetacognitiveMonitoringData): any {
    // Format output using boxed utility
    const formattedOutput = this.formatMetacognitiveOutput(validInput);

    // Log formatted output to console (suppress during tests)
    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    return {
      task: validInput.task,
      monitoringId: validInput.monitoringId,
      stage: validInput.stage,
      iteration: validInput.iteration,
      overallConfidence: validInput.overallConfidence,
      nextAssessmentNeeded: validInput.nextAssessmentNeeded,
      status: 'success',
      uncertaintyAreaCount: validInput.uncertaintyAreas.length,
      hasKnowledgeAssessment: !!validInput.knowledgeAssessment,
      claimCount: validInput.claims?.length ?? 0,
      reasoningStepCount: validInput.reasoningSteps?.length ?? 0,
      timestamp: new Date().toISOString(),
      framework: 'clear-thought-tools'
    };
  }

  private formatMetacognitiveOutput(data: MetacognitiveMonitoringData): string {
    const sections: Record<string, string | string[]> = {
      'Task': data.task,
      'Stage': data.stage.replace('-', ' ').toUpperCase(),
      'Monitoring ID': data.monitoringId,
      'Iteration': data.iteration.toString(),
      'Overall Confidence': `${(data.overallConfidence * 100).toFixed(1)}%`
    };

    // Knowledge assessment
    if (data.knowledgeAssessment) {
      const ka = data.knowledgeAssessment;
      sections['Knowledge Assessment'] = [
        `Domain: ${ka.domain}`,
        `Level: ${ka.knowledgeLevel.toUpperCase()}`,
        `Confidence: ${(ka.confidenceScore * 100).toFixed(1)}%`,
        `Evidence: ${ka.supportingEvidence}`
      ];

      if (ka.knownLimitations.length > 0) {
        sections['Known Limitations'] = ka.knownLimitations.map(limitation => `• ${limitation}`);
      }
    }

    // Claims assessment
    if (data.claims && data.claims.length > 0) {
      sections['Claims Assessment'] = data.claims.map(claim =>
        `• ${claim.claim} (${claim.status.toUpperCase()}, ${(claim.confidenceScore * 100).toFixed(0)}%)`
      );
    }

    // Reasoning steps assessment
    if (data.reasoningSteps && data.reasoningSteps.length > 0) {
      sections['Reasoning Assessment'] = data.reasoningSteps.map(step => {
        const validity = (step.logicalValidity * 100).toFixed(0);
        const strength = (step.inferenceStrength * 100).toFixed(0);
        return `• ${step.step} (Logic: ${validity}%, Inference: ${strength}%)`;
      });
    }

    // Uncertainty areas
    if (data.uncertaintyAreas.length > 0) {
      sections['Uncertainty Areas'] = data.uncertaintyAreas.map(area => `• ${area}`);
    }

    // Recommended approach
    sections['Recommended Approach'] = data.recommendedApproach;

    // Suggested assessments
    if (data.suggestedAssessments && data.suggestedAssessments.length > 0) {
      sections['Suggested Next Assessments'] = data.suggestedAssessments.map(assessment => `• ${assessment}`);
    }

    return boxed('🧭 Metacognitive Monitoring', sections);
  }
}
