import { BaseToolServer } from '../base/BaseToolServer.js';
import { DebuggingApproachSchema, DebuggingApproachData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Debugging Approach Server using thinking-patterns tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class DebuggingApproachServer extends BaseToolServer<DebuggingApproachData, any> {
  constructor() {
    super(DebuggingApproachSchema);
  }

  protected handle(validInput: DebuggingApproachData): any {
    return this.process(validInput);
  }

  /**
   * Standardized process method for debugging approach
   * @param validInput - Validated debugging approach data
   * @returns Processed debugging approach result
   */
  public process(validInput: DebuggingApproachData): any {
    // Format output using boxed utility
    const formattedOutput = this.formatDebuggingOutput(validInput);

    // Log formatted output to console (suppress during tests)
    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    // Handle both string array and DebuggingStep object array formats
    const stepCount = validInput.steps ? validInput.steps.length : 0;

    return {
      approachName: validInput.approachName,
      issue: validInput.issue,
      steps: validInput.steps,
      findings: validInput.findings,
      resolution: validInput.resolution,
      status: 'success',
      hasSteps: stepCount > 0,
      hasFindings: !!validInput.findings,
      hasResolution: !!validInput.resolution,
      stepCount: stepCount,
      timestamp: new Date().toISOString(),
    };
  }

  private formatDebuggingOutput(data: DebuggingApproachData): string {
    const sections: Record<string, string | string[]> = {
      'Approach': data.approachName,
      'Issue': data.issue
    };

    if (data.steps && data.steps.length > 0) {
      // Handle both string array and DebuggingStep object array formats
      const stepStrings = data.steps.map(step => {
        if (typeof step === 'string') {
          return `• ${step}`;
        } else {
          // DebuggingStep object format
          return `• ${step.action}`;
        }
      });
      sections['Steps'] = stepStrings;
    }

    if (data.findings) {
      sections['Findings'] = data.findings;
    }

    if (data.resolution) {
      sections['Resolution'] = data.resolution;
    }

    return boxed('🔍 Debugging Approach', sections);
  }
}
