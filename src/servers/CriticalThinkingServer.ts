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
      ...validInput,
      status: 'success',
      timestamp: new Date().toISOString(),
      issueCount: validInput.potentialIssues.length,
      edgeCaseCount: validInput.edgeCases.length,
      assumptionCount: validInput.invalidAssumptions.length,
      alternativeCount: validInput.alternativeApproaches.length,
    };
  }

  private formatOutput(data: CriticalThinking): string {
    const sections: Record<string, string | string[]> = {
      'Subject': data.subject,
    };

    if (data.analysisId) sections['Analysis ID'] = data.analysisId;
    if (data.context) sections['Context'] = data.context;
    if (data.objectives && data.objectives.length > 0) {
      sections['Objectives'] = data.objectives.map(item => `• ${item}`);
    }

    if (data.potentialIssues && data.potentialIssues.length > 0) {
      sections['Potential Issues'] = data.potentialIssues.map(item => `• ${item.description} (Severity: ${item.severity}, Category: ${item.category})`);
    }
    if (data.edgeCases && data.edgeCases.length > 0) {
      sections['Edge Cases'] = data.edgeCases.map(item => `• ${item.scenario} (Impact: ${item.businessImpact}, Testability: ${item.testability})`);
    }
    if (data.invalidAssumptions && data.invalidAssumptions.length > 0) {
      sections['Invalid Assumptions'] = data.invalidAssumptions.map(item => `• ${item.statement} (Validity: ${item.validity})`);
    }
    if (data.alternativeApproaches && data.alternativeApproaches.length > 0) {
      sections['Alternative Approaches'] = data.alternativeApproaches.map(item => `• ${item.name} (Feasibility: ${(item.feasibility * 100).toFixed(0)}%)`);
    }
    
    if (data.overallAssessment) sections['Overall Assessment'] = data.overallAssessment;
    
    if (data.prioritizedRecommendations && data.prioritizedRecommendations.length > 0) {
      sections['Recommendations'] = data.prioritizedRecommendations.map(item => `• ${item}`);
    }
    
    if (data.nextSteps && data.nextSteps.length > 0) {
      sections['Next Steps'] = data.nextSteps.map(item => `• ${item}`);
    }

    return boxed('🤔 Critical Thinking', sections);
  }
} 