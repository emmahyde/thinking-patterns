import { BaseToolServer } from '../base/BaseToolServer.js';
import { DebuggingApproachSchema, DebuggingApproachData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Debugging Approach Server using clear-thought tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class ClearThoughtDebuggingApproachServer extends BaseToolServer<DebuggingApproachData, any> {
  constructor() {
    super(DebuggingApproachSchema);
  }

  protected handle(validInput: DebuggingApproachData): any {
    // Format output using boxed utility
    const formattedOutput = this.formatDebuggingOutput(validInput);

    // Log formatted output to console
    console.error(formattedOutput);

    return {
      approachName: validInput.approachName,
      issue: validInput.issue,
      status: 'success',
      hasSteps: (validInput.steps?.length ?? 0) > 0,
      hasResolution: !!validInput.resolution,
      stepCount: validInput.steps?.length ?? 0,
      timestamp: new Date().toISOString(),
      framework: 'clear-thought-tools'
    };
  }

  private formatDebuggingOutput(data: DebuggingApproachData): string {
    const sections: Record<string, string | string[]> = {
      'Approach': data.approachName,
      'Issue': data.issue
    };

    if (data.steps && data.steps.length > 0) {
      sections['Steps'] = data.steps.map(step => `• ${step}`);
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
