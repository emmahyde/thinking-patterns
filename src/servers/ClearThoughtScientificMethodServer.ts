import { BaseToolServer } from '../base/BaseToolServer.js';
import { ScientificMethodSchema, ScientificMethodData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Scientific Method Server using clear-thought tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class ClearThoughtScientificMethodServer extends BaseToolServer<ScientificMethodData, any> {
  constructor() {
    super(ScientificMethodSchema);
  }

  protected handle(validInput: ScientificMethodData): any {
    // Format output using boxed utility
    const formattedOutput = this.formatScientificOutput(validInput);

    // Log formatted output to console
    console.error(formattedOutput);

    return {
      inquiryId: validInput.inquiryId,
      stage: validInput.stage,
      iteration: validInput.iteration,
      nextStageNeeded: validInput.nextStageNeeded,
      status: 'success',
      hasObservation: !!validInput.observation,
      hasQuestion: !!validInput.question,
      hasHypothesis: !!validInput.hypothesis,
      hasExperiment: !!validInput.experiment,
      hasAnalysis: !!validInput.analysis,
      hasConclusion: !!validInput.conclusion,
      timestamp: new Date().toISOString(),
      framework: 'clear-thought-tools'
    };
  }

  private formatScientificOutput(data: ScientificMethodData): string {
    const sections: Record<string, string | string[]> = {
      'Inquiry ID': data.inquiryId,
      'Stage': data.stage.toUpperCase(),
      'Iteration': data.iteration.toString()
    };

    // Observation
    if (data.observation) {
      sections['Observation'] = data.observation;
    }

    // Question
    if (data.question) {
      sections['Research Question'] = data.question;
    }

    // Hypothesis
    if (data.hypothesis) {
      const h = data.hypothesis;
      sections['Hypothesis'] = [
        `Statement: ${h.statement}`,
        `Domain: ${h.domain}`,
        `Status: ${h.status.toUpperCase()}`,
        `Confidence: ${(h.confidence * 100).toFixed(1)}%`,
        `ID: ${h.hypothesisId}`
      ];

      if (h.variables.length > 0) {
        sections['Variables'] = h.variables.map(variable =>
          `• ${variable.name} (${variable.type})${variable.operationalization ? ': ' + variable.operationalization : ''}`
        );
      }

      if (h.assumptions.length > 0) {
        sections['Assumptions'] = h.assumptions.map(assumption => `• ${assumption}`);
      }

      if (h.alternativeTo && h.alternativeTo.length > 0) {
        sections['Alternative To'] = h.alternativeTo.map(alt => `• ${alt}`);
      }
    }

    // Experiment
    if (data.experiment) {
      const e = data.experiment;
      sections['Experiment'] = [
        `Design: ${e.design}`,
        `Methodology: ${e.methodology}`,
        `ID: ${e.experimentId}`,
        `Hypothesis ID: ${e.hypothesisId}`
      ];

      if (e.predictions.length > 0) {
        sections['Predictions'] = e.predictions.map(pred =>
          `• If ${pred.if}, then ${pred.then}${pred.else ? `, else ${pred.else}` : ''}`
        );
      }

      if (e.controlMeasures.length > 0) {
        sections['Control Measures'] = e.controlMeasures.map(measure => `• ${measure}`);
      }

      if (e.results) {
        sections['Results'] = e.results;
      }

      if (e.outcomeMatched !== undefined) {
        sections['Outcome Matched Prediction'] = e.outcomeMatched ? 'YES' : 'NO';
      }

      if (e.unexpectedObservations && e.unexpectedObservations.length > 0) {
        sections['Unexpected Observations'] = e.unexpectedObservations.map(obs => `• ${obs}`);
      }

      if (e.limitations && e.limitations.length > 0) {
        sections['Limitations'] = e.limitations.map(limitation => `• ${limitation}`);
      }

      if (e.nextSteps && e.nextSteps.length > 0) {
        sections['Next Steps'] = e.nextSteps.map(step => `• ${step}`);
      }
    }

    // Analysis
    if (data.analysis) {
      sections['Analysis'] = data.analysis;
    }

    // Conclusion
    if (data.conclusion) {
      sections['Conclusion'] = data.conclusion;
    }

    return boxed('🔬 Scientific Method', sections);
  }
}
