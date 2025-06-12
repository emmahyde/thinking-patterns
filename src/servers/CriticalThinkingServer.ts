import { BaseToolServer } from '../base/BaseToolServer.js';
import { CriticalThinkingSchema, CriticalThinking } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

export class CriticalThinkingServer extends BaseToolServer<CriticalThinking, any> {
  constructor() {
    super(CriticalThinkingSchema);
  }

  protected handle(validInput: CriticalThinking): any {
    return this.process(validInput);
  }

  public process(validInput: CriticalThinking): any {
    const formattedOutput = this.formatOutput(validInput);

    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    return {
      subject: validInput.subject,
      potentialIssues: validInput.potentialIssues,
      edgeCases: validInput.edgeCases,
      invalidAssumptions: validInput.invalidAssumptions,
      alternativeApproaches: validInput.alternativeApproaches,
      status: 'success',
      timestamp: new Date().toISOString(),
    };
  }

  private formatOutput(data: CriticalThinking): string {
    const sections: Record<string, string | string[]> = {
      'Subject': data.subject,
    };

    if (data.potentialIssues && data.potentialIssues.length > 0) {
      sections['Potential Issues'] = data.potentialIssues.map(item => `• ${item}`);
    }
    if (data.edgeCases && data.edgeCases.length > 0) {
      sections['Edge Cases'] = data.edgeCases.map(item => `• ${item}`);
    }
    if (data.invalidAssumptions && data.invalidAssumptions.length > 0) {
      sections['Invalid Assumptions'] = data.invalidAssumptions.map(item => `• ${item}`);
    }
    if (data.alternativeApproaches && data.alternativeApproaches.length > 0) {
      sections['Alternative Approaches'] = data.alternativeApproaches.map(item => `• ${item}`);
    }

    return boxed('🤔 Critical Thinking', sections);
  }
} 