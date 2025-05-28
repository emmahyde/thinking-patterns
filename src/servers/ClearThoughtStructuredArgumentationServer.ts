import { BaseToolServer } from '../base/BaseToolServer.js';
import { StructuredArgumentationSchema, StructuredArgumentationData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Structured Argumentation Server using clear-thought tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class ClearThoughtStructuredArgumentationServer extends BaseToolServer<StructuredArgumentationData, any> {
  constructor() {
    super(StructuredArgumentationSchema);
  }

  protected handle(validInput: StructuredArgumentationData): any {
    // Format output using boxed utility
    const formattedOutput = this.formatArgumentationOutput(validInput);

    // Log formatted output to console
    console.error(formattedOutput);

    return {
      claim: validInput.claim,
      argumentId: validInput.argumentId,
      argumentType: validInput.argumentType,
      confidence: validInput.confidence,
      nextArgumentNeeded: validInput.nextArgumentNeeded,
      status: 'success',
      premiseCount: validInput.premises.length,
      hasConclusion: !!validInput.conclusion,
      strengthCount: validInput.strengths?.length ?? 0,
      weaknessCount: validInput.weaknesses?.length ?? 0,
      timestamp: new Date().toISOString(),
      framework: 'clear-thought-tools'
    };
  }

  private formatArgumentationOutput(data: StructuredArgumentationData): string {
    const sections: Record<string, string | string[]> = {
      'Claim': data.claim,
      'Argument Type': data.argumentType.toUpperCase(),
      'Confidence': `${(data.confidence * 100).toFixed(1)}%`
    };

    if (data.argumentId) {
      sections['Argument ID'] = data.argumentId;
    }

    // Premises
    if (data.premises.length > 0) {
      sections['Premises'] = data.premises.map((premise, index) => `${index + 1}. ${premise}`);
    }

    // Conclusion
    if (data.conclusion) {
      sections['Conclusion'] = data.conclusion;
    }

    // Relationships
    if (data.respondsTo) {
      sections['Responds To'] = data.respondsTo;
    }

    if (data.supports && data.supports.length > 0) {
      sections['Supports'] = data.supports.map(support => `• ${support}`);
    }

    if (data.contradicts && data.contradicts.length > 0) {
      sections['Contradicts'] = data.contradicts.map(contradiction => `• ${contradiction}`);
    }

    // Analysis
    if (data.strengths && data.strengths.length > 0) {
      sections['Strengths'] = data.strengths.map(strength => `• ${strength}`);
    }

    if (data.weaknesses && data.weaknesses.length > 0) {
      sections['Weaknesses'] = data.weaknesses.map(weakness => `• ${weakness}`);
    }

    // Suggested next types
    if (data.suggestedNextTypes && data.suggestedNextTypes.length > 0) {
      sections['Suggested Next Arguments'] = data.suggestedNextTypes.map(type => `• ${type}`);
    }

    return boxed('⚖️ Structured Argumentation', sections);
  }
}
